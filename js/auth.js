// ============================================
// TV Tracker - Auth State Management
// ============================================

let currentUser = null;

async function getCurrentUser() {
  if (currentUser) return currentUser;
  if (typeof supabaseClient === 'undefined') return null;
  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session?.user || null;
  return currentUser;
}

async function isLoggedIn() {
  const user = await getCurrentUser();
  return !!user;
}

async function logout() {
  if (typeof supabaseClient !== 'undefined') {
    await supabaseClient.auth.signOut();
  }
  currentUser = null;
  window.location.href = 'auth.html';
}

async function updateNavbarAuth() {
  const user = await getCurrentUser();
  const authLinks = document.querySelectorAll('#navAuth');
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
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}
