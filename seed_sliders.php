<?php
require_once __DIR__ . '/api/db.php';

try {
    $pdo->exec("SET NAMES utf8mb4");
    $pdo->exec("TRUNCATE TABLE sliders");

    $stmt = $pdo->prepare("INSERT INTO sliders (title, subtitle, image_url, display_order) VALUES (?, ?, ?, ?)");
    
    $sliders = [
        ['স্বাগতম সিরাজদিখান উপজেলা ডিজিটাল সেবা পোর্টালে', 'উপজেলার সকল তথ্য ও সেবা এক ছাদের নিচে', 'images/slider1.jpg', 1],
        ['নৈসর্গিক সৌন্দর্য ও ঐতিহ্যের বিক্রমপুর সিরাজদিখান', 'আমাদের প্রিয় জন্মভূমি সিরাজদিখান উপজেলা', 'images/slider2.jpg', 2],
        ['আধুনিক উন্নত যোগাযোগ ও এক্সপ্রেসওয়ে', 'দ্রুততম সময়ে ঢাকা ও মাওয়া যাতায়াত ব্যবস্থা', 'images/slider3.jpg', 3],
        ['স্মার্ট বাংলাদেশ স্মার্ট সিরাজদিখান উদ্যোগ', '২৪/৭ নাগরিক সেবা, ব্লাড ব্যাংক ও মেস্ত্রী সার্ভিস', 'images/slider4.jpg', 4]
    ];

    foreach ($sliders as $s) {
        $stmt->execute($s);
    }

    echo "Sliders seeded cleanly in UTF-8!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
