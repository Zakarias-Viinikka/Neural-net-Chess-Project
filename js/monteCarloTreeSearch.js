class monteCarloTreeSearch {
    constructor(chess, depth) {
        this.chess = chess;
        this.originalPosition = chess.fen();
        this.depth = depth;
        this.model = "model";
        this.treeBranchRoots = [];
    }

    async getBestMove(model, chess) {
        this.chess = chess;
        this.originalPosition = chess.fen();
        this.model = model;

        await this.createTreeBranchRoots();
        this.treeBranchRoots.sort(function(a, b) { return a.evaluation - b.evaluation });
        await this.treeSearch();
        let bestRoot = await this.getBestRoot();
        await this.resetStuff();
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
        for (let i = 0; i < allPossibleMoves.length; i++) {
            let move = allPossibleMoves[i];
            chess.load(this.originalPosition);
            chess.move(move);
            let moveEvaluation = await this.evaluateMove(chess.fen());
            let newBoardPosition = this.chess.fen();
            this.treeBranchRoots.push(new treeBranchRoot(move, moveEvaluation, this, newBoardPosition));
            this.chess.load(this.originalPosition);
        }
    }

    async treeSearch() {
        for (let i = 0; i < this.depth; i++) {
            console.log(i);
            let bestRoot = this.treeBranchRoots[this.treeBranchRoots.length - 1];
            await bestRoot.analyzeBestMove();
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

    async evaluateMove(board) {
        let moveEvaluation;
        tf.tidy(() => {

            let tfChessBoard = tf.tensor2d([ChessboardToNNInput(this.chess)]);
            let predictionResult = this.model.predict(tfChessBoard).dataSync()[0];
            moveEvaluation = predictionResult;
        })
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
    }

    async analyzeBestMove() {
        if (this.treeBranches.length == 0) {
            await this.createLeafPositions();
            this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });
        } else {
            await this.analyzeBestLeaf();
        }
    }

    async createLeafPositions() {
        let possibleMoves = this.monteCarlo.chess.moves();
        let chess = this.monteCarlo.chess;
        for (let i = 0; i < possibleMoves.length; i++) {
            chess.load(this.boardPosition);
            chess.move(possibleMoves[i]);
            let evaluation = await this.monteCarlo.evaluateMove(chess.fen());
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, evaluation, newBoardPosition));
            this.monteCarlo.chess.load(this.boardPosition);
        }
    }

    async analyzeBestLeaf() {
        await this.treeBranches[this.treeBranches.length - 1].analyze();
    }

    async updateEvaluations(evaluation) {
        this.evaluation = evaluation;

        this.monteCarlo.treeBranchRoots.sort(function(a, b) { return a.evaluation - b.evaluation });
    }
}

class treeBranch {
    constructor(origin, monteCarlo, evaluation, boardPosition) {
        this.evaluation = evaluation;
        this.boardPosition = boardPosition;
        this.monteCarlo = monteCarlo;
        this.origin = origin;
        this.treeBranches = [];
    }

    async analyze() {
        if (this.treeBranches.length == 0) {
            await this.createLeafPositions();
            this.treeBranches.sort(function(a, b) { return a.evaluation - b.evaluation });
            await this.updateEvaluations(this.evaluation);
        } else {
            await this.treeBranches[this.treeBranches.length - 1].analyze();
        }
    }

    async createLeafPositions() {
        let chess = this.monteCarlo.chess;
        let possibleMoves = chess.moves();
        for (let i = 0; i < possibleMoves.length; i++) {
            chess.load(this.boardPosition);
            chess.move(possibleMoves[i]);
            let evaluation = await this.monteCarlo.evaluateMove(chess.fen());
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, evaluation, newBoardPosition));

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

        await this.origin.updateEvaluations(evaluation);
    }
}