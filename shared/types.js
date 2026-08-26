// ============================================
// IMPOSTOR GAME — Tipos Compartilhados
// ============================================
export var GameType;
(function (GameType) {
    GameType["IMPOSTOR"] = "IMPOSTOR";
    GameType["TESTA"] = "TESTA";
    GameType["NUMBERS"] = "NUMBERS";
})(GameType || (GameType = {}));
// Estados da máquina de estados do jogo
export var GameState;
(function (GameState) {
    GameState["LOBBY"] = "LOBBY";
    GameState["STARTING"] = "STARTING";
    // Impostor specific
    GameState["WORD_REVEAL"] = "WORD_REVEAL";
    GameState["DISCUSSION"] = "DISCUSSION";
    GameState["VOTING_REQUEST"] = "VOTING_REQUEST";
    GameState["VOTING"] = "VOTING";
    GameState["REVEALING"] = "REVEALING";
    // Generic / Shared
    GameState["RESULT"] = "RESULT";
    GameState["IN_GAME"] = "IN_GAME";
})(GameState || (GameState = {}));
// Dificuldade do jogo
export var Difficulty;
(function (Difficulty) {
    Difficulty["EASY"] = "EASY";
    Difficulty["MEDIUM"] = "MEDIUM";
    Difficulty["HARD"] = "HARD";
})(Difficulty || (Difficulty = {}));
// Modo de impostores
export var ImpostorMode;
(function (ImpostorMode) {
    ImpostorMode["AUTO"] = "AUTO";
    ImpostorMode["CUSTOM"] = "CUSTOM";
})(ImpostorMode || (ImpostorMode = {}));
