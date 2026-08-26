export declare enum GameType {
    IMPOSTOR = "IMPOSTOR",
    TESTA = "TESTA",
    NUMBERS = "NUMBERS"
}
export declare enum GameState {
    LOBBY = "LOBBY",
    STARTING = "STARTING",
    WORD_REVEAL = "WORD_REVEAL",
    DISCUSSION = "DISCUSSION",
    VOTING_REQUEST = "VOTING_REQUEST",
    VOTING = "VOTING",
    REVEALING = "REVEALING",
    RESULT = "RESULT",
    IN_GAME = "IN_GAME"
}
export declare enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD"
}
export declare enum ImpostorMode {
    AUTO = "AUTO",
    CUSTOM = "CUSTOM"
}
export interface ChatMessage {
    id: string;
    playerId: string;
    playerName: string;
    text: string;
    imageUrl?: string;
    timestamp: number;
}
export interface Player {
    id: string;
    name: string;
    avatar: string;
    isHost: boolean;
    isConnected: boolean;
    score: number;
    isWinner?: boolean;
    isImpostor?: boolean;
    word?: string;
    hasSeenWord?: boolean;
    hasVoted?: boolean;
    hasRequestedVote?: boolean;
    votedFor?: string;
    hasVotedSkip?: boolean;
    testaWord?: string;
    hasGuessedTesta?: boolean;
    numberValue?: number;
    discoveredNumbers?: string[];
    hasBeenDiscovered?: boolean;
}
export interface RoomConfig {
    gameType: GameType;
    theme: string;
    customThemeId?: string;
    difficulty: Difficulty;
    impostorMode: ImpostorMode;
    customImpostorCount: number;
    discussionTimeLimit: number;
    showImpostorCount: boolean;
    soundEnabled: boolean;
    useFlatMode?: boolean;
    testaLives: number;
    testaMode: 'points' | 'survival';
    numbersMin?: number;
    numbersMax?: number;
}
export interface ThemePairs {
    easy: string[][];
    medium: string[][];
    hard: string[][];
}
export interface Theme {
    id: string;
    name: string;
    icon: string;
    is18Plus?: boolean;
    pairs: ThemePairs;
}
export interface CustomTheme {
    id: string;
    name: string;
    words: string[];
}
export interface WordSelection {
    groupId: string;
    normalWord: string;
    impostorWord: string;
    themeName: string;
}
export interface Vote {
    voterId: string;
    votedForId: string;
}
export interface VoteResult {
    playerId: string;
    playerName: string;
    voteCount: number;
}
export interface GameResult {
    impostorsFound: boolean;
    impostors: {
        id: string;
        name: string;
    }[];
    normalWord: string;
    impostorWord: string;
    themeName: string;
    votes: VoteResult[];
    eliminatedPlayer: {
        id: string;
        name: string;
    } | null;
    impostorsDiscovered: number;
    totalImpostors: number;
}
export interface RoomPublicState {
    code: string;
    state: GameState;
    players: PublicPlayer[];
    config: RoomConfig;
    hostId: string;
    voteRequestCount: number;
    voteRequestsNeeded: number;
    votesRegistered: number;
    totalPlayers: number;
    round: number;
    customThemeWordCount: number;
}
export interface PublicPlayer {
    id: string;
    name: string;
    avatar: string;
    isHost: boolean;
    isConnected: boolean;
    score: number;
    isWinner?: boolean;
    hasSeenWord: boolean;
    hasVoted: boolean;
    hasRequestedVote: boolean;
    hasVotedSkip?: boolean;
    testaWord?: string;
    hasGuessedTesta?: boolean;
    testaLivesLeft?: number;
    testaGuessedCorrectly?: boolean;
    testaGuessOrder?: number;
    numberValue?: number;
    hasBeenDiscovered?: boolean;
}
export interface GameHistoryEntry {
    id: string;
    date: string;
    theme: string;
    normalWord: string;
    impostorWord: string;
    playerCount: number;
    wasImpostor: boolean;
    won: boolean;
    groupId: string;
}
export interface ClientToServerEvents {
    'room:create': (data: {
        playerName: string;
        avatar: string;
        config: RoomConfig;
        customTheme?: CustomTheme;
    }) => void;
    'room:join': (data: {
        playerName: string;
        avatar: string;
        roomCode: string;
    }) => void;
    'room:leave': () => void;
    'room:updateConfig': (config: Partial<RoomConfig>) => void;
    'room:kick': (playerId: string) => void;
    'room:resetScores': () => void;
    'chat:sendMessage': (message: string) => void;
    'chat:sendImage': (imageUrl: string) => void;
    'game:start': () => void;
    'game:wordSeen': () => void;
    'game:requestVote': () => void;
    'game:cancelVoteRequest': () => void;
    'game:vote': (votedForId: string) => void;
    'game:voteSkip': () => void;
    'game:nextRound': () => void;
    'game:changeTheme': () => void;
    'game:reaction': (reaction: string) => void;
    'game:guessTesta': (guess: string, callback?: (res: {
        correct: boolean;
    }) => void) => void;
    'game:giveUpTesta': () => void;
    'game:guessNumber': (data: {
        targetId: string;
        guess: number;
    }, callback?: (res: {
        correct: boolean;
    }) => void) => void;
    'theme:setCustom': (theme: CustomTheme) => void;
    'theme:addWord': (word: string) => void;
    'theme:removeWord': (word: string) => void;
    'room:reconnect': (data: {
        roomCode: string;
        playerId: string;
    }) => void;
}
export interface ServerToClientEvents {
    'room:created': (data: {
        roomCode: string;
        playerId: string;
    }) => void;
    'room:joined': (data: {
        playerId: string;
        roomState: RoomPublicState;
    }) => void;
    'room:updated': (roomState: RoomPublicState) => void;
    'room:playerJoined': (player: PublicPlayer) => void;
    'room:playerLeft': (playerId: string) => void;
    'room:playerDisconnected': (playerId: string) => void;
    'room:playerReconnected': (playerId: string) => void;
    'room:hostChanged': (newHostId: string) => void;
    'room:closed': () => void;
    'chat:newMessage': (message: {
        id: string;
        playerId: string;
        playerName: string;
        text: string;
        timestamp: number;
        isSystem?: boolean;
    }) => void;
    'game:wordAssigned': (data: {
        word: string;
        isImpostor: boolean;
    }) => void;
    'game:numberAssigned': (numberValue: number) => void;
    'game:started': (roomState: RoomPublicState) => void;
    'game:allReady': () => void;
    'game:voteStarted': () => void;
    'game:discussionStarted': () => void;
    'game:voteRequested': (data: {
        requestCount: number;
        needed: number;
        requesterId: string;
    }) => void;
    'game:votingStarted': () => void;
    'game:voteRegistered': (data: {
        votesCount: number;
        totalPlayers: number;
    }) => void;
    'game:result': (result: GameResult) => void;
    'game:roundReset': (roomState: RoomPublicState) => void;
    'game:reactionReceived': (data: {
        playerId: string;
        reaction: string;
    }) => void;
    'room:reconnected': (data: {
        playerId: string;
        roomState: RoomPublicState;
        word?: string;
        isImpostor?: boolean;
    }) => void;
    'theme:sync': (words: string[]) => void;
    'error': (data: {
        code: string;
        message: string;
    }) => void;
}
export interface ThemeListItem {
    id: string;
    name: string;
    icon: string;
    groupCount: number;
    is18Plus?: boolean;
}
