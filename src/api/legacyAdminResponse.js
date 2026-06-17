/**
 * Maps `{ success, data, meta }` API responses to legacy admin SPA keys.
 */
export function applyLegacyAdminResponse(body, url = '') {
  if (!body?.success || body.data === undefined) return body;

  const path = url.split('?')[0] || '';

  if (path.includes('/admin/appointments') || path === '/appointments') {
    body.appointments = Array.isArray(body.data) ? body.data : [];
  } else if (path.includes('/admin/contact-messages')) {
    body.messages = Array.isArray(body.data) ? body.data : [];
  } else if (path.includes('/newsletter/subscribers')) {
    body.subscribers = Array.isArray(body.data) ? body.data : [];
  } else if (path.includes('/admin/vouchers/issues/recent')) {
    body.issues = body.data?.issues || [];
  } else if (path.includes('/admin/vouchers')) {
    body.vouchers = body.data?.vouchers || (Array.isArray(body.data) ? body.data : []);
  } else if (path.includes('/admin/reviews')) {
    body.reviews = Array.isArray(body.data) ? body.data : [];
  } else if (path.includes('/admin/notifications')) {
    body.notifications = Array.isArray(body.data) ? body.data : [];
    if (body.meta?.unreadCount != null) {
      body.unreadCount = body.meta.unreadCount;
    }
  } else if (/\/admin\/users\/?$/.test(path)) {
    body.users = Array.isArray(body.data) ? body.data : [];
    if (body.meta?.total != null) {
      body.total = body.meta.total;
    }
  } else if (/\/admin\/users\/[^/]+$/.test(path)) {
    body.user = body.data?.user || body.data;
  } else if (path.match(/\/admin\/services\/[^/]+\/team-members$/)) {
    body.teamMembers = body.data?.teamMembers || [];
  } else if (path.includes('/admin/team')) {
    body.teamMembers = Array.isArray(body.data) ? body.data : [];
  } else if (path.endsWith('/vouchers/public')) {
    body.vouchers = body.data?.vouchers || [];
  } else if (path.match(/\/vouchers\/public\/[^/]+$/)) {
    body.voucher = body.data;
  } else if (path === '/services' || /\/admin\/services\/?$/.test(path)) {
    body.services = Array.isArray(body.data) ? body.data : [];
    if (body.data && !Array.isArray(body.data)) {
      body.service = body.data;
    }
  } else if (path.match(/\/admin\/services\/[^/]+$/) || path.match(/\/services\/[^/]+$/)) {
    body.service = body.data;
  } else if (path.includes('/admin/crm/contacts')) {
    body.contacts = body.data?.contacts || (Array.isArray(body.data) ? body.data : []);
  } else if (path.includes('/users/me/bookings') || path.includes('/users/me/appointments')) {
    body.appointments = Array.isArray(body.data) ? body.data : [];
  } else if (path.match(/\/users\/me$/) || path.endsWith('/users/me')) {
    body.user = body.data;
  } else if (path.includes('/users/me/vouchers')) {
    body.vouchers = Array.isArray(body.data) ? body.data : [];
  } else if (
    /\/appointments\/[^/]+$/.test(path) &&
    !path.includes('/admin/') &&
    !path.includes('/available-')
  ) {
    body.appointment = body.data;
  } else if (path.includes('/available-dates')) {
    const dates = Array.isArray(body.data) ? body.data : [];
    const availableDates = {};
    for (const d of dates) {
      if (typeof d === 'string') {
        availableDates[d] = { available: true, timeSlots: [], reason: null };
      }
    }
    body.availableDates = availableDates;
  } else if (path.includes('/admin/blocked-time-slots')) {
    body.blockedTimeSlots = Array.isArray(body.data) ? body.data : [];
  }

  return body;
}
