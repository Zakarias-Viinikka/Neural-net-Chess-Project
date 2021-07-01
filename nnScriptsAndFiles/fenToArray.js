
function fenToArrayFunc(fenSent) {
	let originalfen = fenSent;
	let fen = "";
	for (var i = 0; i < originalfen.length; i++) {
		if (originalfen.charAt(i) != "/") {
			fen += originalfen.charAt(i);
		}
	}
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
	let hasBeenSpace = false;
	let fenToNN = [];
	for (let i = 0; i < fen.length; i++) {
		if (fen.charAt(i) == " ") {
			hasBeenSpace = true;
		}
		if (hasBeenSpace) {
			fenToNN.push(fen.charAt(i));
		}
		else if (Number.isInteger(parseInt( fen.charAt(i)))) {
			//console.log("found a number");
			for (var v = 0; v < parseInt(fen.charAt(i)); v++) {
				fenToNN.push(0);
			}
		}
		else if (fen.charAt(i) == "p") {
			fenToNN.push(1/12);
		}
		else if (fen.charAt(i) == "n") {
			fenToNN.push(2/12);
		}
		else if (fen.charAt(i) == "r") {
			fenToNN.push(3/12);
		}
		else if (fen.charAt(i) == "b") {
			fenToNN.push(4/12);
		}
		else if (fen.charAt(i) == "k") {
			fenToNN.push(5/12);
		}
		else if (fen.charAt(i) == "q") {
			fenToNN.push(6/12);
		}
		else if (fen.charAt(i) == "P") {
			fenToNN.push(7/12);
		}
		else if (fen.charAt(i) == "N") {
			fenToNN.push(8/12);
		}
		else if (fen.charAt(i) == "R") {
			fenToNN.push(9/12);
		}
		else if (fen.charAt(i) == "B") {
			fenToNN.push(10/12);
		}
		else if (fen.charAt(i) == "K") {
			fenToNN.push(11/12);
		}
		else if (fen.charAt(i) == "Q") {
			fenToNN.push(12/12);
		}
	}
	return fenToNN;
}
/*else if (fen.charAt(i) == "p") {
			fenToNN.push(1/12);
		}
		else if (fen.charAt(i) == "n") {
			fenToNN.push(2/12);
		}
		else if (fen.charAt(i) == "r") {
			fenToNN.push(3/12);
		}
		else if (fen.charAt(i) == "b") {
			fenToNN.push(4/12);
		}
		else if (fen.charAt(i) == "k") {
			fenToNN.push(5/12);
		}
		else if (fen.charAt(i) == "q") {
			fenToNN.push(6/12);
		}
		else if (fen.charAt(i) == "P") {
			fenToNN.push(7/12);
		}
		else if (fen.charAt(i) == "N") {
			fenToNN.push(8/12);
		}
		else if (fen.charAt(i) == "R") {
			fenToNN.push(9/12);
		}
		else if (fen.charAt(i) == "B") {
			fenToNN.push(10/12);
		}
		else if (fen.charAt(i) == "K") {
			fenToNN.push(11/12);
		}
		else if (fen.charAt(i) == "Q") {
			fenToNN.push(12/12);
		}*/



		/*

		else if (fen.charAt(i) == "p") {
			fenToNN.push(1);
		}
		else if (fen.charAt(i) == "n") {
			fenToNN.push(2);
		}
		else if (fen.charAt(i) == "r") {
			fenToNN.push(3);
		}
		else if (fen.charAt(i) == "b") {
			fenToNN.push(4);
		}
		else if (fen.charAt(i) == "k") {
			fenToNN.push(5);
		}
		else if (fen.charAt(i) == "q") {
			fenToNN.push(6);
		}
		else if (fen.charAt(i) == "P") {
			fenToNN.push(7);
		}
		else if (fen.charAt(i) == "N") {
			fenToNN.push(8);
		}
		else if (fen.charAt(i) == "R") {
			fenToNN.push(9);
		}
		else if (fen.charAt(i) == "B") {
			fenToNN.push(10);
		}
		else if (fen.charAt(i) == "K") {
			fenToNN.push(11);
		}
		else if (fen.charAt(i) == "Q") {
			fenToNN.push(12);
		}
		*/