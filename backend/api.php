<?php
// Simple PHP backend to serve sqlite database content

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Ensure the db is writable
$dbPath = __DIR__ . '/database.sqlite';
if (!file_exists($dbPath)) {
    echo json_encode(["error" => "Database not found at $dbPath"]);
    exit(0);
}

$db = new SQLite3($dbPath);

$endpoint = $_GET['endpoint'] ?? '';

// We read POST data to get test_name
$test_name = $_POST['test_name'] ?? '';

if (!$test_name) {
    // If not in POST, maybe it's in the raw body (json)
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    if ($data && isset($data['test_name'])) {
        $test_name = $data['test_name'];
    }
}

// Let's treat all tests basically the same if the table has them
if ($endpoint === 'get_writing_test.php' || $endpoint === 'get_reading_test.php' || $endpoint === 'get_listening_test.php' || $endpoint === 'get_speaking_test.php') {
    if (!$test_name) {
        echo json_encode(["error" => "No test_name provided"]);
        exit(0);
    }

    $stmt = $db->prepare('SELECT id, test_name, test_content FROM celpip_test_writing_tbl WHERE test_name = :test_name');
    $stmt->bindValue(':test_name', $test_name, SQLITE3_TEXT);
    $result = $stmt->execute();

    $data = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $data[] = $row;
    }

    echo json_encode($data);
} else {
    echo json_encode(["error" => "Unknown endpoint"]);
}
