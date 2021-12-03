import { Line } from '../primitives';
export interface Options {
    startLine: number;
}
export declare type Parser = (source: string) => Line[] | null;
export default function getParser({ startLine, }?: Partial<Options>): Parser;
