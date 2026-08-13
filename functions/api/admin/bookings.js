// Helper for standard JSON responses with CORS headers
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key'
    }
  });
}

function checkAdminAuth(request, env) {
  const adminKey = env.ADMIN_API_KEY;
  if (!adminKey) {
    // If no ADMIN_API_KEY is configured in Cloudflare environment secrets, block public access
    return false;
  }
  const providedKey = request.headers.get('X-Admin-Key') || 
                      (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  return providedKey === adminKey;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key'
    }
  });
}

// GET /api/admin/bookings (List bookings)
export async function onRequestGet(context) {
  const { request, env } = context;

  if (!checkAdminAuth(request, env)) {
    return jsonResponse({ success: false, error: 'Unauthorized: Invalid or missing X-Admin-Key header.' }, 401);
  }

  const db = env.DB || env.BOOKINGS_DB;
  if (!db) {
    return jsonResponse({ success: false, error: 'Cloudflare D1 Database binding (env.DB) is not configured.' }, 500);
  }

  try {
    const { results } = await db.prepare(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100`).all();
    return jsonResponse({ success: true, count: results.length, bookings: results });
  } catch (err) {
    console.error('[Admin GET Error]', err);
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// PATCH /api/admin/bookings (Update booking status)
export async function onRequestPatch(context) {
  const { request, env } = context;

  if (!checkAdminAuth(request, env)) {
    return jsonResponse({ success: false, error: 'Unauthorized: Invalid or missing X-Admin-Key header.' }, 401);
  }

  const db = env.DB || env.BOOKINGS_DB;
  if (!db) {
    return jsonResponse({ success: false, error: 'Cloudflare D1 Database binding (env.DB) is not configured.' }, 500);
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return jsonResponse({ success: false, error: 'Missing id or status parameter.' }, 400);
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return jsonResponse({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
    }

    const info = await db.prepare(`UPDATE bookings SET status = ? WHERE id = ?`).bind(status, id).run();
    return jsonResponse({ success: true, message: `Booking ${id} status updated to ${status}.`, changes: info.meta?.changes });
  } catch (err) {
    console.error('[Admin PATCH Error]', err);
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
