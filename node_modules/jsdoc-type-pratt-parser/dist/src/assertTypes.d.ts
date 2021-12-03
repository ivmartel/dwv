import { KeyValueResult } from './result/NonTerminalResult';
import { NameResult, NumberResult, TerminalResult, VariadicResult } from './result/TerminalResult';
import { IntermediateResult } from './result/IntermediateResult';
export declare function assertTerminal(result?: IntermediateResult): TerminalResult;
export declare function assertPlainKeyValueOrTerminal(result: IntermediateResult): KeyValueResult | TerminalResult;
export declare function assertPlainKeyValueOrName(result: IntermediateResult): KeyValueResult | NameResult;
export declare function assertPlainKeyValue(result: IntermediateResult): KeyValueResult;
export declare function assertNumberOrVariadicName(result: IntermediateResult): NumberResult | NameResult | VariadicResult<NameResult>;
export declare function isPlainKeyValue(result: IntermediateResult): result is KeyValueResult;
