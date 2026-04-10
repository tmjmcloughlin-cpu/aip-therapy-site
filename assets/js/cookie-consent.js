/**
 * AIP Therapy — Cookie Consent Manager
 * UK GDPR / PECR compliant: Accept / Decline
 * Analytics (GA4 + Clarity) only load after explicit Accept.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'aip_cookie_consent';
  var GA_ID       = 'G-4F4Y57E3FF';
  var CLARITY_ID  = 'w7jfm5pbra';

  /* ── Load analytics ──────────────────────────────────────────── */
  function loadGA() {
    if (document.querySelector('script[data-ga]')) return;
    var s1 = document.createElement('script');
    s1.async = true;
    s1.setAttribute('data-ga', '1');
    s1.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function loadClarity() {
    if (document.querySelector('script[data-clarity]')) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.setAttribute('data-clarity', '1');
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function activateAnalytics() {
    loadGA();
    loadClarity();
  }

  /* ── Banner ──────────────────────────────────────────────────── */
  function removeBanner() {
    var b = document.getElementById('aip-cookie-banner');
    if (b) b.remove();
  }

  function onAccept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    removeBanner();
    activateAnalytics();
  }

  function onDecline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    removeBanner();
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'aip-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="ccb-inner">' +
        '<p class="ccb-text">' +
          'We use cookies to understand how visitors use this site ' +
          '(Google Analytics &amp; Microsoft Clarity). ' +
          'No advertising or third-party tracking cookies are used. ' +
          '<a href="/cookie-policy.html" class="ccb-link">Cookie Policy</a>' +
        '</p>' +
        '<div class="ccb-btns">' +
          '<button id="ccb-accept" class="ccb-btn ccb-accept">Accept cookies</button>' +
          '<button id="ccb-decline" class="ccb-btn ccb-decline">Decline</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    document.getElementById('ccb-accept').addEventListener('click', onAccept);
    document.getElementById('ccb-decline').addEventListener('click', onDecline);
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    var consent = localStorage.getItem(STORAGE_KEY);
    if (consent === 'accepted') {
      activateAnalytics();
    } else if (consent === 'declined') {
      // do nothing — analytics suppressed
    } else {
      // No decision yet — show banner
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
    }
  }

  init();
})();
