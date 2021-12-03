import { Token } from './Token';
export declare class Lexer {
    private text;
    private current;
    private next;
    private previous;
    lex(text: string): void;
    token(): Token;
    peek(): Token;
    last(): Token | undefined;
    advance(): void;
    private read;
}
