// ============================================
// IMPOSTOR GAME — Máquina de Estados
// ============================================
import { GameState } from '../../../shared/types.ts';

// Transições válidas
const validTransitions: Record<GameState, GameState[]> = {
  [GameState.LOBBY]: [GameState.STARTING],
  [GameState.STARTING]: [GameState.WORD_REVEAL],
  [GameState.WORD_REVEAL]: [GameState.DISCUSSION],
  [GameState.DISCUSSION]: [GameState.VOTING],
  [GameState.VOTING_REQUEST]: [GameState.VOTING], // estado intermediário
  [GameState.VOTING]: [GameState.REVEALING],
  [GameState.REVEALING]: [GameState.RESULT],
  [GameState.IN_GAME]: [GameState.RESULT],
  [GameState.RESULT]: [GameState.STARTING, GameState.LOBBY],
};

export class StateMachine {
  private _state: GameState = GameState.LOBBY;
  private _listeners: ((state: GameState, prev: GameState) => void)[] = [];

  get state(): GameState {
    return this._state;
  }

  /**
   * Tenta transitar para um novo estado.
   * Retorna true se a transição foi válida.
   */
  transition(newState: GameState): boolean {
    const allowed = validTransitions[this._state];
    if (!allowed || !allowed.includes(newState)) {
      console.warn(`[StateMachine] Transição inválida: ${this._state} → ${newState}`);
      return false;
    }

    const prev = this._state;
    this._state = newState;

    // Notificar listeners
    for (const listener of this._listeners) {
      listener(this._state, prev);
    }

    return true;
  }

  /**
   * Força um estado (usado na reconexão).
   */
  forceState(state: GameState): void {
    const prev = this._state;
    this._state = state;
    for (const listener of this._listeners) {
      listener(this._state, prev);
    }
  }

  /**
   * Reseta para o lobby.
   */
  reset(): void {
    const prev = this._state;
    this._state = GameState.LOBBY;
    for (const listener of this._listeners) {
      listener(this._state, prev);
    }
  }

  /**
   * Registra um listener para mudanças de estado.
   */
  onTransition(listener: (state: GameState, prev: GameState) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  /**
   * Verifica se uma transição é válida.
   */
  canTransition(newState: GameState): boolean {
    const allowed = validTransitions[this._state];
    return !!allowed && allowed.includes(newState);
  }
}


