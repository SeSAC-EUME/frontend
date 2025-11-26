// ==================== 관리자 공통 스크립트 ====================

(function() {
    'use strict';

    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // 인증 확인
        checkAuthentication();

        // 사용자 정보 표시
        loadUserInfo();

        // 이벤트 리스너 설정
        setupEventListeners();

        // 세션 자동 만료 체크
        startSessionCheck();
    }

    // 인증 확인
    function checkAuthentication() {
        const currentUser = localStorage.getItem('eume_admin_user');
        const sessionExpiry = localStorage.getItem('eume_admin_session_expiry');

        if (!currentUser || !sessionExpiry) {
            // 로그인되지 않음
            window.location.href = 'login.html';
            return;
        }

        const now = Date.now();
        if (now >= parseInt(sessionExpiry)) {
            // 세션 만료
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('eume_admin_user');
            localStorage.removeItem('eume_admin_session_expiry');
            window.location.href = 'login.html';
            return;
        }
    }

    // 사용자 정보 로드
    function loadUserInfo() {
        const currentUser = localStorage.getItem('eume_admin_user');
        if (currentUser) {
            const userData = JSON.parse(currentUser);

            // 사용자 이름 표시
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = userData.name;
            }

            // 소속 기관 표시
            const userOrgElement = document.getElementById('userOrg');
            if (userOrgElement) {
                userOrgElement.textContent = userData.role;
            }
        }
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
        // 사이드바 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('adminSidebar');
            const menuToggle = document.getElementById('menuToggle');

            if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        // 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const userInfo = document.querySelector('.user-info');

            if (dropdown && !dropdown.contains(e.target) && !userInfo.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    // 세션 자동 만료 체크 (1분마다)
    function startSessionCheck() {
        setInterval(() => {
            const sessionExpiry = localStorage.getItem('eume_admin_session_expiry');
            if (sessionExpiry) {
                const now = Date.now();
                const timeLeft = parseInt(sessionExpiry) - now;

                // 5분 전 경고
                if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
                    const minutes = Math.floor(timeLeft / 60000);
                    console.log(`세션이 ${minutes}분 후 만료됩니다.`);
                }

                // 세션 만료
                if (timeLeft <= 0) {
                    alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                    localStorage.removeItem('eume_admin_user');
                    localStorage.removeItem('eume_admin_session_expiry');
                    window.location.href = 'login.html';
                }
            }
        }, 60000); // 1분마다 체크
    }

})();

// ==================== 전역 함수 ====================

// 사이드바 토글
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// 사용자 드롭다운 토글
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// 알림 토글
function toggleNotifications() {
    alert('알림 기능은 추후 구현됩니다.');
}

// 대시보드 새로고침
function refreshDashboard() {
    alert('데이터를 새로고침합니다...');
    window.location.reload();
}

// 보고서 다운로드
function downloadReport() {
    alert('보고서 다운로드 기능은 추후 구현됩니다.');
}

// 사용자 상세 보기
function viewUserDetail(userId) {
    // Step 15에서 구현될 예정
    alert(`사용자 ID ${userId}의 상세 정보를 확인합니다.\n이 기능은 Step 15에서 구현됩니다.`);
}

// 로그아웃
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('eume_admin_user');
        localStorage.removeItem('eume_admin_session_expiry');
        window.location.href = 'login.html';
    }
}
