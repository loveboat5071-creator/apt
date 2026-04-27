// Initialize Lucide icons
lucide.createIcons();

// State Management
let masterDB = JSON.parse(localStorage.getItem('aptMasterDB')) || [];
let filteredData = [];
let ageChart = null;

// Mock Data if empty
function loadMockData() {
    if (masterDB.length === 0) {
        masterDB = [
            { id: 1, name: '강남 에이아이 아파트', city: '서울특별시', district: '강남구', households: 1200, type: 'focus', ages: { '10대': 150, '20대': 200, '30대': 400, '40대': 300, '50대': 100, '60대+': 50 } },
            { id: 2, name: '분당 판교 테크팰리스', city: '경기도', district: '성남시', households: 850, type: 'town', ages: { '10대': 100, '20대': 150, '30대': 300, '40대': 200, '50대': 80, '60대+': 20 } },
            { id: 3, name: '서초 더블류 클라우드', city: '서울특별시', district: '서초구', households: 2100, type: 'focus', ages: { '10대': 300, '20대': 400, '30대': 600, '40대': 500, '50대': 200, '60대+': 100 } },
            { id: 4, name: '영등포 스카이 트리', city: '서울특별시', district: '영등포구', households: 500, type: 'town', ages: { '10대': 50, '20대': 100, '30대': 150, '40대': 100, '50대': 70, '60대+': 30 } }
        ];
        localStorage.setItem('aptMasterDB', JSON.stringify(masterDB));
    }
}

// UI Elements
const citySelect = document.getElementById('city-select');
const districtSelect = document.getElementById('district-select');
const typeSelect = document.getElementById('type-select');
const aptList = document.getElementById('apt-list');
const adminToggleBtn = document.getElementById('admin-toggle-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminView = document.getElementById('admin-view');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const saveDbBtn = document.getElementById('save-db-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Chart Colors
const chartColors = [
    '#6366f1', '#2dd4bf', '#fbbf24', '#f87171', '#a78bfa', '#94a3b8'
];

// Initialize
function init() {
    loadMockData();
    updateDistricts();
    filterAndRender();
}

// Update District Select options based on City
function updateDistricts() {
    const selectedCity = citySelect.value;
    const districts = [...new Set(masterDB
        .filter(item => selectedCity === 'all' || item.city === selectedCity)
        .map(item => item.district))].sort();

    districtSelect.innerHTML = '<option value="all">전체</option>';
    districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        districtSelect.appendChild(opt);
    });
}

// Filtering Logic
function filterAndRender() {
    const city = citySelect.value;
    const district = districtSelect.value;
    const type = typeSelect.value;

    filteredData = masterDB.filter(item => {
        const matchCity = city === 'all' || item.city === city;
        const matchDistrict = district === 'all' || item.district === district;
        const matchType = type === 'all' || item.type === type;
        return matchCity && matchDistrict && matchType;
    });

    renderStats();
    renderCharts();
    renderList();
}

// Render Stats
function renderStats() {
    const totalComplexes = filteredData.length;
    const totalHouseholds = filteredData.reduce((sum, item) => sum + (item.households || 0), 0);
    
    // Calculate major age group
    const ageTotals = { '10대': 0, '20대': 0, '30대': 0, '40대': 0, '50대': 0, '60대+': 0 };
    filteredData.forEach(item => {
        Object.keys(ageTotals).forEach(age => {
            ageTotals[age] += (item.ages[age] || 0);
        });
    });
    
    let mainAge = '-';
    let maxVal = -1;
    Object.entries(ageTotals).forEach(([age, val]) => {
        if (val > maxVal) { maxVal = val; mainAge = age; }
    });

    document.getElementById('stat-total-complexes').textContent = totalComplexes.toLocaleString();
    document.getElementById('stat-total-households').textContent = totalHouseholds.toLocaleString();
    document.getElementById('stat-main-age').textContent = mainAge;
}

// Render Chart
function renderCharts() {
    const ctx = document.getElementById('age-chart').getContext('2d');
    
    const ageTotals = { '10대': 0, '20대': 0, '30대': 0, '40대': 0, '50대': 0, '60대+': 0 };
    filteredData.forEach(item => {
        Object.keys(ageTotals).forEach(age => {
            ageTotals[age] += (item.ages[age] || 0);
        });
    });

    if (ageChart) ageChart.destroy();

    ageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ageTotals),
            datasets: [{
                data: Object.values(ageTotals),
                backgroundColor: chartColors,
                borderWidth: 0,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 20, font: { family: 'Inter' } }
                }
            },
            cutout: '70%'
        }
    });
}

// Render List
function renderList() {
    aptList.innerHTML = '';
    if (filteredData.length === 0) {
        aptList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 2rem;">검색 결과가 없습니다.</p>';
        return;
    }

    filteredData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'apt-card';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div class="name">${item.name}</div>
                    <div class="details">${item.city} ${item.district} | ${item.households}세대</div>
                </div>
                <span style="font-size: 0.65rem; padding: 0.25rem 0.5rem; background: ${item.type==='focus'?'#6366f133':'#2dd4bf33'}; color: ${item.type==='focus'?'#818cf8':'#2dd4bf'}; border-radius: 4px; font-weight: 700;">
                    ${item.type.toUpperCase()}
                </span>
            </div>
        `;
        aptList.appendChild(div);
    });
}

// Admin Logic
adminToggleBtn.onclick = () => adminView.classList.add('active');
closeAdminBtn.onclick = () => adminView.classList.remove('active');

dropZone.onclick = () => fileInput.click();
dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
dropZone.ondragleave = () => dropZone.classList.remove('dragover');
dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
};

fileInput.onchange = (e) => handleFile(e.target.files[0]);

let pendingData = [];
// Flexible column mapping
function getColumnValue(row, possibleNames) {
    for (const name of possibleNames) {
        if (row[name] !== undefined) return row[name];
    }
    return null;
}

// Normalize region names (e.g., "인천광역시" -> "인천")
function normalizeRegion(str) {
    if (!str) return '';
    return str.toString().trim().replace(/특별시|광역시|특별자치시|특별자치도|$/g, '');
}

function handleFile(file) {
    if (!file) return;
    document.getElementById('file-name').textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        
        pendingData = rows.map((row, index) => {
            const cityName = getColumnValue(row, ['시도', '광역', '지역', '시/도', '주소1', 'addr1']) || '기타';
            const districtName = getColumnValue(row, ['시군구', '기초', '구군', '시/군/구', '주소2', 'addr2']) || '전체';
            const aptName = getColumnValue(row, ['단지명', '아파트명', '현장명', '단지', '아파트']) || '알 수 없음';
            const householdCount = parseInt(getColumnValue(row, ['세대수', '세대', '가구수']) || 0);
            
            // Detection for Focus/Town
            const typeStr = (JSON.stringify(row)).toLowerCase();
            let type = 'focus';
            if (typeStr.includes('town') || typeStr.includes('타운')) type = 'town';

            return {
                id: Date.now() + index,
                name: aptName,
                city: cityName,
                district: districtName,
                households: householdCount,
                type: type,
                ages: {
                    '10대': parseInt(getColumnValue(row, ['10대', 'youth', 'age10']) || 0),
                    '20대': parseInt(getColumnValue(row, ['20대', 'age20']) || 0),
                    '30대': parseInt(getColumnValue(row, ['30대', 'age30']) || 0),
                    '40대': parseInt(getColumnValue(row, ['40대', 'age40']) || 0),
                    '50대': parseInt(getColumnValue(row, ['50대', 'age50']) || 0),
                    '60대+': parseInt(getColumnValue(row, ['60대', 'age60']) || 0)
                }
            };
        });

        document.getElementById('row-count').textContent = `${pendingData.length} rows detected`;
        document.getElementById('upload-status').style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
}

saveDbBtn.onclick = () => {
    if (pendingData.length === 0) return;
    masterDB = pendingData;
    localStorage.setItem('aptMasterDB', JSON.stringify(masterDB));
    alert('DB가 성공적으로 업데이트되었습니다.');
    adminView.classList.remove('active');
    updateDistricts();
    filterAndRender();
};

// Update District Select options based on City
function updateDistricts() {
    const selectedCity = citySelect.value;
    const districts = [...new Set(masterDB
        .filter(item => selectedCity === 'all' || item.city === selectedCity || normalizeRegion(item.city) === normalizeRegion(selectedCity))
        .map(item => item.district))]
        .filter(d => d && d !== '전체')
        .sort();

    districtSelect.innerHTML = '<option value="all">전체</option>';
    districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        districtSelect.appendChild(opt);
    });
}

// Filtering Logic
function filterAndRender() {
    const city = citySelect.value;
    const district = districtSelect.value;
    const type = typeSelect.value;

    filteredData = masterDB.filter(item => {
        const matchCity = city === 'all' || item.city === city || normalizeRegion(item.city) === normalizeRegion(city);
        const matchDistrict = district === 'all' || item.district === district;
        const matchType = type === 'all' || item.type === type;
        return matchCity && matchDistrict && matchType;
    });
