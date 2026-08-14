<?php
require_once __DIR__ . '/db.php';

$raw = file_get_contents('php://input');
$input = json_decode($raw, true) ?? $_POST;
$action = $_GET['action'] ?? ($input['action'] ?? '');

// 1. Admin Authentication Check
if ($action === 'login') {
    $password = $input['password'] ?? '';
    if ($password === 'admin123') {
        echo json_encode([
            'status' => 'success',
            'token' => md5('admin_authenticated_' . date('Y-m-d')),
            'message' => 'অ্যাডমিন ড্যাশবোর্ডে স্বাগতম!'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।'
        ]);
    }
    exit();
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = $input['token'] ?? str_replace('Bearer ', '', $authHeader);
$expectedToken = md5('admin_authenticated_' . date('Y-m-d'));

if ($token !== $expectedToken && $token !== 'local_admin_session' && $action !== 'login') {
    $pass = $input['password'] ?? $_POST['password'] ?? '';
    if ($pass !== 'admin123') {
        echo json_encode(['status' => 'unauthorized', 'message' => 'অননুমোদিত অ্যাক্সেস। পাসওয়ার্ড দিন।']);
        exit();
    }
}

// 2. Direct Device File Upload Handler (Images / Photos)
if ($action === 'upload_image') {
    if (!isset($_FILES['image_file']) || $_FILES['image_file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'কোনো ফাইল সিলেক্ট করা হয়নি অথবা ফাইল আপলোডে সমস্যা হয়েছে']);
        exit();
    }

    $file = $_FILES['image_file'];
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExts)) {
        echo json_encode(['status' => 'error', 'message' => 'শুধু JPG, PNG, WEBP বা GIF ফরম্যাটের ছবি আপলোড করা যাবে']);
        exit();
    }

    $uploadDir = __DIR__ . '/../uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filename = 'img_' . uniqid() . '_' . time() . '.' . $ext;
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $relativeUrl = 'uploads/' . $filename;
        echo json_encode([
            'status' => 'success',
            'message' => 'ছবি সফলভাবে আপলোড করা হয়েছে!',
            'url' => $relativeUrl
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'সার্ভারে ফাইল সংরক্ষণ করতে ব্যর্থ হয়েছে']);
    }
    exit();
}

// 3. Add New Listing
if ($action === 'add_listing') {
    $categoryId = (int)($input['category_id'] ?? 0);
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $whatsapp = trim($input['whatsapp'] ?? $phone);
    $location = trim($input['location'] ?? 'সিরাজদিখান');
    $address = trim($input['address'] ?? '');
    $description = trim($input['description'] ?? '');
    $badge = trim($input['badge'] ?? 'Verified');
    $image = trim($input['image'] ?? '');

    if ($categoryId <= 0 || empty($name) || empty($phone)) {
        echo json_encode(['status' => 'error', 'message' => 'ক্যাটাগরি, নাম এবং ফোন নম্বর বাধ্যতামূলক!']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO listings (category_id, name, phone, whatsapp, location, address, description, badge, image, rating) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0)");
    $stmt->execute([$categoryId, $name, $phone, $whatsapp, $location, $address, $description, $badge, $image]);

    echo json_encode([
        'status' => 'success',
        'message' => 'নতুন তথ্য সফলভাবে যুক্ত করা হয়েছে!',
        'id' => $pdo->lastInsertId()
    ]);
    exit();
}

// 4. Edit Existing Listing
if ($action === 'edit_listing') {
    $id = (int)($input['id'] ?? 0);
    $categoryId = (int)($input['category_id'] ?? 0);
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $whatsapp = trim($input['whatsapp'] ?? $phone);
    $location = trim($input['location'] ?? 'সিরাজদিখান');
    $address = trim($input['address'] ?? '');
    $description = trim($input['description'] ?? '');
    $badge = trim($input['badge'] ?? 'Verified');
    $image = trim($input['image'] ?? '');

    if ($id <= 0 || $categoryId <= 0 || empty($name) || empty($phone)) {
        echo json_encode(['status' => 'error', 'message' => 'সঠিক তথ্য সিলেক্ট করুন ও সকল বাধ্যতামূলক ঘর পূরণ করুন']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE listings SET category_id = ?, name = ?, phone = ?, whatsapp = ?, location = ?, address = ?, description = ?, badge = ?, image = ? WHERE id = ?");
    $stmt->execute([$categoryId, $name, $phone, $whatsapp, $location, $address, $description, $badge, $image, $id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'তথ্যটি সফলভাবে আপডেট করা হয়েছে!'
    ]);
    exit();
}

// 5. Delete Listing
if ($action === 'delete_listing') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'অবৈধ আইডি']);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM listings WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['status' => 'success', 'message' => 'এন্ট্রিটি সফলভাবে মুছে ফেলা হয়েছে']);
    exit();
}

// 6. Add New Slider Image
if ($action === 'add_slider') {
    $title = trim($input['title'] ?? '');
    $subtitle = trim($input['subtitle'] ?? '');
    $imageUrl = trim($input['image_url'] ?? '');
    $order = (int)($input['display_order'] ?? 1);

    if (empty($title) || empty($imageUrl)) {
        echo json_encode(['status' => 'error', 'message' => 'স্লাইডার শিরোনাম ও ইমেজের লিংক দেওয়া বাধ্যতামূলক!']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO sliders (title, subtitle, image_url, display_order) VALUES (?, ?, ?, ?)");
    $stmt->execute([$title, $subtitle, $imageUrl, $order]);

    echo json_encode(['status' => 'success', 'message' => 'নতুন স্লাইডার ছবি সফলভাবে যুক্ত করা হয়েছে!']);
    exit();
}

// 7. Delete Slider Image
if ($action === 'delete_slider') {
    $id = (int)($input['id'] ?? 0);
    if ($id > 0) {
        $stmt = $pdo->prepare("DELETE FROM sliders WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'স্লাইডার ছবিটি ডিলিট করা হয়েছে']);
        exit();
    }
}

// 8. Delete Blood Request
if ($action === 'delete_blood_request') {
    $id = (int)($input['id'] ?? 0);
    if ($id > 0) {
        $stmt = $pdo->prepare("DELETE FROM blood_requests WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'রক্তের আবেদনটি ডিলিট করা হয়েছে']);
        exit();
    }
}

// 9. Add New Blood Donor (Admin)
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

    if (empty($name) || empty($bloodGroup) || empty($phone)) {
        echo json_encode(['status' => 'error', 'message' => 'রক্তদাতার নাম, রক্তের গ্রুপ এবং মোবাইল নম্বর দেওয়া বাধ্যতামূলক!']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO blood_donors (name, blood_group, phone, division, district, upazila, union_name, village, image, is_ready) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    $stmt->execute([$name, $bloodGroup, $phone, $division, $district, $upazila, $unionName, $village, $image]);

    echo json_encode([
        'status' => 'success',
        'message' => 'নতুন রক্তদাতা সফলভাবে তালিকায় যুক্ত করা হয়েছে!',
        'id' => $pdo->lastInsertId()
    ]);
    exit();
}

// 10. Delete Blood Donor
if ($action === 'delete_donor') {
    $id = (int)($input['id'] ?? 0);
    if ($id > 0) {
        $stmt = $pdo->prepare("DELETE FROM blood_donors WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'রক্তদাতার তথ্য সফলভাবে মুছে ফেলা হয়েছে']);
        exit();
    }
}

// 11. Add Urgent Blood Request (Admin)
if ($action === 'add_blood_request') {
    $patientName = trim($input['patient_name'] ?? '');
    $bloodGroup = trim($input['blood_group'] ?? '');
    $hospital = trim($input['hospital'] ?? '');
    $bags = (int)($input['bags'] ?? 1);
    $phone = trim($input['phone'] ?? '');
    $neededDate = trim($input['needed_date'] ?? date('Y-m-d'));
    $location = trim($input['location'] ?? '');
    $details = trim($input['details'] ?? '');

    if (empty($patientName) || empty($bloodGroup) || empty($phone)) {
        echo json_encode(['status' => 'error', 'message' => 'রোগীর নাম, রক্তের গ্রুপ এবং মোবাইল নম্বর পূরণ করা বাধ্যতামূলক!']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO blood_requests (patient_name, blood_group, hospital, bags, phone, needed_date, location, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$patientName, $bloodGroup, $hospital, $bags, $phone, $neededDate, $location, $details]);

    echo json_encode(['status' => 'success', 'message' => 'জরুরী রক্তের আবেদন সফলভাবে যুক্ত করা হয়েছে!', 'id' => $pdo->lastInsertId()]);
    exit();
}

// 12. Delete Urgent Blood Request (Admin)
if ($action === 'delete_blood_request') {
    $id = (int)($input['id'] ?? 0);
    if ($id > 0) {
        $stmt = $pdo->prepare("DELETE FROM blood_requests WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'রক্তের আবেদন মুছে ফেলা হয়েছে']);
        exit();
    }
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
