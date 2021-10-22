//------------------------------------------------------------------------------
// Parse the regex
//
//   - The parse() function returns lexemes, tokens and warnings.
//   - Lexemes are used for syntax higlighting.
//   - Tokens are used to build the NFA.
//   - Lexemes break down bracket expressions whereas each expression
//     corresponds to only one token.
//   - The parsing phase generates two types of warnings:
//       - Unclosed brackets ('[').
//       - Terminal escape characters ('//E').
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Imports

import { Match, Lexeme, Token } from './re_types';
import warn, { Warnings } from './re_warnings';

//------------------------------------------------------------------------------
// Constants

const digits = new Set('0123456789');
const words = new Set(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'
);
const spaces = new Set(' \\f\\n\\r\\t\\v');

//------------------------------------------------------------------------------
// Matching functions

const matchAll = (ch: string) => true;

const match = (label: string) => (ch: string) => ch === label;

const matchIn = (set: Set<string>) => (ch: string) => set.has(ch);

const matchNotIn = (set: Set<string>) => (ch: string) => !set.has(ch);

//------------------------------------------------------------------------------
// Create tokens

const value =
  (label: string, type: string, match: Match) =>
  (pos: number, index: number): Token => ({
    label,
    type,
    pos,
    index,
    match,
  });

const operator =
  (label: string) =>
  (pos: number | null, index: number | null): Token => ({
    label,
    type: label,
    pos,
    index,
  });

const getConcat = () => operator('~')(null, null);

const getParenClose = (pos: number, index: number) => operator(')')(pos, index);

//------------------------------------------------------------------------------
// Satic tokens

type StaticTokens = {
  [key: string]: (pos: number, index: number) => Token;
};

const staticTokens: StaticTokens = {
  // Values
  '.': value('.', '.', () => true),

  '\\d': value('\\d', 'charClass', matchIn(digits)),
  '\\D': value('\\D', 'charClass', matchNotIn(digits)),
  '\\w': value('\\w', 'charClass', matchIn(words)),
  '\\W': value('\\W', 'charClass', matchNotIn(words)),
  '\\s': value('\\s', 'charClass', matchIn(spaces)),
  '\\S': value('\\S', 'charClass', matchNotIn(spaces)),

  // Operators
  '|': operator('|'),
  '?': operator('?'),
  '*': operator('*'),
  '+': operator('+'),
  '(': operator('('),
  ')': operator(')'),
};

const typeToDisplayType: {
  [key: string]: string;
} = {
  charLiteral: 'value',
  escapedChar: 'value',
  charClass: 'value-special',
  bracketChar: 'value',
  bracketRangeLow: 'value-special',
  bracketRangeHigh: 'value-special',
  '.': 'value-special',
  '?': 'quantifier',
  '*': 'quantifier',
  '+': 'quantifier',
  '|': 'operator',
  '(': 'delimiter',
  ')': 'delimiter',
  '[': 'delimiter',
  ']': 'delimiter',
  '-': 'value-special',
  '^': 'operator',
};

//------------------------------------------------------------------------------
// Helper functions for lexemes

const addLexeme = (
  lexemes: Lexeme[],
  label: string,
  type: string,
  pos: number
) => {
  const lexeme = {
    label,
    type,
    pos,
    index: lexemes.length,
    displayType: typeToDisplayType[type],
  };
  lexemes.push(lexeme);
};

const describe = (lexeme: Lexeme, info: object) => {
  Object.entries(info).forEach(([key, value]) => (lexeme[key] = value));
};

//------------------------------------------------------------------------------
// Bracket expressions: Helpers

type State = {
  regex: string;
  pos: number;
  lexemes: Lexeme[];
};

const eat = (type: string, state: State) => {
  const { regex, pos, lexemes } = state;
  addLexeme(lexemes, regex[pos], type, pos);
  state.pos++;
};

const tryEat = (label: string, type: string, state: State) => {
  if (state.regex[state.pos] === label) {
    eat(type, state);
    return true;
  }
  return false;
};

const read = (type: string, state: State, set: Set<string>) => {
  const { regex, pos, lexemes } = state;
  const label = regex[pos];
  addLexeme(lexemes, label, type, pos);
  set.add(label);
  state.pos++;
};

const tryRead = (
  label: string,
  type: string,
  state: State,
  set: Set<string>
) => {
  if (state.regex[state.pos] === label) {
    read(type, state, set);
    return true;
  }
  return false;
};

const tryReadBracketRange = (state: State, set: Set<string>) => {
  const { regex, pos } = state;

  if (
    regex.length - pos < 3 ||
    regex[pos + 1] !== '-' ||
    regex[pos + 2] === ']'
  ) {
    return false;
  }

  const rangeLow = regex.charCodeAt(pos);
  const rangeHigh = regex.charCodeAt(pos + 2);
  for (let i = rangeLow; i <= rangeHigh; i++) {
    set.add(String.fromCharCode(i));
  }

  eat('bracketRangeLow', state);
  eat('-', state);
  eat('bracketRangeHigh', state);

  return true;
};

//------------------------------------------------------------------------------
// Bracket expressions: Main

const readBracketExpression = (
  regex: string,
  pos: number,
  lexemes: Lexeme[],
  warnings: Warnings
) => {
  const set: Set<string> = new Set();
  const state = { regex, pos, lexemes };
  const begin = lexemes.length;

  eat('[', state);
  const negate = tryEat('^', '^', state);

  // Special characters are treated as literals at the beginning
  tryRead(']', 'bracketChar', state, set) ||
    tryRead('-', 'bracketChar', state, set);

  // Try a character range, otherwise read a chararacter literal
  while (state.pos < regex.length && regex[state.pos] !== ']') {
    tryReadBracketRange(state, set) || read('bracketChar', state, set);
  }

  // Finalize lexemes
  const end = lexemes.length;
  const matches = [...set].join('');
  const info = { begin, end: lexemes.length, negate, matches };
  const label = regex.slice(pos, state.pos) + ']';

  // Syntax error: open bracket with no closing
  const hasClosingBracket = regex[state.pos] === ']';
  if (hasClosingBracket) {
    eat(']', state);
    describe(lexemes[end], info);
  } else {
    info.end--;
    warn('[', pos, begin, lexemes, warnings);
  }

  describe(lexemes[begin], info);

  // Token
  return {
    label,
    type: 'bracketClass',
    pos,
    index: begin,
    match: negate ? matchNotIn(set) : matchIn(set),
    begin: info.begin, // @todo
    end: info.end,
    negate,
  };
};

//------------------------------------------------------------------------------
// Main parsing function

const parse = (regex: string) => {
  let pos = 0;
  const lexemes: Lexeme[] = [];
  const tokens = [];
  const warnings = new Map();

  while (pos < regex.length) {
    const ch = regex[pos];
    const ch2 = regex[pos + 1];
    const label = regex.slice(pos, pos + 2);
    const index = lexemes.length;
    let token = null;
    let lexemesAdded = false;

    // Bracket expression
    if (ch === '[') {
      token = readBracketExpression(regex, pos, lexemes, warnings);
      lexemesAdded = true;
    }

    // Static tokens (operators and wildcard)
    else if (ch in staticTokens) {
      token = staticTokens[ch](pos, index);
    }

    // Character classes
    else if (label in staticTokens) {
      token = staticTokens[label](pos, index);
    }

    // Escaped chararacter
    else if (ch === '\\' && ch2 !== undefined) {
      token = value(label, 'escapedChar', match(ch2))(pos, index);
    }

    // Syntax error: terminal backslash
    else if (ch === '\\') {
      token = value(ch, 'escapedChar', matchAll)(pos, index);
      token.invalid = true;
      addLexeme(lexemes, token.label, token.type, pos);
      lexemesAdded = true;
      warn('\\E', pos, index, lexemes, warnings);
    }

    // Character literal
    else {
      token = value(ch, 'charLiteral', match(ch))(pos, index);
    }

    // If the lexemes have not already been added (bracket expressions)
    if (!lexemesAdded) addLexeme(lexemes, token.label, token.type, pos);
    tokens.push(token);
    pos += token.label.length;
  }

  return { lexemes, tokens, warnings };
};

//------------------------------------------------------------------------------

export { getConcat, getParenClose };
export default parse;
