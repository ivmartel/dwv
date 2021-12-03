import { PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { ParenthesisResult } from '../result/TerminalResult';
import { ParameterList } from '../result/IntermediateResult';
export declare class ParenthesisParslet implements PrefixParslet {
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): ParenthesisResult | ParameterList;
}
