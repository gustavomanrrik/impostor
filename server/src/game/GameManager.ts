// ============================================
// IMPOSTOR GAME — GameManager (Gerenciador de Salas)
// ============================================
import { Room } from './Room.ts';
import { RoomConfig } from '../../../shared/types.ts';

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Limpar salas inativas a cada 5 minutos
    this.cleanupInterval = setInterval(() => this.cleanupInactiveRooms(), 5 * 60 * 1000);
  }

  /**
   * Cria uma nova sala com código único.
   */
  createRoom(config?: Partial<RoomConfig>): Room {
    const code = this.generateCode();
    const room = new Room(code, config);
    this.rooms.set(code, room);
    console.log(`[GameManager] Sala criada: ${code}`);
    return room;
  }

  /**
   * Busca uma sala pelo código.
   */
  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  /**
   * Remove uma sala.
   */
  removeRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      room.cleanup();
      this.rooms.delete(code);
      console.log(`[GameManager] Sala removida: ${code}`);
    }
  }

  /**
   * Lista todas as salas ativas (para debug).
   */
  listRooms(): { code: string; players: number; state: string }[] {
    return Array.from(this.rooms.entries()).map(([code, room]) => ({
      code,
      players: room.playerCount,
      state: room.state,
    }));
  }

  /**
   * Gera um código de sala único de 5 caracteres.
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluir I, O, 0, 1 para evitar confusão
    let code: string;
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  /**
   * Remove salas vazias ou inativas há mais de 30 minutos.
   */
  private cleanupInactiveRooms(): void {
    for (const [code, room] of this.rooms) {
      if (room.playerCount === 0) {
        this.removeRoom(code);
      }
    }
  }

  /**
   * Cleanup ao desligar o servidor.
   */
  shutdown(): void {
    clearInterval(this.cleanupInterval);
    for (const room of this.rooms.values()) {
      room.cleanup();
    }
    this.rooms.clear();
  }
}


