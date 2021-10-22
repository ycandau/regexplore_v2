export type Match = (ch: string) => boolean;

export type Lexeme = {
  label: string;
  type: string;
  pos: number;
  index: number;
  displayType: string;
  invalid?: boolean;
};

export type Token = {
  label: string;
  type: string;
  pos: number | null;
  index: number | null;
  match?: Match;
  invalid?: boolean;
};
