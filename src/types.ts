export interface PlayerSanitized {
  id: PlayerID;
  username: string;
}

export interface GameSettings {
  category: string;
}

// Socket ID
export type SID = string;

export type RoomCode = string;

export type PlayerID = string;
