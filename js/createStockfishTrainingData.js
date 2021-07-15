//stockfish
let bestMove = "";
let stockfish = STOCKFISH(); //setoption name UCI_AnalyseMode value true
let isok = false;
stockfish.postMessage(`uci`);
let stockfishDepth = 15;
let stockfishEvaluation;
//setoption name UCI_AnalyseMode value true
/*<id> = UCI_AnalyseMode, type check
   The engine wants to behave differently when analysing or playing a game.
   For example when playing it can use some kind of learning.
   This is set to false if the engine is playing a game, otherwise it is true.*/
stockfish.onmessage = function(event) {
    console.log(event);
    //NOTE: Web Workers wrap the response in an object.
    //console.log(event)
    if (typeof event == "string" && event.indexOf("bestmove") != -1) {
        bestMove = event;
    } else if (typeof event == "string" && event.indexOf("info") != -1) {
        stockfishEvaluation = event;
    } else if (event == "readyok") {
        //console.log(event.data);
    }
    return event;
};
//stockfish

let neuralNetFinalArray = [];
createStockFishTrainingData();

async function createStockFishTrainingData() {
    await timeout(2000);

    createNewModel()
        .then(() => createTrainingData())
}

async function createTrainingData() {
    let originalBoard = "";
    let futureBoard = "";
    let trainingData = [];
    let boardEvaluations = [];

    let tempGame = new Chess();
    for (let i = 0; i < 1; i++) {
        game.reset(); //starting board
        let possibleMoves = game.moves();
        let stockfishEvaluation = 0; //
        //add training data//
        while (!game.game_over()) {
            game.move(possibleMoves[parseInt(Math.random() * possibleMoves.length)])
            possibleMoves = game.moves();
            let originalBoard = game.fen();
            for (var v = 0; v < possibleMoves.length; v++) { //for every possible move for a particular board state
                stockfish.postMessage("ucinewgame");
                stockfish.postMessage("isready");
                tempGame.load(originalBoard);
                tempGame.move(possibleMoves[v]);
                stockfish.postMessage("position fen " + tempGame.fen())
                stockfish.postMessage("go " + stockfishDepth + "15");
                let target = await getStockfishEvaluation(tempGame.fen());
                let prediction = await evaluateMove(tempGame)
                if (target == NaN || prediction == NaN) {
                    console.log(target + "% chance to win");
                    console.log(prediction + "model evaluation");
                } else {
                    addTrainingDataToJSONFile(tempGame.fen(), target);
                }
                //adds training data

                //const response = await model.fit([prediction], [target] /*, config?*/ );
                //console.log(response.history.loss[0]);
                tf.dispose(prediction);
                tf.dispose(target);
                //resets board
            }
        }
    }
    return "created training data";
}

async function getStockfishEvaluation() {
    while (bestMove == "") {
        await timeout(50);
    }
    bestMove = "";
    let sfe = stockfishEvaluation;
    let evaluation = sfe.slice(sfe.indexOf("cp") + 3).split(" ")[0];
    evaluation = centiPawnsToWinningProbability(evaluation)
    stockfishEvaluation = "";
    return evaluation;
}

function addTrainingDataToJSONFile(fen, evaluation) {
    jQuery.ajax({
        type: "POST",
        url: 'addTrainingData.php',
        dataType: 'json',
        data: {
            fen: fen,
            evaluation: evaluation
        },

        success: function(result) {
            console.log(result);
        }
    });
}

async function evaluateMove(board) {
    let moveEvaluation;
    let chessboardAsArray = await ChessboardToNNInput(board, []);
    this.drawState = chessboardAsArray[70];
    let tfChessBoard = await tf.tensor2d([chessboardAsArray]);
    tf.tidy(() => {

        let predictionResult = NNTrainer.models[0].model.predict(tfChessBoard).dataSync()[0];
        moveEvaluation = predictionResult;
    })
    tf.dispose(tfChessBoard)

    return moveEvaluation
}


function finishedTraining() {
    console.log('Training has been finished!');
    console.log('Number of tensors not disposed: ' + tf.memory().numTensors);
    let fenTest = "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 1";
    game.load(fenTest);
    board = Chessboard('board', fenTest);
    /*let testArr = [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 5, 0, 1, 0, 0, 1, 7, 0, 7, 1, 0, 0, 0, 7, 0, 11, 7, 0, 0, 7, 7, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];	
    let tfTestArr = tf.tensor2d([testArr]);
    model.predict([tfTestArr]).print();
    tf.dispose(tfTestArr);*/
}

async function createNewModel() {
    for (let i = 0; i < NNTrainer.amountOfModels; i++) {
        await NNTrainer.addModelToTrainer();
    }
    return "created new model";
}

async function mutateModels() {
    for (let j = 0; j < 100; j++) {
        for (let i = 0; i < NNTrainer.amountOfModels; i++) {
            await NNTrainer.models[i].extremeMutate(0.5);
        }
    }
}