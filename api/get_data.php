<?php
require_once __DIR__ . '/db.php';

try {
    // 1. Fetch Categories
    $catStmt = $pdo->query("SELECT id, slug, name_bn, name_en, icon, section, display_order FROM categories ORDER BY display_order ASC, id ASC");
    $categories = $catStmt->fetchAll();

    // Get item counts per category
    $countStmt = $pdo->query("SELECT category_id, COUNT(*) as total FROM listings GROUP BY category_id");
    $countsMap = [];
    foreach ($countStmt->fetchAll() as $c) {
        $countsMap[$c['category_id']] = (int)$c['total'];
    }

    $donorCountStmt = $pdo->query("SELECT COUNT(*) FROM blood_donors");
    $totalDonorsCount = (int)$donorCountStmt->fetchColumn();

    foreach ($categories as &$cat) {
        if ($cat['slug'] === 'blood-donor') {
            $cat['count'] = $totalDonorsCount;
        } else {
            $cat['count'] = isset($countsMap[$cat['id']]) ? $countsMap[$cat['id']] : 0;
        }
    }
    unset($cat);

    // 2. Fetch Listings
    $listStmt = $pdo->query("SELECT l.*, c.slug as category_slug, c.name_bn as category_name_bn 
                             FROM listings l 
                             JOIN categories c ON l.category_id = c.id 
                             ORDER BY l.id DESC");
    $listings = $listStmt->fetchAll();

    // 3. Fetch Sliders
    $sliderStmt = $pdo->query("SELECT * FROM sliders ORDER BY display_order ASC, id DESC");
    $sliders = $sliderStmt->fetchAll();

    // 4. Fetch Blood Donors
    $donorStmt = $pdo->query("SELECT * FROM blood_donors ORDER BY is_ready DESC, id DESC");
    $donors = $donorStmt->fetchAll();

    // 5. Fetch Active Blood Requests
    $requestStmt = $pdo->query("SELECT * FROM blood_requests WHERE status = 'active' ORDER BY id DESC");
    $bloodRequests = $requestStmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'categories' => $categories,
        'listings' => $listings,
        'sliders' => $sliders,
        'donors' => $donors,
        'blood_requests' => $bloodRequests
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
