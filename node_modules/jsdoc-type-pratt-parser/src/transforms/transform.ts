import { KeyValueResult, NonTerminalResult } from '../result/NonTerminalResult'
import { FunctionResult, TerminalResult } from '../result/TerminalResult'

export type TransformFunction<TransformResult> = (parseResult: NonTerminalResult) => TransformResult

export type TransformRule<TransformResult, InputType extends NonTerminalResult> = (parseResult: InputType, transform: TransformFunction<TransformResult>) => TransformResult

export type TransformRules<TransformResult> = {
  [P in NonTerminalResult as P['type']]: TransformRule<TransformResult, P>
}

export function transform<TransformResult> (rules: TransformRules<TransformResult>, parseResult: NonTerminalResult): TransformResult {
  const rule = rules[parseResult.type] as TransformRule<TransformResult, NonTerminalResult>
  if (rule === undefined) {
    throw new Error(`In this set of transform rules exists no rule for type ${parseResult.type}.`)
  }

  return rule(parseResult, aParseResult => transform(rules, aParseResult))
}

export function notAvailableTransform<TransformResult> (parseResult: NonTerminalResult): TransformResult {
  throw new Error('This transform is not available. Are you trying the correct parsing mode?')
}

interface SpecialFunctionParams {
  params: Array<TerminalResult | KeyValueResult>
  this?: TerminalResult
  new?: TerminalResult
}

export function extractSpecialParams (source: FunctionResult): SpecialFunctionParams {
  const result: SpecialFunctionParams = {
    params: []
  }

  for (const param of source.parameters) {
    if (param.type === 'JsdocTypeKeyValue' && param.meta.quote === undefined) {
      if (param.key === 'this') {
        result.this = param.right
      } else if (param.key === 'new') {
        result.new = param.right
      } else {
        result.params.push(param)
      }
    } else {
      result.params.push(param)
    }
  }

  return result
}
