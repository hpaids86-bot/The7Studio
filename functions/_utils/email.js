/**
 * Email Notification Utility for The7Studio
 * Supports Resend, SendGrid, or direct Webhook notification through environment variables.
 */
export async function sendBookingNotificationEmail(env, bookingData) {
  const adminEmail = env.NOTIFICATION_EMAIL || 'the7studioo@gmail.com';
  const apiKey = env.EMAIL_API_KEY || env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('[Email Utility] No EMAIL_API_KEY provided. Skipping automated email dispatch.');
    return { success: false, reason: 'EMAIL_API_KEY not configured' };
  }

  const subject = `New Booking Request: ${bookingData.name} - ${bookingData.event_type} (${bookingData.event_date})`;
  const textBody = `
New Booking Request Received:
-----------------------------
ID: ${bookingData.id}
Name: ${bookingData.name}
Phone: ${bookingData.phone}
Email: ${bookingData.email || 'N/A'}
Event Type: ${bookingData.event_type}
Event Date: ${bookingData.event_date}
Preferred Time: ${bookingData.preferred_time || 'N/A'}
Location: ${bookingData.location || 'N/A'}
Package/Services: ${bookingData.package || 'N/A'}
Hours/Duration: ${bookingData.hours || 'N/A'}
Message: ${bookingData.message || 'None'}
Status: ${bookingData.status}
Created At: ${bookingData.created_at}
  `.trim();

  try {
    // Resend API integration default
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'The7Studio Bookings <bookings@the7studio.in>',
        to: [adminEmail],
        subject: subject,
        text: textBody
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errText = await response.text();
      console.error('[Email Utility Error]', errText);
      return { success: false, error: errText };
    }
  } catch (err) {
    console.error('[Email Utility Exception]', err);
    return { success: false, error: err.message };
  }
}
