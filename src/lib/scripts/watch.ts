import { watch } from 'fs';
import * as path from 'node:path';
import { runCompile } from 'src/lib/scripts/build.helpers.ts';

const srcPath = path.join(import.meta.dir, '../..');

const watcher = watch(srcPath, { recursive: true }, async () => {
    console.log('Rebuilding...');
    await runCompile();
});

watcher.on('error', (error) => {
    console.error(`Watcher error: ${error}`);
});

watcher.on('close', () => {
    console.log('Watcher closed');
});

process.on('SIGINT', () => {
    // close watcher when Ctrl-C is pressed
    console.log(' Closing watcher...');
    watcher.close();

    process.exit(0);
});

console.log(`Watching ${srcPath} for changes...`);
