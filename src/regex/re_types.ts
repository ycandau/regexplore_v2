export type Match = (ch: string) => boolean;

export type Lexeme = {
  label: string;
  type: string;
  pos: number;
  index: number;
  displayType: string;
  invalid?: boolean;
  begin?: number;
  end?: number;
  negate?: boolean;
  matches?: string;
};

export type Token = {
  label: string;
  type: string;
  pos: number | null;
  index: number | null;
  match?: Match;
  invalid?: boolean;
};

type Warning = {
  label: string;
  type: string;
  issue: string;
  msg: string;
  count: number;
  positions: number[];
};

export type Warnings = Map<string, Warning>;
