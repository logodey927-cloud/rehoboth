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
  }

  return body;
}
