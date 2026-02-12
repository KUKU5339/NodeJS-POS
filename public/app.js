window.getToken = function() {
  return localStorage.getItem('nodepos_token') || '';
};

window.apiGet = async function(path) {
  try {
    const token = window.getToken();
    const res = await fetch(path, {
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

(function(){
  function setOfflineBanner(online) {
    var el = document.getElementById('offlineBanner');
    if (!el) return;
    el.style.display = online ? 'none' : '';
  }
  function broadcast(status) {
    try { localStorage.setItem('streetpos_net', status + ':' + Date.now()); } catch(e) {}
  }
  setOfflineBanner(navigator.onLine);
  window.addEventListener('online', function(){ setOfflineBanner(true); broadcast('online'); });
  window.addEventListener('offline', function(){ setOfflineBanner(false); broadcast('offline'); });
  window.addEventListener('storage', function(e){
    if (e.key === 'streetpos_net') {
      var online = String(e.newValue || '').startsWith('online');
      setOfflineBanner(online);
    }
  });
})();

(function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      document.getElementById('error').style.display = 'none';
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.token) {
          document.getElementById('error').textContent = (data && data.message) ? data.message : 'Login failed';
          document.getElementById('error').style.display = '';
          return;
        }
        localStorage.setItem('nodepos_token', data.token);
        window.location.href = '/dashboard';
      } catch (err) {
        document.getElementById('error').textContent = 'Network error';
        document.getElementById('error').style.display = '';
      }
    });
  }
})();
