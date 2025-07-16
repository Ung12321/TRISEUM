// 스플래시 스크린 관리
document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splash-screen');
    
    // 3초 후 스플래시 스크린 제거
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 3000);
});

// 페이지 상태 관리
// 전역 변수
let isAdminLoggedIn = false;
const adminCredentials = { id: 'Santa', password: '123456' };

// 기존 봉사활동 기록 초기화 (한 번만 실행)
function clearExistingVolunteerData() {
    const hasCleared = localStorage.getItem('volunteer-data-cleared');
    if (!hasCleared) {
        localStorage.removeItem('volunteer-activities');
        localStorage.setItem('volunteer-data-cleared', 'true');
    }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    clearExistingVolunteerData(); // 기존 데이터 초기화
    setupNavigation();
    setupAdminModal();
    setupAdminPage();
    setupForms();
    loadStoredData();
    loadRequests();
}

// 네비게이션 설정
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 모든 네비게이션 아이템에서 active 클래스 제거
            navItems.forEach(nav => nav.classList.remove('active'));
            // 모든 페이지 숨기기
            pages.forEach(page => page.classList.remove('active'));
            
            // 클릭된 네비게이션 아이템에 active 클래스 추가
            this.classList.add('active');
            
            // 해당 페이지 표시
            const targetPageId = this.id.replace('-nav', '-page');
            const targetPage = document.getElementById(targetPageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }
        });
    });
}

// 관리자 모달 설정
function setupAdminModal() {
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('admin-modal');
    const closeBtn = document.querySelector('.close');
    const adminLoginForm = document.getElementById('admin-login-form');

    // 관리자 버튼 클릭
    adminBtn.addEventListener('click', function() {
        adminModal.style.display = 'block';
    });

    // 모달 닫기
    closeBtn.addEventListener('click', function() {
        adminModal.style.display = 'none';
    });

    // 모달 외부 클릭시 닫기
    window.addEventListener('click', function(e) {
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // 관리자 로그인 폼 제출
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('admin-id').value;
        const password = document.getElementById('admin-pw').value;
        
        if (id === adminCredentials.id && password === adminCredentials.password) {
            isAdminLoggedIn = true;
            adminModal.style.display = 'none';
            showAdminPage();
            document.getElementById('admin-login-form').reset();
        } else {
            alert('잘못된 관리자 정보입니다.');
        }
    });
}

// 관리자 페이지 설정
function setupAdminPage() {
    const adminPage = document.getElementById('admin-page');
    const logoutBtn = document.getElementById('logout-btn');
    const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
    const adminSections = document.querySelectorAll('.admin-section');

    // 로그아웃 버튼
    logoutBtn.addEventListener('click', function() {
        isAdminLoggedIn = false;
        adminPage.style.display = 'none';
    });

    // 관리자 네비게이션
    adminNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 버튼과 섹션에서 active 클래스 제거
            adminNavBtns.forEach(b => b.classList.remove('active'));
            adminSections.forEach(section => section.classList.remove('active'));
            
            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 해당 섹션 표시
            const targetSectionId = this.id.replace('-nav', '-section');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // 저장 버튼들
    document.getElementById('save-intro').addEventListener('click', function() {
        const content = document.getElementById('intro-editor').value;
        savePageContent('intro', content);
        showSuccessMessage('소개 페이지가 저장되었습니다.');
    });

    // 봉사활동 추가/수정 폼
    document.getElementById('add-volunteer-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const isEditing = this.dataset.editingId;
        
        if (isEditing) {
            // 수정 모드
            updateVolunteerActivity(isEditing, {
                date: document.getElementById('volunteer-date').value,
                title: document.getElementById('volunteer-title').value,
                content: document.getElementById('volunteer-content').value,
                image: document.getElementById('volunteer-image').value || null
            });
            cancelEdit();
        } else {
            // 추가 모드
            const volunteerData = {
                date: document.getElementById('volunteer-date').value,
                title: document.getElementById('volunteer-title').value,
                content: document.getElementById('volunteer-content').value,
                image: document.getElementById('volunteer-image').value || null,
                id: Date.now().toString()
            };
            
            addVolunteerActivity(volunteerData);
            this.reset();
            showSuccessMessage('새 봉사활동이 추가되었습니다.');
        }
    });
}

// 폼 설정
function setupForms() {
    // 도움 요청 폼
    const helpForm = document.getElementById('help-form');
    helpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            type: 'help',
            name: document.getElementById('help-name').value,
            phone: document.getElementById('help-phone').value,
            email: document.getElementById('help-email').value,
            reason: document.getElementById('help-reason').value,
            items: document.getElementById('help-items').value,
            timestamp: new Date().toLocaleString('ko-KR')
        };
        
        saveRequest(formData);
        helpForm.reset();
        showSuccessMessage('도움 요청이 성공적으로 전송되었습니다.');
    });

    // 후원 문의 폼
    const supportForm = document.getElementById('support-form');
    supportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            type: 'support',
            name: document.getElementById('support-name').value,
            phone: document.getElementById('support-phone').value,
            email: document.getElementById('support-email').value,
            supportType: document.getElementById('support-type').value,
            details: document.getElementById('support-details').value,
            timestamp: new Date().toLocaleString('ko-KR')
        };
        
        saveRequest(formData);
        supportForm.reset();
        showSuccessMessage('후원 문의가 성공적으로 전송되었습니다.');
    });
}

// 관리자 페이지 표시
function showAdminPage() {
    const adminPage = document.getElementById('admin-page');
    adminPage.style.display = 'block';
    loadAdminData();
    loadRequests();
}

// 관리자 데이터 로드
function loadAdminData() {
    // 소개 페이지 내용 로드
    const savedIntro = localStorage.getItem('intro-content');
    if (savedIntro) {
        document.getElementById('intro-editor').value = savedIntro;
    }

    // 봉사활동 목록 로드
    loadAdminVolunteerList();
}

// 저장된 데이터 로드
function loadStoredData() {
    // 소개 페이지 내용 적용
    const savedIntro = localStorage.getItem('intro-content');
    if (savedIntro) {
        updatePageContent('intro', savedIntro);
    }

    // 봉사활동 타임라인 로드
    loadVolunteerTimeline();
}

// 페이지 내용 저장
function savePageContent(pageType, content) {
    localStorage.setItem(`${pageType}-content`, content);
    updatePageContent(pageType, content);
}

// 페이지 내용 업데이트
function updatePageContent(pageType, content) {
    const pageElement = document.getElementById(`${pageType}-page`);
    if (pageElement) {
        const contentSection = pageElement.querySelector('.content-section');
        if (contentSection) {
            // HTML 태그를 보존하면서 내용 업데이트
            contentSection.innerHTML = content.replace(/\n/g, '<br>');
        }
    }
}

// 요청 저장
function saveRequest(requestData) {
    let requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests.push(requestData);
    localStorage.setItem('requests', JSON.stringify(requests));
    
    // 관리자가 로그인되어 있으면 실시간으로 요청 목록 업데이트
    if (isAdminLoggedIn) {
        loadRequests();
    }
}

// 요청 목록 로드
function loadRequests() {
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    const helpRequestsList = document.getElementById('help-requests-list');
    const supportRequestsList = document.getElementById('support-requests-list');
    
    if (!helpRequestsList || !supportRequestsList) return;

    // 도움 요청 목록 표시
    const helpRequests = requests.filter(req => req.type === 'help');
    helpRequestsList.innerHTML = '';
    
    if (helpRequests.length === 0) {
        helpRequestsList.innerHTML = '<p>등록된 도움 요청이 없습니다.</p>';
    } else {
        helpRequests.reverse().forEach(req => {
            const requestElement = createRequestElement(req);
            helpRequestsList.appendChild(requestElement);
        });
    }

    // 후원 문의 목록 표시
    const supportRequests = requests.filter(req => req.type === 'support');
    supportRequestsList.innerHTML = '';
    
    if (supportRequests.length === 0) {
        supportRequestsList.innerHTML = '<p>등록된 후원 문의가 없습니다.</p>';
    } else {
        supportRequests.reverse().forEach(req => {
            const requestElement = createRequestElement(req);
            supportRequestsList.appendChild(requestElement);
        });
    }
}

// 요청 요소 생성
function createRequestElement(request) {
    const div = document.createElement('div');
    div.className = 'request-item';
    
    if (request.type === 'help') {
        div.innerHTML = `
            <h5>${request.name}</h5>
            <p><strong>연락처:</strong> ${request.phone}</p>
            <p><strong>이메일:</strong> ${request.email}</p>
            <p><strong>도움이 필요한 이유:</strong><br>${request.reason}</p>
            <p><strong>도움이 필요한 항목:</strong><br>${request.items}</p>
            <p class="timestamp">${request.timestamp}</p>
        `;
    } else if (request.type === 'support') {
        div.innerHTML = `
            <h5>${request.name}</h5>
            <p><strong>연락처:</strong> ${request.phone}</p>
            <p><strong>이메일:</strong> ${request.email}</p>
            <p><strong>후원 유형:</strong> ${request.supportType}</p>
            <p><strong>후원 상세 내용:</strong><br>${request.details || '내용 없음'}</p>
            <p class="timestamp">${request.timestamp}</p>
        `;
    }
    
    return div;
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    // 현재 활성화된 페이지 또는 관리자 섹션 찾기
    const activePage = document.querySelector('.page.active');
    const activeAdminSection = document.querySelector('.admin-section.active');
    
    if (activeAdminSection) {
        activeAdminSection.insertBefore(messageDiv, activeAdminSection.firstChild);
    } else if (activePage) {
        activePage.insertBefore(messageDiv, activePage.firstChild);
    }
    
    // 3초 후 메시지 제거
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 봉사활동 추가
function addVolunteerActivity(volunteerData) {
    let activities = JSON.parse(localStorage.getItem('volunteer-activities') || '[]');
    activities.push(volunteerData);
    // 날짜 순으로 정렬 (최신 순)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('volunteer-activities', JSON.stringify(activities));
    
    loadVolunteerTimeline();
    if (isAdminLoggedIn) {
        loadAdminVolunteerList();
    }
}

// 봉사활동 삭제
function deleteVolunteerActivity(id) {
    if (confirm('이 봉사활동을 삭제하시겠습니까?')) {
        let activities = JSON.parse(localStorage.getItem('volunteer-activities') || '[]');
        activities = activities.filter(activity => activity.id !== id);
        localStorage.setItem('volunteer-activities', JSON.stringify(activities));
        
        loadVolunteerTimeline();
        loadAdminVolunteerList();
        showSuccessMessage('봉사활동이 삭제되었습니다.');
    }
}

// 봉사활동 수정
function editVolunteerActivity(id) {
    let activities = JSON.parse(localStorage.getItem('volunteer-activities') || '[]');
    const activity = activities.find(a => a.id === id);
    
    if (!activity) return;
    
    // 폼에 기존 데이터 채우기
    document.getElementById('volunteer-date').value = activity.date;
    document.getElementById('volunteer-title').value = activity.title;
    document.getElementById('volunteer-content').value = activity.content;
    document.getElementById('volunteer-image').value = activity.image || '';
    
    // 수정 모드로 전환
    const form = document.getElementById('add-volunteer-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const formTitle = form.parentElement.querySelector('h4');
    
    formTitle.textContent = '봉사활동 수정';
    submitBtn.textContent = '수정하기';
    
    // 취소 버튼 추가
    let cancelBtn = form.querySelector('.cancel-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'cancel-edit-btn admin-btn';
        cancelBtn.textContent = '취소';
        cancelBtn.onclick = cancelEdit;
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
    }
    
    // 폼에 수정할 ID 저장
    form.dataset.editingId = id;
    
    // 폼 위치로 스크롤
    form.scrollIntoView({ behavior: 'smooth' });
}

// 수정 모드 취소
function cancelEdit() {
    const form = document.getElementById('add-volunteer-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const formTitle = form.parentElement.querySelector('h4');
    const cancelBtn = form.querySelector('.cancel-edit-btn');
    
    formTitle.textContent = '새 봉사활동 추가';
    submitBtn.textContent = '추가하기';
    
    if (cancelBtn) {
        cancelBtn.remove();
    }
    
    delete form.dataset.editingId;
    form.reset();
}

// 봉사활동 수정 업데이트
function updateVolunteerActivity(id, updatedData) {
    let activities = JSON.parse(localStorage.getItem('volunteer-activities') || '[]');
    const index = activities.findIndex(activity => activity.id === id);
    
    if (index !== -1) {
        activities[index] = { ...activities[index], ...updatedData };
        
        // 날짜순으로 정렬 (최신순)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('volunteer-activities', JSON.stringify(activities));
        
        loadVolunteerTimeline();
        loadAdminVolunteerList();
        showSuccessMessage('봉사활동이 수정되었습니다.');
    }
}

// 봉사활동 타임라인 로드
function loadVolunteerTimeline() {
    const activities = JSON.parse(localStorage.getItem('volunteer-activities') || '[]');
    const timeline = document.getElementById('volunteer-timeline');
    
    if (!timeline) return;
    
    if (activities.length === 0) {
        // 기본 샘플 데이터가 이미 HTML에 있으므로 그대로 둠
        return;
    }
    
    timeline.innerHTML = '';
    
    activities.forEach(activity => {
        const timelineItem = createTimelineItem(activity);
        timeline.appendChild(timelineItem);
    });
}

// 타임라인 아이템 생성
function createTimelineItem(activity) {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    
    const formattedDate = formatDate(activity.date);
    const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f8ff'/%3E%3Ctext x='150' y='100' text-anchor='middle' font-size='14' fill='%23666'%3E사진이 여기에 표시됩니다%3C/text%3E%3C/svg%3E";
    
    div.innerHTML = `
        <div class="timeline-date">${formattedDate}</div>
        <div class="timeline-content">
            <h4>${activity.title}</h4>
            <p>${activity.content}</p>
            <div class="timeline-image">
                <img src="${activity.image || defaultImage}" alt="봉사활동 사진" onerror="this.src='${defaultImage}'">
            </div>
        </div>
    `;
    
    return div;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}`;
}

// 관리자 봉사활동 목록 로드
function loadAdminVolunteerList() {
    const activities = JSON.parse(localStorage.getItem('volunteer-activities') || '[]');
    const listContainer = document.getElementById('admin-volunteer-list');
    
    if (!listContainer) return;
    
    if (activities.length === 0) {
        listContainer.innerHTML = '<p>등록된 봉사활동이 없습니다.</p>';
        return;
    }
    
    listContainer.innerHTML = '';
    
    activities.forEach(activity => {
        const activityElement = createAdminVolunteerItem(activity);
        listContainer.appendChild(activityElement);
    });
}

// 관리자용 봉사활동 아이템 생성
function createAdminVolunteerItem(activity) {
    const div = document.createElement('div');
    div.className = 'admin-volunteer-item';
    
    const formattedDate = formatDate(activity.date);
    
    div.innerHTML = `
        <div class="volunteer-admin-buttons">
            <button class="edit-volunteer-btn" onclick="editVolunteerActivity('${activity.id}')">수정</button>
            <button class="delete-volunteer-btn" onclick="deleteVolunteerActivity('${activity.id}')">삭제</button>
        </div>
        <div class="volunteer-date-display">${formattedDate}</div>
        <h5>${activity.title}</h5>
        <p><strong>내용:</strong> ${activity.content}</p>
        <p><strong>사진:</strong> ${activity.image ? '등록됨' : '기본 이미지 사용'}</p>
    `;
    
    return div;
}

// 페이지 로드시 요청 목록 새로고침 (관리자가 확인할 수 있도록)
setInterval(() => {
    if (isAdminLoggedIn && document.getElementById('admin-requests-section').classList.contains('active')) {
        loadRequests();
    }
}, 5000); // 5초마다 새로고침 