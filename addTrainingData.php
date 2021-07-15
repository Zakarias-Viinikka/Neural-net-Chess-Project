<?php
header('Content-Type: application/json');

$aResult = array();

if (!isset($_POST['fen'])) {
    $aResult['error'] = 'No fen!';
}

if (!isset($_POST['evaluation'])) {
    $aResult['error'] = 'No evaluation!';
}

if (!isset($aResult['error'])) {

    if (file_exists('stockfishTrainingData.json')) {
        $current_data = file_get_contents('stockfishTrainingData.json');
        $array_data = json_decode($current_data, true);
        $extra = array(
            'fen'               =>     $_POST['fen'],
            'evaluation'          =>     $_POST["evaluation"],
        );
        $array_data[] = $extra;
        $final_data = json_encode($array_data);
        if (file_put_contents('stockfishTrainingData.json', $final_data)) {
            $aResult = "<label class='text-success'>File Appended Success fully</p>";
        }
    } else {
        $error = 'JSON File not exits';
    }
}

echo json_encode($aResult);
