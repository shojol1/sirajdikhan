<?php
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $_GET['action'] ?? ($input['action'] ?? '');

if ($action === 'add_donor') {
    $name = trim($input['name'] ?? '');
    $bloodGroup = trim($input['blood_group'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $division = trim($input['division'] ?? 'ঢাকা');
    $district = trim($input['district'] ?? 'মুন্সীগঞ্জ');
    $upazila = trim($input['upazila'] ?? 'সিরাজদিখান');
    $unionName = trim($input['union_name'] ?? 'সিরাজদিখান সদর');
    $village = trim($input['village'] ?? '');
    $image = trim($input['image'] ?? '');
    $lastDonated = !empty($input['last_donated_date']) ? $input['last_donated_date'] : null;

    if (empty($name) || empty($bloodGroup) || empty($phone)) {
        echo json_encode(['status' => 'error', 'message' => 'অনুগ্রহ করে সকল আবশ্যকীয় ঘর পূরণ করুন']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO blood_donors (name, blood_group, phone, division, district, upazila, union_name, village, image, last_donated_date, is_ready) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    $stmt->execute([$name, $bloodGroup, $phone, $division, $district, $upazila, $unionName, $village, $image, $lastDonated]);

    echo json_encode([
        'status' => 'success',
        'message' => 'রক্তদাতা হিসেবে সফলভাবে নাম নিবন্ধিত হয়েছে! ধন্যবাদ।'
    ]);
    exit();
}

if ($action === 'add_request') {
    $patientName = trim($input['patient_name'] ?? '');
    $bloodGroup = trim($input['blood_group'] ?? '');
    $units = (int)($input['units'] ?? 1);
    $hospital = trim($input['hospital'] ?? '');
    $location = trim($input['location'] ?? 'সিরাজদিখান');
    $phone = trim($input['phone'] ?? '');
    $neededDate = trim($input['needed_date'] ?? 'জরুরী');

    if (empty($patientName) || empty($bloodGroup) || empty($phone) || empty($hospital)) {
        echo json_encode(['status' => 'error', 'message' => 'অনুগ্রহ করে সকল ঘর সঠিক তথ্য দিয়ে পূরণ করুন']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO blood_requests (patient_name, blood_group, units, hospital, location, phone, needed_date, status) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
    $stmt->execute([$patientName, $bloodGroup, $units, $hospital, $location, $phone, $neededDate]);

    echo json_encode([
        'status' => 'success',
        'message' => 'জরুরী রক্তের আবেদন পোস্ট করা হয়েছে! স্থানীয় রক্তদাতারা শীঘ্রই যোগাযোগ করবেন।'
    ]);
    exit();
}

if ($action === 'fulfill_request') {
    $requestId = (int)($input['id'] ?? 0);
    if ($requestId > 0) {
        $stmt = $pdo->prepare("UPDATE blood_requests SET status = 'fulfilled' WHERE id = ?");
        $stmt->execute([$requestId]);
        echo json_encode(['status' => 'success', 'message' => 'রক্তের আবেদনটি সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে']);
        exit();
    }
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
