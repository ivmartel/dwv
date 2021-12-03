import { TransformRules } from './transform'
import {
  JsdocObjectKeyValueResult,
  KeyValueResult,
  NonTerminalResult
} from '../result/NonTerminalResult'
import {
  FunctionResult,
  NameResult,
  StringValueResult,
  SymbolResult,
  TerminalResult,
  VariadicResult,
  NumberResult
} from '../result/TerminalResult'
import { isPlainKeyValue } from '../assertTypes'

export function identityTransformRules (): TransformRules<NonTerminalResult> {
  return {
    JsdocTypeIntersection: (result, transform) => ({
      type: 'JsdocTypeIntersection',
      elements: result.elements.map(transform) as TerminalResult[]
    }),

    JsdocTypeGeneric: (result, transform) => ({
      type: 'JsdocTypeGeneric',
      left: transform(result.left) as TerminalResult,
      elements: result.elements.map(transform) as TerminalResult[],
      meta: {
        dot: result.meta.dot,
        brackets: result.meta.brackets
      }
    }),

    JsdocTypeNullable: result => result,

    JsdocTypeUnion: (result, transform) => ({
      type: 'JsdocTypeUnion',
      elements: result.elements.map(transform) as TerminalResult[]
    }),

    JsdocTypeUnknown: result => result,

    JsdocTypeUndefined: result => result,

    JsdocTypeTypeof: (result, transform) => ({
      type: 'JsdocTypeTypeof',
      element: transform(result.element) as TerminalResult
    }),

    JsdocTypeSymbol: (result, transform) => {
      const transformed: SymbolResult = {
        type: 'JsdocTypeSymbol',
        value: result.value
      }
      if (result.element !== undefined) {
        transformed.element = transform(result.element) as NumberResult | NameResult | VariadicResult<NameResult>
      }
      return transformed
    },

    JsdocTypeOptional: (result, transform) => ({
      type: 'JsdocTypeOptional',
      element: transform(result.element) as TerminalResult,
      meta: {
        position: result.meta.position
      }
    }),

    JsdocTypeObject: (result, transform) => ({
      type: 'JsdocTypeObject',
      meta: {
        separator: 'comma'
      },
      elements: result.elements.map(transform) as Array<KeyValueResult | JsdocObjectKeyValueResult>
    }),

    JsdocTypeNumber: result => result,

    JsdocTypeNull: result => result,

    JsdocTypeNotNullable: (result, transform) => ({
      type: 'JsdocTypeNotNullable',
      element: transform(result.element) as TerminalResult,
      meta: {
        position: result.meta.position
      }
    }),

    JsdocTypeSpecialNamePath: result => result,

    JsdocTypeKeyValue: (result, transform) => {
      if (isPlainKeyValue(result)) {
        return {
          type: 'JsdocTypeKeyValue',
          key: result.key,
          right: result.right === undefined ? undefined : transform(result.right) as TerminalResult,
          optional: result.optional,
          readonly: result.readonly,
          meta: result.meta
        }
      } else {
        return {
          type: 'JsdocTypeKeyValue',
          left: transform(result.left) as TerminalResult,
          right: transform(result.right) as TerminalResult,
          meta: result.meta
        }
      }
    },

    JsdocTypeImport: (result, transform) => ({
      type: 'JsdocTypeImport',
      element: transform(result.element) as StringValueResult
    }),

    JsdocTypeAny: result => result,

    JsdocTypeStringValue: result => result,

    JsdocTypeNamePath: result => result,

    JsdocTypeVariadic: (result, transform) => {
      const transformed: VariadicResult<TerminalResult> = {
        type: 'JsdocTypeVariadic',
        meta: {
          position: result.meta.position,
          squareBrackets: result.meta.squareBrackets
        }
      }

      if (result.element !== undefined) {
        transformed.element = transform(result.element) as TerminalResult
      }

      return transformed
    },

    JsdocTypeTuple: (result, transform) => ({
      type: 'JsdocTypeTuple',
      elements: (result.elements as NonTerminalResult[]).map(transform) as TerminalResult[]|KeyValueResult[]
    }),

    JsdocTypeName: result => result,

    JsdocTypeFunction: (result, transform) => {
      const transformed: FunctionResult = {
        type: 'JsdocTypeFunction',
        arrow: result.arrow,
        parameters: result.parameters.map(transform) as TerminalResult[],
        parenthesis: result.parenthesis
      }

      if (result.returnType !== undefined) {
        transformed.returnType = transform(result.returnType) as TerminalResult
      }

      return transformed
    },

    JsdocTypeKeyof: (result, transform) => ({
      type: 'JsdocTypeKeyof',
      element: transform(result.element) as TerminalResult
    }),

    JsdocTypeParenthesis: (result, transform) => ({
      type: 'JsdocTypeParenthesis',
      element: transform(result.element) as TerminalResult
    }),

    JsdocTypeProperty: result => result
  }
}
