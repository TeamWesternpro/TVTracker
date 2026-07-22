// ============================================
// TV Tracker - Data Layer (Supabase + localStorage)
// ============================================

const DB_KEY = 'tvTracker_shows';
let useSupabase = false;

function initSupabase() {
  try {
    if (typeof SUPABASE_CONFIG !== 'undefined' &&
        SUPABASE_CONFIG.url !== 'https://YOUR_PROJECT_ID.supabase.co' &&
        SUPABASE_CONFIG.anonKey !== 'YOUR_ANON_KEY_HERE' &&
        typeof supabaseClient !== 'undefined') {
      useSupabase = true;
      console.log('Supabase connected');
    } else {
      console.log('Using localStorage fallback');
    }
  } catch (e) {
    console.log('Supabase init failed, using localStorage:', e);
  }
}

const SampleShows = [];

function supabaseToLocal(row) {
  return {
    id: row.id,
    user_id: row.user_id || '',
    poster: row.poster || '',
    title: row.title || '',
    description: row.description || '',
    releaseDate: row.release_date || '',
    genre: row.genre || '',
    language: row.language || '',
    status: row.status || '',
    platform: row.platform || '',
    platformLogo: row.platform_logo || '',
    creators: row.creators || [],
    cast: row.cast_members || []
  };
}

function localToSupabase(show) {
  return {
    title: show.title,
    description: show.description,
    release_date: show.releaseDate,
    genre: show.genre,
    language: show.language,
    status: show.status,
    platform: show.platform,
    platform_logo: show.platformLogo,
    poster: show.poster,
    creators: show.creators || [],
    cast_members: show.cast || []
  };
}

function normalizeShow(s) {
  if (!Array.isArray(s.creators)) {
    s.creators = s.creators ? [{ name: s.creators, role: 'Creator', photo: '', status: 'Alive' }] : [];
  }
  s.creators = s.creators.map(c => ({
    name: c.name || '',
    role: c.role || 'Creator',
    photo: c.photo || '',
    status: c.status || 'Alive'
  }));
  if (!Array.isArray(s.cast)) {
    s.cast = s.cast ? s.cast.split(',').map(n => ({ actor: n.trim(), character: '', photo: '' })) : [];
  }
  s.cast = s.cast.map(c => ({
    actor: c.actor || '',
    character: c.character || '',
    photo: c.photo || ''
  }));
  return s;
}

// ===== localStorage helpers =====
function getShowsLocal() {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(SampleShows));
    return SampleShows.map(s => normalizeShow({ ...s }));
  }
  return JSON.parse(data).map(s => normalizeShow({ ...s }));
}

function saveShowsLocal(shows) {
  localStorage.setItem(DB_KEY, JSON.stringify(shows));
}

// ===== Get current user ID helper =====
async function getUserId() {
  if (typeof supabaseClient === 'undefined') return null;
  const { data } = await supabaseClient.auth.getSession();
  return data.session?.user?.id || null;
}

// ===== Public API =====

async function getShows() {
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { data, error } = await supabaseClient
        .from('shows')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: false });
      if (error) throw error;
      return data.map(s => normalizeShow(supabaseToLocal(s)));
    } catch (e) {
      console.error('Supabase getShows error:', e);
      return getShowsLocal();
    }
  }
  return getShowsLocal();
}

async function addShow(show) {
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const supabaseData = localToSupabase(show);
      supabaseData.user_id = userId;
      const { data, error } = await supabaseClient
        .from('shows')
        .insert([supabaseData])
        .select()
        .single();
      if (error) throw error;
      return normalizeShow(supabaseToLocal(data));
    } catch (e) {
      console.error('Supabase addShow error:', e);
      return addShowLocal(show);
    }
  }
  return addShowLocal(show);
}

function addShowLocal(show) {
  const shows = getShowsLocal();
  show.id = Date.now();
  shows.push(show);
  saveShowsLocal(shows);
  return show;
}

async function updateShow(id, updated) {
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { data, error } = await supabaseClient
        .from('shows')
        .update(localToSupabase(updated))
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return normalizeShow(supabaseToLocal(data));
    } catch (e) {
      console.error('Supabase updateShow error:', e);
      return updateShowLocal(id, updated);
    }
  }
  return updateShowLocal(id, updated);
}

function updateShowLocal(id, updated) {
  const shows = getShowsLocal();
  const idx = shows.findIndex(s => s.id === id);
  if (idx !== -1) {
    shows[idx] = { ...shows[idx], ...updated };
    saveShowsLocal(shows);
    return shows[idx];
  }
  return null;
}

async function deleteShow(id) {
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { error } = await supabaseClient
        .from('shows')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return;
    } catch (e) {
      console.error('Supabase deleteShow error:', e);
      return deleteShowLocal(id);
    }
  }
  return deleteShowLocal(id);
}

function deleteShowLocal(id) {
  const shows = getShowsLocal().filter(s => s.id !== id);
  saveShowsLocal(shows);
}

async function getShowById(id) {
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { data, error } = await supabaseClient
        .from('shows')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return normalizeShow(supabaseToLocal(data));
    } catch (e) {
      console.error('Supabase getShowById error:', e);
      return getShowsLocal().find(s => s.id === id);
    }
  }
  return getShowsLocal().find(s => s.id === id);
}

async function getShowsByStatus(status) {
  if (status === 'All') return getShows();
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { data, error } = await supabaseClient
        .from('shows')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status);
      if (error) throw error;
      return data.map(s => normalizeShow(supabaseToLocal(s)));
    } catch (e) {
      console.error('Supabase getShowsByStatus error:', e);
      return getShowsLocal().filter(s => s.status === status);
    }
  }
  return getShowsLocal().filter(s => s.status === status);
}

async function getStatusCounts() {
  const shows = await getShows();
  return {
    All: shows.length,
    Watched: shows.filter(s => s.status === 'Watched').length,
    'Currently Watching': shows.filter(s => s.status === 'Currently Watching').length,
    'Plan to Watch': shows.filter(s => s.status === 'Plan to Watch').length,
    Upcoming: shows.filter(s => s.status === 'Upcoming').length
  };
}

async function getShowsByMonth(year, month) {
  const shows = await getShows();
  return shows.filter(s => {
    const d = new Date(s.releaseDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

initSupabase();
