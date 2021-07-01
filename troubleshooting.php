<!DOCTYPE html>
<html lang="sv">
<head>
	<meta charset="utf-8">
	<title>TroubleShooting</title>
</head>
   	<script src='https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js'></script>
<body>

	<script>
		x = tf.tensor2d([[2,2]]);

		const model = tf.sequential();

		model.add(tf.layers.dense({
		    inputShape: 2,
		    units: 2,
		    activation: 'sigmoid'
		}));
		model.add(tf.layers.dense({
			units: 1,
			activation: 'sigmoid'
		}));

		model.compile({
			optimizer: 'sgd',
			loss: 'meanSquaredError'
		})

		let ctr = 0;
		test();

		async function test() {
			promise = await model.predict(x);
			console.log(parseFloat(promise.dataSync()) + 1);
			console.log(tf.memory().numTensors, ctr);
			ctr++;
			tf.dispose(promise);
			if (ctr <= 10) {
				test();
			}
		}
	</script>
</body>
</html>