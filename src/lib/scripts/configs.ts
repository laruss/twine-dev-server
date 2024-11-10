export const configs = {
    supportedFormats: ['SugarCube'],
    supportedStyles: ['css'],
    supportedScripts: ['js'],
    passageDataComment: '<!--tw-passagedata-->',
    projectPath: 'src/story', // here will be all parsed passages
    staticPath: 'src/static', // here will be all static files (images, sounds, etc.)
    storyDataFileName: '_project.json', // will be placed in projectPath
    stylesFolder: 'styles',
    defaultStylesFile: 'styles.css',
    defaultScriptsFile: 'script.js',
    scriptsFolder: 'scripts',
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
