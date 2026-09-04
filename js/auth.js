// ============================================
// TV Tracker - Auth State & Profile Management
// ============================================

let cachedSessionUser = null;
let sessionCacheTime = 0;
const SESSION_CACHE_MS = 3000;

async function getCurrentUser() {
  if (typeof supabaseClient === 'undefined') return null;
  if (cachedSessionUser && Date.now() - sessionCacheTime < SESSION_CACHE_MS) return cachedSessionUser;
  try {
    const { data } = await supabaseClient.auth.getSession();
    cachedSessionUser = data.session?.user || null;
    sessionCacheTime = Date.now();
    return cachedSessionUser;
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
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {}
  }
  cachedSessionUser = null;
  sessionCacheTime = 0;
  localStorage.removeItem('tvTracker_profile');
  localStorage.removeItem('tvTracker_2fa');
  localStorage.removeItem('tvTracker_2fa_secret');
  window.location.href = 'auth.html';
}

async function getUserProfile(forceRefresh = false) {
  const user = await getCurrentUser();
  if (!user) return null;

  let cached = null;
  const cachedStr = localStorage.getItem('tvTracker_profile');
  if (cachedStr) {
    try { cached = JSON.parse(cachedStr); } catch (e) {}
  }

  if (!forceRefresh && cached) {
    return cached;
  }

  if (typeof supabaseClient !== 'undefined') {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data && !error) {
        const defaults = {
          username: user.email.split('@')[0],
          avatar: '',
          bio: '',
          favorite_genre: 'All',
          two_factor_enabled: localStorage.getItem('tvTracker_2fa') === 'true',
          two_factor_secret: localStorage.getItem('tvTracker_2fa_secret') || ''
        };

        // Only take non-empty values from Supabase so we never wipe out
        // a previously saved username/avatar with a null/empty row.
        const cleanData = {};
        for (const key of Object.keys(data)) {
          const val = data[key];
          if (val !== null && val !== undefined && val !== '') {
            cleanData[key] = val;
          }
        }

        // Precedence: cached (user's saved values) wins, then real non-empty
        // Supabase data, then defaults as a last-resort fallback. This keeps
        // the username the user saved even if the DB row is null/empty.
        const merged = { ...defaults, ...cleanData, ...cached };
        localStorage.setItem('tvTracker_profile', JSON.stringify(merged));
        return merged;
      }
    } catch (e) {}
  }

  if (cached) {
    return cached;
  }

  const defaultProfile = {
    username: user.email.split('@')[0],
    avatar: '',
    bio: '',
    favorite_genre: 'All',
    two_factor_enabled: localStorage.getItem('tvTracker_2fa') === 'true',
    two_factor_secret: localStorage.getItem('tvTracker_2fa_secret') || ''
  };
  localStorage.setItem('tvTracker_profile', JSON.stringify(defaultProfile));
  return defaultProfile;
}

async function saveUserProfile(userId, profileData) {
  const cached = JSON.parse(localStorage.getItem('tvTracker_profile') || '{}');
  const updated = { ...cached, ...profileData };
  localStorage.setItem('tvTracker_profile', JSON.stringify(updated));

  if (typeof profileData.two_factor_enabled !== 'undefined') {
    localStorage.setItem('tvTracker_2fa', profileData.two_factor_enabled ? 'true' : 'false');
  }
  if (typeof profileData.two_factor_secret !== 'undefined') {
    if (profileData.two_factor_secret) {
      localStorage.setItem('tvTracker_2fa_secret', profileData.two_factor_secret);
    } else {
      localStorage.removeItem('tvTracker_2fa_secret');
    }
  }

  if (typeof supabaseClient !== 'undefined') {
    try {
      const { data: existing } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        await supabaseClient
          .from('profiles')
          .update(profileData)
          .eq('user_id', userId);
      } else {
        await supabaseClient
          .from('profiles')
          .insert([{ user_id: userId, ...profileData }]);
      }
    } catch (e) {
      console.warn('Could not sync profile to Supabase table (using local storage):', e.message);
    }
  }
  return updated;
}

async function updateNavbarAuth() {
  const user = await getCurrentUser();
  const authLinks = document.querySelectorAll('#navAuth');
  const profileLinks = document.querySelectorAll('#navProfile');

  if (!user) {
    authLinks.forEach(link => {
      link.textContent = 'Log In';
      link.href = 'auth.html';
      link.onclick = null;
      link.style.display = '';
    });
    profileLinks.forEach(link => {
      link.style.display = 'none';
    });
    return;
  }

  // User is logged in
  authLinks.forEach(link => {
    link.style.display = 'none'; // Replaced by profile dropdown
  });

  const profile = await getUserProfile();
  const displayName = profile?.username || user.email.split('@')[0];
  const userEmail = user.email || '';
  const initial = displayName ? displayName[0].toUpperCase() : 'U';

  const avatarImgHtml = (profile && profile.avatar)
    ? `<img src="${profile.avatar}" alt="${displayName}">`
    : `<span>${initial}</span>`;

  profileLinks.forEach(container => {
    container.style.display = 'inline-flex';
    container.className = 'nav-profile-wrapper';
    container.innerHTML = `
      <div class="nav-profile-trigger" tabindex="0" role="button" aria-haspopup="true">
        <span class="nav-avatar" id="navAvatarSmall">${avatarImgHtml}</span>
        <span class="nav-profile-name">${displayName}</span>
        <span class="nav-profile-arrow">&#9662;</span>
      </div>
      <div class="nav-profile-dropdown" role="menu">
        <div class="dropdown-user-header">
          <div class="dropdown-user-avatar">${avatarImgHtml}</div>
          <div class="dropdown-user-details">
            <div class="dropdown-user-name">${displayName}</div>
            <div class="dropdown-user-email">${userEmail}</div>
          </div>
        </div>
        <ul class="dropdown-menu-list">
          <li>
            <a href="profile.html" class="dropdown-item" role="menuitem">
              <span class="dropdown-item-icon">&#128100;</span>
              <span>My Profile</span>
            </a>
          </li>
          <li>
            <a href="profile.html#security" class="dropdown-item" role="menuitem" onclick="if(window.location.pathname.endsWith('profile.html')){ switchProfileTab('security'); }">
              <span class="dropdown-item-icon">&#128737;</span>
              <span>Security &amp; 2FA</span>
            </a>
          </li>
          <li>
            <a href="tracker.html" class="dropdown-item" role="menuitem">
              <span class="dropdown-item-icon">&#128250;</span>
              <span>Show Tracker</span>
            </a>
          </li>
          <li>
            <a href="calendar.html" class="dropdown-item" role="menuitem">
              <span class="dropdown-item-icon">&#128197;</span>
              <span>Release Calendar</span>
            </a>
          </li>
          <li class="dropdown-divider"></li>
          <li>
            <a href="#" class="dropdown-item logout" role="menuitem" onclick="logout(event)">
              <span class="dropdown-item-icon">&#128682;</span>
              <span>Log Out</span>
            </a>
          </li>
        </ul>
      </div>
    `;
  });
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

// Auto update navbar on page load if elements exist
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('navAuth') || document.getElementById('navProfile')) {
    updateNavbarAuth();
  }
});
