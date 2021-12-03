import { TokenType } from '../lexer/Token';
import { Parser } from '../Parser';
import { PrefixParslet } from './Parslet';
import { Precedence } from '../Precedence';
import { TupleResult } from '../result/TerminalResult';
interface TupleParsletOptions {
    allowQuestionMark: boolean;
}
export declare class TupleParslet implements PrefixParslet {
    private readonly allowQuestionMark;
    constructor(opts: TupleParsletOptions);
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): TupleResult;
}
export {};
