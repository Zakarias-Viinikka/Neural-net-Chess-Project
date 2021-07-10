class NeuralNet {
    constructor() {
        this.model = this.createModel();
        this._zig = new Ziggurat();
    }

    cloneModel() {
        let newModel = this.createModel();
        newModel.setWeights(this.model.getWeights());
        return newModel;
    }

    //weights change to a random weight between -1 and 1
    async extremeMutate(rate) {
        tf.tidy(() => {

            const weights = this.model.getWeights();
            const mutatedWeights = [];
            for (let i = 0; i < weights.length; i++) {
                let tensor = weights[i];
                let shape = weights[i].shape;
                let values = tensor.dataSync().slice();
                for (let j = 0; j < values.length; j++) {
                    if (Math.random() < rate) {
                        let w = values[j];
                        values[j] = this._zig.nextGaussian();
                    }
                }
                let newTensor = tf.tensor(values, shape);
                mutatedWeights[i] = newTensor;
            }
        })
    }

    async mutate(rate) {
        const weights = this.model.getWeights();
        const mutatedWeights = [];
        for (let i = 0; i < weights.length; i++) {
            let tensor = weights[i];
            let shape = weights[i].shape;
            let values = tensor.dataSync().slice();
            for (let j = 0; j < values.length; j++) {
                if (Math.random() < rate) {
                    let w = values[j];
                    values[j] = this._zig.slowTraining(w);
                }
            }
            let newTensor = tf.tensor(values, shape);
            mutatedWeights[i] = newTensor;
        }
        this.model.setWeights(mutatedWeights);

        this.model.setWeights(mutatedWeights);
        tf.dispose(mutatedWeights);
        console.log(tf.memory().numTensors)
    }

    createModel() {
        const inputLayer = tf.layers.dense({ inputShape: 72, units: 10, activation: 'relu' });
        const hiddenLayer2 = tf.layers.dense({ units: 150, activation: 'relu' });
        const hiddenLayer3 = tf.layers.dense({ units: 100, activation: 'relu' });
        const hiddenLayer4 = tf.layers.dense({ units: 80, activation: 'relu' });
        const hiddenLayer5 = tf.layers.dense({ units: 60, activation: 'relu' });
        const hiddenLayer6 = tf.layers.dense({ units: 50, activation: 'relu' });
        const hiddenLayer7 = tf.layers.dense({ units: 25, activation: 'relu' });
        const outputLayer = tf.layers.dense({ units: 1, activation: 'sigmoid' });

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