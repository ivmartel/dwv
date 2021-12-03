import { PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { NonTerminalResult } from '../result/NonTerminalResult';
export declare class NumberParslet implements PrefixParslet {
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): NonTerminalResult;
}
