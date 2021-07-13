class NeuralNetwork {
    constructor(model) {
        this.model = model;
        this._zig = new Ziggurat();
    }

    cloneModel() {
        let newModel = this.createModel();
        newModel.setWeights(this.model.getWeights());
        return newModel;
    }

    //weights change to a random weight between -1 and 1
    async extremeMutate(rate) {
        rate = rate / 10000;
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
        this.model.setWeights(mutatedWeights);

        this.model.setWeights(mutatedWeights);
        tf.dispose(mutatedWeights);
    }

    async mutate(rate) {
        rate = rate / 100;
        const weights = this.model.getWeights();
        const mutatedWeights = [];
        for (let i = 0; i < weights.length; i++) {
            let tensor = weights[i];
            let shape = weights[i].shape;
            let values = tensor.dataSync().slice();
            for (let j = 0; j < values.length; j++) {
                if (Math.random() < rate) {
                    let w = values[j];
                    let hardMutate = parseInt(Math.random() * 100, 10);
                    if (hardMutate <= 9) {
                        values[j] = this._zig.nextGaussian(w);
                    } else {
                        values[j] = this._zig.slowTraining(w);
                    }
                }
            }
            let newTensor = tf.tensor(values, shape);
            mutatedWeights[i] = newTensor;
        }
        this.model.setWeights(mutatedWeights);

        this.model.setWeights(mutatedWeights);
        tf.dispose(mutatedWeights);
    }
}