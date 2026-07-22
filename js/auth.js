// ============================================
// TV Tracker - Auth State Management
// ============================================

async function getCurrentUser() {
  if (typeof supabaseClient === 'undefined') return null;
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data.session?.user || null;
  } catch (e) {
    return null;
  }
}

async function isLoggedIn() {
  const user = await getCurrentUser();
  return !!user;
}

async function logout() {
  if (typeof supabaseClient !== 'undefined') {
    await supabaseClient.auth.signOut();
  }
  localStorage.removeItem('tvTracker_profile');
  window.location.href = 'auth.html';
}

async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const cached = localStorage.getItem('tvTracker_profile');
  if (cached) return JSON.parse(cached);
  if (typeof supabaseClient !== 'undefined') {
    try {
      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        localStorage.setItem('tvTracker_profile', JSON.stringify(data));
        return data;
      }
    } catch (e) {}
  }
  return { username: user.email.split('@')[0], avatar: '' };
}

async function updateNavbarAuth() {
  const user = await getCurrentUser();
  const authLinks = document.querySelectorAll('#navAuth');
  const profileLinks = document.querySelectorAll('#navProfile');

  authLinks.forEach(link => {
    if (user) {
      link.textContent = 'Log Out';
      link.href = '#';
      link.onclick = function(e) { e.preventDefault(); logout(); };
    } else {
      link.textContent = 'Log In';
      link.href = 'auth.html';
      link.onclick = null;
    }
  });

  profileLinks.forEach(link => {
    link.style.display = user ? '' : 'none';
  });

  if (user) {
    const profile = await getUserProfile();
    const avatarEls = document.querySelectorAll('#navAvatarSmall');
    avatarEls.forEach(el => {
      if (profile && profile.avatar) {
        el.innerHTML = `<img src="${profile.avatar}">`;
      } else {
        const initial = (profile?.username || user.email)[0].toUpperCase();
        el.innerHTML = `<span>${initial}</span>`;
      }
    });
  }
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}
