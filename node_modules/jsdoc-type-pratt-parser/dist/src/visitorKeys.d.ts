import { NonTerminalResult } from './result/NonTerminalResult';
declare type VisitorKeys = {
    [P in NonTerminalResult as P['type']]: Array<keyof P>;
};
export declare const visitorKeys: VisitorKeys;
export {};
