import { InfixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Precedence } from '../Precedence';
import { Parser } from '../Parser';
import { JsdocObjectKeyValueResult, KeyValueResult } from '../result/NonTerminalResult';
import { IntermediateResult } from '../result/IntermediateResult';
interface KeyValueParsletOptions {
    allowKeyTypes: boolean;
    allowOptional: boolean;
    allowReadonly: boolean;
}
export declare class KeyValueParslet implements InfixParslet {
    private readonly allowKeyTypes;
    private readonly allowOptional;
    private readonly allowReadonly;
    constructor(opts: KeyValueParsletOptions);
    accepts(type: TokenType, next: TokenType): boolean;
    getPrecedence(): Precedence;
    parseInfix(parser: Parser, left: IntermediateResult): KeyValueResult | JsdocObjectKeyValueResult;
}
export {};
