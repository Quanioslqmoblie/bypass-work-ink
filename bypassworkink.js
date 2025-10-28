(function () {
    'use strict';

    const host = location.hostname;
    const debug = true;

    let currentLanguage = localStorage.getItem('lang') || 'vi';

    // === TRANSLATIONS ===
    const translations = {
        vi: {
            title: "Tool của Quân",
            pleaseSolveCaptcha: "Vui lòng giải CAPTCHA để tiếp tục",
            captchaSuccess: "CAPTCHA đã thành công",
            redirectingToWork: "Đang chuyển qua Work.ink...",
            bypassSuccessCopy: "Bypass thành công, đã Copy Key!",
            waitingCaptcha: "Đang chờ CAPTCHA...",
            pleaseReload: "Vui lòng tải lại trang...",
            bypassSuccess: "Bypass thành công, chờ {time}s...",
            backToCheckpoint: "Đang về lại Checkpoint...",
            captchaSuccessBypassing: "CAPTCHA OK, đang bypass...",
            version: "v1.6.2.3",
            madeBy: "Tạo bởi Quân"
        },
        en: {
            title: "Quan's Tool",
            pleaseSolveCaptcha: "Please solve the CAPTCHA to continue",
            captchaSuccess: "CAPTCHA solved",
            redirectingToWork: "Redirecting to Work.ink...",
            bypassSuccessCopy: "Bypass successful! Key copied!",
            waitingCaptcha: "Waiting for CAPTCHA...",
            pleaseReload: "Please reload the page...",
            bypassSuccess: "Bypass successful, waiting {time}s...",
            backToCheckpoint: "Returning to checkpoint...",
            captchaSuccessBypassing: "CAPTCHA passed, bypassing...",
            version: "v1.6.2.3",
            madeBy: "Made by Quân"
        }
    };

    function t(key, replacements = {}) {
        let text = translations[currentLanguage][key] || key;
        Object.keys(replacements).forEach(ph => {
            text = text.replace(`{${ph}}`, replacements[ph]);
        });
        return text;
    }

    // === DRAGGABLE PANEL CLASS ===
    class DraggablePanel {
        constructor() {
            this.container = null;
            this.shadow = null;
            this.panel = null;
            this.header = null;
            this.statusText = null;
            this.statusDot = null;
            this.langBtns = [];
            this.isDragging = false;
            this.dragOffset = { x: 0, y: 0 };
            this.init();
        }

        init() {
            this.createPanel();
            this.setupDrag();
            this.setupLanguage();
        }

        createPanel() {
            this.container = document.createElement('div');
            this.shadow = this.container.attachShadow({ mode: 'closed' });

            const style = document.createElement('style');
            style.textContent = `
                * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; }

                .panel-wrapper {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 380px;
                    z-index: 2147483647;
                    font-family: 'Segoe UI', 'Roboto', sans-serif;
                    cursor: default;
                    transition: transform 0.2s ease;
                }

                .panel {
                    background: linear-gradient(145deg, #1e1b4b, #0f0a2c);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 
                        0 15px 35px rgba(0, 0, 0, 0.5),
                        0 0 30px rgba(139, 92, 246, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(139, 92, 246, 0.4);
                    animation: floatIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes floatIn {
                    0% { opacity: 0; transform: translateY(-30px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }

                .header {
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: grab;
                    position: relative;
                    overflow: hidden;
                }

                .header:active { cursor: grabbing; }

                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%; left: -50%;
                    width: 200%; height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.15), transparent);
                    animation: shine 4s infinite;
                    pointer-events: none;
                }

                @keyframes shine {
                    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                }

                .title {
                    font-size: 21px;
                    font-weight: 800;
                    color: #fff;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    letter-spacing: 0.5px;
                }

                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: bold;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: rgba(239, 68, 68, 0.6);
                    transform: scale(1.1);
                }

                .status-bar {
                    padding: 18px 20px;
                    background: rgba(255,255,255,0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }

                .status-content {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .status-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #8b5cf6;
                    box-shadow: 0 0 16px currentColor;
                    animation: pulse 2s infinite;
                    position: relative;
                }

                .status-dot::after {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 24px; height: 24px;
                    border: 2px solid currentColor;
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    animation: ripple 2s infinite;
                    opacity: 0;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.7; }
                }

                @keyframes ripple {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
                    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
                }

                .status-dot.info { background: #60a5fa; }
                .status-dot.success { background: #34d399; }
                .status-dot.warning { background: #fbbf24; }
                .status-dot.error { background: #f87171; }

                .status-text {
                    color: #fff;
                    font-size: 15px;
                    font-weight: 600;
                    flex: 1;
                    line-height: 1.5;
                }

                .footer {
                    padding: 14px 20px;
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: rgba(255,255,255,0.7);
                }

                .lang-toggle {
                    display: flex;
                    gap: 8px;
                }

                .lang-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    padding: 6px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .lang-btn:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateY(-1px);
                }

                .lang-btn.active {
                    background: #8b5cf6;
                    border-color: #c4b5fd;
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
                }

                .version {
                    font-weight: 500;
                }

                @media (max-width: 480px) {
                    .panel-wrapper { width: calc(100% - 20px); left: 10px; right: 10px; }
                }
            `;

            this.shadow.appendChild(style);

            const html = `
                <div class="panel-wrapper">
                    <div class="panel">
                        <div class="header">
                            <div class="title">${t('title')}</div>
                            <button class="close-btn">×</button>
                        </div>
                        <div class="status-bar">
                            <div class="status-content">
                                <div class="status-dot info" id="dot"></div>
                                <div class="status-text" id="text">${t('pleaseSolveCaptcha')}</div>
                            </div>
                        </div>
                        <div class="footer">
                            <div class="lang-toggle">
                                <button class="lang-btn ${currentLanguage === 'vi' ? 'active' : ''}" data-lang="vi">VI</button>
                                <button class="lang-btn ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                            </div>
                            <div class="version">${t('version')} - ${t('madeBy')}</div>
                        </div>
                    </div>
                </div>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            this.shadow.appendChild(wrapper.firstChild);

            this.panel = this.shadow.querySelector('.panel');
            this.header = this.shadow.querySelector('.header');
            this.statusText = this.shadow.querySelector('#text');
            this.statusDot = this.shadow.querySelector('#dot');
            this.langBtns = Array.from(this.shadow.querySelectorAll('.lang-btn'));
            this.closeBtn = this.shadow.querySelector('.close-btn');

            document.documentElement.appendChild(this.container);
        }

        setupDrag() {
            let pos = { x: 0, y: 0 };

            this.header.addEventListener('mousedown', (e) => {
                if (e.target === this.closeBtn) return;
                this.isDragging = true;
                const rect = this.container.getBoundingClientRect();
                this.dragOffset.x = e.clientX - rect.left;
                this.dragOffset.y = e.clientY - rect.top;
                this.header.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                pos.x = e.clientX - this.dragOffset.x;
                pos.y = e.clientY - this.dragOffset.y;

                // Giới hạn trong màn hình
                const maxX = window.innerWidth - 400;
                const maxY = window.innerHeight - 200;
                pos.x = Math.max(0, Math.min(pos.x, maxX));
                pos.y = Math.max(0, Math.min(pos.y, maxY));

                this.container.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                this.container.style.top = '0';
                this.container.style.right = 'auto';
            });

            document.addEventListener('mouseup', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    this.header.style.cursor = 'grab';
                }
            });

            this.closeBtn.addEventListener('click', () => {
                this.container.remove();
            });
        }

        setupLanguage() {
            this.langBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    currentLanguage = btn.dataset.lang;
                    localStorage.setItem('lang', currentLanguage);
                    this.langBtns.forEach(b => b.classList.toggle('active', b === btn));
                    this.updateText();
                });
            });
        }

        updateText() {
            this.shadow.querySelector('.title').textContent = t('title');
            this.shadow.querySelector('#text').textContent = this.currentText || t('pleaseSolveCaptcha');
            this.shadow.querySelector('.version').innerHTML = `${t('version')} - ${t('madeBy')}`;
        }

        show(messageKey, type = 'info', replacements = {}) {
            this.currentText = t(messageKey, replacements);
            this.statusText.textContent = this.currentText;
            this.statusDot.className = `status-dot ${type}`;
        }
    }

    // === KHỞI TẠO PANEL ===
    let panel;
    setTimeout(() => {
        panel = new DraggablePanel();
        panel.show('pleaseSolveCaptcha', 'info');
    }, 100);

    // === GIỮ NGUYÊN TOÀN BỘ XỬ LÝ BYPASS ===
    if (host.includes("key.volcano.wtf")) handleVolcano();
    else if (host.includes("work.ink")) handleWorkInk();

    // === [DÁN NGUYÊN HAI HÀM handleVolcano() và handleWorkInk() TỪ BẢN GỐC] ===
    // (Không thay đổi gì, chỉ thay `panel.show(...)` để dùng panel mới)

    function handleVolcano() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');
        if (debug) console.log('[Debug] Waiting Captcha');

        let alreadyDoneContinue = false;
        let alreadyDoneCopy = false;

        function actOnCheckpoint(node) {
            if (!alreadyDoneContinue) {
                const buttons = node && node.nodeType === 1
                    ? node.matches('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                        ? [node]
                        : node.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]')
                    : document.querySelectorAll('#primaryButton[type="submit"], button[type="submit"], a, input[type=button], input[type=submit]');
                for (const btn of buttons) {
                    const text = (btn.innerText || btn.value || "").trim().toLowerCase();
                    if (text.includes("continue") || text.includes("next step")) {
                        const disabled = btn.disabled || btn.getAttribute("aria-disabled") === "true";
                        const style = getComputedStyle(btn);
                        const visible = style.display !== "none" && style.visibility !== "hidden" && btn.offsetParent !== null;
                        if (visible && !disabled) {
                            alreadyDoneContinue = true;
                            if (panel) panel.show('captchaSuccess', 'success');
                            if (debug) console.log('[Debug] Captcha Solved');

                            for (const btn of buttons) {
                                setTimeout(() => {
                                    try {
                                        btn.click();
                                        if (panel) panel.show('redirectingToWork', 'info');
                                    } catch (err) {
                                        if (debug) console.log('[Debug] No Continue Found', err);
                                    }
                                }, 300);
                            }
                            return true;
                        }
                    }
                }
            }

            const copyBtn = node && node.nodeType === 1
                ? node.matches("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                    ? node
                    : node.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']")
                : document.querySelector("#copy-key-btn, .copy-btn, [aria-label='Copy']");
            if (copyBtn) {
                setInterval(() => {
                    try {
                        copyBtn.click();
                        if (panel) panel.show('bypassSuccessCopy', 'success');
                    } catch (err) {}
                }, 500);
                return true;
            }

            return false;
        }

        const mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1 && actOnCheckpoint(node) && alreadyDoneCopy) {
                            mo.disconnect();
                            return;
                        }
                    }
                }
                if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                    if (actOnCheckpoint(mutation.target) && alreadyDoneCopy) {
                        mo.disconnect();
                        return;
                    }
                }
            }
        });

        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled', 'style'] });

        if (actOnCheckpoint() && alreadyDoneCopy) mo.disconnect();
    }

    function handleWorkInk() {
        if (panel) panel.show('pleaseSolveCaptcha', 'info');

        const startTime = Date.now();
        let sessionController = undefined;
        let sendMessageA = undefined;
        let onLinkInfoA = undefined;
        let onLinkDestinationA = undefined;
        let bypassTriggered = false;
        let destinationReceived = false;

        const map = { onLI: ["onLinkInfo"], onLD: ["onLinkDestination"] };

        function getFunction(obj, candidates = null) {
            if (!obj) return { fn: null, index: -1, name: null };
            if (candidates) {
                for (let i = 0; i < candidates.length; i++) {
                    const name = candidates[i];
                    if (typeof obj[name] === "function") return { fn: obj[name], index: i, name };
                }
            } else {
                for (let i in obj) {
                    if (typeof obj[i] == "function" && obj[i].length == 2) return { fn: obj[i], name: i };
                }
            }
            return { fn: null, index: -1, name: null };
        }

        const types = { mo: 'c_monetization', ss: 'c_social_started', tr: 'c_turnstile_response', ad: 'c_adblocker_detected' };

        function triggerBypass(reason) {
            if (bypassTriggered) return;
            bypassTriggered = true;
            if (panel) panel.show('captchaSuccessBypassing', 'success');
            for (let i = 0; i < 5; i++) spoofWorkink();
            setTimeout(() => { if (!destinationReceived) for (let i = 0; i < 5; i++) spoofWorkink(); }, 5000);
        }

        function spoofWorkink() {
            if (!sessionController?.linkInfo) return;
            const socials = sessionController.linkInfo.socials || [];
            socials.forEach(soc => sendMessageA?.call(this, types.ss, { url: soc.url }));
            const monetizations = sessionController.linkInfo.monetizations || [];
            monetizations.forEach(m => {
                try {
                    switch (m) {
                        case 22: sendMessageA?.(types.mo, { type: 'readArticles2', payload: { event: 'read' } }); break;
                        case 25: 
                            sendMessageA?.(types.mo, { type: 'operaGX', payload: { event: 'start' } });
                            sendMessageA?.(types.mo, { type: 'operaGX', payload: { event: 'installClicked' } });
                            fetch('https://work.ink/_api/v2/callback/operaGX', { method: 'POST', mode: 'no-cors', body: JSON.stringify({ noteligible: true }) }).catch(() => {});
                            break;
                        case 34: sendMessageA?.(types.mo, { type: 'norton', payload: { event: 'start' } }); sendMessageA?.(types.mo, { type: 'norton', payload: { event: 'installClicked' } }); break;
                        case 71: sendMessageA?.(types.mo, { type: 'externalArticles', payload: { event: 'start' } }); sendMessageA?.(types.mo, { type: 'externalArticles', payload: { event: 'installClicked' } }); break;
                        case 45: sendMessageA?.(types.mo, { type: 'pdfeditor', payload: { event: 'installed' } }); break;
                        case 57: sendMessageA?.(types.mo, { type: 'betterdeals', payload: { event: 'installed' } }); break;
                    }
                } catch (e) {}
            });
        }

        function trm() {
            return function(...a) {
                const [msgType] = a;
                if (msgType === types.ad) return;
                if (sessionController?.linkInfo && msgType === types.tr) triggerBypass('tr');
                return sendMessageA ? sendMessageA.apply(this, a) : undefined;
            };
        }

        function createLinkInfoProxy() {
            return function(...args) {
                const [info] = args;
                try { Object.defineProperty(info, 'isAdblockEnabled', { get: () => false, configurable: false }); } catch (e) {}
                return onLinkInfoA ? onLinkInfoA.apply(this, args) : undefined;
            };
        }

        function redirect(url) { window.location.href = url; }

        function startCountdown(url, waitLeft) {
            if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });
            const interval = setInterval(() => {
                waitLeft -= 1;
                if (waitLeft > 0) {
                    if (panel) panel.show('bypassSuccess', 'warning', { time: Math.ceil(waitLeft) });
                } else {
                    clearInterval(interval);
                    redirect(url);
                }
            }, 1000);
        }

        function createDestinationProxy() {
            return function(...args) {
                const [data] = args;
                const secondsPassed = (Date.now() - startTime) / 1000;
                destinationReceived = true;
                let waitTimeSeconds = location.href.includes('42rk6hcq') || location.href.includes('ito4wckq') || location.href.includes('pzarvhq1') ? 38 : 5;
                if (secondsPassed >= waitTimeSeconds) {
                    if (panel) panel.show('backToCheckpoint', 'info');
                    redirect(data.url);
                } else {
                    startCountdown(data.url, waitTimeSeconds - secondsPassed);
                }
                return onLinkDestinationA ? onLinkDestinationA.apply(this, args) : undefined;
            };
        }

        function setupProxies() {
            const send = getFunction(sessionController);
            const info = getFunction(sessionController, map.onLI);
            const dest = getFunction(sessionController, map.onLD);
            if (!send.fn || !info.fn || !dest.fn) return;
            sendMessageA = send.fn;
            onLinkInfoA = info.fn;
            onLinkDestinationA = dest.fn;
            try {
                Object.defineProperty(sessionController, send.name, { get: trm, configurable: true });
                Object.defineProperty(sessionController, info.name, { get: createLinkInfoProxy, configurable: true });
                Object.defineProperty(sessionController, dest.name, { get: createDestinationProxy, configurable: true });
            } catch (e) {}
        }

        function checkController(target, prop, value) {
            if (value && typeof value === 'object' && getFunction(value).fn && getFunction(value, map.onLI).fn && getFunction(value, map.onLD).fn && !sessionController) {
                sessionController = value;
                setupProxies();
            }
            return Reflect.set(target, prop, value);
        }

        function createComponentProxy(comp) {
            return new Proxy(comp, {
                construct(target, args) {
                    const instance = Reflect.construct(target, args);
                    if (instance.$$.ctx) instance.$$.ctx = new Proxy(instance.$$.ctx, { set: checkController });
                    return instance;
                }
            });
        }

        function createNodeProxy(node) {
            return async (...args) => {
                const result = await node(...args);
                return new Proxy(result, {
                    get: (t, p) => p === 'component' ? createComponentProxy(t.component) : Reflect.get(t, p)
                });
            };
        }

        function createKitProxy(kit) {
            if (!kit?.start) return [false, kit];
            return [true, new Proxy(kit, {
                get(target, prop) {
                    if (prop === 'start') {
                        return function(...args) {
                            const [nodes, , opts] = args;
                            if (nodes?.nodes && opts?.node_ids) {
                                const idx = opts.node_ids[1];
                                if (nodes.nodes[idx]) nodes.nodes[idx] = createNodeProxy(nodes.nodes[idx]);
                            }
                            return kit.start.apply(this, args);
                        };
                    }
                    return Reflect.get(target, prop);
                }
            })];
        }

        function setupInterception() {
            const orig = unsafeWindow.Promise.all;
            let done = false;
            unsafeWindow.Promise.all = async function(promises) {
                const res = orig.call(this, promises);
                if (!done) {
                    done = true;
                    return new Promise(resolve => {
                        res.then(([kit, app, ...rest]) => {
                            const [ok, proxy] = createKitProxy(kit);
                            if (ok) unsafeWindow.Promise.all = orig;
                            resolve([proxy, app, ...rest]);
                        });
                    });
                }
                return res;
            };
        }

        window.googletag = { cmd: [], _loaded_: true };

        const blockedClasses = ["adsbygoogle", "adsense-wrapper", "inline-ad", "gpt-billboard-container"];
        const blockedIds = ["billboard-1", "billboard-2", "billboard-3", "sidebar-ad-1", "skyscraper-ad-1"];

        setupInterception();

        const ob = new MutationObserver(muts => {
            for (const m of muts) {
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    blockedClasses.forEach(cls => {
                        if (node.classList?.contains(cls)) node.remove();
                        node.querySelectorAll?.(`.${cls}`).forEach(el => el.remove());
                    });
                    blockedIds.forEach(id => {
                        if (node.id === id) node.remove();
                        node.querySelectorAll?.(`#${id}`).forEach(el => el.remove());
                    });
                    if (node.matches('.button.large.accessBtn.pos-relative.svelte-bv7qlp') && node.textContent.includes('Go To Destination') && !bypassTriggered) {
                        let count = 0;
                        const check = () => {
                            const ctrl = sessionController;
                            const dest = getFunction(ctrl, map.onLD);
                            if (ctrl && ctrl.linkInfo && dest.fn) {
                                triggerBypass('gtd');
                            } else if (count++ < 30) {
                                if (panel) panel.show('pleaseReload', 'info');
                                setTimeout(check, 1000);
                            }
                        };
                        check();
                    }
                }
            }
        });
        ob.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
