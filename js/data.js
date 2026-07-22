// ============================================
// TV Tracker - Data Layer
// Shared Series Library + Per-User Tracker
// ============================================

const DB_KEY = 'tvTracker_shows';
const LIB_KEY = 'tvTracker_library';
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

// ===== Helpers =====
async function getUserId() {
  if (typeof supabaseClient === 'undefined') return null;
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data.session?.user?.id || null;
  } catch (e) { return null; }
}

function normalizeShow(s) {
  if (!Array.isArray(s.creators)) {
    s.creators = s.creators ? [{ name: s.creators, role: 'Creator', photo: '', status: 'Alive' }] : [];
  }
  s.creators = s.creators.map(c => ({
    name: c.name || '', role: c.role || 'Creator', photo: c.photo || '', status: c.status || 'Alive'
  }));
  if (!Array.isArray(s.cast)) {
    s.cast = s.cast ? s.cast.split(',').map(n => ({ actor: n.trim(), character: '', photo: '' })) : [];
  }
  s.cast = s.cast.map(c => ({
    actor: c.actor || '', character: c.character || '', photo: c.photo || ''
  }));
  return s;
}

function libRowToLocal(row) {
  return {
    id: row.id,
    externalId: row.external_id || '',
    title: row.title || '',
    description: row.description || '',
    poster: row.poster || '',
    releaseDate: row.release_date || '',
    status: row.status || '',
    genre: row.genre || '',
    language: row.language || '',
    platform: row.platform || '',
    platformLogo: row.platform_logo || '',
    creators: row.creators || [],
    cast: row.cast_members || []
  };
}

function localToLibRow(show) {
  return {
    title: show.title, description: show.description, poster: show.poster,
    release_date: show.releaseDate, status: show.status, genre: show.genre,
    language: show.language, platform: show.platform, platform_logo: show.platformLogo,
    creators: show.creators || [], cast_members: show.cast || [],
    external_id: show.externalId || ''
  };
}

function mergeShow(series, tracker) {
  return {
    id: tracker ? tracker.id : series.id,
    trackerId: tracker ? tracker.id : null,
    seriesId: series.id,
    poster: series.poster,
    title: series.title,
    description: series.description,
    releaseDate: series.releaseDate,
    genre: series.genre,
    language: series.language,
    status: tracker ? tracker.status : series.status,
    platform: series.platform,
    platformLogo: series.platformLogo,
    creators: series.creators,
    cast: series.cast,
    personalRating: tracker ? tracker.personal_rating : 0,
    notes: tracker ? tracker.notes : '',
    dateAdded: tracker ? tracker.date_added : '',
    lastWatched: tracker ? tracker.last_watched : ''
  };
}

// ===== localStorage fallback =====
function getLibraryLocal() {
  const data = localStorage.getItem(LIB_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLibraryLocal(lib) {
  localStorage.setItem(LIB_KEY, JSON.stringify(lib));
}

function getTrackerLocal() {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
}

function saveTrackerLocal(tracker) {
  localStorage.setItem(DB_KEY, JSON.stringify(tracker));
}

// ===== PUBLIC API =====

// Search library by title (case-insensitive)
async function searchLibrary(query) {
  if (useSupabase) {
    try {
      const { data, error } = await supabaseClient
        .from('series_library')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('title');
      if (error) throw error;
      return data.map(libRowToLocal);
    } catch (e) {
      console.error('searchLibrary error:', e);
      return getLibraryLocal().filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
    }
  }
  return getLibraryLocal().filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
}

// Get all shows for current user (joined library + tracker)
async function getShows() {
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { data: trackerRows, error: tErr } = await supabaseClient
        .from('user_tracker')
        .select('*')
        .eq('user_id', userId);
      if (tErr) throw tErr;
      if (!trackerRows || trackerRows.length === 0) return [];

      const seriesIds = trackerRows.map(t => t.series_id);
      const { data: libRows, error: lErr } = await supabaseClient
        .from('series_library')
        .select('*')
        .in('id', seriesIds);
      if (lErr) throw lErr;

      const libMap = {};
      libRows.forEach(l => { libMap[l.id] = libRowToLocal(l); });

      return trackerRows
        .filter(t => libMap[t.series_id])
        .map(t => mergeShow(normalizeShow(libMap[t.series_id]), t))
        .reverse();
    } catch (e) {
      console.error('getShows error:', e);
      return getTrackerLocal().map(t => normalizeShow(t));
    }
  }
  return getTrackerLocal().map(t => normalizeShow(t));
}

// Get shows filtered by status
async function getShowsByStatus(status) {
  if (status === 'All') return getShows();
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { data: trackerRows, error: tErr } = await supabaseClient
        .from('user_tracker')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status);
      if (tErr) throw tErr;
      if (!trackerRows || trackerRows.length === 0) return [];

      const seriesIds = trackerRows.map(t => t.series_id);
      const { data: libRows, error: lErr } = await supabaseClient
        .from('series_library')
        .select('*')
        .in('id', seriesIds);
      if (lErr) throw lErr;

      const libMap = {};
      libRows.forEach(l => { libMap[l.id] = libRowToLocal(l); });

      return trackerRows
        .filter(t => libMap[t.series_id])
        .map(t => mergeShow(normalizeShow(libMap[t.series_id]), t))
        .reverse();
    } catch (e) {
      console.error('getShowsByStatus error:', e);
      return getTrackerLocal().filter(t => t.status === status).map(t => normalizeShow(t));
    }
  }
  return getTrackerLocal().filter(t => t.status === status).map(t => normalizeShow(t));
}

// Get status counts for current user
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

// Get single show by tracker ID (for detail modal)
async function getShowById(id) {
  const userId = await getUserId();
  if (useSupabase && userId) {
    try {
      const { data: tracker, error: tErr } = await supabaseClient
        .from('user_tracker')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (tErr) throw tErr;

      const { data: series, error: lErr } = await supabaseClient
        .from('series_library')
        .select('*')
        .eq('id', tracker.series_id)
        .single();
      if (lErr) throw lErr;

      return mergeShow(normalizeShow(libRowToLocal(series)), tracker);
    } catch (e) {
      console.error('getShowById error:', e);
      return getTrackerLocal().find(s => s.id === id);
    }
  }
  return getTrackerLocal().find(s => s.id === id);
}

// Get shows for calendar by month
async function getShowsByMonth(year, month) {
  const shows = await getShows();
  return shows.filter(s => {
    const d = new Date(s.releaseDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// Add show: search library first, create if needed, then add to user tracker
async function addShow(show) {
  const userId = await getUserId();

  if (useSupabase && userId) {
    try {
      // 1. Search library for existing series by title
      const { data: existing, error: searchErr } = await supabaseClient
        .from('series_library')
        .select('id')
        .ilike('title', show.title.trim())
        .limit(1);

      let seriesId;

      if (searchErr) throw searchErr;

      if (existing && existing.length > 0) {
        seriesId = existing[0].id;
      } else {
        // 2. Create new library entry
        const libData = localToLibRow(show);
        libData.last_updated = new Date().toISOString();
        const { data: newLib, error: insertErr } = await supabaseClient
          .from('series_library')
          .insert([libData])
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        seriesId = newLib.id;
      }

      // 3. Add to user tracker
      const trackerData = {
        user_id: userId,
        series_id: seriesId,
        status: show.status || 'Plan to Watch',
        personal_rating: show.personalRating || 0,
        notes: show.notes || '',
        date_added: new Date().toISOString(),
        last_watched: new Date().toISOString()
      };

      const { data: tracker, error: tErr } = await supabaseClient
        .from('user_tracker')
        .insert([trackerData])
        .select('*')
        .single();
      if (tErr) throw tErr;

      // 4. Return merged result
      const { data: libSeries } = await supabaseClient
        .from('series_library')
        .select('*')
        .eq('id', seriesId)
        .single();

      return mergeShow(normalizeShow(libRowToLocal(libSeries)), tracker);
    } catch (e) {
      console.error('addShow error:', e);
      return addShowLocal(show);
    }
  }
  return addShowLocal(show);
}

// Update show (status, rating, notes in tracker; metadata in library if creator)
async function updateShow(id, updated) {
  const userId = await getUserId();

  if (useSupabase && userId) {
    try {
      const { data: tracker, error: tErr } = await supabaseClient
        .from('user_tracker')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      if (tErr) throw tErr;

      // Update tracker fields
      const trackerUpdate = {};
      if (updated.status) trackerUpdate.status = updated.status;
      if (updated.personalRating !== undefined) trackerUpdate.personal_rating = updated.personalRating;
      if (updated.notes !== undefined) trackerUpdate.notes = updated.notes;
      trackerUpdate.last_watched = new Date().toISOString();

      if (Object.keys(trackerUpdate).length > 0) {
        await supabaseClient
          .from('user_tracker')
          .update(trackerUpdate)
          .eq('id', id);
      }

      // Update library metadata if provided
      const libUpdate = {};
      if (updated.title) libUpdate.title = updated.title;
      if (updated.description !== undefined) libUpdate.description = updated.description;
      if (updated.poster !== undefined) libUpdate.poster = updated.poster;
      if (updated.releaseDate !== undefined) libUpdate.release_date = updated.releaseDate;
      if (updated.genre !== undefined) libUpdate.genre = updated.genre;
      if (updated.language !== undefined) libUpdate.language = updated.language;
      if (updated.platform !== undefined) libUpdate.platform = updated.platform;
      if (updated.platformLogo !== undefined) libUpdate.platform_logo = updated.platformLogo;
      if (updated.creators) libUpdate.creators = updated.creators;
      if (updated.cast) libUpdate.cast_members = updated.cast;
      libUpdate.last_updated = new Date().toISOString();

      if (Object.keys(libUpdate).length > 1) {
        await supabaseClient
          .from('series_library')
          .update(libUpdate)
          .eq('id', tracker.series_id);
      }

      // Return merged
      const { data: series } = await supabaseClient
        .from('series_library')
        .select('*')
        .eq('id', tracker.series_id)
        .single();

      const updatedTracker = { ...tracker, ...trackerUpdate };
      return mergeShow(normalizeShow(libRowToLocal(series)), updatedTracker);
    } catch (e) {
      console.error('updateShow error:', e);
      return updateShowLocal(id, updated);
    }
  }
  return updateShowLocal(id, updated);
}

// Delete from user tracker only (keeps library entry for other users)
async function deleteShow(id) {
  const userId = await getUserId();

  if (useSupabase && userId) {
    try {
      const { error } = await supabaseClient
        .from('user_tracker')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return;
    } catch (e) {
      console.error('deleteShow error:', e);
      return deleteShowLocal(id);
    }
  }
  return deleteShowLocal(id);
}

// ===== localStorage fallbacks =====
function addShowLocal(show) {
  const lib = getLibraryLocal();
  const tracker = getTrackerLocal();

  let libEntry = lib.find(s => s.title.toLowerCase() === show.title.trim().toLowerCase());
  if (!libEntry) {
    libEntry = { ...show, id: Date.now() };
    lib.push(libEntry);
    saveLibraryLocal(lib);
  }

  const trackerEntry = {
    id: Date.now() + 1,
    userId: 'local',
    seriesId: libEntry.id,
    status: show.status || 'Plan to Watch',
    personalRating: 0,
    notes: '',
    dateAdded: new Date().toISOString(),
    lastWatched: new Date().toISOString(),
    poster: libEntry.poster, title: libEntry.title, description: libEntry.description,
    releaseDate: libEntry.releaseDate, genre: libEntry.genre, language: libEntry.language,
    platform: libEntry.platform, platformLogo: libEntry.platformLogo,
    creators: libEntry.creators, cast: libEntry.cast
  };
  tracker.push(trackerEntry);
  saveTrackerLocal(tracker);
  return trackerEntry;
}

function updateShowLocal(id, updated) {
  const tracker = getTrackerLocal();
  const idx = tracker.findIndex(s => s.id === id);
  if (idx !== -1) {
    tracker[idx] = { ...tracker[idx], ...updated };
    saveTrackerLocal(tracker);
    return tracker[idx];
  }
  return null;
}

function deleteShowLocal(id) {
  const tracker = getTrackerLocal().filter(s => s.id !== id);
  saveTrackerLocal(tracker);
}

initSupabase();
