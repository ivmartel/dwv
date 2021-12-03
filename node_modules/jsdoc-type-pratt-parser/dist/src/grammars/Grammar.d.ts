import { InfixParslet, PrefixParslet } from '../parslets/Parslet';
export interface Grammar {
    prefixParslets: PrefixParslet[];
    infixParslets: InfixParslet[];
}
export declare type GrammarFactory = () => Grammar;
