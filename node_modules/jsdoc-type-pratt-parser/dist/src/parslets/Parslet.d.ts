import { TokenType } from '../lexer/Token';
import { Parser } from '../Parser';
import { Precedence } from '../Precedence';
import { IntermediateResult } from '../result/IntermediateResult';
export interface Parslet {
    accepts: (type: TokenType, next: TokenType) => boolean;
    getPrecedence: () => Precedence;
}
export interface PrefixParslet extends Parslet {
    parsePrefix: (parser: Parser) => IntermediateResult;
}
export interface InfixParslet extends Parslet {
    parseInfix: (parser: Parser, left: IntermediateResult) => IntermediateResult;
}
