import { Parser } from './Parser'
import { jsdocGrammar } from './grammars/jsdocGrammar'
import { closureGrammar } from './grammars/closureGrammar'
import { typescriptGrammar } from './grammars/typescriptGrammar'
import { TerminalResult } from './result/TerminalResult'

export type ParseMode = 'closure' | 'jsdoc' | 'typescript'

const parsers = {
  jsdoc: new Parser(jsdocGrammar()),
  closure: new Parser(closureGrammar()),
  typescript: new Parser(typescriptGrammar())
}

/**
 * This function parses the given expression in the given mode and produces a {@link ParseResult}.
 * @param expression
 * @param mode
 */
export function parse (expression: string, mode: ParseMode): TerminalResult {
  return parsers[mode].parseText(expression)
}

/**
 * This function tries to parse the given expression in multiple modes and returns the first successful
 * {@link ParseResult}. By default it tries `'typescript'`, `'closure'` and `'jsdoc'` in this order. If
 * no mode was successful it throws the error that was produced by the last parsing attempt.
 * @param expression
 * @param modes
 */
export function tryParse (expression: string, modes: ParseMode[] = ['typescript', 'closure', 'jsdoc']): TerminalResult {
  let error
  for (const mode of modes) {
    try {
      return parsers[mode].parseText(expression)
    } catch (e) {
      error = e
    }
  }
  throw error
}
