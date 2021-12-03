import { KeyValueResult } from './result/NonTerminalResult'
import { UnexpectedTypeError } from './errors'
import { NameResult, NumberResult, TerminalResult, VariadicResult } from './result/TerminalResult'
import { IntermediateResult } from './result/IntermediateResult'

export function assertTerminal (result?: IntermediateResult): TerminalResult {
  if (result === undefined) {
    throw new Error('Unexpected undefined')
  }
  if (result.type === 'JsdocTypeKeyValue' || result.type === 'JsdocTypeParameterList' || result.type === 'JsdocTypeProperty' || result.type === 'JsdocTypeReadonlyProperty') {
    throw new UnexpectedTypeError(result)
  }
  return result
}

export function assertPlainKeyValueOrTerminal (result: IntermediateResult): KeyValueResult | TerminalResult {
  if (result.type === 'JsdocTypeKeyValue') {
    return assertPlainKeyValue(result)
  }
  return assertTerminal(result)
}

export function assertPlainKeyValueOrName (result: IntermediateResult): KeyValueResult | NameResult {
  if (result.type === 'JsdocTypeName') {
    return result
  }
  return assertPlainKeyValue(result)
}

export function assertPlainKeyValue (result: IntermediateResult): KeyValueResult {
  if (!isPlainKeyValue(result)) {
    if (result.type === 'JsdocTypeKeyValue') {
      throw new UnexpectedTypeError(result, 'Expecting no left side expression.')
    } else {
      throw new UnexpectedTypeError(result)
    }
  }
  return result
}

export function assertNumberOrVariadicName (result: IntermediateResult): NumberResult | NameResult | VariadicResult<NameResult> {
  if (result.type === 'JsdocTypeVariadic') {
    if (result.element?.type === 'JsdocTypeName') {
      return result as VariadicResult<NameResult>
    }
    throw new UnexpectedTypeError(result)
  }
  if (result.type !== 'JsdocTypeNumber' && result.type !== 'JsdocTypeName') {
    throw new UnexpectedTypeError(result)
  }
  return result
}

export function isPlainKeyValue (result: IntermediateResult): result is KeyValueResult {
  return result.type === 'JsdocTypeKeyValue' && !result.meta.hasLeftSideExpression
}
