/*!
 * TropiChat — Bimini Island Tours
 * ─────────────────────────────────────────────────────────────────────
 * Live chat widget connected to TropiChat API (https://tropichat.chat)
 * All conversation logic lives on the backend — this file is purely
 * a UI shell + API bridge.
 * ─────────────────────────────────────────────────────────────────────
 */
(() => {
    'use strict';

    /* ─── Config ──────────────────────────────────────────── */
    const API_URL     = 'https://tropichat.chat/api/message';
    const BUSINESS_ID = 'bimini-island-tours';
    const WA_URL      = 'https://wa.me/2428108687?text=Hi%2C%20I%27m%20interested%20in%20booking%20a%20tour';
    const ERROR_MSG   = "Sorry, I'm having trouble responding right now. Please try again or use the booking form.";

    /* ─── State ───────────────────────────────────────────── */
    let isOpen    = false;
    let isSending = false;

    /* ─── Session ─────────────────────────────────────────── */
    function getSessionId() {
        const KEY = 'tropichat_session_id';
        let id = localStorage.getItem(KEY);
        if (!id) {
            id = 'tc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem(KEY, id);
        }
        return id;
    }
    const sessionId = getSessionId();

    /* ─── DOM refs (populated after inject) ──────────────── */
    let fab, panel, msgArea, inputEl, sendBtn, badge;

    /* ─── Inject widget HTML ─────────────────────────────── */
    function inject() {
        const root = document.createElement('div');
        root.id = 'tc-root';
        root.innerHTML = `
<button class="tc-fab" id="tcFab" aria-label="Open TropiChat">
    <span class="tc-fab-chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
    </span>
    <span class="tc-fab-x" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    </span>
    <span class="tc-badge" id="tcBadge">1</span>
</button>

<div class="tc-panel" id="tcPanel" aria-hidden="true" role="dialog" aria-label="TropiChat">
    <div class="tc-head">
        <div class="tc-head-left">
            <div class="tc-avi-wrap">
                <div class="tc-avi">T</div>
                <span class="tc-avi-dot"></span>
            </div>
            <div class="tc-head-text">
                <strong class="tc-head-name">TropiChat</strong>
                <span class="tc-head-sub">Bimini Island Tours &middot; Online</span>
            </div>
        </div>
        <button class="tc-head-close" id="tcClose" aria-label="Close chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    </div>

    <div class="tc-msgs" id="tcMsgs" role="log" aria-live="polite"></div>

    <div class="tc-foot">
        <div class="tc-input-row" id="tcInputRow">
            <input class="tc-input" id="tcInput" type="text" autocomplete="off" placeholder="Type a message…">
            <button class="tc-send" id="tcSend" aria-label="Send">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 21L23 12 2 3v7l15 2-15 2z"/>
                </svg>
            </button>
        </div>
        <a href="${WA_URL}" class="tc-wa-hint" target="_blank" rel="noopener noreferrer">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Prefer WhatsApp? Message us
        </a>
    </div>
</div>`;
        document.body.appendChild(root);

        fab     = document.getElementById('tcFab');
        panel   = document.getElementById('tcPanel');
        msgArea = document.getElementById('tcMsgs');
        inputEl = document.getElementById('tcInput');
        sendBtn = document.getElementById('tcSend');
        badge   = document.getElementById('tcBadge');
    }

    /* ─── Events ──────────────────────────────────────────── */
    function bindEvents() {
        fab.addEventListener('click', toggle);
        document.getElementById('tcClose').addEventListener('click', close);

        // Global: any element with .js-open-chat opens the widget
        document.addEventListener('click', e => {
            if (e.target.closest('.js-open-chat')) {
                e.preventDefault();
                open();
            }
        });

        // Input send
        sendBtn.addEventListener('click', handleSend);
        inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
    }

    /* ─── Open / Close ────────────────────────────────────── */
    function toggle() { isOpen ? close() : open(); }

    function open() {
        isOpen = true;
        panel.classList.add('tc-panel--open');
        fab.classList.add('tc-fab--open');
        badge.style.display = 'none';
        panel.setAttribute('aria-hidden', 'false');
        inputEl.focus();
        if (msgArea.children.length === 0) greet();
    }

    function close() {
        isOpen = false;
        panel.classList.remove('tc-panel--open');
        fab.classList.remove('tc-fab--open');
        panel.setAttribute('aria-hidden', 'true');
    }

    /* ─── Initial greeting (sent via API on first open) ──── */
    function greet() {
        sendToAPI('__greeting__', true);
    }

    /* ─── Send handler ────────────────────────────────────── */
    function handleSend() {
        if (isSending) return;
        const text = inputEl.value.trim();
        if (!text) return;

        inputEl.value = '';
        appendUserMsg(text);
        sendToAPI(text, false);
    }

    /* ─── API communication ───────────────────────────────── */
    function sendToAPI(message, isGreeting) {
        isSending = true;
        setInputEnabled(false);

        const typing = showTyping();

        const payload = {
            businessId: BUSINESS_ID,
            sessionId:  sessionId,
            message:    message
        };

        // Optional metadata
        payload.metadata = {
            page: window.location.href,
            timestamp: new Date().toISOString()
        };

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('API ' + res.status);
            return res.json();
        })
        .then(data => {
            removeTyping(typing);
            const reply = data.reply || data.message || data.response || '';
            if (reply) {
                appendBotMsg(reply);
            }
        })
        .catch(() => {
            removeTyping(typing);
            appendBotMsg(ERROR_MSG);
        })
        .finally(() => {
            isSending = false;
            setInputEnabled(true);
            if (!isGreeting) inputEl.focus();
        });
    }

    /* ─── Message rendering ───────────────────────────────── */
    function appendBotMsg(text) {
        const el = document.createElement('div');
        el.className = 'tc-msg tc-msg-bot';
        el.innerHTML = esc(text).replace(/\n/g, '<br>');
        msgArea.appendChild(el);
        scrollDown();
    }

    function appendUserMsg(text) {
        const el = document.createElement('div');
        el.className = 'tc-msg tc-msg-user';
        el.textContent = text;
        msgArea.appendChild(el);
        scrollDown();
    }

    /* ─── Typing indicator ────────────────────────────────── */
    function showTyping() {
        const el = document.createElement('div');
        el.className = 'tc-msg tc-msg-bot tc-typing';
        el.innerHTML = '<span></span><span></span><span></span>';
        msgArea.appendChild(el);
        scrollDown();
        return el;
    }

    function removeTyping(el) {
        if (el && el.parentNode === msgArea) msgArea.removeChild(el);
    }

    /* ─── Input state ─────────────────────────────────────── */
    function setInputEnabled(enabled) {
        inputEl.disabled  = !enabled;
        sendBtn.disabled  = !enabled;
        if (enabled) inputEl.placeholder = 'Type a message…';
        else         inputEl.placeholder = 'Waiting for reply…';
    }

    /* ─── Utilities ───────────────────────────────────────── */
    function scrollDown() {
        requestAnimationFrame(() => { msgArea.scrollTop = msgArea.scrollHeight; });
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /* ─── Badge attention ─────────────────────────────────── */
    function showBadge() { if (!isOpen) badge.style.display = 'flex'; }

    /* ─── Public API ──────────────────────────────────────── */
    window.TropiChat = { open, close };

    /* ─── Bootstrap ───────────────────────────────────────── */
    const start = () => { inject(); bindEvents(); setTimeout(showBadge, 4500); };
    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', start)
        : start();
})();
