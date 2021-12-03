import 'mocha';
import { TerminalResult, ParseMode } from '../../src';
declare type JtpMode = 'jsdoc' | 'closure' | 'typescript' | 'permissive';
declare type CatharsisMode = 'jsdoc' | 'closure';
declare type CompareMode = ParseMode | 'fail' | 'differ';
export interface Fixture {
    modes: ParseMode[];
    jtp?: {
        [K in JtpMode]: CompareMode;
    };
    catharsis?: {
        [K in CatharsisMode]: CompareMode;
    };
    expected?: TerminalResult;
    diffExpected?: {
        [K in ParseMode]?: TerminalResult;
    };
    input: string;
    stringified?: string;
}
export declare function testFixture(fixture: Fixture): void;
export {};
