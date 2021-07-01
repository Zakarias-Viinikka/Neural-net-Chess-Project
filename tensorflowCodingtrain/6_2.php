<?php  
	require("getScripts.php");
?>
<!DOCTYPE html>
<html lang="sv">
<head>
	<meta charset="utf-8">
	<title>6.2 Tensors - Intelligence and Learning</title>
</head>
<body>

	<script>
		function setup() {
			let images = [0,0,127,255,0,155,20,200]; //values
			let shape = [2,1,4];
			let datatype = "int32";

			//tf.tensor(images, shape, datatype).print();
			tf.tensor3d(images, shape, datatype).print();
		}

	</script>
</body>
</html>