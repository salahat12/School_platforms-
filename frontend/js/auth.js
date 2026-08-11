let currentUser = null;

async function checkAuth() {
    try {
        const data = await apiClient.get('/api/auth/me');
        currentUser = data.user;
        return currentUser;
    } catch {
        currentUser = null;
        return null;
    }
}

function getUser() { return currentUser; }
function isAdmin() { return currentUser?.role === 'admin'; }
function isTeacher() { return currentUser?.role === 'teacher'; }

async function logout() {
    await apiClient.post('/api/auth/logout');
    currentUser = null;
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    updateNav();
});

function updateNav() {
    const nav = document.querySelector('.main-nav');
    const userMenu = document.querySelector('.user-menu');
    if (!nav || !userMenu) return;
    
    let navHTML = `
        <a href="/" class="nav-link">الرئيسية</a>
        <a href="/grades" class="nav-link">الصفوف</a>
        <a href="/chat-ai" class="nav-link">الذكاء الاصطناعي</a>
        <a href="/about" class="nav-link">عن المدرسة</a>
    `;
    
    if (currentUser) {
        if (isAdmin()) {
            navHTML += `<a href="/admin-dashboard" class="nav-link">لوحة التحكم</a>`;
        } else if (isTeacher()) {
            navHTML += `<a href="/teacher-dashboard" class="nav-link">ملفي</a>`;
        }
        userMenu.innerHTML = `
            <span class="user-name">${currentUser.full_name}</span>
            <span class="user-role">${isAdmin() ? 'مدير' : 'معلمة'}</span>
            <button class="btn-logout" onclick="logout()">خروج</button>
        `;
    } else {
        navHTML += `<a href="/login" class="nav-link">تسجيل الدخول</a>`;
        userMenu.innerHTML = '';
    }
    
    nav.innerHTML = navHTML;
}
