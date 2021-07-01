<?php  
	$array = array();

	for ($i=0; $i < 5; $i++) { 
		for ($v=0; $v < 5; $v++) { 
			$array[$i][$v] = $i . $v;
		}
	}

	$jsoned = json_encode($array);
	echo $jsoned;

	$array2 = (json_decode($jsoned));
	echo "<br><br>";
	echo $array2[0][0] . "<br>";
	echo $array2[1][1] . "<br>";
	echo $array2[2][2] . "<br>";
	echo $array2[3][1] . "<br>";
?>