/**
 * 접근성 기능
 * 노인 사용자를 위한 접근성 개선 기능
 */

// 접근성 초기화
function initAccessibility() {
    applyFontSize();
    applyHighContrast();
    applyTheme();
    setupAccessibilityShortcuts();
    initVoiceGuide();
    manageFocus();
    ensureLargeTouchTargets();

    console.log('접근성 기능이 초기화되었습니다.');
}

// 글자 크기 조절
function changeFontSize(size, showNotification = true) {
    const sizes = {
        'normal': '16px',
        'large': '20px',
        'xlarge': '24px'
    };

    document.documentElement.style.setProperty('--base-font-size', sizes[size]);

    // body 클래스 업데이트
    document.body.classList.remove('text-normal', 'text-large', 'text-xlarge');
    document.body.classList.add(`text-${size}`);

    window.eumeSettings.textSize = size;
    saveUserSettings();

    // 알림 표시 여부 제어
    if (showNotification) {
        showToast(`글자 크기: ${size === 'normal' ? '보통' : size === 'large' ? '크게' : '매우 크게'}`);
    }
}

function applyFontSize() {
    if (window.eumeSettings && window.eumeSettings.textSize) {
        changeFontSize(window.eumeSettings.textSize, false);
    }
}

// 고대비 모드
function toggleHighContrast() {
    const enabled = !window.eumeSettings.highContrast;

    if (enabled) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }

    window.eumeSettings.highContrast = enabled;
    saveUserSettings();

    showToast(enabled ? '고대비 모드 켜짐' : '고대비 모드 꺼짐');
}

function applyHighContrast() {
    if (window.eumeSettings && window.eumeSettings.highContrast) {
        document.body.classList.add('high-contrast');
    }
}

// 테마 적용
function applyTheme() {
    if (window.eumeSettings && window.eumeSettings.theme) {
        const theme = window.eumeSettings.theme;
        document.body.classList.remove('theme-ocean', 'theme-sunset', 'theme-forest', 'theme-lavender', 'theme-rose');
        document.body.classList.add(`theme-${theme}`);
    }
}

// 음성 안내
function toggleVoiceGuide() {
    const enabled = !window.eumeSettings.voiceGuide;
    window.eumeSettings.voiceGuide = enabled;
    saveUserSettings();

    if (enabled) {
        speakText('음성 안내가 켜졌습니다');
    }

    showToast(enabled ? '음성 안내 켜짐' : '음성 안내 꺼짐');
}

function initVoiceGuide() {
    if (window.eumeSettings && window.eumeSettings.voiceGuide) {
        // 버튼 호버 시 음성 안내
        document.querySelectorAll('button:not(.no-voice)').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const label = btn.getAttribute('aria-label') || btn.textContent.trim();
                if (label && label.length < 50) {
                    speakText(label);
                }
            });
        });

        // 링크 호버 시 음성 안내
        document.querySelectorAll('a:not(.no-voice)').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const label = link.getAttribute('aria-label') || link.textContent.trim();
                if (label && label.length < 50) {
                    speakText(label);
                }
            });
        });
    }
}

function speakText(text) {
    if (!window.eumeSettings || !window.eumeSettings.voiceGuide) return;
    if (!('speechSynthesis' in window)) return;

    // 이전 음성 중단
    speechSynthesis.cancel();

    // 이모지 및 특수문자 제거
    const cleanText = text.replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ').trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8; // 천천히 말하기
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
}

// 접근성 단축키
function setupAccessibilityShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + 키 조합
        if (e.altKey) {
            switch(e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    increaseFontSize();
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    decreaseFontSize();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    toggleHighContrast();
                    break;
                case 'v':
                case 'V':
                    e.preventDefault();
                    toggleVoiceGuide();
                    break;
            }
        }
    });
}

// 글자 크기 증가/감소
function increaseFontSize() {
    const sizes = ['normal', 'large', 'xlarge'];
    const currentSize = window.eumeSettings.textSize || 'large';
    const currentIndex = sizes.indexOf(currentSize);
    if (currentIndex < sizes.length - 1) {
        changeFontSize(sizes[currentIndex + 1]);
    } else {
        showToast('이미 최대 크기입니다');
    }
}

function decreaseFontSize() {
    const sizes = ['normal', 'large', 'xlarge'];
    const currentSize = window.eumeSettings.textSize || 'large';
    const currentIndex = sizes.indexOf(currentSize);
    if (currentIndex > 0) {
        changeFontSize(sizes[currentIndex - 1]);
    } else {
        showToast('이미 최소 크기입니다');
    }
}

// 포커스 관리
function manageFocus() {
    // Tab 키 네비게이션 개선
    const focusableElements = document.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((el, index) => {
        el.addEventListener('focus', () => {
            el.classList.add('focused');

            // 포커스된 요소가 화면에 보이도록 스크롤
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            if (window.eumeSettings && window.eumeSettings.voiceGuide) {
                const label = el.getAttribute('aria-label') || el.textContent.trim();
                if (label && label.length < 50) {
                    speakText(label);
                }
            }
        });

        el.addEventListener('blur', () => {
            el.classList.remove('focused');
        });
    });
}

// 큰 터치 영역 확보
function ensureLargeTouchTargets() {
    document.querySelectorAll('button, a').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height < 44 || rect.width < 44) {
            el.style.minHeight = '44px';
            el.style.padding = el.style.padding || '8px 12px';
        }
    });
}

// 페이지 로드 시 접근성 적용
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.eumeSettings) {
            initAccessibility();
        }
    });
} else {
    if (window.eumeSettings) {
        initAccessibility();
    }
}

// 전역 객체로 내보내기
window.EumeAccessibility = {
    init: initAccessibility,
    changeFontSize: changeFontSize,
    toggleHighContrast: toggleHighContrast,
    toggleVoiceGuide: toggleVoiceGuide,
    speakText: speakText,
    increaseFontSize: increaseFontSize,
    decreaseFontSize: decreaseFontSize
};
