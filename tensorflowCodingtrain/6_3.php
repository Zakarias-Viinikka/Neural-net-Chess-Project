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
		function setup() {
			let images = [0,0,127,255,0,155,20,200]; //values
			let shape = [2,1,4];
			let datatype = "int32";

			//tf.tensor(images, shape, datatype).print();
			let network = tf.tensor3d(images, shape, datatype);

			network.data().then(function(stuff){
				console.log(stuff);
			});

			let varNetwork = tf.variable(network);
			varNetwork.print();
		}

	</script>
</body>
</html>