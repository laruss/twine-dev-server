import type {
    CompilePassagesInfoType,
    OptionalPassageType,
    PassageType,
    ProjectInfoWithTagsType,
} from 'src/lib/scripts/types.ts';
import { configs } from 'src/lib/scripts/configs.ts';
import * as fs from 'fs';
import * as path from 'path';

type GetFilePathsFromCatalog = (
    catalogPath: string,
    fileFormats: Readonly<string[]>
) => Promise<string[]>;

export const CLEAR_SESSION_STORAGE_SCRIPT = `
// ----------------------------------------------
/* script clears sessionStorage on document load
 * to prevent the browser from caching the previous state in watch mode  
*/
document.body.onload = () => sessionStorage.clear();
// ----------------------------------------------

`;

export const getFilePathsFromCatalog: GetFilePathsFromCatalog = async (
    catalogPath,
    fileFormats
) => {
    const formattedExtensions = fileFormats.map((ext) => ext.toLowerCase());

    const checkPath = async (path: string): Promise<void> => {
        try {
            const stat = await fs.promises.stat(path);
            if (!stat.isDirectory()) {
                throw new Error(`Path "${path}" is not a directory.`);
            }
        } catch {
            throw new Error(`Path "${path}" does not exist.`);
        }
    };

    const collectFiles = async (dirPath: string): Promise<string[]> => {
        const entries = await fs.promises.readdir(dirPath, {
            withFileTypes: true,
        });
        let filePaths: string[] = [];

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                filePaths = filePaths.concat(await collectFiles(fullPath));
            } else {
                const fileExtension = path
                    .extname(entry.name)
                    .slice(1)
                    .toLowerCase();
                if (formattedExtensions.includes(fileExtension)) {
                    filePaths.push(fullPath);
                }
            }
        }
        return filePaths;
    };

    await checkPath(catalogPath);
    return collectFiles(catalogPath);
};

export function validateStoryData(data: ProjectInfoWithTagsType) {
    if (configs.supportedFormats.indexOf(data.format) === -1) {
        throw new Error(
            `Invalid StoryData format. Supported: ${configs.supportedFormats.join(', ')}`
        );
    }
    if (!data['format-version']) {
        throw new Error('Invalid StoryData format version');
    }
    if (data.options === undefined || data.options === null) {
        throw new Error('Invalid StoryData options. Should be a string');
    }
    if (typeof data.zoom !== 'number' || data.zoom < 0 || data.zoom > 2) {
        throw new Error(
            `Invalid StoryData zoom. Should be a number between 0 and 2`
        );
    }
    if (!data.creator) {
        throw new Error('Invalid StoryData creator');
    }
    if (!data['creator-version']) {
        throw new Error('Invalid StoryData creator version');
    }
    if (!data.ifid || data.ifid.length !== 36) {
        throw new Error(
            'Invalid StoryData ifid: should be a 36-character string'
        );
    }
    if (!data.name) {
        throw new Error('Invalid StoryData name: should be a string');
    }
    if (
        !data.startnode ||
        typeof data.startnode !== 'number' ||
        data.startnode < 0 ||
        !Number.isInteger(data.startnode)
    ) {
        throw new Error('Invalid StoryData startnode: should be a number');
    }
    if (
        !Array.isArray(data.tags) ||
        data.tags.some((tag) => !tag.name || !tag.color)
    ) {
        throw new Error('Invalid StoryData tags');
    }
}

type ParsePassage = (passage: string) => OptionalPassageType;

export const parsePassage: ParsePassage = (passage) => {
    const metadataPattern = /^=+\n([\s\S]*?)\n=+\n/;
    const match = passage.match(metadataPattern);
    let metadata: { [key: string]: string } = {};
    let content = passage;
    if (match) {
        const metadataContent = match[1];
        content = passage.slice(match[0].length);
        const lines = metadataContent.split('\n');
        for (const line of lines) {
            const [key, ...rest] = line.split(':');
            if (key && rest.length > 0) {
                const value = rest.join(':').trim();
                const trimmedKey = key.trim();
                if (
                    ['name', 'pid', 'tags', 'position', 'size'].includes(
                        trimmedKey
                    )
                ) {
                    metadata[trimmedKey] = value;
                }
            }
        }
    }
    return { content, ...metadata };
};

export function getFileNameWoExtension(filePath: string) {
    return path.parse(filePath).name;
}

export function fillInPassageInfo(
    passage: OptionalPassageType,
    info: CompilePassagesInfoType
): PassageType {
    const { maxPosition, defaultSize, positionDelta } = configs.passageFormat;

    if (!passage.pid) {
        info.biggestPid += 1;
        passage.pid = info.biggestPid;
    }
    if (!passage.name) {
        throw new Error(`Passage with pid ${passage.pid} has no name`);
    }
    if (!passage.tags) {
        passage.tags = '';
    }
    if (!passage.size) {
        passage.size = defaultSize;
    }
    if (!passage.position) {
        let position: [number, number] = [0, 0];

        const allPositionsString = JSON.stringify(info.allPositions);
        while (allPositionsString.includes(JSON.stringify(position))) {
            if (position[0] < maxPosition) {
                position[0] += positionDelta;
            } else {
                position[0] = 0;
                position[1] += positionDelta;
            }
        }
        info.allPositions.push(position);
        passage.position = position.join(',');
    }

    return passage as PassageType;
}

export async function openFile(...paths: string[]) {
    const path_ = path.join(...paths);
    const file = Bun.file(path_);
    try {
        return await file.text();
    } catch (e) {
        console.error(`Can't open file '${path_}': ${(e as Error).message}`);
        process.exit(1);
    }
}

export async function openStoryData() {
    const textData = await openFile(
        configs.projectPath,
        configs.storyDataFileName
    );
    let jsonData = {} as ProjectInfoWithTagsType;
    try {
        jsonData = JSON.parse(textData);
    } catch (e) {
        console.error(
            `Error while trying to read '${configs.storyDataFileName}': ${(e as Error).message}`
        );
        process.exit(1);
    }
    validateStoryData(jsonData);

    return jsonData;
}

export async function getEntryFilePath(
    folderToSearch: string,
    entryName: string,
    extensions: Readonly<string[]>
) {
    const files = await fs.promises.readdir(folderToSearch, {
        withFileTypes: true,
    });
    const entryFile = files.find((file) => {
        return (
            file.isFile() &&
            extensions.map((ext) => `${entryName}.${ext}`).includes(file.name)
        );
    });

    if (!entryFile) {
        throw new Error(
            `Entry file '${entryName}.${extensions[0]}' not found in '${folderToSearch}'`
        );
    }

    return path.join(folderToSearch, entryFile.name);
}
