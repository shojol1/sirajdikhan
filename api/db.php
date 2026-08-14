<?php
// ===================================================
// LIVE PRODUCTION DATABASE CONNECTION - AMAR SIRAJDIKHAN
// ===================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Live Production Database Credentials
$db_host = 'localhost';
$db_user = 'shojolwo_user';
$db_pass = 'Shojol123456';
$db_name = 'shojolwo_sirajdikhan';

$pdo = null;

try {
    // 1. Primary cPanel internal connection
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
} catch (PDOException $e) {
    // 2. Secondary external host connection
    try {
        $pdo = new PDO("mysql:host=bdix.mywhiteserver.com;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]);
    } catch (PDOException $e2) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Live Database Connection Failed: ' . $e2->getMessage()
        ]);
        exit();
    }
}
