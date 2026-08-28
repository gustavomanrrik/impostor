export type ThemeGroup = [string, string];
export interface Theme {
    id: string;
    name: string;
    icon: string;
    is18Plus: boolean;
    pairs: {
        easy: ThemeGroup[];
        medium: ThemeGroup[];
        hard: ThemeGroup[];
    };
}
export declare const themes: Theme[];
export declare const getThemesWithCount: () => {
    id: string;
    name: string;
    icon: string;
    is18Plus: boolean;
    groupCount: number;
}[];
