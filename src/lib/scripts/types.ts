export type ProjectInfoType = {
    name: string;
    startnode: number;
    creator: string;
    ['creator-version']: string;
    ifid: string;
    zoom: number;
    format: 'SugarCube';
    ['format-version']: string;
    options: string;
};

export type TagType = {
    name: string;
    color: string;
};

export type ProjectInfoWithTagsType = ProjectInfoType & {
    tags: TagType[];
};

export type PassageInfoType = {
    pid: number;
    name: string;
    tags: string;
    position: string;
    size: string;
};

export type OptionalPassageInfoType = Partial<PassageInfoType>;

export type PassageType = PassageInfoType & {
    content: string;
};

export type OptionalPassageType = OptionalPassageInfoType & {
    content: string;
};

export type CompilePassagesInfoType = {
    biggestPid: number;
    allPositions: [number, number][];
};
