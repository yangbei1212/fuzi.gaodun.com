<?php
// 先设置 CORS 头
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

$apiUrl = 'https://openspeech.bytedance.com/api/v1/tts';
$token = 'ghoh5hrIJgt5u7Ne5jWVNjJXaBkrnm0K';

// 记录请求日志
error_log('TTS Request: ' . json_encode($input));

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true); // 获取响应头
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json; charset=utf-8',
    'Authorization: Bearer; ' . $token
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

if ($response === false) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'TTS API request failed: ' . curl_error($ch)]);
    error_log('TTS cURL Error: ' . curl_error($ch));
    curl_close($ch);
    exit();
}

// 分离响应头和响应体
$header = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

curl_close($ch);

// 从响应头中提取 Content-Type
preg_match('/Content-Type: (.+)/i', $header, $matches);
$contentType = isset($matches[1]) ? trim($matches[1]) : 'audio/mpeg';

error_log('TTS Response Code: ' . $httpCode);
error_log('TTS Response Content-Type: ' . $contentType);
error_log('TTS Response Body Size: ' . strlen($body));

// 设置正确的 Content-Type
header('Content-Type: ' . $contentType);
http_response_code($httpCode);
echo $body;
?>

