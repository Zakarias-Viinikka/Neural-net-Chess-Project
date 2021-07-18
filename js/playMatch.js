class playMatch {
    constructor(model0Id, model1Id, winningReward, _matchIndex, showMoves, disableDOMS, originalChess) {
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
        this.disableDOMS = disableDOMS;
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
        this.repetition = 0;
    }
    async start() {
        if (!this.disableDOMS) {
            document.getElementById("modelThatIsWhite").innerHTML = this.model0Id;
            board = Chessboard('board', this.chess.fen());
        }
        let openings = [
            "rnbqkbnr/ppp1pp1p/3p2p1/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3",
            "rnbqkbnr/ppp1pppp/8/3p4/8/1P3N2/P1PPPPPP/RNBQKB1R b KQkq - 0 2",
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkbnr/ppp1pppp/8/3p4/8/P7/1PPPPPPP/RNBQKBNR w KQkq - 0 2",
            "rnbqkbnr/ppp2ppp/4p3/3p4/5P2/5N2/PPPPP1PP/RNBQKB1R w KQkq - 0 3",
            "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
            "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/1P6/P1PP1PPP/RNBQKBNR w KQkq - 0 3",
            "rnbqkbnr/1p1ppppp/p7/2p5/4P3/8/PPPPNPPP/RNBQKB1R w KQkq - 0 3",
            "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
            "rnbqkb1r/pppp1ppp/4pn2/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3",
            "rnbqkb1r/p1pppppp/5n2/1p6/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3",
            "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/7P/PPP1PPP1/RNBQKBNR w KQkq - 0 3",
            "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2",
            "rnbqkbnr/ppppp1pp/8/5p2/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2",
            "rnbqkbnr/pp1ppppp/2p5/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 2",
            "rnbqkb1r/pppppppp/5n2/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2",
            "rnbqkbnr/pppp1ppp/4p3/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2",
            "rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2",
            "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
            "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
            "r1bqkb1r/ppp2ppp/2n2n2/3pp3/8/3P1NP1/PPP1PPBP/RNBQ1RK1 b kq - 0 1",
            "r1bqkbnr/pppppppp/2n5/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
            "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 1",
            "rnbqkbnr/ppp1pppp/8/3p4/8/2N5/PPPPPPPP/R1BQKBNR w KQkq - 0 1",
            "rnbqkb1r/pppp1ppp/5n2/4p3/2BPP3/8/PPP2PPP/RNBQK1NR b KQkq - 0 1",
            "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 0 1",
            "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkb1r/ppp1pppp/8/3n4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkbnr/pppp1ppp/8/4p3/8/1P6/P1PPPPPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 1",
            "r1bqk1nr/ppppbppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
            "rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 1",
            "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1"
        ]

        this.chess.load(openings[parseInt(Math.random() * openings.length)]);
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

                if (!this.chess.game_over()) {
                    this.history.push(justBoardStateAsFenString);
                }

                if (!this.disableDOMS) {
                    board = Chessboard('board', this.chess.fen());
                }
                if (!this.disableDOMS) {
                    document.getElementById("moveMade").innerHTML = move;
                }

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
            if (this.matchResults.model0Points < this.winningReward && this.matchResults.model1Points < this.winningReward) {
                let reward = 1;
                let square = move.charAt(move.indexOf("x") + 1) + move.charAt(move.indexOf("x") + 2);
                let pieceEaten = this.chess.get(square).type;
                if (pieceEaten == "q") {
                    reward = 9;
                } else if (pieceEaten == "r") {
                    reward = 5;
                } else if (pieceEaten == "n" || pieceEaten == "b") {
                    reward = 3;
                }
                reward = reward * 2;

                if (this.modelToMove == 0) {
                    this.matchResults.model0Points += 3;
                } else {
                    this.matchResults.model1Points += 3;
                }
            }
        }
    }

    rewardAttackingKing() {
        if (this.chess.in_check()) {
            if (this.matchResults.model0Points < this.winningReward && this.matchResults.model1Points < this.winningReward) {
                if (this.modelToMove == 0) {
                    this.matchResults.model1Points += 1;
                } else {
                    this.matchResults.model0Points += 1;
                }
            }
        }
    }

    updateLastGameBoard() {
        if (!this.disableDOMS) {
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
    }

    getMatchResults() {
        let winner;
        let points;

        let repetition = 0;
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
        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i] == justBoardStateFen) {
                repetition += 0.5;
            }
        }

        console.log(repetition);
        this.matchResults.white = this.model0Id;
        this.updateLastGameBoard();
        if (this.chess.in_checkmate()) {
            winner = this.getModelNotToMoveId();
            this.matchResults.result = "checkmate";
            points = this.winningReward;
        } else {
            this.matchResults.winner = "draw";
            this.matchResults.result = "draw";
            points = 0;
        }

        /*else if (repetition == 1 || this.chess.in_threefold_repetition()) {
            if (this.matchResults.model0Points < this.matchResults.model1Points) {
                winner = this.matchResults.model0Id;
            } else if (this.matchResults.model0Points > this.matchResults.model1Points) {
                winner = this.matchResults.model1Id;
            }
            this.matchResults.result = "repetition";
            points = this.winningReward;
        } else if (this.chess.in_stalemate()) {
            winner = this.getModelToMove();
            points = this.winningReward;
            this.matchResults.result = "stalemate";
        } else {
            this.matchResults.winner = "draw";
            this.matchResults.result = "draw";
            points = 0;
            console.log("insufficient material: " + this.chess.insufficient_material());
            console.log("50 move rule: " + this.history.length)
        }*/
        this.matchResults.winner = winner;

        if (winner == this.model0Id) {
            this.matchResults.model0Points += points;
            this.matchResults.model1Points -= points;
        } else {
            this.matchResults.model0Points -= points;
            this.matchResults.model1Points += points;

        }

        console.log(this.matchResults.result)
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