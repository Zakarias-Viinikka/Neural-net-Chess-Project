<?php  
	require("getScripts.php");
?>
<!DOCTYPE html>
<html lang="sv">
<head>
	<meta charset="utf-8">
	<title>TensorFlow.js: Layers API Part 1 - Intelligence and Learning</title>
</head>
<body>

	<script>
		const tfmodel = tf.sequential();

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

		const sgdOptimizer = tf.train.sgd(0.1);
		const configModel = {
			optimizer: sgdOptimizer,
			loss: 'meanSquaredError'
		}

		tfmodel.compile(configModel);



		function setup() {
		}

		function draw() {
			//console.log("tensors outside of tidy " + tf.memory().numTensors);
		}
	</script>
</body>
</html>