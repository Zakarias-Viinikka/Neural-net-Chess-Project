function centiPawnsToWinningProbability(centipawns) {
    return 1 / (1 + (Math.pow(10, (-(centipawns / 100) / 4))));
    /*https://www.chessprogramming.org/Pawn_Advantage,_Win_Percentage,_and_Elo*/
}