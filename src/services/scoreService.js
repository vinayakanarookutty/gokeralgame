/**
 * scoreService.js
 * GoKeralam Backend Service
 * Handles non-blocking asynchronous score submission and live leaderboard retrieval
 * connected to the Coolnest Render backend (configured via environment variables).
 */

// Helper to resolve route to full URL (supports both absolute URLs and relative paths)
const resolveEndpoint = (route, defaultRoute, baseUrl) => {
  const chosenRoute = (route || '').trim() || defaultRoute;
  if (/^https?:\/\//i.test(chosenRoute)) {
    return chosenRoute;
  }
  const cleanBase = (baseUrl || 'https://coolnest-backend.onrender.com').replace(/\/+$/, '');
  const cleanRoute = chosenRoute.startsWith('/') ? chosenRoute : `/${chosenRoute}`;
  return `${cleanBase}${cleanRoute}`;
};

// 1. Backend Base URL from environment variable (VITE_BACKEND_URL)
export const BACKEND_BASE_URL =
  (typeof window !== 'undefined' && window.__BACKEND_URL__) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  'https://coolnest-backend.onrender.com';

// 2. Name & Score submission route from environment variable (VITE_NAME_ROUTE or VITE_SCORES_ROUTE)
export const NAME_ROUTE =
  (typeof window !== 'undefined' && (window.__NAME_ROUTE__ || window.__SCORES_ROUTE__)) ||
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_NAME_ROUTE || import.meta.env.VITE_SCORES_ROUTE)) ||
  '/api/scores';

// 3. Leaderboard route from environment variable (VITE_LEADERBOARD_ROUTE)
export const LEADERBOARD_ROUTE =
  (typeof window !== 'undefined' && window.__LEADERBOARD_ROUTE__) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LEADERBOARD_ROUTE) ||
  '/api/scores';

// Resolved full endpoints
export const NAME_ENDPOINT = resolveEndpoint(NAME_ROUTE, '/api/scores', BACKEND_BASE_URL);
export const SCORES_ENDPOINT = NAME_ENDPOINT;
export const LEADERBOARD_ENDPOINT = resolveEndpoint(LEADERBOARD_ROUTE, '/api/scores', BACKEND_BASE_URL);

/**
 * Fire-and-forget asynchronous score and player name saving.
 * Does NOT block or wait for the server response before showing game over screen.
 * The game transitions immediately, and the score is saved in the background.
 */
export const saveScoreAsync = (data) => {
  const payload = {
    playerName: (data.playerName || localStorage.getItem('gokerala_player_name') || 'Runner').trim(),
    score: typeof data.score === 'number' ? data.score : parseInt(data.score || '0', 10),
    km: data.km ? data.km.toString() : '0.00',
    distance: typeof data.distance === 'number' ? data.distance : parseFloat(data.distance || '0'),
    coins: typeof data.coins === 'number' ? data.coins : parseInt(data.coins || '0', 10),
    coconuts: typeof data.coconuts === 'number' ? data.coconuts : parseInt(data.coconuts || '0', 10),
    location: data.location?.name || data.location || 'Kerala',
    controlMode: data.controlMode || localStorage.getItem('gokerala_control_mode') || 'HALF_BODY',
  };

  // 1. Cache to local storage immediately
  try {
    const localHistory = JSON.parse(localStorage.getItem('gokerala_local_scores') || '[]');
    localHistory.unshift({
      ...payload,
      _id: 'local_' + Date.now(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('gokerala_local_scores', JSON.stringify(localHistory.slice(0, 50)));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  // 2. Fire-and-forget fetch to Coolnest Cloud Backend
  const endpoint = NAME_ENDPOINT || SCORES_ENDPOINT;
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true, // Allows request to outlive page unload if needed
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      console.log('✓ Score successfully stored in Coolnest Cloud DB:', result);
    })
    .catch((error) => {
      console.warn('Backend score submission queued/failed in background:', error.message);
    });
};

/**
 * Fetch top leaderboard scores from the backend database.
 * Uses LEADERBOARD_ENDPOINT configured via VITE_LEADERBOARD_ROUTE.
 * Falls back to local cached scores or default Kerala Champions if unreachable.
 */
export const getLeaderboardAsync = async (limit = 20) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const separator = LEADERBOARD_ENDPOINT.includes('?') ? '&' : '?';
    const url = `${LEADERBOARD_ENDPOINT}${separator}limit=${limit}`;

    const res = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item, index) => ({
          rank: index + 1,
          id: item._id || `entry_${index}`,
          name: item.playerName || item.name || 'Runner',
          score: item.score || 0,
          distance: `${item.km || '0.00'} km`,
          location: item.location || 'Kerala',
          badge: index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`,
          createdAt: item.createdAt,
        }));
      }
    }
  } catch (err) {
    console.info('Backend leaderboard unreachable or timed out, using fallback:', err.message);
  }

  // Fallback to locally cached scores
  try {
    const local = JSON.parse(localStorage.getItem('gokerala_local_scores') || '[]');
    if (local.length > 0) {
      return local.slice(0, limit).map((item, idx) => ({
        rank: idx + 1,
        id: item._id || `local_${idx}`,
        name: item.playerName || item.name || 'Runner',
        score: item.score || 0,
        distance: `${item.km || '0.00'} km`,
        location: item.location || 'Kerala',
        badge: idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`,
      }));
    }
  } catch (e) {
    // ignore
  }

  // Default Kerala champions fallback
  return [
    { rank: 1, name: 'Ananya Nair (Kochi)', distance: '14.8 km', score: 18450, location: 'Munnar', badge: '👑' },
    { rank: 2, name: 'Rahul Varma (Thrissur)', distance: '12.4 km', score: 15200, location: 'Thrissur', badge: '🥈' },
    { rank: 3, name: 'Fahad Faasil (Alappuzha)', distance: '11.2 km', score: 13980, location: 'Alappuzha', badge: '🥉' },
    { rank: 4, name: 'Devika Menon (Calicut)', distance: '7.5 km', score: 9850, location: 'Wayanad', badge: '#4' },
    { rank: 5, name: 'Ashwin Pillai (Trivandrum)', distance: '6.8 km', score: 8700, location: 'Kovalam', badge: '#5' },
  ];
};
