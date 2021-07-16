class NeuralNetworkTrainer {
    constructor(chess) {
        this.startTime = new Date();
        this.models = [];
        this.keepTraining = true;
        this.rate = parseInt(localStorage.getItem("mutationRate")); //in percentages %
        this.modelScores = [];
        this.chess = chess;
        this.matchesToPlay = 0;
        this.matchesPlayed = 0;
        this.showMoves = localStorage.getItem("showMoves");
        this.winningReward = 100;
        this.amountOfMatches = 0;
        this.amountOfModels = 2;
        this.disableDOMS = false;
        this.locationReload = true;
        this.locationReloadctr = 0;
        this.keepTraining = localStorage.getItem("keepTraining");
        if (this.keepTraining == "true") {
            this.keepTraining = true;
        }
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
        localStorage.setItem("keepTraining", true);
        this.keepTraining = true;
        while (this.keepTraining) {
            await this.tournament();
            if (this.locationReload) {
                this.locationReloadctr++;
                if (this.locationReloadctr > 5) {
                    document.location.reload();
                }
            }
            await timeout(2);
        }
    }

    async matchFinished() {
        this.chess.reset();
        if (!this.disableDOMS) {
            document.getElementById("matchesPlayed").innerHTML = localStorage.getItem("matchesPlayed");
        }
        if (this.keepTraining) {
            this.updateFinishedTrainingLogs()
            await this.saveModels().then(r => r);
            this.resetModelScores();
            await this.evolution().then(r => r);
        }
    }

    async tournament() {
        if (!this.keepTraining) {
            if (!this.disableDOMS) {
                document.getElementById("tournamentScores").innerHTML = "";
            }
            this.matchesPlayed--;
        }
        if (!this.disableDOMS) {
            document.getElementById("matchesPlayed").innerHTML = localStorage.getItem("matchesPlayed");
        }
        let modelId = 0;
        let opponentModelId = 1;
        let matchPlayers = [];
        let results;
        this.matchesPlayed++;
        this.matchesToPlay = parseInt(this.models.length / 2);
        for (let i = 0; i < this.matchesToPlay && this.keepTraining; i++) {
            modelId = i;
            opponentModelId = this.models.length - i - 1;
            matchPlayers[i] = new playMatch(modelId, opponentModelId, this.winningReward, i, this.showMoves, this.disableDOMS);

            await matchPlayers[i].start().then(r => results = r);
            this.updateModelScore(results.model0Id, results.model0Points)
            this.updateModelScore(results.model1Id, results.model1Points)

            //update visually scores so far
            if (this.keepTraining) {
                if (!this.disableDOMS) {
                    document.getElementById("modelThatWon").innerHTML = results.winner;
                    document.getElementById("modelThatWonColor").innerHTML = results.white;
                    document.getElementById("matchOutcome").innerHTML = results.result;
                    document.getElementById("tournamentScores").innerHTML = "";
                }
            }
            for (let j = 0; j < this.modelScores.length; j++) {
                let modelScore = this.modelScores[j];
                if (!this.disableDOMS) {
                    document.getElementById("tournamentScores").innerHTML += "Model Id" + modelScore.modelId + " Score: " + modelScore.score + "<br>";
                }
            }

            if (!this.keepTraining) {
                break;
            }

            let matchesPlayed = parseInt(localStorage.getItem("matchesPlayed"));
            matchesPlayed++;
            localStorage.setItem("matchesPlayed", matchesPlayed);

            this.chess.reset();
        }
        await this.matchFinished();
    }

    async saveModels() {

        if (this.keepTraining) {
            for (let i = 0; i < this.models.length; i++) {
                let savePath = 'model' + i;
                const saveResult = await this.models[i].model.save('indexeddb://' + savePath).then(r => r);

            }
        }
    }

    async saveModelToDownloads(modelName) {
        const saveResult = await this.models[0].model.save('downloads://' + modelName);
    }

    async loadFromFiles(modelName) {
        NNTrainer.models = [];
        NNTrainer.modelScores = [];
        for (let i = 0; i < this.amountOfModels; i++) {
            let modelPath = 'http://localhost/models/' + modelName + ".json";
            await this.addModelToTrainer(modelPath);
        }
    }

    async loadModels() {
        NNTrainer.models = [];
        NNTrainer.modelScores = [];
        for (let i = 0; i < this.amountOfModels; i++) {
            let modelPath = 'indexeddb://model' + i;
            await this.addModelToTrainer(modelPath);
        }
    }

    async createModel(modelSavePath) {
        if (modelSavePath == null) {
            const inputLayer = tf.layers.dense({ inputShape: 71, units: 71, activation: 'sigmoid' });
            const hiddenLayer1 = tf.layers.dense({ units: 71, activation: 'sigmoid' });
            const hiddenLayer2 = tf.layers.dense({ units: 50, activation: 'sigmoid' });
            const hiddenLayer3 = tf.layers.dense({ units: 25, activation: 'sigmoid' });
            const hiddenLayer4 = tf.layers.dense({ units: 5, activation: 'sigmoid' });
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
                await this.cloneAndMutate(topHalf[i], losers[i]);
            }
        } else if (this.trainingGoal = "eat") {

        }

        this.updateFinishedTrainingLogs();
    }

    async cloneAndMutate(originalElite, toBecomeMutated) {
        let eliteWeights = originalElite.model.getWeights();
        await this.setWeight(toBecomeMutated, eliteWeights).then(r => r);
        await toBecomeMutated.mutate(this.rate);
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