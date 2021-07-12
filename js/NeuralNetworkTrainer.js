class NeuralNetworkTrainer {
    constructor(chess) {
        this.startTime = new Date();
        this.models = [];
        this.keepTraining = true;
        this.rate = parseInt(localStorage.getItem("mutationRate")); //in percentages %
        this.modelScores = [];
        this.chess = chess;
        this.matchesPlayed = 0;
        this.matchesToPlay = 0;
        this.matchesFinished = [];
        this.showMoves = localStorage.getItem("showMoves");
        this.winningReward = 1000;
        this.amountOfMatches = 0;
        this.MT = new Multithread(6);
        this.testingLogic = true;

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
        await this.tournament();
    }

    async matchFinished() {
        console.clear();
        console.log("Started: " + this.startTime);
        console.log("All matches concluded");

        if (this.keepTraining) {
            this.updateFinishedTrainingLogs()
            await this.saveModels().then(r => r);
            this.resetModelScores();
            await this.evolution().then(r => r);
        }
    }

    async tournament() {
        console.log("Started Training");
        if (!this.keepTraining) {
            document.getElementById("tournamentScores").innerHTML = "";
            this.matchesPlayed--;
        }
        this.matchesPlayed++;
        document.getElementById("matchNumber").innerHTML = this.matchesPlayed;
        let modelId = 0;
        let opponentModelId = 1;
        let matchPlayers = [];
        this.matchesToPlay = parseInt(this.models.length / 2);
        this.matchesFinished = [];
        for (let i = 0; i < this.matchesToPlay; i++) {
            modelId = i;
            opponentModelId = this.models.length - i - 1;
            matchPlayers[i] = new playMatch(modelId, opponentModelId, this.winningReward, i, this.testingLogic);
            if (this.testingLogic) {
                let results;

                await matchPlayers[i].start().then(r => results = r);
                this.updateModelScore(results.model0Id, results.model0Points)
                this.updateModelScore(results.model1Id, results.model1Points)

                //update visually scores so far
                if (this.keepTraining) {
                    document.getElementById("modelThatWon").innerHTML = results.winner;
                    document.getElementById("modelThatWonColor").innerHTML = results.white;
                    document.getElementById("matchOutcome").innerHTML = results.result;
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

                this.chess.reset();

                this.matchFinished();
                if (this.keepTraining) {
                    await this.startTraining();
                }
            } else {
                this.MT.process((async() => { return await matchPlayers[i].start })(), this.MTCallback)();
            }
        }
    }

    MTCallback(returnValue) {
        console.log(returnValue);
        let allOtherMatchesFinished = true;
        if (returnValue != null) {
            this.matchesFinished[returnValue.matchIndex] = true;
        }
        for (let i = 0; i < this.matchesToPlay; i++) {
            if (this.matchesFinished[i] == false) {
                allOtherMatchesFinished = false;
                break;
            }
        }

        if (returnValue != null) {
            this.updateModelScore(returnValue.model0Id, returnValue.model0Points)
            this.updateModelScore(returnValue.model1Id, returnValue.model1Points)
        }

        if (allOtherMatchesFinished) {
            this.allMTMatchesFinished();
        } else {
            setTimeout(this.MTCallback, 5000);
        }
    }

    async allMTMatchesFinished() {
        console.log(`Tournament number ${i + 1} concluded.`);

        let matchesPlayed = parseInt(localStorage.getItem("matchesPlayed"));
        matchesPlayed += this.amountOfMatches;
        localStorage.setItem("matchesPlayed", matchesPlayed);
        await this.startTraining();
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