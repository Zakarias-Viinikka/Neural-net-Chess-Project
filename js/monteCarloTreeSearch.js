class monteCarloTreeSearch {
    constructor() {
        this.depth = localStorage.getItem("depth");
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

        await this.createTreeBranchRoots();
        this.treeBranchRoots.sort(function(a, b) { return a.evaluation - b.evaluation });

        await this.treeSearch();
        let bestRoot = await this.getBestRoot();
        await this.resetStuff();
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
            chess.move(move);
            let moveEvaluation = await this.evaluateMove(chess, 1, this.history);
            let newBoardPosition = this.chess.fen();
            this.treeBranchRoots.push(new treeBranchRoot(move, moveEvaluation, this, newBoardPosition, this.history));
            chess.undo();
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

    async evaluateMove(board, opponentTurn, history) {
        let moveEvaluation;
        let chessboardAsArray = await ChessboardToNNInput(board, history);
        this.drawState = chessboardAsArray[70];
        let tfChessBoard = await tf.tensor2d([chessboardAsArray]);
        tf.tidy(() => {

            let predictionResult = this.model.predict(tfChessBoard).dataSync()[0];
            moveEvaluation = predictionResult;
        })
        tf.dispose(tfChessBoard)

        return moveEvaluation * opponentTurn
    }
}

class treeBranchRoot {
    constructor(move, evaluation, monteCarlo, boardPosition, history) {
        this.boardPosition = boardPosition;
        this.monteCarlo = monteCarlo;
        this.move = move;
        this.originalEvaluation = evaluation;
        this.evaluation = evaluation;
        this.treeBranches = [];
        this.opponentTurn = -1;
        this.history = history;
    }

    async analyzeBestMove() {
        if (this.treeBranches.length == 0) {
            await this.createTreeBranchPositions().then(r => r);
            this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });
        } else {
            await this.analyzeBestTreeBranch().then(r => r);
        }
    }

    async createTreeBranchPositions() {
        let possibleMoves = this.monteCarlo.chess.moves();
        let chess = this.monteCarlo.chess;
        for (let i = 0; i < possibleMoves.length; i++) {
            let move = possibleMoves[i];
            chess.load(this.boardPosition);
            chess.move(move);
            let evaluation = await this.monteCarlo.evaluateMove(chess, this.opponentTurn, this.history);
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, evaluation, newBoardPosition, -this.opponentTurn, this.history));
            this.monteCarlo.chess.load(this.boardPosition);
        }
    }

    async analyzeBestTreeBranch() {
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
    constructor(origin, monteCarlo, evaluation, boardPosition, opponentTurn, history) {
        this.evaluation = evaluation;
        this.boardPosition = boardPosition;
        this.monteCarlo = monteCarlo;
        this.origin = origin;
        this.treeBranches = [];
        this.opponentTurn = -opponentTurn;
        this.history = history;
        this.history.push(boardPosition);
    }

    async analyze() {
        if (this.treeBranches.length == 0) {
            await this.createTreeBranchPositions();
            this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });
            await this.updateEvaluations(this.evaluation);
        } else {
            await this.treeBranches[this.treeBranches.length - 1].analyze();
        }
    }

    async createTreeBranchPositions() {
        let chess = this.monteCarlo.chess;
        let possibleMoves = chess.moves();
        for (let i = 0; i < possibleMoves.length; i++) {
            let move = possibleMoves[i]
            chess.load(this.boardPosition);
            chess.move(move);
            let evaluation = await this.monteCarlo.evaluateMove(chess, this.opponentTurn, this.monteCarlo.history) * this.opponentTurn;
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, evaluation, newBoardPosition, -this.opponentTurn, this.history));

            chess.load(this.boardPosition);
        }
    }

    async updateEvaluations(evaluation) {
        this.evaluation = evaluation;

        for (let i = this.treeBranches.length - 1; i > 0; i--) {
            let newEvaluation = this.treeBranches[i].evaluation;
            if (newEvaluation < this.treeBranches[this.treeBranches.length - 1].evaluation) {
                let tmp = this.treeBranches[this.treeBranches.length - 1].evaluation;
                this.treeBranches[this.treeBranches.length - 1].evaluation = newEvaluation;
                this.treeBranches[i].evaluation = tmp;
            } else {
                break;
            }
        }
        this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });

        await this.origin.updateEvaluations(evaluation);
    }
}