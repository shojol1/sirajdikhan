-- ===================================================
-- DATABASE SCHEMA FOR AMAR SIRAJDIKHAN UPAZILA PORTAL
-- ===================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `listings`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `blood_donors`;
DROP TABLE IF EXISTS `blood_requests`;
DROP TABLE IF EXISTS `admin_users`;

-- 1. CATEGORIES TABLE
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `name_bn` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `section` VARCHAR(50) NOT NULL DEFAULT 'general',
  `display_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. LISTINGS TABLE
CREATE TABLE `listings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `whatsapp` VARCHAR(30) DEFAULT NULL,
  `location` VARCHAR(150) DEFAULT 'সিরাজদিখান',
  `address` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `badge` VARCHAR(50) DEFAULT NULL,
  `rating` DECIMAL(2,1) DEFAULT 5.0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BLOOD DONORS TABLE
CREATE TABLE `blood_donors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `blood_group` VARCHAR(10) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `division` VARCHAR(100) DEFAULT 'ঢাকা',
  `district` VARCHAR(100) DEFAULT 'মুন্সীগঞ্জ',
  `upazila` VARCHAR(100) DEFAULT 'সিরাজদিখান',
  `union_name` VARCHAR(100) NOT NULL,
  `village` VARCHAR(150) DEFAULT NULL,
  `last_donated_date` DATE DEFAULT NULL,
  `is_ready` TINYINT(1) DEFAULT 1,
  `image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BLOOD REQUESTS TABLE
CREATE TABLE `blood_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_name` VARCHAR(150) NOT NULL,
  `blood_group` VARCHAR(10) NOT NULL,
  `units` INT DEFAULT 1,
  `hospital` VARCHAR(200) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `needed_date` VARCHAR(100) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ADMIN USERS TABLE
CREATE TABLE `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED ALL 52 CATEGORIES
INSERT INTO `categories` (`id`, `slug`, `name_bn`, `name_en`, `icon`, `section`, `display_order`) VALUES
(1, 'hospital', 'হাসপাতাল', 'Hospital', 'fa-hospital-user', 'health', 1),
(2, 'clinic', 'ক্লিনিক', 'Clinic', 'fa-clinic-medical', 'health', 2),
(3, 'diagnostic', 'ডায়াগনস্টিক', 'Diagnostic Center', 'fa-microscope', 'health', 3),
(4, 'specialist-doctor', 'বিশেষজ্ঞ ডাক্তার', 'Specialist Doctor', 'fa-user-md', 'health', 4),
(5, 'homeo-doctor', 'হোমিও ডাক্তার', 'Homeo Doctor', 'fa-mortar-pestle', 'health', 5),
(6, 'vet-doctor', 'পশু ডাক্তার', 'Veterinary Doctor', 'fa-paw', 'health', 6),
(7, 'upazila-doctor', 'উপজেলা ডাক্তার', 'Upazila Doctor', 'fa-stethoscope', 'health', 7),
(8, 'ambulance', 'অ্যাম্বুলেন্স সেবা', 'Ambulance Service', 'fa-ambulance', 'emergency', 8),
(9, 'pharmacy', 'ফার্মেসী শপ', 'Pharmacy Shop', 'fa-pills', 'health', 9),
(10, 'blood-donor', 'ব্লাড ডোনার', 'Blood Donor', 'fa-droplet', 'health', 10),
(11, 'blood-org', 'ব্লাড সংগঠন', 'Blood Organization', 'fa-hand-holding-medical', 'health', 11),
(12, 'social-group', 'সোশ্যাল গ্রুপ', 'Social Group', 'fa-users-line', 'civic', 12),
(13, 'upazila-info', 'উপজেলা তথ্য', 'Upazila Information', 'fa-landmark', 'emergency', 13),
(14, 'post-office', 'পোষ্ট অফিস', 'Post Office', 'fa-mail-bulk', 'civic', 14),
(15, 'education', 'শিক্ষা প্রতিষ্ঠান', 'Educational Institution', 'fa-graduation-cap', 'education', 15),
(16, 'sim-code', 'সকল সিমের কোড', 'SIM USSD Codes', 'fa-sim-card', 'civic', 16),
(17, 'courier', 'কুরিয়ার সার্ভিস', 'Courier Service', 'fa-truck-fast', 'civic', 17),
(18, 'bank-ngo', 'আর্থিক প্রতিষ্ঠান', 'Financial Institutions', 'fa-building-columns', 'civic', 18),
(19, 'rent-a-car', 'রেন্ট-এ-কার', 'Rent a Car', 'fa-car-side', 'transport', 19),
(20, 'journalist', 'সাংবাদিক', 'Journalists', 'fa-newspaper', 'civic', 20),
(21, 'lawyer', 'আইনজীবী', 'Lawyers & Advocates', 'fa-scale-balanced', 'civic', 21),
(22, 'shop-showroom', 'দোকান-শোরুম', 'Shops & Showrooms', 'fa-store', 'civic', 22),
(23, 'training-center', 'ট্রেনিং সেন্টার', 'Training Center', 'fa-chalkboard-user', 'education', 23),
(24, 'lp-gas', 'এলপি গ্যাস', 'LP Gas Dealer', 'fa-fire-flame-simple', 'civic', 24),
(25, 'kazi-office', 'কাজী অফিস', 'Kazi Office', 'fa-book-bookmark', 'civic', 25),
(26, 'bike-ride', 'বাইক রাইড শেয়ার', 'Bike Ride Share', 'fa-motorcycle', 'transport', 26),
(27, 'haat-bazar', 'হাট-বাজার', 'Markets & Haat', 'fa-basket-shopping', 'civic', 27),
(28, 'dish-service', 'ডিস সার্ভিস', 'Dish TV Service', 'fa-tv', 'civic', 28),
(29, 'internet-service', 'ইন্টারনেট সার্ভিস', 'ISP Internet', 'fa-wifi', 'civic', 29),
(30, 'beauty-parlor', 'বিউটি পার্লার', 'Beauty Parlor', 'fa-spa', 'civic', 30),
(31, 'restaurant', 'রেস্টুরেন্ট', 'Restaurant', 'fa-utensils', 'civic', 31),
(32, 'food-order', 'খাবার অর্ডার', 'Food Order', 'fa-bowl-food', 'civic', 32),
(33, 'marriage-matchmaker', 'বিয়ের ঘটক', 'Marriage Matchmaker', 'fa-heart-circle-bolt', 'civic', 33),
(34, 'coaching-center', 'কোচিং সেন্টার', 'Coaching Center', 'fa-school', 'education', 34),
(35, 'tuition-service', 'টিউশন সার্ভিস', 'Tuition Service', 'fa-user-graduate', 'education', 35),
(36, 'online-service', 'অনলাইন সার্ভিস', 'Online Computer Center', 'fa-desktop', 'civic', 36),
(37, 'house-shift', 'বাসা বদল সার্ভিস', 'Home Shifting Service', 'fa-truck-ramp-box', 'civic', 37),
(38, 'library', 'বই লাইব্রেরি', 'Book Library', 'fa-book-open', 'education', 38),
(39, 'nursery', 'নার্সারী দোকান', 'Plant Nursery', 'fa-seedling', 'civic', 39),
(40, 'nagorik-seba', 'নাগরিক সেবাসমূহ', 'Citizen Services', 'fa-award', 'civic', 40),
(41, 'deed-writer', 'দলিল লেখক', 'Deed Writer', 'fa-file-signature', 'civic', 41),
(42, 'volunteer-org', 'স্বেচ্ছাসেবী সংগঠন', 'Volunteer Orgs', 'fa-hands-holding-child', 'civic', 42),
(43, 'amin-surveyor', 'আমিন (সার্ভেয়ার)', 'Land Surveyor (Amin)', 'fa-compass-drafting', 'civic', 43),
(44, 'electrician', 'ইলেকট্রিক মেস্ত্রী', 'Electrician', 'fa-bolt', 'craftsmen', 44),
(45, 'sanitary', 'স্যানিটারি মেস্ত্রী', 'Sanitary & Plumber', 'fa-faucet-drip', 'craftsmen', 45),
(46, 'tiles-mechanic', 'টাইলস মেস্ত্রী', 'Tiles Specialist', 'fa-cubes', 'craftsmen', 46),
(47, 'tailor', 'দরজি কারিগর', 'Tailor Craftsman', 'fa-scissors', 'craftsmen', 47),
(48, 'carpenter', 'কাঠের মেস্ত্রী', 'Carpenter', 'fa-hammer', 'craftsmen', 48),
(49, 'auto-mechanic', 'অটোরিক্সা মেস্ত্রী', 'Auto Mechanic', 'fa-screwdriver-wrench', 'craftsmen', 49),
(50, 'painter', 'পেইন্ট মেস্ত্রী', 'Painter', 'fa-paint-roller', 'craftsmen', 50),
(51, 'tire-mechanic', 'টায়ার মেস্ত্রী', 'Tire Repair Mechanic', 'fa-circle-dot', 'craftsmen', 51),
(52, 'motor-mechanic', 'মোটর মেস্ত্রী', 'Motor Mechanic', 'fa-gears', 'craftsmen', 52);

SET FOREIGN_KEY_CHECKS = 1;
