export interface PlayerSanitized {
  uid: string;
  username: string;
}

export interface PlayerStatsSanitized {
  username: string;
  interactions: Interaction[];
  guesses: string[];
  elo: number | null;
}

export interface GameSettings {
  category: string;
  timeLimit: number;
}

export interface Interaction {
  question: string;
  answer: string;
}
