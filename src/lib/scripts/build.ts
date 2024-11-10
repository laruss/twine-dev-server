import { runCompile } from 'src/lib/scripts/build.helpers.ts';
import * as fs from 'fs';
import * as path from 'path';
import { configs } from 'src/lib/scripts/configs.ts';
import { openStoryData } from 'src/lib/scripts/compile.helpers.ts';

async function createDistFolder() {
    await fs.promises.rm(configs.distPath, { recursive: true, force: true });
    await fs.promises.mkdir(configs.distPath, { recursive: true });
}

async function copyFilesInFolderRecursive(source: string, destination: string) {
    const stats = await fs.promises.stat(source);
    if (stats.isDirectory()) {
        await fs.promises.mkdir(destination, { recursive: true });
        const files = await fs.promises.readdir(source);
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const destinationPath = path.join(destination, file);
            await copyFilesInFolderRecursive(sourcePath, destinationPath);
        }
    } else {
        await fs.promises.copyFile(source, destination);
    }
}

async function copyStaticFiles() {
    const staticFiles = await fs.promises.readdir(configs.staticPath);
    for (const file of staticFiles) {
        const source = path.join(configs.staticPath, file);
        const destination = path.join(configs.distPath, file);
        await copyFilesInFolderRecursive(source, destination);
    }
}

async function copyHtmlFile() {
    const storyData = await openStoryData();
    const file = Bun.file(configs.outputHtmlPath);
    const outputHtmlPath = path.join(configs.distPath, storyData.name + ".html");
    await Bun.write(outputHtmlPath, file);
}

async function build() {
    await runCompile();
    await createDistFolder();
    await copyStaticFiles();
    await copyHtmlFile();
}

await build();
