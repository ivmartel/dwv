import { PrefixParslet } from './Parslet'
import { TokenType } from '../lexer/Token'
import { Parser } from '../Parser'
import { Precedence } from '../Precedence'
import { TerminalResult } from '../result/TerminalResult'

export class ImportParslet implements PrefixParslet {
  accepts (type: TokenType, next: TokenType): boolean {
    return type === 'import'
  }

  getPrecedence (): Precedence {
    return Precedence.PREFIX
  }

  parsePrefix (parser: Parser): TerminalResult {
    parser.consume('import')
    if (!parser.consume('(')) {
      throw new Error('Missing parenthesis after import keyword')
    }
    const path = parser.parseType(Precedence.PREFIX)
    if (path.type !== 'JsdocTypeStringValue') {
      throw new Error('Only string values are allowed as paths for imports')
    }
    if (!parser.consume(')')) {
      throw new Error('Missing closing parenthesis after import keyword')
    }
    return {
      type: 'JsdocTypeImport',
      element: path
    }
  }
}
