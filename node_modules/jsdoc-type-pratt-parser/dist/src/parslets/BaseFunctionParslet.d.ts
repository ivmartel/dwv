import { KeyValueResult } from '../result/NonTerminalResult';
import { IntermediateResult } from '../result/IntermediateResult';
import { TerminalResult } from '../result/TerminalResult';
export declare class BaseFunctionParslet {
    protected getParameters(value: IntermediateResult): Array<TerminalResult | KeyValueResult>;
    protected getUnnamedParameters(value: IntermediateResult): TerminalResult[];
}
