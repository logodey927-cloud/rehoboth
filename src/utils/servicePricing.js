/**
 * Service Pricing Utility
 * Fetches service pricing from API and calculates prices
 */

import { getServices, unwrapServicesList } from "../api/api";

/**
 * Get service price from API
 * @param {string} serviceName - Name of the service
 * @param {number|null} duration - Duration in minutes (optional)
 * @returns {Promise<{price: number, duration: number}>}
 */
export async function getServicePrice(serviceName, duration = null) {
  try {
    if (!serviceName) {
      return { price: 70, duration: 60 };
    }

    // Fetch services from API
    const response = await getServices();
    if (!response.data?.success) {
      return { price: 70, duration: 60 };
    }

    const services = unwrapServicesList(response);

    // Find matching service by title or item name
    let matchedService = null;
    let matchedItem = null;
    let matchedDuration = null;

    for (const service of services) {
      // Check if service title matches
      if (service.title && service.title.toLowerCase().includes(serviceName.toLowerCase())) {
        matchedService = service;
        break;
      }

      // Check service items
      if (service.items && Array.isArray(service.items)) {
        for (const item of service.items) {
          if (item.name && item.name.toLowerCase().includes(serviceName.toLowerCase())) {
            matchedService = service;
            matchedItem = item;
            break;
          }
        }
      }
    }

    if (!matchedService) {
      return { price: 70, duration: 60 };
    }

    // If we have a matched item, check its durations
    if (matchedItem && matchedItem.durations) {
      const durations = Array.isArray(matchedItem.durations)
        ? matchedItem.durations
        : [matchedItem.durations];

      // If duration is specified, find matching duration
      if (duration) {
        matchedDuration = durations.find((d) => d.minutes === duration);
      }

      // If no match or no duration specified, use first duration
      if (!matchedDuration && durations.length > 0) {
        matchedDuration = durations[0];
      }

      if (matchedDuration) {
        return {
          price: parseFloat(matchedDuration.price) || 70,
          duration: matchedDuration.minutes || 60,
        };
      }
    }

    // Fallback: use first item's first duration from matched service
    if (matchedService.items && Array.isArray(matchedService.items)) {
      const firstItem = matchedService.items[0];
      if (firstItem && firstItem.durations) {
        const durations = Array.isArray(firstItem.durations)
          ? firstItem.durations
          : [firstItem.durations];
        if (durations.length > 0) {
          const firstDuration = durations[0];
          return {
            price: parseFloat(firstDuration.price) || 70,
            duration: firstDuration.minutes || 60,
          };
        }
      }
    }

    // Final fallback
    return { price: 70, duration: 60 };
  } catch (err) {
    return { price: 70, duration: 60 };
  }
}

/**
 * Calculate voucher discount
 * @param {object} voucher - Voucher object with discount_type and discount_value
 * @param {number} servicePrice - Original service price
 * @returns {number} Discount amount
 */
export function calculateVoucherDiscount(voucher, servicePrice) {
  if (!voucher || !voucher.discount_type) {
    return 0;
  }

  if (voucher.discount_type === "free_service" || voucher.discount_type === "full_coverage") {
    return servicePrice;
  }

  if (voucher.discount_type === "percent") {
    return (servicePrice * voucher.discount_value) / 100;
  } else if (voucher.discount_type === "amount") {
    return Math.min(voucher.discount_value, servicePrice);
  }

  return 0;
}

