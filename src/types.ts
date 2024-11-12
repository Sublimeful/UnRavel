export interface PlayerSanitized {
  id: PlayerID;
  username: string;
}

export interface PlayerStatsSanitized {
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

// Socket ID
export type SID = string;

export type RoomCode = string;

export type PlayerID = string;
