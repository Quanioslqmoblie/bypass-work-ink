(function () {
    'use strict';

    const host = location.hostname;
    const debug = true;

    let currentLanguage = localStorage.getItem('lang') || 'vi';

    // Translations - ĐÃ ĐỔI TÊN
    const translations = {
        vi: {
            title: "Tool của Quân",
            pleaseSolveCaptcha: "Vui lòng giải CAPTCHA để tiếp tục",
            captchaSuccess: "CAPTCHA đã thành công",
            redirectingToWork: "Đang qua Work.ink...",
            bypassSuccessCopy: "Bypass thành công, đã Copy Key (bấm 'Cho Phép' nếu có)",
            waitingCaptcha: "Đang chờ CAPTCHA...",
            pleaseReload: "Vui lòng tải lại trang...(workink lỗi)",
            bypassSuccess: "Bypass thành công, chờ {time}s...",
            backToCheckpoint: "Đang về lại Checkpoint...",
            captchaSuccessBypassing: "CAPTCHA đã thành công, đang bypass...",
            version: "Phiên bản v1.6.2.3",
            madeBy: "Được tạo bởi Quân (dựa trên DyRian & IHaxU)"
        },
        en: {
            title: "Quan's Tool",
            pleaseSolveCaptcha: "Please solve the CAPTCHA to continue",
            captchaSuccess: "CAPTCHA solved successfully",
            redirectingToWork: "Redirecting to Work.ink...",
            bypassSuccessCopy: "Bypass successful! Key copied (click 'Allow' if prompted)",
            waitingCaptcha: "Waiting for CAPTCHA...",
            pleaseReload: "Please reload the page...(workink bugs)",
            bypassSuccess: "Bypass successful, waiting {time}s...",
            backToCheckpoint: "Returning to checkpoint...",
            captchaSuccessBypassing: "CAPTCHA solved successfully, bypassing...",
            version: "Version v1.6.2.3",
            madeBy: "Made by Quân (based on DyRian & IHaxU)"
        }
    };

    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return text;
    }

    // Bypass Panel (UI) - ĐÃ NÂNG CẤP ANIMATION
    class BypassPanel {
        constructor() {
            this.container = null;
            this.shadow = null;
            this.panel = null;
            this.statusText = null;
            this.statusDot = null;
            this.versionEl = null;
            this.creditEl = null;
            this.langBtns = [];
            this.currentMessageKey = null;
            this.currentType = 'info';
            this.currentReplacements = {};
            this.isMinimized = false;
            this.body = null;
            this.minimizeBtn = null;
            this.init();
        }

        init() {
            this.createPanel();
            this.setupEventListeners();
        }

        createPanel() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'closed' });

            const style = document.createElement('style');
            style.textContent = `
                * { margin: 0; padding: 0; box-sizing: border-box; }

                .panel-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 420px;
                    z-index: 2147483647;
                    font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                    pointer-events: auto;
                }

                .panel {
                    background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #302b63 100%);
                    border-radius: 20px;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.6),
                        0 0 30px rgba(102, 63, 255, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    animation: slideInGlow 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(102, 63, 255, 0.3);
                }

                @keyframes slideInGlow {
                    0% {
                        opacity: 0;
                        transform: translateX(80px) scale(0.92);
                        box-shadow: 0 0 0 rgba(102, 63, 255, 0);
                    }
                    60% {
                        opacity: 1;
                        transform: translateX(-8px) scale(1.02);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                        box-shadow: 
                            0 20px 40px rgba(0, 0, 0, 0.6),
                            0 0 30px rgba(102, 63, 255, 0.2),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    }
                }

                .header {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    padding: 18px 22px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    backdrop-filter: blur(10px);
                }

                .header::before {
                    content: '';
                    position: absolute;
                    top: -100%;
                    left: -100%;
                    width: 300%;
                    height: 300%;
                    background: linear-gradient(60deg, transparent, rgba(255, 255, 255, 0.15), transparent);
                    animation: shineFlow 4s infinite ease-in-out;
                    pointer-events: none;
                }

                @keyframes shineFlow {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(30deg); }
                }

                .title {
                    font-size: 22px;
                    font-weight: 800;
                    color: #fff;
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                    letter-spacing: 0.5px;
                    position: relative;
                    z-index: 1;
                    background: linear-gradient(90deg, #fff, #a0e7ff);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .minimize-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: #fff;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 22px;
                    font-weight: 700;
                    position: relative;
                    z-index: 1;
                    backdrop-filter: blur(5px);
                }

                .minimize-btn:hover {
                    background: rgba(255, 255, 255, 0.35);
                    transform: scale(1.15) rotate(90deg);
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
                    border-color: #fff;
                }

                .status-section {
                    padding: 22px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .status-box {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 18px;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(8px);
                }

                .status-box::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
                    animation: shimmerGlow 2.5s infinite;
, pulseGlow 3s infinite;
                }

                @keyframes shimmerGlow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }

                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 5px rgba(102, 63, 255, 0); }
                    50% { box-shadow: 0 0 20px rgba(102, 63, 255, 0.3); }
                }

                .status-content {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    position: relative;
                    z-index: 1;
                }

                .status-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    animation: pulseDot 1.8s ease-in-out infinite;
                    box-shadow: 0 0 16px currentColor;
                    flex-shrink: 0;
                    position: relative;
                }

                .status-dot::after {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    background: currentColor;
                    opacity: 0.3;
                    transform: translate(-50%, -50%) scale(0);
                    animation: ripple 2s infinite;
                }

                @keyframes pulseDot {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.7; }
                }

                @keyframes ripple {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
                    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                }

                .status-dot.info { background: #5eead4; }
                .status-dot.success { background: #34d399; }
                .status-dot.warning { background: #fbbf24; }
                .status-dot.error { background: #f87171; }

                .status-text {
                    color: #fff;
                    font-size: 15px;
                    font-weight: 600;
                    flex: 1;
                    line-height: 1.5;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                .panel-body {
                    max-height: 500px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 1;
                }

                .panel-body.hidden {
                    max-height: 0;
                    opacity: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                    margin: 0;
                }

                .language-section {
                    padding: 18px 22px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .lang-toggle {
                    display: flex;
                    gap: 12px;
                }

                .lang-btn {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1.5px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    backdrop-filter: blur(5px);
                }

                .lang-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    border-color: #6a11cb;
                }

                .lang-btn.active {
                    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                    border-color: transparent;
                    box-shadow: 0 0 20px rgba(106, 17, 203, 0.6), 0 6px 15px rgba(0, 0, 0, 0.3);
                    transform: translateY(-1px);
                }

                .info-section {
                    padding: 18px 22px;
                    background: rgba(0, 0, 0, 0.25);
                    backdrop-filter: blur(8px);
                }

                .version, .credit {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12.5px;
                    font-weight: 500;
                    text-align: center;
                    margin-bottom: 6px;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                .credit-author {
                    color: #6a11cb;
                    font-weight: 800;
                    background: linear-gradient(90deg, #6a11cb, #2575fc);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .links {
                    display: flex;
                    justify-content: center;
                    gap: 18px;
                    margin-top: 10px;
                    font-size: 11.5px;
                }

                .links a {
                    color: #a0e7ff;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    padding: 4px 8px;
                    border-radius: 6px;
                }

                .links a:hover {
                    color: #fff;
                    background: rgba(106, 17, 203, 0.3);
                    text-decoration: underline;
                    transform: translateY(-1px);
                }

                @media (max-width: 480px) {
                    .panel-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        width: auto;
                    }
                    .title { font-size: 20px; }
                }
            `;

            this.shadow.appendChild(style);

            const panelHTML = `
                <div class="panel-container">
                    <div class="panel">
                        <div class="header">
                            <div class="title">${t('title')}</div>
                            <button class="minimize-btn" id="minimize-btn">−</button>
                        </div>
                        <div class="status-section">
                            <div class="status-box">
                                <div class="status-content">
                                    <div class="status-dot info" id="status-dot"></div>
                                    <div class="status-text" id="status-text">${t('pleaseSolveCaptcha')}</div>
                                </div>
                            </div>
                        </div>
                        <div class="panel-body" id="panel-body">
                            <div class="language-section">
                                <div class="lang-toggle">
                                    <button class="lang-btn ${currentLanguage === 'vi' ? 'active' : ''}" data-lang="vi">Tiếng Việt</button>
                                    <button class="lang-btn ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">English</button>
                                </div>
                            </div>
                            <div class="info-section">
                                <div class="version" id="version">${t('version')}</div>
                                <div class="credit" id="credit">
                                    ${t('madeBy')}
                                </div>
                                <div class="links">
                                    <a href="https://www.youtube.com/@dyydeptry" target="_blank">YouTube</a>
                                    <a href="https://discord.gg/DWyEfeBCzY" target="_blank">Discord</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = panelHTML;
            this.shadow.appendChild(wrapper.firstElementChild);

            this.panel = this.shadow.querySelector('.panel');
            this.statusText = this.shadow.querySelector('#status-text');
            this.statusDot = this.shadow.querySelector('#status-dot');
            this.versionEl = this.shadow.querySelector('#version');
            this.creditEl = this.shadow.querySelector('#credit');
            this.langBtns = Array.from(this.shadow.querySelectorAll('.lang-btn'));
            this.body = this.shadow.querySelector('#panel-body');
            this.minimizeBtn = this.shadow.querySelector('#minimize-btn');

            document.documentElement.appendChild(this.container);
        }

        setupEventListeners() {
            this.langBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentLanguage = btn.dataset.lang;
                    this.updateLanguage();
                });
            });

            this.minimizeBtn.addEventListener('click', () => {
                this.isMinimized = !this.isMinimized;
                this.body.classList.toggle('hidden');
                this.minimizeBtn.textContent = this.isMinimized ? '+' : '−';
            });
        }

        updateLanguage() {
            localStorage.setItem('lang', currentLanguage);
            this.langBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
            });

            this.shadow.querySelector('.title').textContent = t('title');
            this.versionEl.textContent = t('version');
            this.creditEl.textContent = t('madeBy');

            if (this.currentMessageKey) {
                this.show(this.currentMessageKey, this.currentType, this.currentReplacements);
            }
        }

        show(messageKey, type = 'info', replacements = {}) {
            this.currentMessageKey = messageKey;
            this.currentType = type;
            this.currentReplacements = replacements;

            const message = t(messageKey, replacements);
            this.statusText.textContent = message;
            this.statusDot.className = `status-dot ${type}`;
        }
    }

    let panel = null;
    setTimeout(() => {
        panel = new BypassPanel();
        panel.show('pleaseSolveCaptcha', 'info');
    }, 100);

    // === GIỮ NGUYÊN TOÀN BỘ XỬ LÝ VOLCANO & WORK.INK ===
    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("work.ink")) handleWorkInk();

    // [Giữ nguyên toàn bộ hàm handleVolcano() và handleWorkInk() như cũ]
    // (Không thay đổi logic, chỉ đổi tên UI)
    // Đã kiểm tra: không cần chỉnh sửa gì thêm

    // === HÀM handleVolcano() & handleWorkInk() GIỮ NGUYÊN 100% ===
    // (Copy nguyên bản từ script gốc của bạn)
    // ... [đoạn code dài giữ nguyên như bạn gửi] ...

    // (Tạm ẩn để gọn, nhưng trong thực tế sẽ dán đầy đủ)
    // Bạn chỉ cần thay toàn bộ phần trên vào script cũ, phần dưới giữ nguyên.

})();
