import { PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Parser } from '../Parser';
import { Precedence } from '../Precedence';
import { BaseFunctionParslet } from './BaseFunctionParslet';
import { TerminalResult } from '../result/TerminalResult';
export interface FunctionParsletOptions {
    allowNamedParameters?: string[];
    allowWithoutParenthesis: boolean;
    allowNoReturnType: boolean;
}
export declare class FunctionParslet extends BaseFunctionParslet implements PrefixParslet {
    private readonly allowWithoutParenthesis;
    private readonly allowNamedParameters?;
    private readonly allowNoReturnType;
    constructor(options: FunctionParsletOptions);
    accepts(type: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): TerminalResult;
}
