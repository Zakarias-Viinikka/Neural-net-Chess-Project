class monteCarloTreeSearch {
    constructor(chess, depth, model) {
        this.chess = chess;
        this.originalPosition = chess.fen();
        this.depth = depth;
        this.model = model;
        this.treeBranchRoots = [];
        this.treeBranches = [];
        this.bestMove = "";
    }

    getBestMove() {
        let allPossibleMoves = this.chess.moves();
        createTreeBranchRoots();
        treeSearch();
        let bestRoot = this.getBestRoot();
        console.log("best root has been found: " + bestRoot.move);
        return bestRoot.move;
    }

    createTreeBranchRoots() {
        for (let i = 0; i < allPossibleMoves.length; i++) {
            let move = allPossibleMoves[i];
            let moveEvaluation = this.evaluateMove(originalPosition, move, this.chess);
            this.treeBranchRoots.push(new treeBranchRoot(move, moveEvaluation, this));
        }
    }

    treeSearch() {
        /*sortTreesRootsByScore();*/
        for (let i = 0; i < depth; i++) {
            let bestRoot = this.getBestRoot();
            bestRoot.analyzeBestMove();
        }
    }

    getBestRoot() {
        let bestRootIndex = 0;
        for (let i = 0; i < this.treeBranchRoots.length; i++) {
            let root = this.treeBranchRoots[i];
            if (root.evaluation > this.getRootEvaluation(bestRootIndex)) {
                bestRootIndex = i;
            }
        }
        return this.rootMoves[bestRootIndex];
    }

    getRootEvaluation(rootIndex) {
        return this.treeBranchRoots[rootIndex].evaluation;
    }

    /*sortTreesRootsByScore() {
        this.modelScores.sort(function(a, b) { return nnTrainer.getModelScore(b) - nnTrainer.getModelScore(a) });
        this.treeBranchRoots.sort(function(a, b) {
            return b.evaluation - a.evaluation;
        })
    }*/

    evaluateMove(originalChess, move, chess) {
        chess.move(move, chess);
        let moveEvaluation = this.model.predict(ChessboardToNNInput(chess).dataSync()[0]);
        chess.load(originalChess.fen());
        return moveEvaluation
    }
}

class treeBranchRoot {
    constructor(move, evaluation, monteCarlo) {
        this.boardPosition = monteCarlo.chess.fen();
        this.monteCarlo = monteCarlo;
        this.move = move;
        this.originalEvaluation = evaluation;
        this.evaluation = evaluation;
        this.treeBranches = [];
        this.bestLeafIndex = 0;
    }

    getMove() {
        return move;
    }

    analyzeBestMove() {
        if (this.treeBranches.length = 0) {
            this.createLeafPositions();
            let bestLeaf = this.getBestLeaf();
        } else {
            this.getBestLeaf();
            //analyzeBestLeaf();
        }
    }

    createLeafPositions() {
        let possibleMoves = this.monteCarlo.chess.moves();
        for (let i = 0; i < possibleMoves.length; i++) {
            let eval = this.monteCarlo.evaluateMove(possibleMoves[i]);
            if (eval > this.bestEvaluation) {
                this.evaluation = eval;
                this.bestLeafIndex = i;
            }
            this.monteCarlo.chess.move(possibleMoves[i]);
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, eval, newBoardPosition));
        }
    }

    getBestLeaf() {
        this.treeBranches[bestLeafIndex].analyze();
    }

    updateEvaluations(evaluation) {

    }
}

class treeBranch {
    constructor(origin, monteCarlo, evaluation, boardPosition) {
        this.evaluation = evaluation;
        this.boardPosition = boardPosition;
        this.monteCarlo = monteCarlo;
        this.origin = origin;
        this.treeBranches = [];
        this.evaluationsForEveryMove = [];
        this.allPossibleMoves = this.model = model;
        this.bestLeafIndex = 0;
    }

    analyze() {
        if (this.treeBranches.length = 0) {
            this.createLeafPositions();
            this.updateEvaluations(evaluation);
        } else {
            this.treeBranches[bestLeafIndex].analyze();
        }
    }

    createLeafPositions() {
        let possibleMoves = this.monteCarlo.chess.moves();
        for (let i = 0; i < possibleMoves.length; i++) {
            let eval = this.monteCarlo.evaluateMove(possibleMoves[i]);
            if (eval > this.bestEvaluation) {
                this.evaluation = eval;
                this.bestLeafIndex = i;
            }
            this.monteCarlo.chess.move(possibleMoves[i]);
            let newBoardPosition = this.monteCarlo.chess.fen();
            this.treeBranches.push(new treeBranch(this, this.monteCarlo, eval, newBoardPosition));
        }
    }

    updateEvaluations(evaluation) {
        this.evaluation = evaluation;
        for (let i = 0; i < array.length; i++) {
            const element = array[i];

        }
        this.origin.updateEvaluations(evaluation);
    }
}