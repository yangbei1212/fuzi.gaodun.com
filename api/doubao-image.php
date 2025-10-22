<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

$apiKey = 'bd747896-e89b-46f4-a5ab-0a232d086845';
$endpointId = 'ep-20251015102102-x2n2t';
$apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

$data = [
    'model' => $endpointId,
    'prompt' => $input['prompt'] ?? '',
    'n' => $input['n'] ?? 1,
    'size' => $input['size'] ?? '2k',
    'response_format' => 'url'
];

// 如果有图片参数，添加到请求中
if (isset($input['image']) && !empty($input['image'])) {
    $data['image'] = $input['image'];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'API request failed']);
    exit();
}

http_response_code($httpCode);
echo $response;
?>
