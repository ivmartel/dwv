import { NonTerminalResult } from './result/NonTerminalResult'
import { TerminalResult } from './result/TerminalResult'
import { visitorKeys } from './visitorKeys'

type NodeVisitor = (node: NonTerminalResult, parentNode?: NonTerminalResult, property?: string) => void

function _traverse<T extends NonTerminalResult, U extends NonTerminalResult> (node: T, parentNode?: U, property?: keyof U, onEnter?: NodeVisitor, onLeave?: NodeVisitor): void {
  onEnter?.(node, parentNode, property as string)

  const keysToVisit = visitorKeys[node.type] as Array<keyof T>

  if (keysToVisit !== undefined) {
    for (const key of keysToVisit) {
      const value = node[key]
      if (value !== undefined) {
        if (Array.isArray(value)) {
          for (const element of value) {
            _traverse(element as unknown as NonTerminalResult, node, key, onEnter, onLeave)
          }
        } else {
          _traverse(value as unknown as NonTerminalResult, node, key, onEnter, onLeave)
        }
      }
    }
  }

  onLeave?.(node, parentNode, property as string)
}

export function traverse (node: TerminalResult, onEnter?: NodeVisitor, onLeave?: NodeVisitor): void {
  _traverse(node, undefined, undefined, onEnter, onLeave)
}
