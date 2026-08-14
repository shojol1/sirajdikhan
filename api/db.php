<?php
// ===================================================
// DATABASE CONNECTION API - AMAR SIRAJDIKHAN
// ===================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Live Production Credentials
$live_host = 'bdix.mywhiteserver.com';
$live_user = 'shojolwo_user';
$live_pass = 'Shojol123456';
$live_name = 'shojolwo_sirajdikhan';

// Local Development Fallback Credentials
$local_host = '127.0.0.1';
$local_user = 'root';
$local_pass = '';
$local_name = 'amar_sirajdikhan';

$pdo = null;

// 1. Try Live host (bdix.mywhiteserver.com)
try {
    $pdo = new PDO("mysql:host=$live_host;dbname=$live_name;charset=utf8mb4", $live_user, $live_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
} catch (PDOException $e1) {
    // 2. Try cPanel internal localhost host with Live Credentials
    try {
        $pdo = new PDO("mysql:host=localhost;dbname=$live_name;charset=utf8mb4", $live_user, $live_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
    } catch (PDOException $e2) {
        // 3. Fallback to Local Development
        try {
            $pdo = new PDO("mysql:host=$local_host;dbname=$local_name;charset=utf8mb4", $local_user, $local_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
        } catch (PDOException $e3) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Database connection failed: ' . $e3->getMessage()
            ]);
            exit();
        }
    }
}
