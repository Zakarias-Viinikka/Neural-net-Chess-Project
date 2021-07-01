function separateIntoMovesJs(pgn) {
	let pgnSent = pgn;
	let addToArr = false;
	let arrIndex = 0;
	let arrS = [];
	let wasDot = false;
	arrS[0] = "";
	for(var i = 0; i < pgnSent.length; i++) {
		if (pgnSent.charAt(i) == ".") {
			addToArr = true;
			wasDot = true;
		}
		else if (wasDot && pgnSent.charAt(i) == " ") {
			arrIndex++;
			wasDot = false;
			addToArr = true;
			arrS[arrIndex] = "";
		}
		else if (pgnSent.charAt(i) == " ") {
			addToArr = false;
			arrIndex++;
			arrS[arrIndex] = "";
		}
		else if (addToArr) {
			arrS[arrIndex] += pgnSent.charAt(i);
		}
	}
	//console.table(arrS);	
	return arrS;
}