class NeuralNetworkTrainer {
    constructor(chess) {
        this.models = [];
        this.keepTraining = true;
        this.rate = 1; //in percentages %
        this.modelScores = [];
        this.chess = chess;
        this.matchesPlayed = 0;

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
        console.log("memory: " + tf.memory().numTensors)

        await this.saveModels().then(r => r);
        this.resetModelScores();
        await this.evolution().then(r => r);

        if (this.keepTraining) {
            await this.startTraining();
        }
    }

    async tournament() {
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
                } else if (loser == 2) {
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
            document.getElementById("tournamentScores").innerHTML = "";
            for (let j = 0; j < this.modelScores.length; j++) {
                let modelScore = this.modelScores[j];
                document.getElementById("tournamentScores").innerHTML += modelScore.modelId + ": " + modelScore.score + "<br>";

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
        for (let i = 0; i < 10; i++) {
            let modelPath = 'http://localhost/models/' + modelName + ".json";
            await this.addModelToTrainer(modelPath);
        }
        this.models[0].model.getWeights()[0].print();
    }

    async loadModels() {
        for (let i = 0; i < 10; i++) {
            let modelPath = 'indexeddb://model' + i;
            await this.addModelToTrainer(modelPath);
        }
    }

    async createModel(modelSavePath) {
        if (modelSavePath == null) {
            const inputLayer = tf.layers.dense({ inputShape: 72, units: 10, activation: 'relu' });
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
                this.updateModelScore(white, 1)
                this.updateModelScore(black, -1)
            } else {
                this.updateModelScore(model0Id, -1)
                this.updateModelScore(model1Id, 1)
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

    async makeAMove(model0, modelId0, model1, modelId1, modelToMove, history, oneMoveAgo, twoMovesAgo) {
        if (this.chess.game_over()) {
            Chessboard('board4', {
                position: this.chess.fen(),
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
            if (game.in_checkmate) {
                return modelToMove;
            } else {
                return (modelToMove + 1) % 2;
            }
        } else {
            let move = "";
            let monteChess = new Chess();
            monteChess.load(this.chess.fen())
            let currentModel;
            let modelId;
            let opponentModelId;
            if (modelToMove == 0) {
                currentModel = model0
                modelId = modelId0;
                opponentModelId = modelId1;
            } else {
                currentModel = model1
                opponentModelId = modelId0;
                modelId = modelId1;
            }
            move = await monteCarlo.getBestMove(currentModel.model, monteChess, history).then(r => r);

            (async() => {
                if (move.indexOf("p") != -1 || move.indexOf("P") != -1) {
                    history = [];
                }
                twoMovesAgo = oneMoveAgo;
                oneMoveAgo = this.chess.fen();
                this.chess.move(move);

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

            await this.timeout(100).then(r => r);

            if (this.keepTraining) {
                return this.makeAMove(model0, modelId0, model1, modelId1, modelToMove, history, oneMoveAgo, twoMovesAgo)
            } else {
                return 3;
            }
        }
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async testIfWinnerIsAssignedPointsCorrectly() {
        let id0 = 2;
        let id1 = 1;
        let white = id0;
        let model0 = this.models[id0];
        let model1 = this.models[id1];
        board = Chessboard('board', this.chess.fen());

        this.chess.load("QQQBkNKB/PPPNN1QB/PPPPRBPP/PPPRRRPP/PPPPPPPP/PPPPPPPP/PPPPPPPP/RNBQRBNR w - - 0 1");

        let results = await this.playTestMatch(model0, model1, id0, id1, this.chess, white).then(r => r);
        await this.testResults(results, model0, model1, id0, id1, white).then(r => r);
    }

    async playTestMatch(model0, model1, id0, id1, _chess, white) {
        return await this.makeAMove(model0, id0, model1, id1, white, new Array(), ).then(r => r);
        //model0, modelId0, model1, modelId1, modelToMove, history, oneMoveAgo, twoMovesAgo
    }

    async testResults(r, model1, model2, id0, id1, white) {
        let nextToMakeMove = r;
        if (white == id0 && nextToMakeMove == 1 || white == id1 && nextToMakeMove == 0) {
            this.updateModelScore(id0, 1)
            this.updateModelScore(id1, -1)
        } else {
            this.updateModelScore(id0, -1)
            this.updateModelScore(id1, 1)
        }
        this.updateScores(id0, id1, r, white);
        console.log("next to make a move: " + nextToMakeMove);
        console.log("id for white: " + white);
        console.log("scores are: [" + id0 + "] " + this.getModelScore(id0) + ",  [" + id1 + "] " + this.getModelScore(id1))
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