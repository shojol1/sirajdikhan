<?php
require_once __DIR__ . '/api/db.php';

try {
    $pdo->exec("SET NAMES utf8mb4");

    // Add Journalist listing with sample photo
    $pdo->exec("INSERT INTO listings (category_id, name, phone, whatsapp, location, address, description, badge, image, rating) 
                VALUES ((SELECT id FROM categories WHERE slug='journalist'), 'মোঃ জহিরুল ইসলাম (দৈনিক সমকাল সিরাজদিখান প্রতিনিধি)', '01711223344', '01711223344', 'সিরাজদিখান প্রেস ক্লাব', 'প্রেস ক্লাব ভবন, সিরাজদিখান', 'উপজেলা জ্যেষ্ঠ সাংবাদিক ও সংবাদকর্মী।', 'Verified', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 5.0)");

    // Update Hospital listing with sample logo photo
    $pdo->exec("UPDATE listings SET image = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150' WHERE name LIKE '%উপজেলা স্বাস্থ্য কমপ্লেক্স%'");
    
    // Update Electrician listing with sample photo
    $pdo->exec("UPDATE listings SET image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' WHERE name LIKE '%কামাল হোসেন%'");

    echo "Sample member photos added cleanly!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
