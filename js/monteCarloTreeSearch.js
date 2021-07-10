class monteCarloTreeSearch {
    constructor(chess, depth) {
        this.chess = chess;
        this.originalPosition = chess.fen();
        this.depth = depth;
        this.model = "model";
        this.treeBranchRoots = [];
        this.history = [];
        this.drawState = 0;
    }

    async getBestMove(model, chess, history) {
        this.chess = chess;
        this.originalPosition = chess.fen();
        this.model = model;
        this.history = history;

        await this.createTreeBranchRoots().then(r => r);
        this.treeBranchRoots.sort(function(a, b) { return a.evaluation - b.evaluation });
        await this.treeSearch().then(r => r);
        let bestRoot = await this.getBestRoot().then(r => r);
        await this.resetStuff().then(r => r);
        this.chess.reset();
        return bestRoot.move;
    }

    async resetStuff() {
        this.treeBranchRoots = [];
        this.chess.load(this.originalPosition);
    }

    async createTreeBranchRoots() {
        let chess = this.chess;
        let allPossibleMoves = chess.moves();
        let removedMoves = 0;
        for (let i = 0; i < allPossibleMoves.length; i++) {
            let move = allPossibleMoves[i];
            chess.load(this.originalPosition);
            chess.move(move);
            let moveEvaluation = await this.evaluateMove(chess, this.history, move, false);
            let newBoardPosition = this.chess.fen();
            this.treeBranchRoots.push(new treeBranchRoot(move, moveEvaluation, this, newBoardPosition));
            this.chess.load(this.originalPosition);
        }
    }
    async treeSearch() {
        for (let i = 0; i < this.depth; i++) {
            let bestRoot = this.treeBranchRoots[this.treeBranchRoots.length - 1];
            await bestRoot.analyzeBestMove().then(r => r);
            //sort
            for (let i = this.treeBranchRoots.length - 1; i > 0; i--) {
                let newEvaluation = this.treeBranchRoots[i].evaluation;
                if (newEvaluation < this.treeBranchRoots[i - 1].evaluation) {
                    let tmp = this.treeBranchRoots[i - 1].evaluation;
                    this.treeBranchRoots[i - 1].evaluation = newEvaluation;
                    this.treeBranchRoots[i].evaluation = tmp;
                } else {
                    break;
                }
            }
        }
    }

    async getBestRoot() {
        return this.treeBranchRoots[this.treeBranchRoots.length - 1];
    }

    async getRootEvaluation(rootIndex) {
        return this.treeBranchRoots[rootIndex].evaluation;
    }

    async evaluateMove(board, history, move, opponentTurn) {
        let moveEvaluation;
        let chessboardAsArray = await ChessboardToNNInput(board, history, move, opponentTurn);
        this.drawState = chessboardAsArray[71];
        let tfChessBoard = await tf.tensor2d([chessboardAsArray]);
        tf.tidy(() => {

            let predictionResult = this.model.predict(tfChessBoard).dataSync()[0];
            moveEvaluation = predictionResult;
        })
        tf.dispose(tfChessBoard)
        return moveEvaluation
    }
}

class treeBranchRoot {
    constructor(move, evaluation, monteCarlo, boardPosition) {
        this.boardPosition = boardPosition;
        this.monteCarlo = monteCarlo;
        this.move = move;
        this.originalEvaluation = evaluation;
        this.evaluation = evaluation;
        this.treeBranches = [];
        this.opponentTurn = true;
    }

    async analyzeBestMove() {
        if (this.treeBranches.length == 0) {
            await this.createLeafPositions().then(r => r);
            this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });
        } else {
            await this.analyzeBestLeaf().then(r => r);
        }
    }

    async createLeafPositions() {
        let possibleMoves = this.monteCarlo.chess.moves();
        let chess = this.monteCarlo.chess;
        for (let i = 0; i < possibleMoves.length; i++) {
            let move = possibleMoves[i];
            chess.load(this.boardPosition);
            chess.move(move);
            let evaluation = await this.monteCarlo.evaluateMove(chess, monteCarlo.history, move, this.opponentTurn);
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, evaluation, newBoardPosition, this.opponentTurn));
            this.monteCarlo.chess.load(this.boardPosition);
        }
    }

    async analyzeBestLeaf() {
        await this.treeBranches[this.treeBranches.length - 1].analyze().then(r => r);
    }

    async updateEvaluations(evaluation) {
        this.evaluation = evaluation;

        for (let i = this.treeBranches.length - 1; i > 0; i--) {
            let newEvaluation = this.treeBranches[i].evaluation;
            if (newEvaluation < this.treeBranches[i - 1].evaluation) {
                let tmp = this.treeBranches[i - 1].evaluation;
                this.treeBranches[i - 1].evaluation = newEvaluation;
                this.treeBranches[i].evaluation = tmp;
            } else {
                break;
            }
        }

        this.monteCarlo.treeBranchRoots.sort(function(a, b) { return a.evaluation - b.evaluation });
    }
}

class treeBranch {
    constructor(origin, monteCarlo, evaluation, boardPosition, opponentTurn) {
        this.evaluation = evaluation;
        this.boardPosition = boardPosition;
        this.monteCarlo = monteCarlo;
        this.origin = origin;
        this.treeBranches = [];
        this.opponentTurn = !opponentTurn;
    }

    async analyze() {
        if (this.treeBranches.length == 0) {
            await this.createLeafPositions().then(r => r);
            this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });
            await this.updateEvaluations(this.evaluation).then(r => r);
        } else {
            await this.treeBranches[this.treeBranches.length - 1].analyze().then(r => r);
        }
    }

    async createLeafPositions() {
        let chess = this.monteCarlo.chess;
        let possibleMoves = chess.moves();
        for (let i = 0; i < possibleMoves.length; i++) {
            let move = possibleMoves[i]
            chess.load(this.boardPosition);
            chess.move(move);
            let evaluation = await this.monteCarlo.evaluateMove(chess, monteCarlo.history, move, this.opponentTurn);
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, evaluation, newBoardPosition, this.opponentTurn));

            chess.load(this.boardPosition);
        }
    }

    async updateEvaluations(evaluation) {
        this.evaluation = evaluation;

        for (let i = this.treeBranches.length - 1; i > 0; i--) {
            let newEvaluation = this.treeBranches[i].evaluation;
            if (newEvaluation < this.treeBranches[i - 1].evaluation) {
                let tmp = this.treeBranches[i - 1].evaluation;
                this.treeBranches[i - 1].evaluation = newEvaluation;
                this.treeBranches[i].evaluation = tmp;
            } else {
                break;
            }
        }
        this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });

        await this.origin.updateEvaluations(evaluation).then(r => r);
    }
}