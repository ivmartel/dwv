import { Block, Line, Problem } from '../primitives';
import { splitLines } from '../util';
import blockParser from './block-parser';
import sourceParser from './source-parser';
import specParser from './spec-parser';
import { Tokenizer } from './tokenizers/index';
import tokenizeTag from './tokenizers/tag';
import tokenizeType from './tokenizers/type';
import tokenizeName from './tokenizers/name';
import tokenizeDescription, {
  getJoiner as getDescriptionJoiner,
} from './tokenizers/description';

export interface Options {
  // start count for source line numbers
  startLine: number;
  // escaping chars sequence marking wrapped content literal for the parser
  fence: string;
  // block and comment description compaction strategy
  spacing: 'compact' | 'preserve';
  // tokenizer functions extracting name, type, and description out of tag, see Tokenizer
  tokenizers: Tokenizer[];
}

export type Parser = (source: string) => Block[];

export default function getParser({
  startLine = 0,
  fence = '```',
  spacing = 'compact',
  tokenizers = [
    tokenizeTag(),
    tokenizeType(spacing),
    tokenizeName(),
    tokenizeDescription(spacing),
  ],
}: Partial<Options> = {}): Parser {
  if (startLine < 0 || startLine % 1 > 0) throw new Error('Invalid startLine');

  const parseSource = sourceParser({ startLine });
  const parseBlock = blockParser({ fence });
  const parseSpec = specParser({ tokenizers });
  const joinDescription = getDescriptionJoiner(spacing);

  const notEmpty = (line: Line): boolean =>
    line.tokens.description.trim() != '';

  return function (source: string): Block[] {
    const blocks: Block[] = [];
    for (const line of splitLines(source)) {
      const lines = parseSource(line);

      if (lines === null) continue;
      if (lines.find(notEmpty) === undefined) continue;

      const sections = parseBlock(lines);
      const specs = sections.slice(1).map(parseSpec);

      blocks.push({
        description: joinDescription(sections[0]),
        tags: specs,
        source: lines,
        problems: specs.reduce(
          (acc: Problem[], spec) => acc.concat(spec.problems),
          []
        ),
      });
    }
    return blocks;
  };
}
