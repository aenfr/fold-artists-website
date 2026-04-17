/* Fold Artists access gate */
(function () {
  'use strict';

  // SHA-256 of the access token
  const TOKEN_HASH = 'f1e516c13632e872c06b6e244634c97d92463ea51bc256f708b04a19b1e299fc';
  const STORAGE_KEY = 'fold_access_v1';

  // Check existing session first
  let alreadyUnlocked = false;
  try { alreadyUnlocked = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
  if (alreadyUnlocked) return;

  // Inject blocking style immediately via document.write fallback or style injection
  // (this runs in <head>, body doesn't exist yet)
  const style = document.createElement('style');
  style.id = 'fold-gate-blocker';
  style.textContent = `
    body > *:not(#fold-gate) { visibility: hidden !important; }
    body { overflow: hidden !important; }
  `;
  // document.head might not exist yet either, but documentElement always does
  (document.head || document.documentElement).appendChild(style);

  async function sha256Hex(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function unlock() {
    const gate = document.getElementById('fold-gate');
    if (gate) gate.classList.add('unlocked');
    const blocker = document.getElementById('fold-gate-blocker');
    if (blocker) blocker.remove();
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    setTimeout(() => { if (gate) gate.remove(); }, 550);
  }

  function injectGate() {
    const gate = document.createElement('div');
    gate.id = 'fold-gate';
    gate.innerHTML = `
      <div id="fold-gate-bg"></div>
      <div id="fold-gate-card">
        <img id="fold-gate-logo" src="assets/fold-artists-logo.png" alt="Fold Artists" />
        <h1 id="fold-gate-title">Fold Artists</h1>
        <p id="fold-gate-sub">This site is confidential. Enter your access token to continue.</p>
        <form id="fold-gate-form" autocomplete="off">
          <input id="fold-gate-input" type="password" placeholder="Access token"
                 autocomplete="off" autocapitalize="off" spellcheck="false" autofocus />
          <button id="fold-gate-submit" type="submit">Unlock</button>
          <div id="fold-gate-error" aria-live="polite"></div>
        </form>
        <div id="fold-gate-footer">Confidential &middot; By appointment only</div>
      </div>
    `;
    document.body.appendChild(gate);

    const form = document.getElementById('fold-gate-form');
    const input = document.getElementById('fold-gate-input');
    const err = document.getElementById('fold-gate-error');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      err.textContent = '';
      input.classList.remove('error');
      const val = (input.value || '').trim();
      if (!val) return;
      try {
        const hash = await sha256Hex(val);
        if (hash === TOKEN_HASH) {
          unlock();
        } else {
          input.classList.add('error');
          err.textContent = 'Invalid token. Please try again.';
          input.select();
        }
      } catch (e) {
        err.textContent = 'Browser does not support secure hashing.';
      }
    });

    input.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGate);
  } else {
    injectGate();
  }
})();
