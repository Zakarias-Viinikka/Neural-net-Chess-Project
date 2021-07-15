class NeuralNetwork {
    constructor(model) {
        this.model = model;
    }

    cloneModel() {
        let newModel = this.createModel();
        newModel.setWeights(this.model.getWeights());
        return newModel;
    }
    async mutate(rate) {
        rate = rate / 1000;
        const weights = this.model.getWeights();
        const mutatedWeights = [];
        for (let i = 0; i < weights.length; i++) {
            let tensor = weights[i];
            let shape = weights[i].shape;
            let values = tensor.dataSync().slice();
            for (let j = 0; j < values.length; j++) {
                if (Math.random() < rate) {
                    //let w = values[j];
                    let change = Math.random() + 0.5;
                    values[j] = values[j] * change;
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