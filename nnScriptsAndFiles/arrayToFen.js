let array1 = [];
function arrayToFenFunc(arraySent) {
	let slashes = 0;
	//converts back to fen to see if it works
	array1 = arraySent;
	let fenString = "";
	for (var i = 0; i < array1.length; i++) {
		if (i > 63) {
			fenString += array1[i];
		}
		//kollar om den är en nolla och då gör den svart magi
		else if (array1[i] == 0) {
			/*fenString += findZeroes(i);
			while(array1[i] == 0 && (i+1)%8 != 0) {
				i++;
			}*/
			if (!Number.isInteger(parseInt(fenString.charAt(fenString.length-1)))) {
				fenString += "1";
			}
			else {
				let lastChar = parseInt(fenString.charAt(fenString.length-1))+1;
				let restOfString = fenString.substring(0, fenString.length - 1);
				fenString = restOfString + lastChar;
				//replaceAt(fenString, fenString.length, parseInt(fenString.charAt(fenString.length-1))+1);
			}	
		}
		else if (array1[i] == 1) {
			fenString += "p";
		}
		else if(array1[i] == 2) {
			fenString += "n";
		}	
		else if(array1[i] == 3) {
			fenString += "r";
		}
		else if(array1[i] == 4) {
			fenString += "b";
		}
		else if(array1[i] == 5) {
			fenString += "k";
		}
		else if(array1[i] == 6) {
			fenString += "q";
		}
		else if(array1[i] == 7) {
			fenString += "P";
		}
		else if(array1[i] == 8) {
			fenString += "N";
		}
		else if(array1[i] == 9) {
			fenString += "R";
		}
		else if(array1[i] == 10) {
			fenString += "B";
		}
		else if(array1[i] == 11) {
			fenString += "K";
		}
		else if(array1[i] == 12) {
			fenString += "Q";
		}
		
		if ( (i+1)%8 == 0 && i != 0) {
			if (slashes < 7) {
				fenString += "/";
				slashes++;
			}
		}
	}

	return fenString;
}
	'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
	//let empty = 0;
	//let wpawn = 1;
	//let wknight = 2;
	//let wrook = 3;
	//let wbishop = 4;
	//let wking = 5;
	//let wqueen = 6;
	//let bpawn = 7;
	//let bknight = 8;
	//let brook = 9;
	//let bbishop = 10;
	//let bking = 11;
	//let bqueen = 12;

function findZeroes(index) {
	let amountOfZeroes = 0;
	while(array1[index] == 0 && ((index+1)%8)+1 != 0) {
		amountOfZeroes++;
		index++;
	}
	console.log(amountOfZeroes);
	return amountOfZeroes;

}

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}