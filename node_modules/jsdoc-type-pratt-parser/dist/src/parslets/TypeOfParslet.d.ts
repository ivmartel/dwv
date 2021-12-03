import { PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Parser } from '../Parser';
import { Precedence } from '../Precedence';
import { TypeOfResult } from '../result/TerminalResult';
export declare class TypeOfParslet implements PrefixParslet {
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): TypeOfResult;
}
