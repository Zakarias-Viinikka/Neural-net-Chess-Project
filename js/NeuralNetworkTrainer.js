class NeuralNetworkTrainer {
    constructor(chess, depth) {
        this.models = [];
        this.keepTraining = true;
        this.rate = 0.01;
        this.modelScores = [];
        this.depth = depth;
        this.chess = chess;

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

    addModelToTrainer(model) {
        this.models.push(model);
        this.modelScores.push(new ModelScore(this.models.length));
    }

    stopTraining() {
        this.keepTraining = false;
    }

    async startTraining() {

        this.keepTraining = true;
        let modelId = 0;
        let opponentModelId = 1;
        let loser = 0;
        let white = 0;
        console.log("Started Training");

        for (let i = 0; i < parseInt(this.models.length / 2); i++) {
            white = Math.floor(Math.random() * 2);
            modelId = i;
            opponentModelId = this.models.length - i - 1;

            if (white == 1) {
                loser = await this.playMatch(this.models[modelId], this.models[opponentModelId], this.chess)
                this.updateScores(modelId, opponentModelId, loser, white)
            } else {
                loser = await this.playMatch(this.models[opponentModelId], this.models[modelId], this.chess)
                this.updateScores(modelId, opponentModelId, loser, white)
            }

            if (!this.keepTraining) {
                break;
            }
            console.log(`Match number ${i} concluded.`);

            let matchesPlayed = parseInt(localStorage.getItem("matchesPlayed"));
            matchesPlayed++;
            localStorage.setItem("matchesPlayed", matchesPlayed);
        }

        console.log("All matches concluded");
        console.log("memory: " + tf.memory().numTensors)

        await this.evolution();
        await this.saveModels();

        this.resetModelScores();

        if (this.keepTraining) {
            await this.startTraining();
        }
    }

    async saveModels() {
        if (this.keepTraining) {
            for (let i = 0; i < 10 /*this.models.length*/ ; i++) {
                let savePath = 'localstorage://Model' + i
                const saveResult = await this.models[i].model.save(savePath, { requestInit: { method: 'POST', headers: { 'class': 'Dog' } } })
            }
            console.log("saved models")
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

    async evolution() {

        let topHalf = [];
        let losers = [];

        this.modelScores.sort(function(a, b) {
            return a.distance - b.distance;
        });
        let nnTrainer = this;
        this.modelScores.sort(function(a, b) { return nnTrainer.getModelScore(b) - nnTrainer.getModelScore(a) });

        for (let i = 0; i < parseInt(this.models.length / 2); i++) {
            topHalf.push(i);
            losers.push(models.length - i);
        }

        for (let i = 0; i < topHalf.length; i++) {
            await cloneAndMutate(this.models[topHalf[i].modelId], this.models[losers[i].modelId]);
        }


        this.updateFinishedTrainingLogs();
    }

    async cloneAndMutate(originalElite, toBecomeMutated) {
        let eliteWeights = await originalElite.getWeights();
        await toBecomeMutated.setWeights(eliteWeights);
        await toBecomeMutated.mutate();
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

    async playMatch(model0, model1, _chess) {

        this.chess = _chess
        this.chess.reset();
        board = Chessboard('board', this.chess.fen());

        let modelToMakeAMove = 0;
        return await this.makeAMove(model0, model1, modelToMakeAMove)
    }

    async makeAMove(model0, model1, modelToMove) {
        if (this.chess.game_over()) {
            if (game.in_checkmate) {
                return modelToMove;
            } else {
                return 2;
            }
        } else {
            let move = "";

            if (modelToMove == 0) {
                move = await monteCarloTreeSearch(this.depth, model0.model, this.chess);
            } else {
                move = await monteCarloTreeSearch(this.depth, model1.model, this.chess);
            }
            (async() => {
                this.chess.move(move);
                board = Chessboard('board', this.chess.fen());
                document.getElementById("moveMade").innerHTML = move;
            })();

            modelToMove++;
            modelToMove = modelToMove % 2;

            await this.timeout(100);

            if (this.keepTraining) {
                return this.makeAMove(model0, model1, modelToMove)
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

        let results = await this.playTestMatch(model1, model2, this.chess);
        await this.testResults(results, model1, model2, id1, id2);



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
        return await this.makeAMove(model0, model1, modelToMakeAMove)
    }

    getModelScore(modelId) {
        for (let i = 0; i < this.models.length; i++) {
            if (this.modelScores[i].modelId == modelId) {
                return this.modelScores[i].score;
            }
        }
        return -1;
    }

    updateModelScore(modelId, amount) {
        for (let i = 0; i < this.models.length; i++) {
            if (this.modelScores[i].modelId == modelId) {
                this.modelScores[i].score += amount;
            }
        }
    }

    async testIfEvolutionWorks() {
        for (let i = 0; i < this.models.length; i++) {
            NNTrainer.models[i].model.getWeights()[0].print()
        }
        console.log("---------------------");
        console.log("---------------------");
        console.log("---------------------");
        console.log("---------------------");
        console.log("---------------------");
        console.log("---------------------");
        for (let i = 0; i < this.models.length; i++) {
            this.updateScores(i);
        }
        await this.evolution();
        for (let i = 0; i < this.models.length; i++) {
            NNTrainer.models[i].model.getWeights()[0].print()
        }
    }

    monteCarloSpeedTester() {
        let startTime = new Date().getTime();
        monteCarloTreeSearch(1, this.models[0].model, new Chess());
        let timeDifference = new Date().getTime() - startTime;
    }
}

class ModelScore {
    constructor(modelId) {
        this.modelId = modelId;
        this.score = 0;
    }
}