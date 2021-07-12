class playMatch {
    constructor(model0Id, model1Id, winningReward, _matchIndex, showMoves) {
        this.showMoves = showMoves;
        this.model0Reward = 0;
        this.model1Reward = 0;
        this.modelToMove = 0;
        this.chess = new Chess();
        this.modelToMove = 0;
        this.history = [];
        this.oneMoveAgo;
        this.twoMovesAgo;
        this.moveCtr = 0;
        this.winningReward = winningReward;
        this.monteCarlo = new monteCarloTreeSearch();
        this.matchResults = {
            model0Points: 0,
            model1Points: 0,
            matchIndex: _matchIndex
        };
        if (parseInt(Math.random() * 2) == 0) {
            this.modelThatGotWhite = 0;
        } else {
            this.modelThatGotWhite = 1;
        }

        if (this.modelThatGotWhite == 0) {
            this.model0 = NNTrainer.models[model0Id].model;
            this.model1 = NNTrainer.models[model1Id].model;
            this.matchResults.white = model0Id;
            this.matchResults.model0Id = model0Id;
            this.matchResults.model1Id = model1Id;
            this.model0Id = model0Id;
            this.model1Id = model1Id;
        } else {
            this.model1 = NNTrainer.models[model1Id].model;
            this.model0 = NNTrainer.models[model0Id].model;
            this.matchResults.white = model1Id;
            this.matchResults.model0Id = model1Id;
            this.matchResults.model1Id = model0Id;
            this.model1Id = model0Id;
            this.model0Id = model1Id;
        }
    }
    async start() {
        document.getElementById("modelThatIsWhite").innerHTML = this.model0Id;
        board = Chessboard('board', this.chess.fen());

        await this.makeAMoveUntillGameOver();

        return this.matchResults;
    }

    async makeAMoveUntillGameOver() {
        if (this.moveCtr == null) {
            this.moveCtr = 0;
        }
        this.moveCtr++
            let justBoardStateFen = "";
        let ctr = 0;
        while (true) {
            let fenCharacter = this.chess.fen().charAt(ctr);
            if (fenCharacter == " ") {
                break;
            }
            justBoardStateFen += fenCharacter;
            ctr++;
        }
        let repetitionDraw = 0;
        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i] == justBoardStateFen) {
                repetitionDraw += 0.5;
            }
        }

        if (this.chess.game_over()) {
            this.getMatchResults();
        } else {
            let move = "";
            let monteChess = new Chess();
            monteChess.load(this.chess.fen())

            move = await this.monteCarlo.getBestMove(this.getModelToMove(), monteChess, this.history);

            (async() => {
                this.twoMovesAgo = this.oneMoveAgo;
                this.oneMoveAgo = this.chess.fen();
                this.chess.move(move);
                if (move.indexOf("p") != -1 || move.indexOf("P") != -1 || move.indexOf("x") != -1) {
                    this.history = [];
                }
                this.rewardEatingPieces(move);
                this.rewardAttackingKing();
                let justBoardStateAsFenString = "";
                let ctr = 0;
                while (true) {
                    let fenCharacter = this.chess.fen().charAt(ctr);
                    if (fenCharacter == " ") {
                        break;
                    }
                    justBoardStateAsFenString += fenCharacter;
                    ctr++;
                }

                this.history.push(justBoardStateAsFenString);

                board = Chessboard('board', this.chess.fen());
                document.getElementById("moveMade").innerHTML = move;

            })();

            this.modelToMove = (this.modelToMove + 1) % 2;

            if (this.showMoves == "true") {
                await timeout(100);
            } else if (this.moveCtr % 20 == 0) {
                await timeout(50);
            }

            if (NNTrainer.keepTraining) {
                return this.makeAMoveUntillGameOver();
            } else {
                return 3;
            }
        }
    }

    rewardEatingPieces(move) {
        if (move.indexOf("x") != -1) {
            if (this.matchResults.winnerPoints < this.winningReward && this.matchResults.winnerPoints < this.winningReward) {
                if (this.modelToMove == 0) {
                    this.matchResults.model0Points += 1;
                    this.matchResults.model1Points -= 1;
                } else {
                    this.matchResults.model0Points -= 1;
                    this.matchResults.model1Points += 1;
                }
            }
        }
    }

    rewardAttackingKing() {
        if (this.chess.in_check()) {
            if (this.matchResults.model0Points < this.winningReward && this.matchResults.model1Points < this.winningReward) {
                if (this.modelToMove == 0) {
                    this.matchResults.model0Points -= 1;
                    this.matchResults.model1Points += 1;
                } else {
                    this.matchResults.model0Points += 1;
                    this.matchResults.model1Points -= 1;
                }
            }
        }
    }

    updateLastGameBoard() {
        Chessboard('board4', {
            position: this.chess.fen(),
            showNotation: false
        });
        Chessboard('board3', {
            position: this.oneMoveAgo,
            showNotation: false
        });
        Chessboard('board2', {
            position: this.twoMovesAgo,
            showNotation: false
        });
    }

    getMatchResults() {
        let winner;
        let points;
        this.matchResults.white = this.model0Id;
        this.updateLastGameBoard();
        if (this.chess.in_checkmate()) {
            winner = this.getModelNotToMoveId();
            this.matchResults.result = "checkmate";
            points = this.winningReward * 5;
        } else if (this.chess.in_threefold_repetition()) {
            winner = this.getModelToMoveId();
            this.matchResults.result = "repetition";
            points = this.winningReward * 2;
        } else {
            this.matchResults.result = "draw";
        }

        if (this.matchResults.result == "draw") {
            return;
        }

        if (this.model0Id == winner) {
            this.matchResults.model0Points += points;
            this.matchResults.model1Points -= points;
        } else {
            this.matchResults.model0Points -= points;
            this.matchResults.model1Points += points;

        }

        this.matchResults.winner = winner;
    }

    getModelToMoveId() {
        if (this.modelToMove == 0) {
            return this.model0Id;
        } else {
            return this.model1Id;
        }
    }
    getModelNotToMoveId() {
        if (this.modelToMove == 1) {
            return this.model0Id;
        } else {
            return this.model1Id;
        }
    }

    getModelToMove() {
        if (this.modelToMove == 0) {
            return this.model0;
        } else {
            return this.model1;
        }
    }
}