//------------------------------------------------------------------------------
// Warnings
//
//   - Warnings are aggregated by type, with arrays of positions.
//   - They are generated during two phases:
//     - Two types during parsing ('[' and '\\E').
//     - All other types during validation.
//------------------------------------------------------------------------------

import { Warning, Warnings } from './re_types';
import { Lexeme } from './re_types';

interface WarningReference {
  label: string;
  type: string;
  issue: string;
  msg: string;
}

type WarningReferences = {
  [key: string]: WarningReference;
};

//------------------------------------------------------------------------------

const staticInformation: WarningReferences = {
  '[': {
    label: '[',
    type: '[',
    issue: 'An open bracket has not been closed',
    msg: 'The parser is adding an implicit closing bracket.',
  },
  '\\E': {
    type: '\\E',
    label: '\\',
    issue: 'No character after backslash',
    msg: 'The parser is ignoring the backslash.',
  },
  '(': {
    type: '(',
    label: '(',
    issue: 'An open parenthesis has not been closed',
    msg: 'The parser is adding an implicit closing parenthesis.',
  },
  ')': {
    type: ')',
    label: ')',
    issue: 'A closing parenthesis has no match',
    msg: 'The parser is ignoring the closing parenthesis.',
  },
  '**': {
    type: '**',
    label: '', // label from parser
    issue: 'Redundant quantifiers',
    msg: 'The parser is simplifying the quantifiers to a single one.',
  },
  'E*': {
    type: 'E*',
    label: '', // label from parser
    issue: 'A quantifier follows an empty value',
    msg: 'The parser is ignoring the quantifier.',
  },
  'E|': {
    type: 'E|',
    label: '|',
    issue: 'An alternation follows an empty value',
    msg: 'The parser is ignoring the alternation.',
  },
  '|E': {
    type: '|E',
    label: '|',
    issue: 'An alternation precedes an empty value',
    msg: 'The parser is ignoring the alternation.',
  },
  '()': {
    type: '()',
    label: '()',
    issue: 'A pair of parentheses contains no value',
    msg: 'The parser is ignoring the parentheses.',
  },
  '(E': {
    type: '(E',
    label: '(',
    issue: 'An open parenthesis has not been closed and is empty',
    msg: 'The parser is ignoring the parenthesis.',
  },
};

//------------------------------------------------------------------------------

const warn =
  (staticInformation: WarningReferences) =>
  (
    type: string,
    pos: number,
    index: number,
    lexemes: Lexeme[],
    warnings: Warnings,
    info?: object
  ) => {
    lexemes[index].invalid = true;

    const existingWarning = warnings.get(type);
    if (existingWarning) {
      existingWarning.count += 1;
      existingWarning.positions.push(pos);
      return;
    }

    const warning: Warning = {
      ...staticInformation[type],
      ...info,
      count: 1,
      positions: [pos],
    };
    warnings.set(type, warning);
  };

//------------------------------------------------------------------------------

export default warn(staticInformation);
