import { Parser } from '../Parser';
import { TokenType } from '../lexer/Token';
import { PrefixParslet } from './Parslet';
import { Precedence } from '../Precedence';
import { NameResult } from '../result/TerminalResult';
interface NameParsletOptions {
    allowedAdditionalTokens: TokenType[];
}
export declare class NameParslet implements PrefixParslet {
    private readonly allowedAdditionalTokens;
    constructor(options: NameParsletOptions);
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): NameResult;
}
export {};
