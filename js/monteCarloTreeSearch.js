async function monteCarloTreeSearch(depth) {
    boardBeforeMonte = game.fen(); //saves the board before anything is done
    possibleMovesMonte = game.moves();
    let originalBoard = game.fen();
    let rootMoves = [];
    let evaluationPool = 0; // all the evaluations will be added into this variable and later the number will be used to distribute how many moves each move is worth investigating further

    for (var i = 0; i < possibleMovesMonte.length; i++) {
        game.move(possibleMovesMonte[i]);

        let move = tf.tensor2d([getNeuralInputFromFen()]);
        let promise = await model.predict(move); // the promise stores the predict data once the model is done predicting
        //console.log(promise[0]);
        //rootMoves.push(positionEvaluation())
        let results = parseFloat(promise.dataSync());
        if (results > 0) {
            evaluationPool += results;
        }
        rootMoves.push(new rootEvaluation(i, results))
        tf.dispose(promise);
        tf.dispose(move);

        game.load(originalBoard);
    }
    //hand out moves
    let sortMovesByValueArr = [];
    let totalMovesHandedOut = 0;
    for (var i = 0; i < rootMoves.length; i++) {
        rootMoves[i].updateMovesToCheck(evaluationPool, depth);
        totalMovesHandedOut += rootMoves[i].getPositionsToCheckLeft();
        //console.log("getPositionsToCheckLeft gives: ", rootMoves[i].getPositionsToCheckLeft());
        sortMovesByValueArr.push(i + "," + rootMoves[i].getEvaluation());
    }
    //sort moves by value
    sortMovesByValueArr.sort(compareWithSplit);
    //remove the extra moves handed out
    let removeMoveIndex = sortMovesByValueArr.length;
    console.log("Amount of moves handed out: ", totalMovesHandedOut, "Limit given: ", depth);
    while (totalMovesHandedOut > depth) {
        console.log("Amount of moves handed out: ", totalMovesHandedOut, "Limit given: ", depth);
        rootMoves[sortMovesByValueArr[removeMoveIndex - 1].split(",")[0]].removeAMove();
        removeMoveIndex--;
        if (removeMoveIndex - 1 < 0) {
            removeMoveIndex = sortMovesByValueArr.length;
        }
        totalMovesHandedOut--;
    }
    //create the first set of leafmoves
    for (var i = 0; i < rootMoves.length; i++) {
        game.load(originalBoard);
        game.move(possibleMovesMonte[i]);
        //i is the root of the leaf
        leafMoves.push(new leafEvaluation(i, game.fen(), rootMoves[i].getPositionsToCheckLeft()));
    }
    leafMoves[0].getPredictions();
}

function compareWithSplit(a, b) {
    a = a.split(",")[1];
    b = b.split(",")[1];
    return b - a;
}

function bestMoveFound() {
    console.log("Amount of tensors: " + tf.memory().numTensors);
    leafMoves = [];
    console.log("The best move has is: " + possibleMovesMonte[bestMoveIndex]);
    game.load(boardBeforeMonte);
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
        console.log(leafIndex, leafMoves.length - 1, " best move so far has the index: ", bestMoveIndex);
        // ... // get all the moves
        game.load(currentBoard);
        allPossibleMovesFromHere = game.moves();
        // ... //

        // ... // get a prediction for all the moves
        for (let i = 0; i < allPossibleMovesFromHere.length; i++) {
            game.load(currentBoard);
            game.move(allPossibleMovesFromHere[i]);
            let move = tf.tensor2d([getNeuralInputFromFen()]);
            const promise = await model.predict(move);
            //get the reults from the promise by using parsefloat on the promise after using dataSync to make sure the order is right
            let results = parseFloat(promise.dataSync());
            if (results < 0) {
                results = 0;
            }

            allEvaluations.push(results);
            evaluationSum += results;

            tf.dispose(move);
            tf.dispose(promise);
        }

        // ... //

        // ... // returnMoveOrCreateNewLeaf();
        //console.log("positionsToCheckLeft: ", positionsToCheckLeft)
        if (positionsToCheckLeft < 1) {
            for (var i = 0; i < allEvaluations.length; i++) {
                if (allEvaluations[i] > bestMoveValue) {
                    bestMoveIndex = origin;
                    bestMoveValue = allEvaluations[i];
                }
            }
        } else { //create new leaf
            for (var i = 0; i < allPossibleMovesFromHere.length; i++) {
                //console.log(allEvaluations[i]/evaluationSum*positionsToCheckLeft);
                game.load(currentBoard);
                game.move(allPossibleMovesFromHere[i]);
                let movesForleafLeft = parseInt(allEvaluations[i] / evaluationSum * positionsToCheckLeft);
                leafMoves.push(new leafEvaluation(origin, game.fen(), movesForleafLeft));
            }
        }
        // ... //
        if (leafIndex == leafMoves.length - 1) {
            bestMoveFound();
        } else {
            leafMoves[leafIndex + 1].getPredictions();
        }
    }
}