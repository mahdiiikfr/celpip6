<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    die();
}

$db = new SQLite3(__DIR__ . '/database.sqlite');

$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$postData = $_POST;
if (empty($postData)) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $postData = json_decode($raw, true) ?? [];
        if (empty($postData)) {
            parse_str($raw, $postData);
        }
    }
}

if (strpos($requestUri, 'get_writing_test.php') !== false) {
    $test_name = $postData['test_name'] ?? '';

    if (empty($test_name)) {
        echo json_encode(["error" => "test_name is required"]);
        die();
    }

    $stmt = $db->prepare('SELECT test_content FROM celpip_test_writing_tbl WHERE test_name = :test_name LIMIT 1');
    $stmt->bindValue(':test_name', $test_name, SQLITE3_TEXT);

    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);

    if ($row) {
        echo json_encode([
            ["test_content" => $row['test_content']]
        ]);
    } else {
        echo json_encode([]);
    }
    die();
}

if (strpos($requestUri, 'health') !== false) {
    echo json_encode(["status" => "ok"]);
    die();
}

http_response_code(404);
echo json_encode(["error" => "Route not found", "uri" => $requestUri]);
