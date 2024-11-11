import 'twine-sugarcube';

declare module 'twine-sugarcube' {
    interface SugarCubeStoryVariables {
        [key: string]: Record<string, any>;
    }
    interface SugarCubeSetupObject {
        [key: string]: Record<string, any>
    }
}
