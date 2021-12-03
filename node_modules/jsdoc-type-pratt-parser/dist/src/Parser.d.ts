import { Token, TokenType } from './lexer/Token';
import { Lexer } from './lexer/Lexer';
import { InfixParslet, PrefixParslet } from './parslets/Parslet';
import { Grammar } from './grammars/Grammar';
import { Precedence } from './Precedence';
import { TerminalResult } from './result/TerminalResult';
import { IntermediateResult } from './result/IntermediateResult';
export declare class Parser {
    private readonly prefixParslets;
    private readonly infixParslets;
    private readonly lexer;
    constructor(grammar: Grammar, lexer?: Lexer);
    parseText(text: string): TerminalResult;
    getPrefixParslet(): PrefixParslet | undefined;
    getInfixParslet(precedence: Precedence): InfixParslet | undefined;
    canParseType(): boolean;
    parseType(precedence: Precedence): TerminalResult;
    parseIntermediateType(precedence: Precedence): IntermediateResult;
    parseInfixIntermediateType(result: IntermediateResult, precedence: Precedence): IntermediateResult;
    consume(type: TokenType): boolean;
    getToken(): Token;
    peekToken(): Token;
    previousToken(): Token | undefined;
    getLexer(): Lexer;
}
