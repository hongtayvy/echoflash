export type DeckId = string;
export type CardId = string;

export type echoflash = {
  id: CardId;
  deckId: DeckId;
  question: string;
  answer: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

export type Deck = {
  id: DeckId;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type StudyMark = "know" | "dontknow";

export type StudySession = {
  deckId: DeckId;
  startedAt: number;
  updatedAt: number;
  order: CardId[];
  index: number;
  flipped: boolean;
  marks: Record<CardId, StudyMark>;
};

export type CsvRow = {
  question: string;
  answer: string;
  tags?: string[];
};

export type CsvError = {
  row: number;
  message: string;
};
