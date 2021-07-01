<?php  
	require("getScripts.php");
?>
<!DOCTYPE html>
<html lang="sv">
<head>
	<meta charset="utf-8">
	<title>matrix math in tensorflow.js</title>
</head>
<body>

	<script>
		function setup() {
		}

		let values1 = []; //values
		let values2 = []; //values
		for (var i = 0; i < 6; i++) {
			values1.push(Math.random()*10);
			values2.push(Math.random()*10);
		}

		let shape1 = [1,2,3];
		let shape2 = [1,3,2];

		let datatype = "int32";

		//tf.tensor(images, shape, datatype).print();
		let network1 = tf.tensor3d(values1, shape1, datatype);
		let network2 = tf.tensor3d(values2, shape2, datatype);

		/*network.data().then(function(stuff){
			console.log(stuff);
		});*/

		let varNetwork1 = tf.variable(network1);
		let varNetwork2 = tf.variable(network2);
		varNetwork1.print();
		varNetwork2.print();
		//scalar
		console.log("scalar");
		let scalar = varNetwork1.mul(5);
		scalar.print();
		//dot product
		console.log("dot product");
		//let dotProduct = tf.layers.dot(varNetwork1, varNetwork2, 2);
	</script>
</body>
</html>