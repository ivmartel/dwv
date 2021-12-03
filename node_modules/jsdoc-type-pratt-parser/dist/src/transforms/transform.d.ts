import { KeyValueResult, NonTerminalResult } from '../result/NonTerminalResult';
import { FunctionResult, TerminalResult } from '../result/TerminalResult';
export declare type TransformFunction<TransformResult> = (parseResult: NonTerminalResult) => TransformResult;
export declare type TransformRule<TransformResult, InputType extends NonTerminalResult> = (parseResult: InputType, transform: TransformFunction<TransformResult>) => TransformResult;
export declare type TransformRules<TransformResult> = {
    [P in NonTerminalResult as P['type']]: TransformRule<TransformResult, P>;
};
export declare function transform<TransformResult>(rules: TransformRules<TransformResult>, parseResult: NonTerminalResult): TransformResult;
export declare function notAvailableTransform<TransformResult>(parseResult: NonTerminalResult): TransformResult;
interface SpecialFunctionParams {
    params: Array<TerminalResult | KeyValueResult>;
    this?: TerminalResult;
    new?: TerminalResult;
}
export declare function extractSpecialParams(source: FunctionResult): SpecialFunctionParams;
export {};
