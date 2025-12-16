export enum GamePhase {
  PLAYING = 'PLAYING',
  OUT_OF_EGGS = 'OUT_OF_EGGS',
  BOUGHT_EGGS = 'BOUGHT_EGGS', // The moment after buying, before first drop
  HAS_40_EGGS = 'HAS_40_EGGS', // After first drop, showing 40
  WIN_SEQUENCE_START = 'WIN_SEQUENCE_START',
  NUDE_SCENE = 'NUDE_SCENE',
}

export type ModalType = 
  | 'INFO' 
  | 'INPUT' 
  | 'NONE';

export interface GameState {
  eggsFed: number;
  inventoryCount: number | null; // null means infinite/hidden initially
  phase: GamePhase;
  runOutThreshold: number; // Random 20-40
  winThreshold: number; // runOut + random amount
  isLinesRed: boolean;
}

export interface ModalConfig {
  show: boolean;
  text: string;
  type: ModalType;
  onConfirm?: () => void;
  onInputConfirm?: (val: string) => boolean; // Returns true if valid
  inputPlaceholder?: string;
  okText?: string;
}