class NeuralNetworkTrainer {
    constructor(models, chess, depth) {
        this.models = models;
        this.keepTraining = false;
        this.rate = 0.01;
        this.modelTrainingScore = [];
        for (let i = 0; i < models.length; i++) {
            this.modelTrainingScore.push(0);
        }
        this.depth = depth;
        this.chess = chess;
    }

    stopTraining() {
        this.keepTraining = false;
    }

    startTraining() {
        this.keepTraining = true;

        // Training
        while (keepTraining) {
            //every model players every other model
            for (let i = 0; i < this.models.length; i++) {
                for (let j = 0; j < i; j++) {
                    //randomizes who goes first
                    if (Math.floor(Math.random() * 2) == 1) {
                        let winner = playMatch(this.models[i], this.models[j], this.chess)
                        if (winner == 0) {
                            this.modelTrainingScore[i]++;
                        } else if (winner == 1) {
                            this.modelTrainingScore[j]++;
                        } else {
                            this.modelTrainingScore[i] += 0.5;
                            this.modelTrainingScore[j] += 0.5;
                        }
                    } else {
                        let winner = playMatch(this.models[j], this.models[i], this.chess)
                        if (winner == 0) {
                            this.modelTrainingScore[i]++;
                        } else if (winner == 1) {
                            this.modelTrainingScore[j]++;
                        } else {
                            this.modelTrainingScore[i] += 0.5;
                            this.modelTrainingScore[j] += 0.5;
                        }
                    }
                }
            }
        }
        // Training
        console.log(stoppedTraining)
        console.log("memory: " + tf.memory())
    }
}

async function playMatch(model0, model1, _chess) {
    let chess = _chess
    chess.reset();
    let modelToMove = 0;

    console.log(model0.model)
    while (true) {
        if (!(chess.game_over())) {
            break;
        } else {
            modelToMove++;
            modelToMove = modelToMove % 2;
        }
    }
    if (modelToMove == 0) {
        await monteCarloTreeSearch(this.depth, model0.model);
    } else {
        await monteCarloTreeSearch(this.depth, model1.model);
    }


    if (game.in_checkmate) {
        return modelToMove;
    } else {
        return 2;
    }
}