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

        await this.tournament().then(r => r);

        console.log("All matches concluded");
        console.log("memory: " + tf.memory().numTensors)

        await this.saveModels().then(r => r);
        this.resetModelScores();
        await this.evolution().then(r => r);

        if (this.keepTraining) {
            await this.startTraining().then(r => r);
        }
    }

    async tournament() {
        let modelId = 0;
        let opponentModelId = 1;
        let loser = 0;
        let white = 0;
        for (let i = 0; i < parseInt(this.models.length / 2); i++) {
            white = Math.floor(Math.random() * 2);
            modelId = i;
            opponentModelId = this.models.length - i - 1;
            if (white == 1) {
                loser = await this.playMatch(this.models[modelId], modelId, this.models[opponentModelId], opponentModelId, this.chess)
                this.updateScores(modelId, opponentModelId, loser, white)
            } else {
                loser = await this.playMatch(this.models[opponentModelId], modelId, this.models[modelId], opponentModelId, this.chess)
                this.updateScores(modelId, opponentModelId, loser, white)
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
        this.matchesPlayed++;
        document.getElementById("matchNumber").innerHTML = this.matchesPlayed;
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

    updateScores(model0Id, model1Id, loser, white) {
        if (white == 0 && loser == 1 || white == 1 && loser == 0) {
            this.updateModelScore(model0Id, 1)
            this.updateModelScore(model1Id, -1)
        } else {
            this.updateModelScore(model0Id, -1)
            this.updateModelScore(model1Id, 1)
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

    async playMatch(model0, modelId1, model1, modelId2, _chess) {
        this.chess = _chess
        this.chess.reset();
        board = Chessboard('board', this.chess.fen());

        let modelToMakeAMove = 0;
        return await this.makeAMove(model0, modelId1, model1, modelId2, modelToMakeAMove, []).then(r => r)
    }

    async makeAMove(model0, modelId0, model1, modelId1, modelToMove, history) {
        if (this.chess.game_over()) {
            board2 = Chessboard('board2', this.chess.fen());
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
                return this.makeAMove(model0, modelId0, model1, modelId1, modelToMove, history)
            } else {
                return 3;
            }
        }
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async testIfWinnerIsAssignedPointsCorrectly() {
        let id1 = 2;
        let id2 = 1;
        let model1 = this.models[id1];
        let model2 = this.models[id2];
        board = Chessboard('board', this.chess.fen());

        this.chess.load("QQQBkNKB/PPPNN1QB/PPPPRBPP/PPPRRRPP/PPPPPPPP/PPPPPPPP/PPPPPPPP/RNBQRBNR w - - 0 1");

        let results = await this.playTestMatch(model1, model2, this.chess).then(r => r);
        await this.testResults(results, model1, model2, id1, id2).then(r => r);
    }

    async testResults(r, model1, model2, id1, id2) {
        let white = 0;
        for (let i = 0; i < this.models.length; i++) {
            this.updateModelScore(i).score = 0;
        }
        this.updateScores(id1, id2, r, white);
        console.log("id for white: " + white);
        console.log("scores are: [" + id1 + "] " + this.getModelScore(id1) + ",  [" + id2 + "] " + this.getModelScore(id2))
    }

    async playTestMatch(model0, model1, _chess) {
        let modelToMakeAMove = 0;
        return await this.makeAMove(model0, model1, modelToMakeAMove).then(r => r)
    }

    getModelScore(modelId) {
        for (let i = 0; i < this.models.length; i++) {
            if (this.modelScores[i].modelId == modelId) {
                return this.modelScores[i].score;
            }
        }
        return -1;
    }


    async monteCarloSpeedTester() {
        let startTime = new Date().getTime();
        this.chess.move(monteCarlo.getBestMove(this.models[5].model, this.chess));
        let timeDifference = new Date().getTime() - startTime;
        board = Chessboard('board', this.chess.fen());
        console.log(timeDifference);
    }
}

class ModelScore {
    constructor(modelId) {
        this.modelId = modelId;
        this.score = 0;
    }
}