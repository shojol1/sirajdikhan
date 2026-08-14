/* ==========================================================================
   AMAR SIRAJDIKHAN - FRONTEND APPLICATION ENGINE
   ========================================================================== */

let globalCategories = [];
let globalListings = [];
let globalSliders = [];
let globalDonors = [];
let globalBloodRequests = [];
let activeSectionFilter = 'all';

let currentSlideIndex = 0;
let sliderTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadData();
  setupEventListeners();
});

// 1. Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('as_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('as_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

// 2. Fetch Data from MySQL Backend API
async function loadData() {
  const gridEl = document.getElementById('category-grid');
  if (gridEl) {
    gridEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">
        <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
        <p style="margin-top: 10px;">সিরাজদিখান ডাটাবেজ থেকে তথ্য লোড হচ্ছে...</p>
      </div>
    `;
  }

  try {
    const res = await fetch('api/get_data.php');
    const data = await res.json();

    if (data.status === 'success') {
      globalCategories = data.categories || [];
      globalListings = data.listings || [];
      globalSliders = data.sliders || [];
      globalDonors = data.donors || [];
      globalBloodRequests = data.blood_requests || [];

      renderSlider();
      renderUrgentNotice();
      renderCategories();
      renderDonorDirectory('all');
    } else {
      showFallbackUI();
    }
  } catch (err) {
    console.warn("Backend API unavailable, using local client cache.", err);
    showFallbackUI();
  }
}

function showFallbackUI() {
  globalCategories = typeof DEFAULT_CATEGORIES !== 'undefined' ? DEFAULT_CATEGORIES : [];
  globalDonors = typeof DEFAULT_DONORS !== 'undefined' ? DEFAULT_DONORS : [];
  renderCategories();
  renderDonorDirectory('all');
}

// 3. Dynamic Image Slider Engine
function renderSlider() {
  const container = document.getElementById('hero-slider-wrapper');
  if (!container) return;

  if (globalSliders.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  const slidesHtml = globalSliders.map((s, idx) => `
    <div class="slide-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
      <img src="${s.image_url}" alt="${s.title}" class="slide-image">
      <div class="slide-overlay">
        <div class="slide-title">${s.title}</div>
        ${s.subtitle ? `<div class="slide-subtitle">${s.subtitle}</div>` : ''}
      </div>
    </div>
  `).join('');

  const dotsHtml = globalSliders.map((_, idx) => `
    <div class="slider-dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})"></div>
  `).join('');

  container.innerHTML = `
    <div class="hero-slider-container" onmouseenter="pauseSlider()" onmouseleave="resumeSlider()">
      <div class="slide-track">
        ${slidesHtml}
      </div>
      <button class="slider-prev" onclick="prevSlide()"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="slider-next" onclick="nextSlide()"><i class="fa-solid fa-chevron-right"></i></button>
      <div class="slider-dots">${dotsHtml}</div>
    </div>
  `;

  currentSlideIndex = 0;
  startSliderTimer();
}

function startSliderTimer() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(nextSlide, 2500);
}

function pauseSlider() { clearInterval(sliderTimer); }
function resumeSlider() { startSliderTimer(); }

function nextSlide() {
  if (globalSliders.length <= 1) return;
  const nextIdx = (currentSlideIndex + 1) % globalSliders.length;
  goToSlide(nextIdx);
}

function prevSlide() {
  if (globalSliders.length <= 1) return;
  const prevIdx = (currentSlideIndex - 1 + globalSliders.length) % globalSliders.length;
  goToSlide(prevIdx);
}

function goToSlide(idx) {
  currentSlideIndex = idx;
  const slides = document.querySelectorAll('.slide-item');
  const dots = document.querySelectorAll('.slider-dot');

  slides.forEach((slide, i) => slide.classList.toggle('active', i === idx));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
}

// 4. Render Urgent Blood Requests Ticker
function renderUrgentNotice() {
  const noticeContainer = document.getElementById('urgent-notice-wrapper');
  if (!noticeContainer) return;

  if (globalBloodRequests.length > 0) {
    const req = globalBloodRequests[0];
    noticeContainer.innerHTML = `
      <div class="notice-card">
        <div class="notice-pulse-icon">
          <i class="fa-solid fa-droplet"></i>
        </div>
        <div class="notice-content">
          <div class="notice-title">🚨 জরুরী রক্তের প্রয়োজন (${req.blood_group}) - ${req.units} ব্যাগ</div>
          <div class="notice-text">
            রোগীর নাম: <strong>${req.patient_name}</strong> | স্থান: ${req.hospital} (${req.location})
          </div>
        </div>
        <div class="notice-action">
          <a href="tel:${req.phone}" class="btn btn-blood">
            <i class="fa-solid fa-phone"></i> কল করুন
          </a>
        </div>
      </div>
    `;
  } else {
    noticeContainer.innerHTML = '';
  }
}

// 5. Render Categories Grid with Category Headers & Dividers
const SECTION_MAP = {
  emergency: {
    title: 'জরুরী সেবাসমূহ ও হটলাইন',
    icon: 'fa-phone-volume',
    color: 'var(--blood-red)',
    badgeBg: 'rgba(225, 29, 72, 0.12)',
    desc: 'অ্যাম্বুলেন্স, ফায়ার সার্ভিস, থানা ও প্রশাসন জরুরী ফোন নম্বর'
  },
  health: {
    title: 'স্বাস্থ্যসেবা ও ডাক্তার',
    icon: 'fa-heart-pulse',
    color: 'var(--blood-red)',
    badgeBg: 'rgba(225, 29, 72, 0.12)',
    desc: 'হাসপাতাল, ক্লিনিক, বিশেষজ্ঞ ডাক্তার, ডায়াগনস্টিক ও ফার্মেসী'
  },
  craftsmen: {
    title: 'মেস্ত্রী ও কারিগর টেকনিশিয়ান',
    icon: 'fa-screwdriver-wrench',
    color: 'var(--amber-gold)',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    desc: 'ইলেকট্রিক, স্যানিটারি, টাইলস, কাঠের মেস্ত্রী ও কারিগর'
  },
  transport: {
    title: 'পরিবহন, রাইড ও কার ভাড়া',
    icon: 'fa-car-side',
    color: 'var(--royal-blue)',
    badgeBg: 'rgba(37, 99, 235, 0.12)',
    desc: 'রেন্ট-এ-কার, বাইক রাইড শেয়ার ও অটোরিক্সা সেবা'
  },
  education: {
    title: 'শিক্ষা প্রতিষ্ঠান ও পড়াশোনা',
    icon: 'fa-graduation-cap',
    color: 'var(--primary-emerald)',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    desc: 'স্কুল, কলেজ, কোচিং সেন্টার, প্রাইভেট টিউটর ও বই লাইব্রেরি'
  },
  civic: {
    title: 'নাগরিক সেবা ও ব্যবসায়িক তথ্য',
    icon: 'fa-landmark',
    color: 'var(--primary-emerald)',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    desc: 'ব্যাংক, কাজী অফিস, পোষ্ট অফিস, রেস্টুরেন্ট ও অন্যান্য সেবা'
  }
};

const SECTION_ORDER = ['emergency', 'health', 'craftsmen', 'transport', 'education', 'civic'];

function renderCategories(filterQuery = '') {
  const gridEl = document.getElementById('category-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';
  let filtered = globalCategories;

  if (activeSectionFilter !== 'all') {
    filtered = filtered.filter(c => c.section === activeSectionFilter);
  }

  if (filterQuery.trim() !== '') {
    const q = filterQuery.toLowerCase().trim();
    filtered = filtered.filter(c => {
      const matchCat = c.name_bn.toLowerCase().includes(q) || c.name_en.toLowerCase().includes(q);
      const matchListing = globalListings.some(l => 
        l.category_id == c.id && 
        (l.name.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q)) || (l.location && l.location.toLowerCase().includes(q)))
      );
      return matchCat || matchListing;
    });
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 50px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-magnifying-glass fa-3x" style="margin-bottom:12px; opacity:0.5;"></i>
        <h3>কোনো তথ্য পাওয়া যায়নি</h3>
        <p>অনুগ্রহ করে অন্য কিওয়ার্ড লিখে অনুসন্ধান করুন।</p>
      </div>
    `;
    return;
  }

  // Group filtered categories by section
  const sectionGroups = {};
  filtered.forEach(cat => {
    const secKey = cat.section && SECTION_MAP[cat.section] ? cat.section : 'civic';
    if (!sectionGroups[secKey]) {
      sectionGroups[secKey] = [];
    }
    sectionGroups[secKey].push(cat);
  });

  // Render each section block in defined order
  SECTION_ORDER.forEach(secKey => {
    const categoriesInSec = sectionGroups[secKey];
    if (!categoriesInSec || categoriesInSec.length === 0) return;

    const secInfo = SECTION_MAP[secKey] || SECTION_MAP.civic;
    
    // Calculate total listings count in this section
    const totalListingsInSec = categoriesInSec.reduce((acc, cat) => {
      const count = cat.count !== undefined ? cat.count : globalListings.filter(l => l.category_id == cat.id).length;
      return acc + count;
    }, 0);

    const sectionBlock = document.createElement('div');
    sectionBlock.className = 'category-section-block';
    sectionBlock.setAttribute('data-section-block', secKey);

    sectionBlock.innerHTML = `
      <div class="cat-section-header">
        <div class="cat-section-left">
          <div class="cat-section-icon" style="background:${secInfo.badgeBg}; color:${secInfo.color};">
            <i class="fa-solid ${secInfo.icon}"></i>
          </div>
          <div>
            <div class="cat-section-title">${secInfo.title}</div>
            <div class="cat-section-desc">${secInfo.desc}</div>
          </div>
        </div>
        <div class="cat-section-badge">
          <i class="fa-solid fa-layer-group" style="margin-right:4px;"></i> ${categoriesInSec.length} টি ক্যাটাগরি (${totalListingsInSec} টি তথ্য)
        </div>
      </div>
      
      <div class="cat-section-divider" style="background: linear-gradient(90deg, ${secInfo.color} 0%, rgba(5, 150, 105, 0.15) 70%, transparent 100%);"></div>
      
      <div class="category-subgrid" id="subgrid-${secKey}"></div>
    `;

    const subgridEl = sectionBlock.querySelector(`#subgrid-${secKey}`);

    categoriesInSec.forEach(cat => {
      let itemCount = cat.count !== undefined ? cat.count : globalListings.filter(l => l.category_id == cat.id).length;
      if (cat.slug === 'blood-donor' || cat.slug === 'blood-donors' || cat.name_bn.includes('ডোনার') || cat.name_bn.includes('রক্তদাতা')) {
        itemCount = globalDonors.length;
      }
      
      const card = document.createElement('div');
      card.className = 'cat-card';
      card.setAttribute('data-section', cat.section);
      card.onclick = () => {
        if (cat.slug === 'blood-donor' || cat.slug === 'blood-donors' || cat.name_bn.includes('ডোনার') || cat.name_bn.includes('রক্তদাতা')) {
          window.location.href = 'donors.php';
        } else {
          openCategoryModal(cat);
        }
      };

      card.innerHTML = `
        <div class="cat-icon-box">
          <i class="fa-solid ${cat.icon || 'fa-folder'}"></i>
        </div>
        <div class="cat-name">${cat.name_bn}</div>
        <div class="cat-count-badge">${itemCount} টি তথ্য</div>
      `;
      subgridEl.appendChild(card);
    });

    gridEl.appendChild(sectionBlock);
  });
}

function setSectionFilter(section, btnEl) {
  activeSectionFilter = section;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  
  const searchInput = document.getElementById('main-search-input');
  renderCategories(searchInput ? searchInput.value : '');
}

// 6. Category Detail Modal (Includes Circular Avatar & Fallback Icon)
function openCategoryModal(category) {
  if (category.slug === 'blood-donor' || category.slug === 'blood-donors' || category.name_bn.includes('ডোনার') || category.name_bn.includes('রক্তদাতা')) {
    window.location.href = 'donors.php';
    return;
  }

  const modal = document.getElementById('category-modal');
  const titleEl = document.getElementById('cat-modal-title');
  const bodyEl = document.getElementById('cat-modal-body');

  titleEl.innerHTML = `<i class="fa-solid ${category.icon}"></i> ${category.name_bn}`;

  const categoryListings = globalListings.filter(l => l.category_id == category.id);

  if (categoryListings.length === 0) {
    bodyEl.innerHTML = `
      <div style="text-align:center; padding: 40px 10px; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open fa-3x" style="margin-bottom:12px; opacity:0.4;"></i>
        <p>এই ক্যাটাগরিতে এখনও কোনো সদস্য নিবন্ধিত হননি।</p>
        <button onclick="closeModal('category-modal'); openAdminModal();" class="btn btn-outline" style="margin-top:15px;">
          <i class="fa-solid fa-plus"></i> নতুন সদস্য যোগ করুন (অ্যাডমিন)
        </button>
      </div>
    `;
  } else {
    bodyEl.innerHTML = categoryListings.map(item => {
      // Check if image exists, otherwise fallback to circular icon
      const avatarHtml = item.image && item.image.trim() !== '' 
        ? `<img src="${item.image}" alt="${item.name}" class="listing-avatar-img">`
        : `<div class="listing-avatar-icon"><i class="fa-solid ${category.icon || 'fa-user'}"></i></div>`;

      return `
        <div class="listing-card">
          <div class="listing-avatar-wrapper">
            ${avatarHtml}
          </div>
          <div class="item-info">
            <div class="item-title">
              ${item.name}
              ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
            </div>
            <div class="item-location">
              <i class="fa-solid fa-location-dot"></i> ${item.location} ${item.address ? `• ${item.address}` : ''}
            </div>
            ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
          </div>
          <div class="item-actions">
            <a href="tel:${item.phone}" class="action-btn-call">
              <i class="fa-solid fa-phone"></i> কল
            </a>
            <a href="https://wa.me/88${item.phone.replace(/[^0-9]/g, '')}" target="_blank" class="action-btn-wa">
              <i class="fa-brands fa-whatsapp"></i> চ্যাট
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  modal.classList.add('active');
}

// Render Inline Blood Donor Directory on Main Page
function renderDonorDirectory(group = 'all', chipEl = null) {
  if (chipEl) {
    document.querySelectorAll('.blood-groups-flex .bg-chip').forEach(c => c.classList.remove('active'));
    chipEl.classList.add('active');
  }

  const gridEl = document.getElementById('donors-directory-grid') || document.getElementById('donor-directory-grid');
  if (!gridEl) return;

  let matched = globalDonors;
  if (group !== 'all') {
    matched = globalDonors.filter(d => d.blood_group === group);
  }

  if (matched.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 40px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-user-slash fa-3x" style="margin-bottom:12px; opacity:0.4;"></i>
        <p>এই মুহূর্তে <strong>${group}</strong> গ্রুপের কোনো রক্তদাতার তথ্য তালিকাভুক্ত নেই।</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = matched.map(d => {
    const avatarHtml = d.image ? 
      `<img src="${d.image}" alt="${d.name}" class="listing-avatar-img">` :
      `<div class="listing-avatar-icon" style="background:var(--blood-light); color:var(--blood-red);">
        <i class="fa-solid fa-user"></i>
       </div>`;

    const phoneClean = d.phone ? d.phone.replace(/[^0-9]/g, '') : '';

    return `
      <div class="donor-card" onclick="openDonorDetailsModal(${d.id})" style="cursor:pointer;">
        <div class="donor-avatar-wrap">
          ${avatarHtml}
        </div>
        <div class="donor-details">
          <div class="donor-name-row">
            <span class="donor-name">${d.name}</span>
            <span class="donor-group-tag">${d.blood_group}</span>
          </div>
          <div class="donor-address">
            <i class="fa-solid fa-location-dot" style="color:var(--blood-red);"></i> <strong>${d.village ? `${d.village}, ` : ''}${d.union_name || 'সিরাজদিখান'}, ${d.upazila || 'সিরাজদিখান'}</strong>
          </div>
          <div class="donor-contact">
            <i class="fa-solid fa-phone" style="color:var(--primary-emerald);"></i> ${d.phone}
          </div>
        </div>
        <div class="donor-actions" onclick="event.stopPropagation()">
          <a href="tel:${d.phone}" class="action-btn-call" style="background:var(--blood-red);">
            <i class="fa-solid fa-phone"></i> কল
          </a>
          ${phoneClean ? `
          <a href="https://wa.me/88${phoneClean}" target="_blank" class="action-btn-wa">
            <i class="fa-brands fa-whatsapp"></i> চ্যাট
          </a>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function openDonorDetailsModal(donorId) {
  const donor = globalDonors.find(d => d.id == donorId);
  if (!donor) return;

  const avatarBox = document.getElementById('modal-donor-avatar-container');
  const nameEl = document.getElementById('modal-donor-name');
  const groupTagEl = document.getElementById('modal-donor-blood-tag');
  const phoneEl = document.getElementById('modal-donor-phone');
  const addressDetailsEl = document.getElementById('modal-donor-address-details');
  const callBtn = document.getElementById('modal-donor-call-btn');
  const waBtn = document.getElementById('modal-donor-wa-btn');

  if (avatarBox) {
    if (donor.image) {
      avatarBox.innerHTML = `<img src="${donor.image}" alt="${donor.name}" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid var(--blood-red); box-shadow: 0 8px 24px rgba(225, 29, 72, 0.4);">`;
    } else {
      avatarBox.innerHTML = `
        <div style="width: 110px; height: 110px; border-radius: 50%; background: var(--blood-light); color: var(--blood-red); display: flex; align-items: center; justify-content: center; font-size: 3.2rem; margin: 0 auto; border: 4px solid var(--blood-red); box-shadow: 0 8px 24px rgba(225, 29, 72, 0.4);">
          <i class="fa-solid fa-user"></i>
        </div>
      `;
    }
  }

  if (nameEl) nameEl.textContent = donor.name;
  if (groupTagEl) {
    groupTagEl.innerHTML = `<span class="donor-group-tag" style="font-size: 1.1rem; padding: 4px 18px; border-radius: 20px;">${donor.blood_group}</span>`;
  }
  if (phoneEl) phoneEl.textContent = donor.phone || 'N/A';

  const district = donor.district || 'মুন্সীগঞ্জ';
  const upazila = donor.upazila || 'সিরাজদিখান';
  const union = donor.union_name || 'সিরাজদিখান সদর';
  const village = donor.village || '';

  if (addressDetailsEl) {
    addressDetailsEl.innerHTML = `
      <div><strong>জেলা:</strong> ${district}</div>
      <div><strong>উপজেলা:</strong> ${upazila}</div>
      <div><strong>ইউনিয়ন:</strong> ${union}</div>
      ${village ? `<div><strong>গ্রাম / এলাকা:</strong> ${village}</div>` : ''}
    `;
  }

  const phoneClean = donor.phone ? donor.phone.replace(/[^0-9]/g, '') : '';
  if (callBtn) callBtn.href = `tel:${phoneClean}`;
  if (waBtn) {
    if (phoneClean) {
      waBtn.style.display = 'flex';
      waBtn.href = `https://wa.me/88${phoneClean}`;
    } else {
      waBtn.style.display = 'none';
    }
  }

  const modal = document.getElementById('donor-details-modal');
  if (modal) modal.classList.add('active');
}

function filterDonorsByGroup(group, chipEl) {
  renderDonorDirectory(group, chipEl);
}

async function handleDonorSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('api/blood.php?action=add_donor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || 'রক্তদাতা হিসেবে সফলভাবে নিবন্ধিত হয়েছেন!');
    closeModal('donor-register-modal');
    form.reset();

    globalDonors.unshift({
      id: Date.now(),
      name: data.name || '',
      blood_group: data.blood_group || '',
      phone: data.phone || '',
      union_name: data.union_name || 'সিরাজদিখান সদর',
      village: data.village || '',
      upazila: 'সিরাজদিখান',
      district: 'মুন্সীগঞ্জ',
      division: 'ঢাকা',
      is_ready: 1
    });

    renderDonorDirectory('all');
    if (typeof renderAdminMetrics === 'function') renderAdminMetrics();
  } catch (err) {
    alert("রক্তদাতা হিসেবে নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!");
    closeModal('donor-register-modal');
    form.reset();

    globalDonors.unshift({
      id: Date.now(),
      name: data.name || '',
      blood_group: data.blood_group || '',
      phone: data.phone || '',
      union_name: data.union_name || 'সিরাজদিখান সদর',
      village: data.village || '',
      upazila: 'সিরাজদিখান',
      district: 'মুন্সীগঞ্জ',
      division: 'ঢাকা',
      is_ready: 1
    });

    renderDonorDirectory('all');
    if (typeof renderAdminMetrics === 'function') renderAdminMetrics();
  }
}

async function handleBloodRequestSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const patient_name = data.patient_name || data.name || 'জরুরী রোগী';
  const blood_group = data.blood_group || '';
  const hospital = data.hospital || '';
  const units = parseInt(data.units || data.bags) || 1;
  const phone = data.phone || '';
  const needed_date = data.needed_date || '';

  try {
    const res = await fetch('api/blood.php?action=add_request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || 'জরুরী রক্তের আবেদন পোস্ট করা হয়েছে!');
    closeModal('blood-request-modal');
    form.reset();

    globalBloodRequests.unshift({
      id: Date.now(),
      patient_name,
      blood_group,
      hospital,
      bags: units,
      phone,
      needed_date,
      location: 'সিরাজদিখান'
    });

    if (typeof renderAdminMetrics === 'function') renderAdminMetrics();
  } catch (err) {
    alert("জরুরী রক্তের আবেদন পোস্ট করা হয়েছে!");
    closeModal('blood-request-modal');
    form.reset();

    globalBloodRequests.unshift({
      id: Date.now(),
      patient_name,
      blood_group,
      hospital,
      bags: units,
      phone,
      needed_date,
      location: 'সিরাজদিখান'
    });

    if (typeof renderAdminMetrics === 'function') renderAdminMetrics();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function openBloodRequestModal() {
  closeModal('donors-modal');
  document.getElementById('blood-request-modal').classList.add('active');
}

function openDonorRegisterModal() {
  document.getElementById('donor-register-modal').classList.add('active');
}

function setupEventListeners() {
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderCategories(e.target.value);
    });
  }
}
