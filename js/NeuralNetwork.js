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
        rate = rate / 10000;
        const weights = this.model.getWeights();
        let ctr = 1;
        const mutatedWeights = [];
        for (let i = 0; i < weights.length; i++) {
            let tensor = weights[i];
            let shape = weights[i].shape;
            let values = tensor.dataSync().slice();
            /*
            for (let j = 0; j < values.length; j++) {
                if (Math.random() < rate) {
                    ctr++;
                    //let w = values[j];
                    if (Math.random() > 0.5) {
                        let change = Math.random() + 0.5;
                        values[j] = values[j] * change;
                    } else {
                        let change = Math.random() * 2 - 1;
                        values[j] += change;
                    }
                }
            }
            */
            let weightToChange = parseInt(Math.random() * weights.length);
            if (Math.random() > 0.5) {
                let change = Math.random() + 0.5;
                values[weightToChange] = values[weightToChange] * change;
            } else {
                let change = Math.random() * 2 - 1;
                values[weightToChange] += change;
            }
            let newTensor = tf.tensor(values, shape);
            mutatedWeights[i] = newTensor;
        }
        this.model.setWeights(mutatedWeights);
        this.model.setWeights(mutatedWeights);
        tf.dispose(mutatedWeights);
        console.log("weights changed: " + ctr);
    }
}