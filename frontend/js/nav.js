function toggleMobileMenu() {
    document.querySelector('.main-nav').classList.toggle('open');
}

function renderHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    header.innerHTML = `
        <div class="container">
                <a href="/" class="logo">
                <img src="/assets/logo.jpg" alt="شعار المدرسة" class="logo-img"/>
                <div class="logo-text">
                    <span class="school-name">البيرة الاساسية المختلطه</span>
                    <span class="school-tag">Al-Bireh Primary Mixed School</span>
                </div>
            </a>
            <nav class="main-nav">
                <a class="nav-link" href="/">الرئيسية</a>
                <a class="nav-link" href="/grades">الصفوف</a>
                <a class="nav-link" href="/about">عن المدرسة</a>
            </nav>
            <div class="user-menu"></div>
            <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
        </div>
    `;

    if (typeof updateNav === 'function') updateNav();
}

document.addEventListener('DOMContentLoaded', renderHeader);
