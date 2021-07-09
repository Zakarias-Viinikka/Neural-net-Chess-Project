function ChessboardToNNInput(chessboard) {
    let boardAs2DArray = chessboard.board();
    let chessboardAsArray = [];
    this.getPieceValue = function(type, color) {
        let pieceValue = 0;
        if (type == "p") {
            pieceValue = 0.1
        } else if (type == "n") {
            pieceValue = 0.3
        } else if (type == "n") {
            pieceValue = 0.3
        }
        switch (type) {
            case "p":
                pieceValue = 0.1
                break;
            case "n":
                pieceValue = 0.3
                break;
            case "b":
                pieceValue = 0.3
                break;
            case "q":
                pieceValue = 0.9
                break;
            case "k":
                pieceValue = 1
                break;
            default:
                // code block
        }

        if (color == "b") {
            pieceValue = -pieceValue;
        }
        return pieceValue;
    }
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (boardAs2DArray[i][j] != null) {
                let pieceType = boardAs2DArray[i][j].type;
                let pieceColor = boardAs2DArray[i][j].color;
                chessboardAsArray.push(this.getPieceValue(pieceType, pieceColor));
            } else {
                chessboardAsArray.push(0);
            }
        }
    }

    let chessToFen = chessboard.fen();
    let lastPartOfFEN = "";
    let spaceHasBeenFound = false;

    for (let i = 0; i < chessToFen.length; i++) {
        if (spaceHasBeenFound) {
            lastPartOfFEN += chessToFen.indexOf(i);
        } else {
            if (chessToFen.indexOf(i) == " ") {
                spaceHasBeenFound = true;
            }
        }
    }

    let halfMoves = "";
    let halfMovesArr = [];
    let halfMovesDone = false;
    let repeats = "";
    for (let i = lastPartOfFEN.length; i > 0; i--) {
        if (!halfMovesDone) {
            if (lastPartOfFEN.indexOf(i) == " ") {
                halfMovesDone = true;
                for (let j = halfMovesArr.length; j > 0; j--) {
                    halfMoves += halfMovesArr[j];
                }
                halfMoves = parseFloat(halfMoves) / 50;
            } else {
                halfMovesArr.push(lastPartOfFEN.indexOf(i))
            }
        } else {
            if (lastPartOfFEN.indexOf(i) == " ") {
                break;
            } else {
                repeats = parseInt(lastPartOfFEN.indexOf(i)) / 2;
            }
        }
    }
    chessboardAsArray.push(halfMoves);
    chessboardAsArray.push(repeats);
    //includes allowed castles and whose turn it is into the final array that will be the input for the NN

    if (lastPartOfFEN.indexOf("w") != -1) {
        chessboardAsArray.push(1);
    } //else it is black and value is 0
    else {
        chessboardAsArray.push(0);
    }
    if (lastPartOfFEN.indexOf("K") != -1) {
        chessboardAsArray.push(1);
    } else {
        chessboardAsArray.push(0);
    }
    if (lastPartOfFEN.indexOf("Q") != -1) {
        chessboardAsArray.push(1);
    } else {
        chessboardAsArray.push(0);
    }
    if (lastPartOfFEN.indexOf("k") != -1) {
        chessboardAsArray.push(1);
    } else {
        chessboardAsArray.push(0);
    }
    if (lastPartOfFEN.indexOf("q") != -1) {
        chessboardAsArray.push(1);
    } else {
        chessboardAsArray.push(0);
    }
    //enpassant
    return chessboardAsArray;
}