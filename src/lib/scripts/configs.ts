export const configs = {
    supportedFormats: ['SugarCube'],
    styles: {
        supportedExtensions: ['css'],
        folder: 'styles',
        defaultFile: 'styles.css',
    },
    scripts: {
        supportedExtensions: ['js', 'ts', 'tsx', 'jsx'],
        folder: 'scripts',
        defaultFile: 'index.js',
        entry: 'index',
        outputFolder: '.js_build',
    },
    passageDataComment: '<!--tw-passagedata-->',
    projectPath: 'src/story', // here will be all parsed passages
    staticPath: 'src/static', // here will be all static files (images, sounds, etc.)
    storyDataFileName: '_project.json', // will be placed in projectPath
    htmlPath: 'index.html',
    passageFormat: {
        metaDelimiter: '====================',
        defaultSize: '100,100',
        maxPosition: 10000,
        positionDelta: 150,
    },
    outputHtmlPath: '.dist.html',
    distPath: 'dist',
} as const;
