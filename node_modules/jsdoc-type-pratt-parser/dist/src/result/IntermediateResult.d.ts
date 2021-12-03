import { KeyValueResult, NonTerminalResult } from './NonTerminalResult';
import { TerminalResult } from './TerminalResult';
export declare type IntermediateResult = NonTerminalResult | ParameterList | ReadonlyProperty;
export interface ParameterList {
    type: 'JsdocTypeParameterList';
    elements: Array<KeyValueResult | TerminalResult>;
}
export interface ReadonlyProperty {
    type: 'JsdocTypeReadonlyProperty';
    element: TerminalResult;
}
