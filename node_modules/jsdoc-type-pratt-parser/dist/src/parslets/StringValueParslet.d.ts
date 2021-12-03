import { PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Parser } from '../Parser';
import { Precedence } from '../Precedence';
import { StringValueResult } from '../result/TerminalResult';
export declare class StringValueParslet implements PrefixParslet {
    accepts(type: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): StringValueResult;
}
