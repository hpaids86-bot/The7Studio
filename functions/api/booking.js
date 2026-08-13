import { sendBookingNotificationEmail } from '../_utils/email.js';

// Helper for standard JSON responses with CORS headers
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    }
  });
}

// Handle OPTIONS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    }
  });
}

// Handle GET requests (API Health / Info Check)
export async function onRequestGet(context) {
  return jsonResponse({
    status: 'online',
    service: 'The7Studio Booking API',
    endpoint: '/api/booking',
    method: 'POST required for booking submission'
  });
}

// Handle POST requests (Booking Submission)
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get('content-type') || '';
    let body = {};

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (body[key]) {
          body[key] = Array.isArray(body[key]) ? [...body[key], value] : [body[key], value];
        } else {
          body[key] = value;
        }
      }
    } else {
      // Fallback text or raw attempt
      try {
        body = await request.json();
      } catch (e) {
        return jsonResponse({ success: false, error: 'Unsupported Content-Type. Please send JSON.' }, 400);
      }
    }

    // Extract fields
    const name = (body.name || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const event_type = (body.event_type || body.service || '').toString().trim();
    const event_date = (body.event_date || body.date || '').toString().trim();
    const preferred_time = (body.preferred_time || body.time || '').toString().trim();
    const location = (body.location || '').toString().trim();
    const package_info = Array.isArray(body.package || body.services) 
      ? (body.package || body.services).join(', ') 
      : (body.package || body.services || body.budget || '').toString().trim();
    const hours = (body.hours || body.duration || '').toString().trim();
    const message = (body.message || body.details || '').toString().trim();

    // SERVER-SIDE VALIDATION
    const errors = [];

    if (!name || name.length < 2) {
      errors.push('Full name is required (minimum 2 characters).');
    }

    // Phone validation: allow digits, spaces, hyphens, plus sign, min 10 digits
    const cleanedPhone = phone.replace(/[^0-9+]/g, '');
    if (!phone || cleanedPhone.length < 10) {
      errors.push('A valid phone number (at least 10 digits) is required.');
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email address format.');
    }

    if (!event_type) {
      errors.push('Event type selection is required.');
    }

    if (!event_date) {
      errors.push('Event date is required.');
    } else {
      // Check date format and basic sanity
      const parsedDate = new Date(event_date);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Invalid event date provided.');
      }
    }

    // Anti-Spam Check: Honeypot or rapid submission check
    if (body.website_url || body._gotcha) {
      // Honeypot field filled -> silent reject spam
      return jsonResponse({
        success: true,
        message: 'Booking request received successfully. Our team will contact you shortly to confirm availability.'
      });
    }

    if (errors.length > 0) {
      return jsonResponse({
        success: false,
        error: `Validation error: ${errors.join(' ')}`
      }, 400);
    }

    // Generate unique booking record
    const id = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const created_at = new Date().toISOString();
    const status = 'pending';

    const bookingRecord = {
      id,
      created_at,
      name,
      phone,
      email,
      event_type,
      event_date,
      preferred_time,
      location,
      package: package_info,
      hours,
      message,
      status
    };

    // DATABASE STORAGE (Cloudflare D1)
    const db = env.DB || env.BOOKINGS_DB;
    let savedToDb = false;

    if (db) {
      try {
        await db.prepare(`
          INSERT INTO bookings (id, created_at, name, phone, email, event_type, event_date, preferred_time, location, package, hours, message, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          created_at,
          name,
          phone,
          email,
          event_type,
          event_date,
          preferred_time,
          location,
          package_info,
          hours,
          message,
          status
        ).run();
        savedToDb = true;
        console.log(`[D1 Storage] Successfully saved booking ${id}`);
      } catch (dbErr) {
        console.error('[D1 Storage Error]', dbErr);
        // Continue gracefully even if D1 table setup is pending
      }
    } else {
      console.warn('[D1 Storage Warning] D1 Database binding (env.DB) not found. Booking processed in memory.');
    }

    // EMAIL NOTIFICATION DISPATCH (Async background attempt)
    try {
      context.waitUntil(sendBookingNotificationEmail(env, bookingRecord));
    } catch (e) {
      await sendBookingNotificationEmail(env, bookingRecord);
    }

    return jsonResponse({
      success: true,
      message: 'Booking request received successfully.\nOur team will contact you shortly to confirm availability.',
      bookingId: id,
      dbStatus: savedToDb ? 'saved' : 'pending_configuration'
    }, 200);

  } catch (err) {
    console.error('[POST /api/booking Exception]', err);
    return jsonResponse({
      success: false,
      error: 'An internal server error occurred while processing your request. Please try again or contact us directly via WhatsApp/Phone.'
    }, 500);
  }
}
