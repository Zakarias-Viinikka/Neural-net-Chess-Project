class NeuralNetworkTrainer {
    constructor(chess) {
        this.models = [];
        this.keepTraining = true;
        this.rate = parseInt(localStorage.getItem("mutationRate")); //in percentages %
        this.modelScores = [];
        this.chess = chess;
        this.matchesPlayed = 0;
        this.showMoves = localStorage.getItem("showMoves");

        if (localStorage.getItem("matchesPlayed") == null) {
            localStorage.setItem("matchesPlayed", "0");
        }
        if (localStorage.getItem("evolutions") == null) {
            localStorage.setItem("evolutions", "0");
        }
        if (localStorage.getItem("timeSpent") == null) {
            localStorage.setItem("timeSpent", "0");
            //updates every evolution
            localStorage.setItem("timeLastLogged", new Date().getTime());
        }
    }

    async addModelToTrainer(modelPath) {
        let model = await this.createModel(modelPath);
        this.models.push(new NeuralNetwork(model));
        this.modelScores.push(new ModelScore(this.models.length - 1));
    }

    stopTraining() {
        this.keepTraining = false;
    }

    async startTraining() {
        console.log("Started Training");

        await this.tournament();

        console.log("All matches concluded");

        if (this.keepTraining) {
            console.log(new Date());
            this.updateFinishedTrainingLogs()
            await this.saveModels().then(r => r);
            this.resetModelScores();
            await this.evolution().then(r => r);
            await this.startTraining();
        }
    }

    async tournament() {
        if (!this.keepTraining) {
            document.getElementById("tournamentScores").innerHTML = "";
            this.matchesPlayed--;
        }
        this.matchesPlayed++;
        document.getElementById("matchNumber").innerHTML = this.matchesPlayed;
        let modelId = 0;
        let opponentModelId = 1;
        let loser = "";
        let whiteId;
        let blackId;
        for (let i = 0; i < parseInt(this.models.length / 2); i++) {
            modelId = i;
            opponentModelId = this.models.length - i - 1;
            if (Math.floor(Math.random() * 2) == 0) {
                whiteId = modelId;
                blackId = opponentModelId;
            } else {
                whiteId = opponentModelId;
                blackId = modelId;
            }
            if (whiteId == modelId) {
                await this.playMatch(this.models[modelId], modelId, this.models[opponentModelId], opponentModelId, this.chess).then(r => loser = r)
                if (loser == 0) {
                    loser = modelId;
                } else if (loser == 1) {
                    loser = opponentModelId;
                } else {
                    loser = "draw";
                }
                this.updateScores(whiteId, blackId, loser)
            } else {
                await this.playMatch(this.models[opponentModelId], opponentModelId, this.models[modelId], modelId, this.chess).then(r => loser = r)
                if (loser == 1) {
                    loser = modelId;
                } else if (loser == 0) {
                    loser = opponentModelId;
                } else {
                    loser = "draw";
                }
                this.updateScores(whiteId, blackId, loser)
            }

            //update visually scores so far
            let winner = (loser == blackId ? whiteId : blackId)
            if (this.keepTraining) {
                document.getElementById("modelThatWon").innerHTML = winner;
                document.getElementById("modelThatWonColor").innerHTML = (winner == whiteId ? "white" : "black");
                document.getElementById("tournamentScores").innerHTML = "";
            }
            for (let j = 0; j < this.modelScores.length; j++) {
                let modelScore = this.modelScores[j];
                document.getElementById("tournamentScores").innerHTML += "Model Id" + modelScore.modelId + " Score: " + modelScore.score + "<br>";

            }

            if (!this.keepTraining) {
                break;
            }
            console.log(`Match number ${i + 1} concluded.`);

            let matchesPlayed = parseInt(localStorage.getItem("matchesPlayed"));
            matchesPlayed++;
            localStorage.setItem("matchesPlayed", matchesPlayed);
        }
    }

    async saveModels() {
        if (this.keepTraining) {
            for (let i = 0; i < this.models.length; i++) {
                let savePath = 'model' + i;
                const saveResult = await this.models[i].model.save('indexeddb://' + savePath).then(r => r);

            }
            console.log("saved models")
        }
    }

    async saveModelToDownloads(modelName) {
        const saveResult = await this.models[0].model.save('downloads://' + modelName);
    }

    async loadFromFiles(modelName) {
        NNTrainer.models = [];
        NNTrainer.modelScores = [];
        for (let i = 0; i < 10; i++) {
            let modelPath = 'http://localhost/models/' + modelName + ".json";
            await this.addModelToTrainer(modelPath);
        }
        this.models[0].model.getWeights()[0].print();
    }

    async loadModels() {
        NNTrainer.models = [];
        NNTrainer.modelScores = [];
        for (let i = 0; i < 10; i++) {
            let modelPath = 'indexeddb://model' + i;
            await this.addModelToTrainer(modelPath);
        }
    }

    async createModel(modelSavePath) {
        if (modelSavePath == null) {
            const inputLayer = tf.layers.dense({ inputShape: 71, units: 10, activation: 'relu' });
            const hiddenLayer1 = tf.layers.dense({ units: 72, activation: 'relu' });
            const hiddenLayer2 = tf.layers.dense({ units: 50, activation: 'relu' });
            const hiddenLayer3 = tf.layers.dense({ units: 25, activation: 'relu' });
            const hiddenLayer4 = tf.layers.dense({ units: 5, activation: 'relu' });
            const outputLayer = tf.layers.dense({ units: 1, activation: 'sigmoid' });

            const model = tf.sequential();
            model.add(inputLayer);
            model.add(hiddenLayer1);
            model.add(hiddenLayer2);
            model.add(hiddenLayer3);
            model.add(hiddenLayer4);
            model.add(outputLayer);
            model.compile({
                optimizer: 'sgd',
                loss: 'meanSquaredError'
            })

            return await model;
        } else {
            return await tf.loadLayersModel(modelSavePath);
        }
    }

    resetModelScores() {
        for (let i = 0; i < this.modelScores.length; i++) {
            this.modelScores[i].score = 0;
        }
    }

    updateScores(white, black, loser) {
        if (loser != "draw") {
            if (loser == black) {
                this.updateModelScore(white, 1000)
                this.updateModelScore(black, -1000)
            } else {
                this.updateModelScore(white, -1000)
                this.updateModelScore(black, 1000)
            }
        }
    }

    updateModelScore(modelId, amount) {
        for (let i = 0; i < this.models.length; i++) {
            if (this.modelScores[i].modelId == modelId) {
                this.modelScores[i].score += amount;
                break;
            }
        }
    }

    async evolution() {

        let topHalf = [];
        let losers = [];
        if (this.trainingGoal = "win") {

            this.modelScores.sort(function(a, b) {
                return a.distance - b.distance;
            });
            let nnTrainer = this;
            this.modelScores.sort(function(a, b) { return nnTrainer.getModelScore(b) - nnTrainer.getModelScore(a) });

            for (let i = 0; i < 2; i++) {
                topHalf.push(this.models[i]);
                losers.push(this.models[this.models.length - i - 1]);
            }

            for (let i = 0; i < topHalf.length; i++) {
                await this.cloneAndMutate(topHalf[i], losers[i]).then(r => r);
            }
        } else if (this.trainingGoal = "eat") {

        }


        this.models[9].model.getWeights()[0].print();

        this.updateFinishedTrainingLogs();
    }

    async cloneAndMutate(originalElite, toBecomeMutated) {
        let eliteWeights = originalElite.model.getWeights();
        await this.setWeight(toBecomeMutated, eliteWeights).then(r => r);
        await toBecomeMutated.mutate(this.rate).then(r => r);

    }

    async setWeight(whoToSet, weights) {
        tf.tidy(() => {
            whoToSet.model.setWeights(weights);
        })
    }

    updateFinishedTrainingLogs() {
        let matchesPlayed = parseInt(localStorage.getItem("evolution"));
        matchesPlayed++;
        localStorage.setItem("evolution", matchesPlayed);

        let timeSpentOnTraining = new Date().getTime - parseInt(localStorage.getItem("timeLastLogged"));
        localStorage.setItem("timeSpent", parseInt(localStorage.getItem("timeSpent")) + timeSpentOnTraining);
    }

    async cloneModel(id) {
        NNTrainer.models.push(NNTrainer.models[id].cloneModel());
    }

    async playMatch(white, whiteId, black, blackId, _chess) {
        document.getElementById("modelThatIsWhite").innerHTML = whiteId;
        this.chess = _chess;
        this.chess.reset();
        board = Chessboard('board', this.chess.fen());

        let modelToMakeAMove = 0;
        return await this.makeAMove(white, whiteId, black, blackId, modelToMakeAMove, []).then(r => r)
    }

    async makeAMove(model0, modelId0, model1, modelId1, modelToMove, history, oneMoveAgo, twoMovesAgo, moveCtr) {
        if (moveCtr == null) {
            moveCtr = 0;
        }
        moveCtr++
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
        for (let i = 0; i < history.length; i++) {
            if (history[i] == justBoardStateFen) {
                repetitionDraw += 0.5;
            }
        }

        if (this.chess.game_over()) {
            this.updateLastGameBoard(this.chess.fen(), oneMoveAgo, twoMovesAgo);
            if (this.chess.in_checkmate()) {
                console.log("checkmate");
                return modelToMove;
            } else if (this.chess.in_threefold_repetition() || history == 1.5) {
                if (this.chess.in_threefold_repetition() == false) {
                    console.log("logic error");
                    console.log("repetition: " + this.chess.in_threefold_repetition());
                    console.log("draw: " + this.chess.in_draw());
                    console.log("history", history);
                }
                console.log("repetition");
                return (modelToMove + 1) % 2;
            } else {
                console.log("acceptable draw");
            }
        } else {
            let move = "";
            let monteChess = new Chess();
            monteChess.load(this.chess.fen())
            let currentModel;
            if (modelToMove == 0) {
                currentModel = model0
            } else {
                currentModel = model1
            }
            move = await monteCarlo.getBestMove(currentModel.model, monteChess, history).then(r => r);

            (async() => {
                twoMovesAgo = oneMoveAgo;
                oneMoveAgo = this.chess.fen();
                this.chess.move(move);
                if (move.indexOf("p") != -1 || move.indexOf("P") != -1 || move.indexOf("x") != -1) {
                    history = [];
                }
                this.rewardEatingPieces(move, modelId0, modelId1, modelToMove);
                this.rewardChecks(this.chess, modelId0, modelId1, modelToMove);
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

                history.push(justBoardStateAsFenString);
                board = Chessboard('board', this.chess.fen());
                document.getElementById("moveMade").innerHTML = move;
            })();

            modelToMove = (modelToMove + 1) % 2;

            if (this.showMoves == "true") {
                await this.timeout(100).then(r => r);
            } else if (moveCtr % 20 == 0) {
                await this.timeout(50).then(r => r);
            }

            if (this.keepTraining) {
                return this.makeAMove(model0, modelId0, model1, modelId1, modelToMove, history, oneMoveAgo, twoMovesAgo, moveCtr)
            } else {
                return 3;
            }
        }
    }

    rewardEatingPieces(move, model0Id, model1Id, modelToMove) {
        if (move.indexOf("x") != -1) {
            let modelToReward = model0Id;
            let modelToPunish = model1Id;
            if (modelToMove == 0) {
                modelToReward = model0Id;
                modelToPunish = model1Id;
            } else {
                modelToReward = model1Id;
                modelToPunish = model0Id;
            }

            this.updateModelScore(modelToReward, 1)
            this.updateModelScore(modelToPunish, -1)
        }
    }

    rewardChecks(chess, model0Id, model1Id, modelToMove) {
        let inCheck = chess.in_check();
        if (inCheck) {
            let modelToReward = model0Id;
            let modelToPunish = model1Id;
            if (modelToMove == 0) {
                modelToReward = model0Id;
                modelToPunish = model1Id;
            } else {
                modelToReward = model0Id;
                modelToPunish = model1Id;
            }
            this.updateModelScore(modelToReward, 4);
            this.updateModelScore(modelToPunish, -4);
        }
    }

    updateLastGameBoard(thisTurn, oneMoveAgo, twoMovesAgo) {

        Chessboard('board4', {
            position: thisTurn,
            showNotation: false
        });
        Chessboard('board3', {
            position: oneMoveAgo,
            showNotation: false
        });
        Chessboard('board2', {
            position: twoMovesAgo,
            showNotation: false
        });
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    getModelScore(modelId) {
        for (let i = 0; i < this.models.length; i++) {
            if (this.modelScores[i].modelId == modelId) {
                return this.modelScores[i].score;
            }
        }
        return -1;
    }
}

class ModelScore {
    constructor(modelId) {
        this.modelId = modelId;
        this.score = 0;
    }
}