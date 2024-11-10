import * as jsdom from 'jsdom';
import * as path from 'node:path';
import { configs } from 'src/lib/scripts/configs.ts';
import type {
    CompilePassagesInfoType,
    OptionalPassageType,
    ProjectInfoType,
    TagType,
} from 'src/lib/scripts/types.ts';
import {
    CLEAR_SESSION_STORAGE_SCRIPT,
    fillInPassageInfo,
    getEntryFilePath,
    getFileNameWoExtension,
    getFilePathsFromCatalog,
    openStoryData,
    parsePassage,
} from 'src/lib/scripts/compile.helpers.ts';
import fs from 'node:fs';

const dom = new jsdom.JSDOM();
const document = dom.window.document;
let isBuild = false;

function createElementWithAttributes(
    elementName: string,
    attributes?: Record<string, string | number>,
    toggleAttributes?: Record<string, boolean | undefined>
) {
    const node = document.createElement(elementName);
    if (attributes) {
        Object.entries(attributes).forEach(([attr, value]) => {
            node.setAttribute(attr, String(value));
        });
    }
    if (toggleAttributes) {
        Object.entries(toggleAttributes).forEach(([attr, value]) => {
            node.toggleAttribute(attr, value);
        });
    }

    return node;
}

function createStoryData(rawStoryData: ProjectInfoType) {
    return createElementWithAttributes('tw-storydata', rawStoryData, {
        hidden: true,
    });
}

function createTags(tags: TagType[]) {
    return tags.map((tag) => createElementWithAttributes('tw-tag', tag));
}

async function createStyles() {
    const styleAttributes = {
        role: 'stylesheet',
        id: 'twine-user-stylesheet',
        type: 'text/twine-css',
    };
    const {
        projectPath,
        styles: { supportedExtensions, folder },
    } = configs;
    let styleContent: string = '';

    const allStyles = await getFilePathsFromCatalog(
        path.join(projectPath, folder),
        supportedExtensions
    );

    for (const stylePath of allStyles) {
        const file = Bun.file(stylePath);
        const text = await file.text();
        styleContent += `${styleContent === '' ? '' : '\n'}${text}`;
    }

    const element = createElementWithAttributes('style', styleAttributes);
    element.innerHTML = styleContent;

    return element;
}

async function createScripts() {
    const scriptAttributes = {
        role: 'script',
        id: 'twine-user-script',
        type: 'text/twine-javascript',
    };
    const {
        projectPath,
        scripts: { folder, supportedExtensions, entry, outputFolder },
    } = configs;
    let scriptsContent: string = '';
    const outdir = outputFolder;
    const entryFilePath = await getEntryFilePath(
        path.join(projectPath, folder),
        entry,
        supportedExtensions
    );

    scriptsContent += isBuild ? '' : CLEAR_SESSION_STORAGE_SCRIPT;

    await Bun.build({
        entrypoints: [entryFilePath],
        outdir,
    });
    const file = Bun.file(path.join(outdir, 'index.js'));
    const text = await file.text();

    await fs.promises.rm(outdir, { recursive: true, force: true });

    scriptsContent += text;

    const element = createElementWithAttributes('script', scriptAttributes);
    element.innerHTML = scriptsContent;

    return element;
}

type CreatePassages = () => Promise<[HTMLElement[], CompilePassagesInfoType]>;

const createPassages: CreatePassages = async () => {
    const encodeHtmlEntities = (text: string) => {
        const divEl = document.createElement('div');
        divEl.textContent = text;
        return divEl.innerHTML;
    };

    const { projectPath } = configs;
    const passagesObjects: OptionalPassageType[] = [];

    const allPassages = await getFilePathsFromCatalog(projectPath, ['md']);

    for (const passagePath of allPassages) {
        const file = Bun.file(passagePath);
        const text = await file.text(); // here we can have either passage with metadata or w/o it
        const passageContent = parsePassage(text);
        passageContent.name = getFileNameWoExtension(passagePath);
        passagesObjects.push(passageContent);
    }

    const biggestPid = passagesObjects.reduce((acc, passage) => {
        const pidAsInt = Number(passage.pid || 0);
        return pidAsInt > acc ? pidAsInt : acc;
    }, 0);
    console.log('*** Biggest not-generated pid:', biggestPid, '***\n');

    const allPositions: [number, number][] = [];
    passagesObjects.forEach((psg) => {
        if (psg.position) {
            try {
                const pos_ = psg.position
                    .split(',')
                    .map((pos) => Number(pos)) as [number, number];
                allPositions.push(pos_);
            } catch (e) {
                console.log(`Ignoring: ${(e as Error).message}`);
            }
        }
    });

    const compileInfo = {
        allPositions,
        biggestPid,
    };

    return [
        passagesObjects.map((psg) => {
            const { content, ...passageProps } = fillInPassageInfo(
                psg,
                compileInfo
            );
            const elem = createElementWithAttributes(
                'tw-passagedata',
                passageProps
            );
            elem.innerHTML = encodeHtmlEntities(content);

            return elem;
        }),
        compileInfo,
    ];
};

async function appendStoryDataToHtmlAndSave(storyDataInDiv: HTMLDivElement) {
    const file = Bun.file(configs.htmlPath);
    const fileData = await file.text();
    const htmlContent = fileData.replace(
        configs.passageDataComment,
        storyDataInDiv.innerHTML
    );

    await Bun.write(configs.outputHtmlPath, htmlContent);
}

export async function compile() {
    const divElement = document.createElement('div');
    const jsonData = await openStoryData();
    const { tags, ...rawStoryData } = jsonData;
    const storyDataElement = createStoryData(rawStoryData);

    const stylesElement = await createStyles();
    storyDataElement.appendChild(stylesElement);

    const scriptsElement = await createScripts();
    storyDataElement.appendChild(scriptsElement);

    const tagElements = createTags(tags);
    tagElements.forEach((el) => storyDataElement.appendChild(el));

    const [passages, compileInfo] = await createPassages();
    passages.forEach((psg) => storyDataElement.appendChild(psg));

    divElement.appendChild(storyDataElement);

    await appendStoryDataToHtmlAndSave(divElement);

    console.log('Story compiled successfully');
    console.log('\n', configs.passageFormat.metaDelimiter);
    console.log(' Next available pid:', compileInfo.biggestPid + 1);
    console.log(configs.passageFormat.metaDelimiter);
}

const main = async () => {
    const args = process.argv.slice(2);
    if (args.includes('--build')) {
        isBuild = true;
    }

    await compile();
};

await main();
