// Fixture consent tool with built-in faults: after "reject" it still sends a Consent Mode
// ping with gcs=G100, loads the Meta pixel and sets _fbp; after "accept" it also loads
// Google Tag Manager. The privacy policy names only Google Analytics.
(function () {
  const load = (src) => { const s = document.createElement('script'); s.src = src; document.head.appendChild(s); };
  function apply(choice) {
    document.getElementById('cookie-consent').style.display = 'none';
    load('http://connect.facebook.net/en_US/fbevents.js');
    if (choice === 'reject') {
      new Image().src = 'http://www.google-analytics.com/g/collect?v=2&tid=G-TEST&gcs=G100';
      document.cookie = '_fbp=fb.1.123; path=/; max-age=3600';
    } else {
      load('http://www.googletagmanager.com/gtag/js?id=G-TEST');
    }
  }
  const stored = localStorage.getItem('choice');
  if (stored) apply(stored);
  for (const button of document.querySelectorAll('#cookie-consent button')) {
    button.addEventListener('click', () => { localStorage.setItem('choice', button.dataset.choice); apply(button.dataset.choice); });
  }
})();
