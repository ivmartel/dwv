import { Block } from '../primitives';
import { Tokenizer } from './tokenizers/index';
export interface Options {
    startLine: number;
    fence: string;
    spacing: 'compact' | 'preserve';
    tokenizers: Tokenizer[];
}
export declare type Parser = (source: string) => Block[];
export default function getParser({ startLine, fence, spacing, tokenizers, }?: Partial<Options>): Parser;
