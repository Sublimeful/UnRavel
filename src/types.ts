export interface PlayerSanitized {
  uid: string;
  username: string;
}

export interface PlayerStatsSanitized {
  username: string;
  interactions: Interaction[];
  guesses: string[];
}

export interface GameSettings {
  category: string;
}

export interface Interaction {
  question: string;
  answer: string;
}
