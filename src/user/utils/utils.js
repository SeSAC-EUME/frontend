/**
 * 공통 유틸리티 함수
 */

// 날짜/시간 유틸리티
const DateUtils = {
    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    },

    formatTime(date) {
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    },

    formatDateTime(date) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return new Intl.DateTimeFormat('ko-KR', options).format(date);
    },

    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    },

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },

    getDayOfWeek(date) {
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return days[date.getDay()];
    }
};

// 문자열 유틸리티
const StringUtils = {
    truncate(str, length) {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    removeHtml(str) {
        const tmp = document.createElement('div');
        tmp.innerHTML = str;
        return tmp.textContent || tmp.innerText || '';
    },

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    unescapeHtml(text) {
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        };
        return text.replace(/&[^;]+;/g, m => map[m] || m);
    },

    toKoreanNumber(num) {
        if (num < 10000) return num.toLocaleString('ko-KR');

        const units = ['', '만', '억', '조'];
        const result = [];
        let unitIndex = 0;

        while (num > 0) {
            const part = num % 10000;
            if (part > 0) {
                result.unshift(part.toLocaleString('ko-KR') + units[unitIndex]);
            }
            num = Math.floor(num / 10000);
            unitIndex++;
        }

        return result.join(' ');
    }
};

// 저장소 유틸리티
const StorageUtils = {
    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('저장 실패:', e);
            return false;
        }
    },

    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('로드 실패:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('삭제 실패:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('초기화 실패:', e);
            return false;
        }
    },

    has(key) {
        return localStorage.getItem(key) !== null;
    },

    keys() {
        return Object.keys(localStorage);
    }
};

// 검증 유틸리티
const ValidationUtils = {
    isEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isPhone(phone) {
        const re = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
        return re.test(phone);
    },

    isKorean(text) {
        const re = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        return re.test(text);
    },

    isEmpty(value) {
        return value === null || value === undefined || value === '';
    },

    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },

    isInRange(value, min, max) {
        const num = parseFloat(value);
        return num >= min && num <= max;
    }
};

// 배열 유틸리티
const ArrayUtils = {
    unique(arr) {
        return [...new Set(arr)];
    },

    shuffle(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    },

    groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }
};

// 플랫폼 감지
const PlatformUtils = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },

    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    },

    isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    },

    isChrome() {
        return /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);
    },

    isTablet() {
        return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
    }
};

// 디바운스
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 쓰로틀
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 딥 카피
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) {
        const copy = [];
        for (let i = 0; i < obj.length; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }
    if (obj instanceof Object) {
        const copy = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = deepCopy(obj[key]);
            }
        }
        return copy;
    }
}

// UUID 생성
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 랜덤 색상 생성
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFB6C1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 숫자 포맷팅
function formatNumber(num) {
    return num.toLocaleString('ko-KR');
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 쿠키 유틸리티
const CookieUtils = {
    set(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },

    get(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    },

    remove(name) {
        this.set(name, '', -1);
    }
};

// URL 유틸리티
const URLUtils = {
    getParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    getAllParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    },

    setParam(name, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    removeParam(name) {
        const url = new URL(window.location.href);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }
};

// 내보내기
window.Utils = {
    Date: DateUtils,
    String: StringUtils,
    Storage: StorageUtils,
    Validation: ValidationUtils,
    Array: ArrayUtils,
    Platform: PlatformUtils,
    Cookie: CookieUtils,
    URL: URLUtils,
    debounce,
    throttle,
    deepCopy,
    generateUUID,
    getRandomColor,
    formatNumber,
    formatFileSize
};
