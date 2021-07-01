function ChessboardToNNInput(chessboard) {
    let newBoardAsArray = fenToArrayFunc(game.fen()); //translates the FEN board into an array
    //includes allowed castles and whose turn it is into the final array that will be the input for the NN
    let newBoardAsArrayNN = [];
    //finish the neuralnet final array
    for (var z = 0; z < 64; z++) {
        newBoardAsArrayNN[z] = newBoardAsArray[z];
    }
    let lastPartOfArray = "";
    for (var z = 64; z < newBoardAsArrayNN.length; z++) {
        lastPartOfArray += newBoardAsArrayNN[z];
    }
    if (lastPartOfArray.indexOf("w") != -1) {
        newBoardAsArrayNN.push(1);
    } //else it is black and value is 0
    else {
        newBoardAsArrayNN.push(0);
    }
    if (lastPartOfArray.indexOf("K") != -1) {
        newBoardAsArrayNN.push(1);
    } else {
        newBoardAsArrayNN.push(0);
    }
    if (lastPartOfArray.indexOf("Q") != -1) {
        newBoardAsArrayNN.push(1);
    } else {
        newBoardAsArrayNN.push(0);
    }
    if (lastPartOfArray.indexOf("k") != -1) {
        newBoardAsArrayNN.push(1);
    } else {
        newBoardAsArrayNN.push(0);
    }
    if (lastPartOfArray.indexOf("q") != -1) {
        newBoardAsArrayNN.push(1);
    } else {
        newBoardAsArrayNN.push(0);
    }

    return newBoardAsArrayNN;
}