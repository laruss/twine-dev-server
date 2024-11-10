import { configs } from 'src/lib/scripts/configs.ts';
import type {
    ProjectInfoType,
    PassageType,
    TagType,
    ProjectInfoWithTagsType,
} from './types.ts';
import fs from 'node:fs';
import * as path from 'node:path';
import * as jsdom from 'jsdom';

const showHelp = () => {
    console.log(`
Usage: bun run decompile.ts <directory-path>

Arguments:
  <directory-path>  The path to the directory containing files to process.
                    This path must contain a single HTML file and other files or folders to be copied.

Description:
  This script processes the specified directory, looking for a single HTML file and any additional files.
  It will verify that there is only one HTML file in the directory.
  All other files and folders will be copied to the destination path defined in 'constants.staticPath'.

Example:
  bun run decompile.ts "/path/to/directory"

Notes:
  - The script will only proceed if exactly one HTML file is found in the specified directory.
  - All other files and folders (except the HTML file) will be copied to 'constants.staticPath'.
    Subdirectories will be copied recursively.
`);
};

const showError = (err: string) => {
    console.error(err);
    showHelp();
    process.exit(1);
};

type GetTwineScriptAndHtml = (html: string) => {
    html: string;
    twineScript: string;
};

const getTwineScriptAndHtml: GetTwineScriptAndHtml = (html) => {
    const twineTagRegex = /<tw-storydata[\s\S]*?<\/tw-storydata>/;

    const match = html.match(twineTagRegex);

    if (match) {
        const twineScript = match[0];
        const newHtml = html.replace(twineTagRegex, configs.passageDataComment);

        return { html: newHtml, twineScript };
    } else {
        showError('`Tw-storydata` tag is not found, aborting...');
        return { html, twineScript: '' };
    }
};

type GetProjectInfo = (data: string) => ProjectInfoType;

const getProjectInfo: GetProjectInfo = (data) => {
    const nameMatch = data.match(/name="([^"]+)"/);
    const startnodeMatch = data.match(/startnode="(\d+)"/);
    const creatorMatch = data.match(/creator="([^"]+)"/);
    const creatorVersionMatch = data.match(/creator-version="([^"]+)"/);
    const ifidMatch = data.match(/ifid="([^"]+)"/);
    const zoomMatch = data.match(/zoom="([^"]+)"/);
    const formatMatch = data.match(/format="([^"]+)"/);
    const formatVersionMatch = data.match(/format-version="([^"]+)"/);
    const optionsMatch = data.match(/options="([^"]+)"/);

    if (!(formatMatch && formatMatch[1] === 'SugarCube')) {
        throw new Error("Only 'SugarCube' stories are supported for now");
    }

    return {
        name: nameMatch ? nameMatch[1] : '',
        startnode: startnodeMatch ? parseInt(startnodeMatch[1], 10) : 0,
        creator: creatorMatch ? creatorMatch[1] : '',
        'creator-version': creatorVersionMatch ? creatorVersionMatch[1] : '',
        ifid: ifidMatch ? ifidMatch[1] : '',
        zoom: zoomMatch ? parseFloat(zoomMatch[1]) : 0,
        format:
            formatMatch && formatMatch[1] === 'SugarCube'
                ? 'SugarCube'
                : 'SugarCube',
        'format-version': formatVersionMatch ? formatVersionMatch[1] : '',
        options: optionsMatch ? optionsMatch[1] : '',
    };
};

type GetStyles = (data: string) => string;

const getStyles: GetStyles = (data) => {
    const styleMatch = data.match(/<style[^>]*>([\s\S]*?)<\/style>/);

    return styleMatch ? styleMatch[1].trim() : '';
};

type GetScript = (data: string) => string;

const getScript: GetScript = (data) => {
    const scriptMatch = data.match(/<script[^>]*>([\s\S]*?)<\/script>/);

    return scriptMatch ? scriptMatch[1].trim() : '';
};

const getTags = (data: string) => {
    const tags: TagType[] = [];
    const tagRegex = /<tw-tag\s+name="([^"]+)"\s+color="([^"]+)"/g;

    let match;
    while ((match = tagRegex.exec(data)) !== null) {
        tags.push({
            name: match[1],
            color: match[2],
        });
    }

    return tags;
};

type GetPassages = (data: string) => PassageType[];

const getPassages: GetPassages = (data) => {
    const passages: PassageType[] = [];
    const passageRegex =
        /<tw-passagedata\s+pid="(\d+)"\s+name="([^"]+)"\s+tags="([^"]*)"\s+position="([^"]+)"\s+size="([^"]+)">([\s\S]*?)<\/tw-passagedata>/g;

    let match;
    while ((match = passageRegex.exec(data)) !== null) {
        passages.push({
            pid: parseInt(match[1], 10),
            name: match[2],
            tags: match[3],
            position: match[4],
            size: match[5],
            content: match[6].trim(),
        });
    }

    return passages;
};

async function saveHTML(html: string) {
    await Bun.write('index.html', html);
}

async function createFolders(path_: string) {
    await fs.promises.mkdir(path_, { recursive: true });
}

async function saveProjectInfo(info: ProjectInfoWithTagsType) {
    await Bun.write(
        getProjectPath(configs.storyDataFileName),
        JSON.stringify(info, null, 4)
    );
}

function getProjectPath(...pathes: string[]) {
    return path.join(configs.projectPath, ...pathes);
}

async function saveStyles(stylesContent: string) {
    await createFolders(getProjectPath(configs.stylesFolder));
    await Bun.write(
        getProjectPath(configs.stylesFolder, configs.defaultStylesFile),
        stylesContent
    );
}

async function saveScripts(scriptsContent: string) {
    await createFolders(getProjectPath(configs.scriptsFolder));
    await Bun.write(
        getProjectPath(configs.scriptsFolder, configs.defaultScriptsFile),
        scriptsContent
    );
}

async function savePassages(passages: PassageType[]) {
    const decodeHtmlEntities = (text: string) => {
        const dom = new jsdom.JSDOM();
        const parser = new dom.window.DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        return doc.documentElement.textContent || '';
    };

    for (const passage of passages) {
        let stringContent: string = configs.passageFormat.metaDelimiter;
        stringContent += `\nname: ${passage.name}\npid: ${passage.pid}\ntags: ${passage.tags}\nposition: ${passage.position}\nsize: ${passage.size}\n`;
        stringContent += `${configs.passageFormat.metaDelimiter}\n`;
        stringContent += decodeHtmlEntities(passage.content);
        await Bun.write(getProjectPath(`${passage.name}.md`), stringContent);
    }
}

const copyRecursive = async (
    src: string,
    dest: string,
    exceptPath?: string
): Promise<void> => {
    if (src === exceptPath) return;

    const stats = await fs.promises.stat(src);

    if (stats.isDirectory()) {
        await createFolders(dest);

        const items = await fs.promises.readdir(src);
        await Promise.all(
            items.map((childItem) =>
                copyRecursive(
                    path.join(src, childItem),
                    path.join(dest, childItem),
                    exceptPath
                )
            )
        );
    } else {
        await fs.promises.copyFile(src, dest);
    }
};

async function copyStatic(sourcePath: string, htmlPath: string) {
    if (!(await fs.promises.exists(configs.staticPath))) {
        await createFolders(configs.staticPath);
    }
    await copyRecursive(sourcePath, configs.staticPath, htmlPath);
}

async function decompile(sourcePath: string, sourceHtmlPath: string) {
    const file = Bun.file(sourceHtmlPath);
    const srcHtml = await file.text();
    const { html, twineScript } = getTwineScriptAndHtml(srcHtml);
    const projectInfo = getProjectInfo(twineScript);
    const tags = getTags(twineScript);
    const styles = getStyles(twineScript);
    const scripts = getScript(twineScript);
    const passages = getPassages(twineScript);

    await createFolders(configs.projectPath);
    await saveHTML(html);
    await saveProjectInfo({ ...projectInfo, tags });
    await saveStyles(styles);
    await saveScripts(scripts);
    await savePassages(passages);

    await copyStatic(sourcePath, sourceHtmlPath);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showError('Please provide a path as the first argument.');
    }

    const inputPath = args[0];

    if (!(await fs.promises.exists(inputPath))) {
        showError('The specified path does not exist.');
    }

    if (!(await fs.promises.stat(inputPath)).isDirectory()) {
        showError('The specified path is not a directory.');
    }

    const contents = await fs.promises.readdir(inputPath);
    const htmlFiles = contents.filter(
        (file) => path.extname(file).toLowerCase() === '.html'
    );

    if (htmlFiles.length === 0) {
        showError('No HTML files found in the specified directory.');
    } else if (htmlFiles.length > 1) {
        showError(
            'More than one HTML file found in the specified directory. There should only be one.'
        );
    }

    const htmlFilePath = path.join(inputPath, htmlFiles[0]);
    console.log('HTML file found:', htmlFilePath);

    await decompile(inputPath, htmlFilePath);
    console.log(
        'All files are decompiled and are in `src/story` / `src/static` folders'
    );
}

await main();
