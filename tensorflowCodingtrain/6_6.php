<?php  
	require("getScripts.php");
?>
<!DOCTYPE html>
<html lang="sv">
<head>
	<meta charset="utf-8">
	<title>TensorFlow.js: Layers API Part 2 - Intelligence and Learning</title>
</head>
<body>

	<script>
		//create model
		const tfmodel = tf.sequential();
		//create and add layers
		const configHidden = {
			units: 4,
			inputShape: [2],
			activation: 'sigmoid'
		}
		const hiddenLayer = tf.layers.dense(configHidden);

		const configOutput = {
			units: 3,
			activation: 'sigmoid'
		}
		const outputLayer = tf.layers.dense(configOutput);

		tfmodel.add(hiddenLayer);
		tfmodel.add(outputLayer);
		//create optimizer and config for the model
		const sgdOptimizer = tf.train.sgd(0.1);
		const configModel = {
			optimizer: sgdOptimizer,
			loss: 'meanSquaredError'
		}
		//create the model
		tfmodel.compile(configModel);


		const inputs = tf.tensor2d([
			[0.24,0.32],
			[0.3,0.55]
			]);
		tfmodel.predict(inputs).print();

		async function train() {
			const response = await model.fit(xs, ys, config?);
			console.log(response.history.loss[0]);
		}

		train.then(() => console.log("training complete"));















		function setup() {
		}

		function draw() {
			//console.log("tensors outside of tidy " + tf.memory().numTensors);
		}
	</script>
</body>
</html>