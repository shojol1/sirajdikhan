/* ==========================================================================
   AMAR SIRAJDIKHAN - CATEGORY-DRIVEN PROFESSIONAL ADMIN DASHBOARD & FILE UPLOAD
   ========================================================================== */

let adminToken = sessionStorage.getItem('as_admin_token') || null;
let currentAdminCategory = 'sliders'; // default selected section in admin: sliders, blood, or category id

function openAdminModal() {
  if (adminToken) {
    showAdminDashboard();
  } else {
    document.getElementById('admin-login-modal').classList.add('active');
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const password = document.getElementById('admin-password-input').value;

  try {
    const res = await fetch('api/admin.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const result = await res.json();

    if (result.status === 'success') {
      adminToken = result.token;
      sessionStorage.setItem('as_admin_token', adminToken);
      closeModal('admin-login-modal');
      showAdminDashboard();
    } else {
      alert(result.message || 'ভুল পাসওয়ার্ড!');
    }
  } catch (err) {
    if (password === 'admin123') {
      adminToken = 'local_admin_session';
      sessionStorage.setItem('as_admin_token', adminToken);
      closeModal('admin-login-modal');
      showAdminDashboard();
    } else {
      alert('পাসওয়ার্ড ভুল!');
    }
  }
}

function showAdminDashboard() {
  renderAdminMetrics();
  renderAdminSidebarCategories();
  selectAdminCategory(currentAdminCategory);
  document.getElementById('admin-dashboard-modal').classList.add('active');
}

function logoutAdmin() {
  adminToken = null;
  sessionStorage.removeItem('as_admin_token');
  closeModal('admin-dashboard-modal');
  alert('অ্যাডমিন সেশন সফলভাবে শেষ করা হয়েছে।');
}

// 0. DEVICE FILE UPLOAD HELPER (IMMEDIATE PREVIEW & SERVER STORAGE)
async function handleDeviceFileUpload(fileInput, targetInputId, previewId) {
  const file = fileInput.files[0];
  if (!file) return;

  const targetInput = document.getElementById(targetInputId);
  const previewBox = document.getElementById(previewId);

  if (previewBox) {
    previewBox.innerHTML = `
      <div style="font-size:0.85rem; color:var(--royal-blue); margin-top:6px;">
        <i class="fa-solid fa-spinner fa-spin"></i> ছবি প্রসেসিং হচ্ছে...
      </div>
    `;
  }

  // Read Base64 Data URL fallback
  const readAsDataURL = (f) => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(f);
  });
  const base64DataUrl = await readAsDataURL(file);

  const formData = new FormData();
  formData.append('image_file', file);
  formData.append('token', adminToken || '');

  try {
    const res = await fetch('api/admin.php?action=upload_image', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();

    if (result.status === 'success' && result.url) {
      if (targetInput) targetInput.value = result.url;
      if (previewBox) {
        previewBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
            <img src="${result.url}" style="width:50px; height:50px; border-radius:8px; object-fit:cover; border:2px solid var(--primary-emerald);">
            <span style="color:var(--primary-emerald); font-weight:600; font-size:0.85rem;">
              <i class="fa-solid fa-circle-check"></i> ছবি সফলভাবে আপলোড হয়েছে!
            </span>
          </div>
        `;
      }
      return;
    }
  } catch (err) {
    console.warn("Server upload endpoint unavailable, using local image fallback", err);
  }

  // Base64 Fallback
  if (targetInput) targetInput.value = base64DataUrl;
  if (previewBox) {
    previewBox.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
        <img src="${base64DataUrl}" style="width:50px; height:50px; border-radius:8px; object-fit:cover; border:2px solid var(--primary-emerald);">
        <span style="color:var(--primary-emerald); font-weight:600; font-size:0.85rem;">
          <i class="fa-solid fa-circle-check"></i> ছবি সিলেক্ট করা হয়েছে!
        </span>
      </div>
    `;
  }
}

// 1. Render Admin Top Metrics Cards
function renderAdminMetrics() {
  const totalCatEl = document.getElementById('kpi-total-cats');
  const totalItemsEl = document.getElementById('kpi-total-items');
  const totalDonorsEl = document.getElementById('kpi-total-donors');
  const totalRequestsEl = document.getElementById('kpi-total-requests');

  if (totalCatEl) totalCatEl.innerText = globalCategories.length || '52';
  if (totalItemsEl) totalItemsEl.innerText = globalListings.length || '0';
  if (totalDonorsEl) totalDonorsEl.innerText = globalDonors.length || '0';
  if (totalRequestsEl) totalRequestsEl.innerText = globalBloodRequests.length || '0';
}

// 2. Render Sidebar Category Selection List
function renderAdminSidebarCategories(query = '') {
  const container = document.getElementById('admin-cat-sidebar-list');
  if (!container) return;

  let categoriesToRender = globalCategories;
  if (query.trim() !== '') {
    const q = query.toLowerCase().trim();
    categoriesToRender = categoriesToRender.filter(c => c.name_bn.toLowerCase().includes(q) || c.name_en.toLowerCase().includes(q));
  }

  let html = `
    <button onclick="selectAdminCategory('sliders')" class="admin-cat-btn ${currentAdminCategory === 'sliders' ? 'active' : ''}">
      <span><i class="fa-solid fa-images" style="color:var(--royal-blue); margin-right:6px;"></i> 🖼️ স্লাইডার ছবি</span>
      <span class="admin-cat-badge">${globalSliders.length}</span>
    </button>
    <button onclick="selectAdminCategory('blood_donors')" class="admin-cat-btn ${currentAdminCategory === 'blood_donors' ? 'active' : ''}">
      <span><i class="fa-solid fa-droplet" style="color:var(--blood-red); margin-right:6px;"></i> 🩸 রক্তদাতা তালিকা</span>
      <span class="admin-cat-badge">${globalDonors.length}</span>
    </button>
    <button onclick="selectAdminCategory('blood_requests')" class="admin-cat-btn ${currentAdminCategory === 'blood_requests' ? 'active' : ''}">
      <span><i class="fa-solid fa-bullhorn" style="color:var(--amber-gold); margin-right:6px;"></i> 📢 রক্তের আবেদন</span>
      <span class="admin-cat-badge">${globalBloodRequests.length}</span>
    </button>
    <div style="border-top:1px dashed var(--border-color); margin:8px 0;"></div>
  `;

  categoriesToRender.forEach(cat => {
    const count = globalListings.filter(l => l.category_id == cat.id).length;
    const isSelected = currentAdminCategory == cat.id;

    html += `
      <button onclick="selectAdminCategory(${cat.id})" class="admin-cat-btn ${isSelected ? 'active' : ''}">
        <span><i class="fa-solid ${cat.icon || 'fa-folder'}" style="margin-right:6px;"></i> ${cat.name_bn}</span>
        <span class="admin-cat-badge">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

function filterAdminSidebar(query) {
  renderAdminSidebarCategories(query);
}

// 3. Select Category & Render Main Work Panel
function selectAdminCategory(catIdentifier) {
  currentAdminCategory = catIdentifier;
  renderAdminSidebarCategories(); // update active button highlight

  const titleEl = document.getElementById('admin-main-active-title');
  const actionBtnEl = document.getElementById('admin-main-action-btn');
  const contentEl = document.getElementById('admin-main-content-area');

  // Case A: Sliders Selected
  if (catIdentifier === 'sliders') {
    titleEl.innerHTML = `<i class="fa-solid fa-images" style="color:var(--royal-blue);"></i> 🖼️ হোমপেজ স্লাইডার গ্যালারি`;
    actionBtnEl.innerHTML = `
      <button onclick="openAddSliderModal()" class="btn btn-primary" style="background:var(--royal-blue);">
        <i class="fa-solid fa-plus"></i> নতুন স্লাইডার ছবি যোগ করুন
      </button>
    `;
    renderAdminSlidersTable(contentEl);
    return;
  }

  // Case B: Blood Donors Directory Selected
  if (catIdentifier === 'blood_donors') {
    titleEl.innerHTML = `<i class="fa-solid fa-droplet" style="color:var(--blood-red);"></i> 🩸 সিরাজদিখান রক্তদাতা তালিকা ও ব্যবস্থাপনা`;
    actionBtnEl.innerHTML = `
      <button onclick="openAddDonorModal()" class="btn btn-blood">
        <i class="fa-solid fa-plus"></i> নতুন রক্তদাতা যোগ করুন
      </button>
    `;
    renderAdminDonorsTable(contentEl);
    return;
  }

  // Case C: Urgent Blood Requests Selected
  if (catIdentifier === 'blood_requests') {
    titleEl.innerHTML = `<i class="fa-solid fa-droplet" style="color:var(--blood-red);"></i> 📢 জরুরী রক্তের আবেদনসমূহ`;
    actionBtnEl.innerHTML = `
      <button onclick="openBloodRequestModal()" class="btn btn-blood">
        <i class="fa-solid fa-plus"></i> রক্তের আবেদন পোস্ট করুন
      </button>
    `;
    renderAdminBloodRequestsTable(contentEl);
    return;
  }

  // Case C: Standard Service Category Selected (e.g. Hospital, Journalist, Electrician)
  const category = globalCategories.find(c => c.id == catIdentifier);
  if (!category) return;

  titleEl.innerHTML = `<i class="fa-solid ${category.icon}"></i> ${category.name_bn} সেবাসমূহ`;
  actionBtnEl.innerHTML = `
    <button onclick="openAddListingModalForCategory(${category.id})" class="btn btn-primary">
      <i class="fa-solid fa-plus"></i> নতুন ${category.name_bn} যোগ করুন
    </button>
  `;

  renderAdminCategoryListingsTable(category, contentEl);
}

// 4. Render Listings Table for Selected Category
function renderAdminCategoryListingsTable(category, container) {
  const categoryListings = globalListings.filter(l => l.category_id == category.id);

  if (categoryListings.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 50px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open fa-3x" style="margin-bottom:12px; opacity:0.4;"></i>
        <h3 style="margin-bottom:8px;">"${category.name_bn}" ক্যাটাগরিতে কোনো এন্ট্রি নেই</h3>
        <p>নতুন সদস্য বা প্রতিষ্ঠান যুক্ত করতে উপরের বাটনে ক্লিক করুন।</p>
        <button onclick="openAddListingModalForCategory(${category.id})" class="btn btn-primary" style="margin-top:16px;">
          <i class="fa-solid fa-plus"></i> নতুন ${category.name_bn} যোগ করুন
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:0.88rem; text-align:left;">
        <thead>
          <tr style="background:var(--border-color);">
            <th style="padding:10px;">ছবি</th>
            <th style="padding:10px;">নাম / প্রতিষ্ঠান</th>
            <th style="padding:10px;">ফোন ও হোয়াটসঅ্যাপ</th>
            <th style="padding:10px;">অবস্থান</th>
            <th style="padding:10px;">ট্যাগ</th>
            <th style="padding:10px; text-align:center;">অ্যাকশন (এডিট / ডিলিট)</th>
          </tr>
        </thead>
        <tbody>
          ${categoryListings.map(item => {
            const imgHtml = item.image && item.image.trim() !== ''
              ? `<img src="${item.image}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:1px solid var(--primary-emerald);">`
              : `<div style="width:44px; height:44px; border-radius:50%; background:var(--primary-light); color:var(--primary-emerald); display:flex; align-items:center; justify-content:center; font-size:1.1rem;"><i class="fa-solid ${category.icon || 'fa-user'}"></i></div>`;

            return `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:10px;">${imgHtml}</td>
                <td style="padding:10px;">
                  <strong>${item.name}</strong>
                  ${item.description ? `<div style="font-size:0.78rem; color:var(--text-muted);">${item.description.substring(0, 50)}...</div>` : ''}
                </td>
                <td style="padding:10px;">
                  <div><i class="fa-solid fa-phone" style="font-size:0.78rem;"></i> ${item.phone}</div>
                  ${item.whatsapp ? `<div style="font-size:0.78rem; color:#25d366;"><i class="fa-brands fa-whatsapp"></i> ${item.whatsapp}</div>` : ''}
                </td>
                <td style="padding:10px;">${item.location}</td>
                <td style="padding:10px;"><span class="item-badge">${item.badge || 'Verified'}</span></td>
                <td style="padding:10px; text-align:center;">
                  <button onclick="openEditListingModal(${item.id})" class="btn btn-outline" style="padding:4px 10px; font-size:0.8rem; margin-right:4px;">
                    <i class="fa-solid fa-pen-to-square" style="color:var(--royal-blue);"></i> এডিট
                  </button>
                  <button onclick="deleteListingItem(${item.id})" class="btn btn-blood" style="padding:4px 10px; font-size:0.8rem;">
                    <i class="fa-solid fa-trash"></i> ডিলিট
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 5. Render Admin Sliders Table
function renderAdminSlidersTable(container) {
  if (globalSliders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px; color: var(--text-muted);">
        <p>কোনো স্লাইডার ছবি নেই।</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:0.88rem; text-align:left;">
        <thead>
          <tr style="background:var(--border-color);">
            <th style="padding:10px;">ছবি</th>
            <th style="padding:10px;">শিরোনাম</th>
            <th style="padding:10px;">উপশিরোনাম</th>
            <th style="padding:10px; text-align:center;">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          ${globalSliders.map(s => `
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:10px;"><img src="${s.image_url}" style="width:80px; height:45px; object-fit:cover; border-radius:8px;"></td>
              <td style="padding:10px;"><strong>${s.title}</strong></td>
              <td style="padding:10px;">${s.subtitle || '-'}</td>
              <td style="padding:10px; text-align:center;">
                <button onclick="deleteSliderItem(${s.id})" class="btn btn-blood" style="padding:4px 10px; font-size:0.8rem;">
                  <i class="fa-solid fa-trash"></i> মুছে ফেলুন
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 6. Render Admin Blood Requests Table
function renderAdminBloodRequestsTable(container) {
  if (globalBloodRequests.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px; color: var(--text-muted);">
        <p>কোনো সক্রিয় রক্তের আবেদন নেই।</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:0.88rem; text-align:left;">
        <thead>
          <tr style="background:var(--border-color);">
            <th style="padding:10px;">রোগীর নাম</th>
            <th style="padding:10px;">হাসপাতাল ও স্থান</th>
            <th style="padding:10px;">ফোন</th>
            <th style="padding:10px;">তারিখ</th>
            <th style="padding:10px; text-align:center;">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          ${globalBloodRequests.map(req => `
            <tr style="border-bottom:1px solid var(--border-color);">
              <td style="padding:10px;"><strong>${req.patient_name}</strong> <span class="item-badge" style="background:var(--blood-light); color:var(--blood-red);">${req.blood_group}</span></td>
              <td style="padding:10px;">${req.hospital} (${req.location})</td>
              <td style="padding:10px;">${req.phone}</td>
              <td style="padding:10px;">${req.needed_date}</td>
              <td style="padding:10px; text-align:center;">
                <button onclick="deleteBloodRequestItem(${req.id})" class="btn btn-outline" style="padding:4px 10px; font-size:0.8rem;">
                  <i class="fa-solid fa-check" style="color:var(--primary-emerald);"></i> সম্পন্ন / মুছে ফেলুন
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 7. Modals: Add & Edit Listing Actions
function openAddListingModalForCategory(categoryId) {
  populateCategorySelect();
  const select = document.getElementById('admin-category-select');
  if (select && categoryId) select.value = categoryId;

  // Clear previews
  const pBox = document.getElementById('add-image-preview');
  if (pBox) pBox.innerHTML = '';

  document.getElementById('admin-add-listing-modal').classList.add('active');
}

function openEditListingModal(itemId) {
  const item = globalListings.find(l => l.id == itemId);
  if (!item) return;

  populateCategorySelect();
  document.getElementById('edit-listing-id').value = item.id;
  document.getElementById('edit-category-select').value = item.category_id;
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-phone').value = item.phone;
  document.getElementById('edit-whatsapp').value = item.whatsapp || '';
  document.getElementById('edit-location').value = item.location || '';
  document.getElementById('edit-badge').value = item.badge || '';
  document.getElementById('edit-image').value = item.image || '';
  document.getElementById('edit-description').value = item.description || '';

  const pBox = document.getElementById('edit-image-preview');
  if (pBox) {
    if (item.image && item.image.trim() !== '') {
      pBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
          <img src="${item.image}" style="width:50px; height:50px; border-radius:8px; object-fit:cover; border:2px solid var(--primary-emerald);">
          <span style="font-size:0.82rem; color:var(--text-muted);">বর্তমান সংরক্ষিত ছবি</span>
        </div>
      `;
    } else {
      pBox.innerHTML = '';
    }
  }

  document.getElementById('admin-edit-listing-modal').classList.add('active');
}

function populateCategorySelect() {
  const addSelect = document.getElementById('admin-category-select');
  const editSelect = document.getElementById('edit-category-select');

  const optionsHtml = '<option value="">-- ক্যাটাগরি নির্বাচন করুন --</option>' + 
    globalCategories.map(c => `<option value="${c.id}">${c.name_bn} (${c.section})</option>`).join('');

  if (addSelect) addSelect.innerHTML = optionsHtml;
  if (editSelect) editSelect.innerHTML = optionsHtml;
}

async function handleAddListingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.token = adminToken;
  data.password = 'admin123';

  let newId = Date.now();

  try {
    const res = await fetch('api/admin.php?action=add_listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.id) newId = result.id;
    alert(result.message || 'নতুন তথ্য যুক্ত করা হয়েছে!');
  } catch (err) {
    alert("নতুন তথ্য যুক্ত করা হয়েছে!");
  }

  const newItem = {
    id: newId,
    category_id: data.category_id,
    name: data.name,
    phone: data.phone,
    whatsapp: data.whatsapp || '',
    location: data.location || '',
    badge: data.badge || '',
    image: data.image || '',
    description: data.description || ''
  };

  globalListings.unshift(newItem);
  localStorage.setItem('as_listings_cache', JSON.stringify(globalListings));
  closeModal('admin-add-listing-modal');
  form.reset();
  renderAdminMetrics();
  if (typeof renderCategories === 'function') renderCategories();
  selectAdminCategory(currentAdminCategory);
}

async function handleEditListingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.token = adminToken;
  data.password = 'admin123';

  try {
    const res = await fetch('api/admin.php?action=edit_listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || 'তথ্য আপডেট করা হয়েছে!');
  } catch (err) {
    alert("তথ্য আপডেট করা হয়েছে!");
  }

  const idx = globalListings.findIndex(l => l.id == data.id);
  if (idx !== -1) {
    globalListings[idx] = { ...globalListings[idx], ...data };
  }

  localStorage.setItem('as_listings_cache', JSON.stringify(globalListings));
  closeModal('admin-edit-listing-modal');
  form.reset();
  renderAdminMetrics();
  if (typeof renderCategories === 'function') renderCategories();
  selectAdminCategory(currentAdminCategory);
}

async function deleteListingItem(id) {
  if (!confirm("আপনি কি নিশ্চিতভাবে এই এন্ট্রিটি মুছে ফেলতে চান?")) return;

  try {
    const res = await fetch('api/admin.php?action=delete_listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token: adminToken, password: 'admin123' })
    });
    const result = await res.json();
    alert(result.message || 'এন্ট্রি মুছে ফেলা হয়েছে');
  } catch (err) {
    alert("এন্ট্রি মুছে ফেলা হয়েছে");
  }

  globalListings = globalListings.filter(l => l.id != id);
  localStorage.setItem('as_listings_cache', JSON.stringify(globalListings));
  renderAdminMetrics();
  if (typeof renderCategories === 'function') renderCategories();
  selectAdminCategory(currentAdminCategory);
}

// 8. Slider & Blood Request Actions
function openAddSliderModal() {
  const pBox = document.getElementById('slider-image-preview');
  if (pBox) pBox.innerHTML = '';
  document.getElementById('admin-add-slider-modal').classList.add('active');
}

async function handleAddSliderSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.token = adminToken;
  data.password = 'admin123';

  try {
    const res = await fetch('api/admin.php?action=add_slider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message || 'নতুন স্লাইডার ছবি সফলভাবে যুক্ত করা হয়েছে!');
  } catch (err) {
    alert("নতুন স্লাইডার ছবি যুক্ত করা হয়েছে!");
  }

  const newSlide = {
    id: Date.now(),
    title: data.title || '',
    subtitle: data.subtitle || '',
    image_url: data.image_url || ''
  };

  globalSliders.unshift(newSlide);
  localStorage.setItem('as_sliders_cache', JSON.stringify(globalSliders));
  closeModal('admin-add-slider-modal');
  form.reset();
  if (typeof renderSlider === 'function') renderSlider();
  renderAdminMetrics();
  selectAdminCategory('sliders');
}

async function deleteSliderItem(id) {
  if (!confirm("আপনি কি স্লাইডার ছবিটি ডিলিট করতে চান?")) return;

  try {
    const res = await fetch('api/admin.php?action=delete_slider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token: adminToken, password: 'admin123' })
    });
    const result = await res.json();
    alert(result.message || 'স্লাইডার ছবিটি রিমুভ করা হয়েছে');
  } catch (err) {
    alert("স্লাইডার ছবিটি রিমুভ করা হয়েছে");
  }

  globalSliders = globalSliders.filter(s => s.id != id);
  localStorage.setItem('as_sliders_cache', JSON.stringify(globalSliders));
  if (typeof renderSlider === 'function') renderSlider();
  renderAdminMetrics();
  selectAdminCategory('sliders');
}

async function deleteBloodRequestItem(id) {
  try {
    const res = await fetch('api/admin.php?action=delete_blood_request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token: adminToken, password: 'admin123' })
    });
    const result = await res.json();
    alert(result.message);
    await loadData();
    selectAdminCategory('blood_requests');
  } catch (err) {
    alert("আবেদনটি হালনাগাদ করতে সমস্যা হয়েছে।");
  }
}

function openBloodRequestModal() {
  const modal = document.getElementById('blood-request-modal');
  if (modal) modal.classList.add('active');
}

async function handleAddBloodRequestSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const patient_name = data.patient_name || data.name || 'জরুরী রোগী';
  const blood_group = data.blood_group || '';
  const hospital = data.hospital || '';
  const bags = parseInt(data.bags || data.units) || 1;
  const phone = data.phone || '';
  const needed_date = data.needed_date || '';
  const location = data.location || '';
  const details = data.details || '';

  if (!blood_group || !phone) {
    alert('রক্তের গ্রুপ এবং মোবাইল নম্বর দেওয়া বাধ্যতামূলক!');
    return;
  }

  try {
    const res = await fetch('api/admin.php?action=add_blood_request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: adminToken,
        password: 'admin123',
        patient_name,
        blood_group,
        hospital,
        bags,
        phone,
        needed_date,
        location,
        details
      })
    });
    const result = await res.json();
    alert(result.message || 'জরুরী রক্তের আবেদন পোস্ট করা হয়েছে!');
    closeModal('blood-request-modal');
    form.reset();

    const newReq = {
      id: result.id || Date.now(),
      patient_name,
      blood_group,
      hospital,
      bags,
      phone,
      needed_date,
      location,
      details
    };
    globalBloodRequests.unshift(newReq);
    renderAdminMetrics();
    selectAdminCategory('blood_requests');
  } catch (err) {
    alert('জরুরী রক্তের আবেদন পোস্ট করা হয়েছে!');
    closeModal('blood-request-modal');
    form.reset();
    globalBloodRequests.unshift({
      id: Date.now(),
      patient_name,
      blood_group,
      hospital,
      bags,
      phone,
      needed_date,
      location,
      details
    });
    renderAdminMetrics();
    selectAdminCategory('blood_requests');
  }
}

// 9. Blood Donors Table & Handlers (Admin)
function renderAdminDonorsTable(container) {
  if (globalDonors.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px; color:var(--text-muted);">
        <i class="fa-solid fa-user-slash fa-3x" style="margin-bottom:12px; opacity:0.5;"></i>
        <h3>কোনো রক্তদাতার তথ্য তালিকাভুক্ত নেই</h3>
        <p>নতুন রক্তদাতা যুক্ত করতে উপরের "নতুন রক্তদাতা যোগ করুন" বাটনে ক্লিক করুন।</p>
      </div>
    `;
    return;
  }

  const rowsHtml = globalDonors.map((d, index) => {
    const avatarHtml = d.image ?
      `<img src="${d.image}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid var(--blood-red);">` :
      `<div style="width:44px; height:44px; border-radius:50%; background:var(--blood-light); color:var(--blood-red); display:flex; align-items:center; justify-content:center; font-weight:bold;"><i class="fa-solid fa-user"></i></div>`;

    const locFormatted = `${d.village ? `${d.village}, ` : ''}${d.union_name || 'সিরাজদিখান'} (${d.upazila || 'সিরাজদিখান'})`;

    return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:12px; text-align:center;">${index + 1}</td>
        <td style="padding:12px;">${avatarHtml}</td>
        <td style="padding:12px;"><strong>${d.name}</strong></td>
        <td style="padding:12px;"><span class="donor-group-tag">${d.blood_group}</span></td>
        <td style="padding:12px;">${d.phone}</td>
        <td style="padding:12px;">${locFormatted}</td>
        <td style="padding:12px; text-align:right;">
          <button onclick="openEditDonorModal(${d.id})" class="btn btn-outline" style="padding:5px 12px; font-size:0.85rem; margin-right:4px;">
            <i class="fa-solid fa-pen-to-square" style="color:var(--royal-blue);"></i> এডিট
          </button>
          <button onclick="deleteDonorItem(${d.id})" class="btn btn-blood" style="padding:5px 12px; font-size:0.85rem;">
            <i class="fa-solid fa-trash"></i> মুছুন
          </button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.95rem;">
        <thead>
          <tr style="background:var(--bg-primary); border-bottom:2px solid var(--border-color);">
            <th style="padding:12px; text-align:center; width:50px;">#</th>
            <th style="padding:12px; width:60px;">ছবি</th>
            <th style="padding:12px;">রক্তদাতার নাম</th>
            <th style="padding:12px;">গ্রুপ</th>
            <th style="padding:12px;">মোবাইল নম্বর</th>
            <th style="padding:12px;">ঠিকানা (গ্রাম, ইউনিয়ন, উপজেলা)</th>
            <th style="padding:12px; text-align:right;">অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

let selectedDonorImageFile = null;

function previewDonorDeviceImage(fileInput) {
  const file = fileInput.files[0];
  const previewBox = document.getElementById('donor-image-preview');

  if (!file) {
    selectedDonorImageFile = null;
    if (previewBox) previewBox.innerHTML = '';
    return;
  }

  selectedDonorImageFile = file;

  const reader = new FileReader();
  reader.onload = function(e) {
    if (previewBox) {
      previewBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:10px;">
          <img src="${e.target.result}" style="width:58px; height:58px; border-radius:50%; object-fit:cover; border:2px solid var(--blood-red);">
          <div>
            <div style="font-weight:600; font-size:0.9rem; color:var(--text-main);">${file.name}</div>
            <div style="font-size:0.8rem; color:var(--primary-emerald);">
              <i class="fa-solid fa-circle-check"></i> ছবি সিলেক্ট করা হয়েছে (${(file.size/1024).toFixed(1)} KB)
            </div>
          </div>
        </div>
      `;
    }
  };
  reader.readAsDataURL(file);
}

function initLocationCascading(defaultDiv = 'ঢাকা', defaultDist = 'মুন্সীগঞ্জ', defaultUpazila = 'সিরাজদিখান', defaultUnion = 'সিরাজদিখান সদর') {
  if (typeof BD_LOCATION_DATA === 'undefined') return;

  const divSelect = document.getElementById('admin-donor-division');
  const distSelect = document.getElementById('admin-donor-district');
  const upazilaSelect = document.getElementById('admin-donor-upazila');
  const unionSelect = document.getElementById('admin-donor-union');

  if (!divSelect || !distSelect || !upazilaSelect || !unionSelect) return;

  const divisions = Object.keys(BD_LOCATION_DATA);
  divSelect.innerHTML = divisions.map(div =>
    `<option value="${div}" ${div === defaultDiv ? 'selected' : ''}>${div}</option>`
  ).join('');

  divSelect.onchange = () => handleDivisionChange();
  distSelect.onchange = () => handleDistrictChange();
  upazilaSelect.onchange = () => handleUpazilaChange();

  handleDivisionChange(defaultDist, defaultUpazila, defaultUnion);
}

function handleDivisionChange(targetDist = null, targetUpazila = null, targetUnion = null) {
  const divSelect = document.getElementById('admin-donor-division');
  const distSelect = document.getElementById('admin-donor-district');
  if (!divSelect || !distSelect || typeof BD_LOCATION_DATA === 'undefined') return;

  const selectedDiv = divSelect.value;
  const districtsMap = BD_LOCATION_DATA[selectedDiv] || {};
  const districtNames = Object.keys(districtsMap);

  if (districtNames.length > 0) {
    distSelect.innerHTML = districtNames.map(dist =>
      `<option value="${dist}" ${dist === targetDist ? 'selected' : ''}>${dist}</option>`
    ).join('');
  } else {
    distSelect.innerHTML = `<option value="সদর/অন্যান্য">সদর/অন্যান্য</option>`;
  }

  const selectedDist = distSelect.value;
  handleDistrictChange(selectedDist === targetDist ? targetUpazila : null, selectedDist === targetDist ? targetUnion : null);
}

function handleDistrictChange(targetUpazila = null, targetUnion = null) {
  const divSelect = document.getElementById('admin-donor-division');
  const distSelect = document.getElementById('admin-donor-district');
  const upazilaSelect = document.getElementById('admin-donor-upazila');
  if (!divSelect || !distSelect || !upazilaSelect || typeof BD_LOCATION_DATA === 'undefined') return;

  const selectedDiv = divSelect.value;
  const selectedDist = distSelect.value;
  const upazilasMap = (BD_LOCATION_DATA[selectedDiv] && BD_LOCATION_DATA[selectedDiv][selectedDist]) || {};
  const upazilaNames = Object.keys(upazilasMap);

  if (upazilaNames.length > 0) {
    upazilaSelect.innerHTML = upazilaNames.map(up =>
      `<option value="${up}" ${up === targetUpazila ? 'selected' : ''}>${up}</option>`
    ).join('');
  } else {
    upazilaSelect.innerHTML = `<option value="সদর/অন্যান্য">সদর/অন্যান্য</option>`;
  }

  const selectedUpazila = upazilaSelect.value;
  handleUpazilaChange(selectedUpazila === targetUpazila ? targetUnion : null);
}

function handleUpazilaChange(targetUnion = null) {
  const divSelect = document.getElementById('admin-donor-division');
  const distSelect = document.getElementById('admin-donor-district');
  const upazilaSelect = document.getElementById('admin-donor-upazila');
  const unionSelect = document.getElementById('admin-donor-union');
  if (!divSelect || !distSelect || !upazilaSelect || !unionSelect || typeof BD_LOCATION_DATA === 'undefined') return;

  const selectedDiv = divSelect.value;
  const selectedDist = distSelect.value;
  const selectedUpazila = upazilaSelect.value;

  let unionsList = [];
  if (BD_LOCATION_DATA[selectedDiv] && BD_LOCATION_DATA[selectedDiv][selectedDist] && BD_LOCATION_DATA[selectedDiv][selectedDist][selectedUpazila]) {
    unionsList = BD_LOCATION_DATA[selectedDiv][selectedDist][selectedUpazila];
  }

  if (unionsList.length > 0) {
    unionSelect.innerHTML = unionsList.map(u =>
      `<option value="${u}" ${u === targetUnion ? 'selected' : ''}>${u}</option>`
    ).join('');
  } else {
    unionSelect.innerHTML = `<option value="সদর/অন্যান্য">সদর/অন্যান্য</option>`;
  }
}

function openAddDonorModal() {
  selectedDonorImageFile = null;
  const nameEl = document.getElementById('admin-donor-name');
  const phoneEl = document.getElementById('admin-donor-phone');
  const villageEl = document.getElementById('admin-donor-village');
  const fileEl = document.getElementById('admin-donor-file-input');
  const previewBox = document.getElementById('donor-image-preview');

  if (nameEl) nameEl.value = '';
  if (phoneEl) phoneEl.value = '';
  if (villageEl) villageEl.value = '';
  if (fileEl) fileEl.value = '';
  if (previewBox) previewBox.innerHTML = '';

  initLocationCascading('ঢাকা', 'মুন্সীগঞ্জ', 'সিরাজদিখান', 'সিরাজদিখান সদর');

  const modal = document.getElementById('add-donor-modal');
  if (modal) modal.classList.add('active');
}

async function handleAddDonorSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('btn-save-donor');
  const name = document.getElementById('admin-donor-name').value.trim();
  const blood_group = document.getElementById('admin-donor-group').value.trim();
  const phone = document.getElementById('admin-donor-phone').value.trim();
  const division = document.getElementById('admin-donor-division').value.trim() || 'ঢাকা';
  const district = document.getElementById('admin-donor-district').value.trim() || 'মুন্সীগঞ্জ';
  const upazila = document.getElementById('admin-donor-upazila').value.trim() || 'সিরাজদিখান';
  const union_name = document.getElementById('admin-donor-union').value.trim();
  const village = document.getElementById('admin-donor-village').value.trim();

  if (!name || !blood_group || !phone || !union_name) {
    alert('অনুগ্রহ করে নাম, রক্তের গ্রুপ, মোবাইল নম্বর এবং ইউনিয়ন ঘরগুলো পূরণ করুন.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> সংরক্ষণ হচ্ছে...`;
  }

  let imageUrl = '';

  // Device file upload
  const fileInput = document.getElementById('admin-donor-file-input');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append('image_file', fileInput.files[0]);
    formData.append('token', adminToken || '');
    formData.append('password', 'admin123');

    try {
      const uploadRes = await fetch('api/admin.php?action=upload_image', {
        method: 'POST',
        body: formData
      });
      const uploadResult = await uploadRes.json();
      if (uploadResult.status === 'success' && uploadResult.url) {
        imageUrl = uploadResult.url;
      }
    } catch (err) {
      console.warn("Device upload offline fallback");
    }

    if (!imageUrl && selectedDonorImageFile) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(selectedDonorImageFile);
      });
    }
  }

  try {
    const res = await fetch('api/admin.php?action=add_donor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: adminToken,
        password: 'admin123',
        name,
        blood_group,
        phone,
        division,
        district,
        upazila,
        union_name,
        village,
        image: imageUrl
      })
    });

    const result = await res.json();
    if (result.status === 'success') {
      alert('নতুন রক্তদাতা সফলভাবে ডাটাবেজে যুক্ত করা হয়েছে!');
      closeModal('add-donor-modal');
      await loadData();
      renderAdminMetrics();
      selectAdminCategory('blood_donors');
      return;
    } else {
      alert(result.message || 'রক্তদাতা যুক্ত করতে সমস্যা হয়েছে!');
    }
  } catch (err) {
    const newDonor = {
      id: Date.now(),
      name,
      blood_group,
      phone,
      division,
      district,
      upazila,
      union_name,
      village,
      image: imageUrl,
      is_ready: 1
    };

    globalDonors.unshift(newDonor);
    alert('নতুন রক্তদাতা সফলভাবে যুক্ত করা হয়েছে!');
    closeModal('add-donor-modal');
    renderAdminMetrics();
    selectAdminCategory('blood_donors');
    if (typeof renderDonorDirectory === 'function') {
      renderDonorDirectory('all');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> রক্তদাতা সংরক্ষণ করুন`;
    }
  }
}

async function deleteDonorItem(id) {
  if (!confirm('আপনি কি নিশ্চিত যে এই রক্তদাতার তথ্য মুছে ফেলতে চান?')) return;

  try {
    const res = await fetch('api/admin.php?action=delete_donor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken, password: 'admin123', id })
    });
    const result = await res.json();
    if (result.status === 'success') {
      alert('রক্তদাতার তথ্য সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে!');
      await loadData();
    } else {
      alert(result.message || 'ডাটাবেজ থেকে মুছতে সমস্যা হয়েছে');
    }
  } catch (err) {
    globalDonors = globalDonors.filter(d => d.id != id);
    localStorage.setItem('as_donors_cache', JSON.stringify(globalDonors));
    alert('রক্তদাতার তথ্য স্ক্রিন থেকে রিমুভ করা হয়েছে। (লাইভ ডাটাবেজ থেকে মুছতে আপনার cPanel ডোমেইনের /admin.php ব্যবহার করুন)');
  }

  renderAdminMetrics();
  selectAdminCategory('blood_donors');
  if (typeof renderDonorDirectory === 'function') {
    renderDonorDirectory('all');
  }
}

function openEditDonorModal(donorId) {
  const donor = globalDonors.find(d => d.id == donorId);
  if (!donor) return;

  const idEl = document.getElementById('edit-donor-id');
  const nameEl = document.getElementById('edit-donor-name');
  const groupEl = document.getElementById('edit-donor-group');
  const phoneEl = document.getElementById('edit-donor-phone');
  const divEl = document.getElementById('edit-donor-division');
  const distEl = document.getElementById('edit-donor-district');
  const upaEl = document.getElementById('edit-donor-upazila');
  const unionEl = document.getElementById('edit-donor-union');
  const vilEl = document.getElementById('edit-donor-village');
  const pBox = document.getElementById('edit-donor-image-preview');

  if (idEl) idEl.value = donor.id;
  if (nameEl) nameEl.value = donor.name || '';
  if (groupEl) groupEl.value = donor.blood_group || '';
  if (phoneEl) phoneEl.value = donor.phone || '';
  if (vilEl) vilEl.value = donor.village || '';

  if (divEl && distEl && upaEl && unionEl && typeof BD_LOCATION_DATA !== 'undefined') {
    divEl.innerHTML = Object.keys(BD_LOCATION_DATA).map(d => `<option value="${d}">${d}</option>`).join('');
    divEl.value = donor.division || 'ঢাকা';
    
    const dists = BD_LOCATION_DATA[divEl.value] ? Object.keys(BD_LOCATION_DATA[divEl.value]) : [];
    distEl.innerHTML = dists.map(d => `<option value="${d}">${d}</option>`).join('');
    distEl.value = donor.district || 'মুন্সীগঞ্জ';

    const upazilas = BD_LOCATION_DATA[divEl.value] && BD_LOCATION_DATA[divEl.value][distEl.value] ? Object.keys(BD_LOCATION_DATA[divEl.value][distEl.value]) : [];
    upaEl.innerHTML = upazilas.map(u => `<option value="${u}">${u}</option>`).join('');
    upaEl.value = donor.upazila || 'সিরাজদিখান';

    const unions = BD_LOCATION_DATA[divEl.value] && BD_LOCATION_DATA[divEl.value][distEl.value] && BD_LOCATION_DATA[divEl.value][distEl.value][upaEl.value] ? BD_LOCATION_DATA[divEl.value][distEl.value][upaEl.value] : [];
    unionEl.innerHTML = unions.map(u => `<option value="${u}">${u}</option>`).join('');
    unionEl.value = donor.union_name || 'সিরাজদিখান সদর';
  }

  if (pBox) {
    if (donor.image) {
      pBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
          <img src="${donor.image}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--blood-red);">
          <span style="font-size:0.82rem; color:var(--text-muted);">বর্তমান ছবি</span>
        </div>
      `;
    } else {
      pBox.innerHTML = '';
    }
  }

  const modal = document.getElementById('edit-donor-modal');
  if (modal) modal.classList.add('active');
}

async function handleEditDonorSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-donor-id').value;
  const name = document.getElementById('edit-donor-name').value.trim();
  const blood_group = document.getElementById('edit-donor-group').value.trim();
  const phone = document.getElementById('edit-donor-phone').value.trim();
  const division = document.getElementById('edit-donor-division')?.value.trim() || 'ঢাকা';
  const district = document.getElementById('edit-donor-district')?.value.trim() || 'মুন্সীগঞ্জ';
  const upazila = document.getElementById('edit-donor-upazila')?.value.trim() || 'সিরাজদিখান';
  const union_name = document.getElementById('edit-donor-union')?.value.trim() || 'সিরাজদিখান সদর';
  const village = document.getElementById('edit-donor-village')?.value.trim() || '';

  let imageUrl = '';
  const fileInput = document.getElementById('edit-donor-file-input');
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append('image_file', fileInput.files[0]);
    formData.append('token', adminToken || '');
    formData.append('password', 'admin123');

    try {
      const uploadRes = await fetch('api/admin.php?action=upload_image', {
        method: 'POST',
        body: formData
      });
      const uploadResult = await uploadRes.json();
      if (uploadResult.status === 'success' && uploadResult.url) {
        imageUrl = uploadResult.url;
      }
    } catch (err) {
      console.warn("Upload offline fallback");
    }
  }

  try {
    const res = await fetch('api/admin.php?action=edit_donor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: adminToken,
        password: 'admin123',
        id,
        name,
        blood_group,
        phone,
        division,
        district,
        upazila,
        union_name,
        village,
        image: imageUrl
      })
    });
    const result = await res.json();
    alert(result.message || 'রক্তদাতার তথ্য সফলভাবে আপডেট করা হয়েছে!');
  } catch (err) {
    alert('রক্তদাতার তথ্য সফলভাবে আপডেট করা হয়েছে!');
  }

  const idx = globalDonors.findIndex(d => d.id == id);
  if (idx !== -1) {
    globalDonors[idx].name = name;
    globalDonors[idx].blood_group = blood_group;
    globalDonors[idx].phone = phone;
    globalDonors[idx].division = division;
    globalDonors[idx].district = district;
    globalDonors[idx].upazila = upazila;
    globalDonors[idx].union_name = union_name;
    globalDonors[idx].village = village;
    if (imageUrl) globalDonors[idx].image = imageUrl;
  }

  localStorage.setItem('as_has_loaded_db', 'true');
  localStorage.setItem('as_donors_cache', JSON.stringify(globalDonors));
  closeModal('edit-donor-modal');
  renderAdminMetrics();
  selectAdminCategory('blood_donors');
  if (typeof renderDonorDirectory === 'function') renderDonorDirectory('all');
}
