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

(function() {
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const password2 = document.getElementById('password2').value.trim();
      const errEl = document.getElementById('regError');
      const okEl = document.getElementById('regSuccess');
      errEl.style.display = 'none';
      okEl.style.display = 'none';
      if (password !== password2) {
        errEl.textContent = 'Passwords do not match';
        errEl.style.display = '';
        return;
      }
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.id) {
          errEl.textContent = (data && data.message) ? data.message : 'Registration failed';
          errEl.style.display = '';
          return;
        }
        okEl.textContent = 'Account created! Redirecting to login...';
        okEl.style.display = '';
        setTimeout(() => { window.location.href = '/login'; }, 1200);
      } catch (err) {
        errEl.textContent = 'Network error';
        errEl.style.display = '';
      }
    });
  }
})();
