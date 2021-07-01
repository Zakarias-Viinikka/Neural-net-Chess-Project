class NeuralNet {
    constructor() {
        this.model = this.createModel();
    }

    testModel() {
        let fenTest = "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 1";
        game.load(fenTest);
        board = Chessboard('board', fenTest);
        let testArr = [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 5, 0, 1, 0, 0, 1, 7, 0, 7, 1, 0, 0, 0, 7, 0, 11, 7, 0, 0, 7, 7, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let tfTestArr = tf.tensor2d([testArr]);
        this.model.predict([tfTestArr]).print();
        tf.dispose(tfTestArr);
    }

    createModel() {
        const inputLayer = tf.layers.dense({
            inputShape: 69,
            units: 10,
            activation: 'relu'
        });

        const hiddenLayer2 = tf.layers.dense({
            //inputShape: 69,
            units: 150,
            activation: 'relu'
        });

        const hiddenLayer3 = tf.layers.dense({
            //inputShape: 150,
            units: 100,
            activation: 'relu'
        });

        const hiddenLayer4 = tf.layers.dense({
            //inputShape: 100,
            units: 80,
            activation: 'relu'
        });

        const hiddenLayer5 = tf.layers.dense({
            //inputShape: 80,
            units: 60,
            activation: 'relu'
        });

        const hiddenLayer6 = tf.layers.dense({
            //inputShape: 60,
            units: 50,
            activation: 'relu'
        });


        const hiddenLayer7 = tf.layers.dense({
            //inputShape: 50,
            units: 25,
            activation: 'relu'
        });

        const outputLayer = tf.layers.dense({
            units: 1,
            activation: 'softmax'
        });

        const model = tf.sequential();
        model.add(inputLayer);
        model.add(hiddenLayer2);
        model.add(hiddenLayer3);
        model.add(hiddenLayer4);
        model.add(hiddenLayer5);
        model.add(hiddenLayer6);
        model.add(hiddenLayer7);
        model.add(outputLayer);
        model.compile({
            optimizer: 'sgd',
            loss: 'meanSquaredError'
        })

        return model;
    }
}