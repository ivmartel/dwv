import { InfixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { IntermediateResult, ParameterList } from '../result/IntermediateResult';
interface ParameterListParsletOptions {
    allowTrailingComma: boolean;
}
export declare class ParameterListParslet implements InfixParslet {
    private readonly allowTrailingComma;
    constructor(option: ParameterListParsletOptions);
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parseInfix(parser: Parser, left: IntermediateResult): ParameterList;
}
export {};
