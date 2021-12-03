import { InfixParslet, PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { IntermediateResult } from '../result/IntermediateResult';
import { TerminalResult } from '../result/TerminalResult';
export declare class OptionalParslet implements PrefixParslet, InfixParslet {
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): TerminalResult;
    parseInfix(parser: Parser, left: IntermediateResult): TerminalResult;
}
