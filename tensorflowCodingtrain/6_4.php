<?php  
	require("getScripts.php");
?>
<!DOCTYPE html>
<html lang="sv">
<head>
	<meta charset="utf-8">
	<title>6.3: TensorFlow.js: Variables & Operations - Intelligence and Learning</title>
</head>
<body>

	<script>
		let images = [0,0,127,255,0,155,20,200]; //values
		let shape = [2,1,4];
		let datatype = "int32";

		function setup() {
		}

		function draw() {
			console.log("tensors outside of tidy " + tf.memory().numTensors);
		}

		tf.tidy(func);
		function func() {

			//tf.tensor(images, shape, datatype).print();
			let a = tf.tensor3d(images, shape, datatype);
			let b = tf.tensor3d(images, shape, datatype);
			let c = tf.tensor3d(images, shape, datatype);

			a.data().then(function(stuff){
				console.log(stuff);
			});

			let vara = tf.variable(a);
			vara.print();
		}
	</script>
</body>
</html>