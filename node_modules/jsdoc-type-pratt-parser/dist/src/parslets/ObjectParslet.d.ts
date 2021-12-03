import { PrefixParslet } from './Parslet';
import { TokenType } from '../lexer/Token';
import { Parser } from '../Parser';
import { Precedence } from '../Precedence';
import { TerminalResult } from '../result/TerminalResult';
interface ObjectParsletOptions {
    allowKeyTypes: boolean;
}
export declare class ObjectParslet implements PrefixParslet {
    private readonly allowKeyTypes;
    constructor(opts: ObjectParsletOptions);
    accepts(type: TokenType): boolean;
    getPrecedence(): Precedence;
    parsePrefix(parser: Parser): TerminalResult;
}
export {};
