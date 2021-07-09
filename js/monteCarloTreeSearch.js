let monteModel;
let leafMoves = []; //array for storing the leaf moves in the monte carlo tree search algorithm
let bestMoveIndex = 0; //stores the index for the best root move so far
let bestMoveValue = -1; //stores the value for the best prediction so far
let possibleMovesMonte; //possibleMoves but as a global variable for the monte carlo tree search
let boardBeforeMonte;
let bestMove;

async function monteCarloTreeSearch(depth, _model, _chess) {
    monteModel = _model;
    boardBeforeMonte = _chess.fen(); //saves the board before anything is done
    monteBoard = _chess;
    possibleMovesMonte = monteBoard.moves();
    let originalBoard = monteBoard.fen();
    let rootMoves = [];
    let evaluationPool = 0; // all the evaluations will be added into this variable and later the number will be used to distribute how many moves each move is worth investigating further

    for (var i = 0; i < possibleMovesMonte.length; i++) {
        monteBoard.move(possibleMovesMonte[i]);

        let move = tf.tensor2d([ChessboardToNNInput()]);
        let promise = await monteModel.predict(move); // the promise stores the predict data once the model is done predicting
        //rootMoves.push(positionEvaluation())
        let results = parseFloat(promise.dataSync());
        if (results > 0) {
            evaluationPool += results;
        }
        rootMoves.push(new rootEvaluation(i, results))
        tf.dispose(promise);
        tf.dispose(move);

        monteBoard.load(originalBoard);
    }
    //hand out moves
    let sortMovesByValueArr = [];
    let totalMovesHandedOut = 0;
    for (var i = 0; i < rootMoves.length; i++) {
        rootMoves[i].updateMovesToCheck(evaluationPool, depth);
        totalMovesHandedOut += rootMoves[i].getPositionsToCheckLeft();
        sortMovesByValueArr.push(i + "," + rootMoves[i].getEvaluation());
    }
    //sort moves by value
    sortMovesByValueArr.sort(compareWithSplit);
    //remove the extra moves handed out
    let removeMoveIndex = sortMovesByValueArr.length;
    while (totalMovesHandedOut > depth) {
        rootMoves[sortMovesByValueArr[removeMoveIndex - 1].split(",")[0]].removeAMove();
        removeMoveIndex--;
        if (removeMoveIndex - 1 < 0) {
            removeMoveIndex = sortMovesByValueArr.length;
        }
        totalMovesHandedOut--;
    }
    //create the first set of leafmoves
    for (var i = 0; i < rootMoves.length; i++) {
        monteBoard.load(originalBoard);
        monteBoard.move(possibleMovesMonte[i]);
        //i is the root of the leaf
        leafMoves.push(new leafEvaluation(i, monteBoard.fen(), rootMoves[i].getPositionsToCheckLeft()));
    }
    await goThroughLeafMoves();
    monteBoard.load(originalBoard);
    bestMoveFound();
    return bestMove;
}

async function goThroughLeafMoves() {
    for (let i = 0; i < leafMoves.length; i++) {
        await leafMoves[i].getPredictions();
    }
}

function compareWithSplit(a, b) {
    a = a.split(",")[1];
    b = b.split(",")[1];
    return b - a;
}

function bestMoveFound() {
    leafMoves = [];
    bestMoveIndex = 0;
    bestMoveValue = -1;
    bestMove = possibleMovesMonte[bestMoveIndex];
}

//create an object for every root move
function rootEvaluation(oSent, eSent) {
    let origin = oSent;
    let evaluation = eSent;
    let positionsToCheckLeft = 0;
    this.updateMovesToCheck = function(evaluationPool, positionsToCheck) {
        if (evaluation > 0) {
            positionsToCheckLeft = Math.round((evaluation / evaluationPool * positionsToCheck));
        }
        if (positionsToCheckLeft <= 0) {
            positionsToCheckLeft = 1;
        }
    }
    this.removeAMove = function() {
        positionsToCheckLeft--;
    }
    this.getPositionsToCheckLeft = function() {
        return positionsToCheckLeft;
    }
    this.getOrigin = function() {
        return origin;
    }
    this.getEvaluation = function() {
        return evaluation;
    }
}
//object for leaf moves
function leafEvaluation(oSent, currentBoardSent, positionsToCheckLeftSent) {
    let leafIndex = leafMoves.length;
    let origin = oSent;
    let allPossibleMovesFromHere = [];
    let allEvaluations = [];
    let currentBoard = currentBoardSent;
    let positionsToCheckLeft = positionsToCheckLeftSent;
    let evaluationSum = 0;
    //updates the best move if one is found or creates a new leaf
    this.getPredictions = async function() {
        let promise = new Promise(() => {

            })
            // ... // get all the moves
        monteBoard.load(currentBoard);
        allPossibleMovesFromHere = monteBoard.moves();
        // ... //

        // ... // get a prediction for all the moves
        for (let i = 0; i < allPossibleMovesFromHere.length; i++) {
            monteBoard.load(currentBoard);
            monteBoard.move(allPossibleMovesFromHere[i]);
            let tfChessBoard = tf.tensor2d([ChessboardToNNInput()]);
            const promise = await monteModel.predict(tfChessBoard);
            //get the reults from the promise by using parsefloat on the promise after using dataSync to make sure the order is right
            let results = parseFloat(promise.dataSync());
            if (results < 0) {
                results = 0;
            }

            allEvaluations.push(results);
            evaluationSum += results;

            tf.dispose(tfChessBoard);
            tf.dispose(promise);
        }

        // ... //

        // ... // returnMoveOrCreateNewLeaf();
        if (positionsToCheckLeft < 1) {
            for (var i = 0; i < allEvaluations.length; i++) {
                if (allEvaluations[i] > bestMoveValue) {
                    bestMoveIndex = origin;
                    bestMoveValue = allEvaluations[i];
                }
            }
        } else { //create new leaf
            for (var i = 0; i < allPossibleMovesFromHere.length; i++) {
                monteBoard.load(currentBoard);
                monteBoard.move(allPossibleMovesFromHere[i]);
                let movesForleafLeft = parseInt(allEvaluations[i] / evaluationSum * positionsToCheckLeft);
                leafMoves.push(new leafEvaluation(origin, monteBoard.fen(), movesForleafLeft));
            }
        }
    }
}