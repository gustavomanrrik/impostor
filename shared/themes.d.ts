import { Theme } from './types';
export declare const themes: Theme[];
export declare const getThemesWithCount: () => {
    id: string;
    name: string;
    icon: string;
    is18Plus: boolean | undefined;
    groupCount: number;
}[];
