/**
 * Resolve customer avatar: uploaded URL or deterministic gender-based default (DiceBear).
 */

const STYLES = {
  female: "micah",
  male: "micah",
  neutral: "micah",
};

function styleForGender(gender) {
  if (gender === "male") return STYLES.male;
  if (gender === "female") return STYLES.female;
  return STYLES.neutral;
}

/** Deterministic default avatar URL from user id + gender */
export function getDefaultAvatarUrl({ id, gender } = {}) {
  const seed = encodeURIComponent(id || "guest");
  const style = styleForGender(gender);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=128&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

/** Display URL: custom upload wins, else gender default */
export function resolveUserAvatarUrl(user) {
  const custom = user?.avatar_url?.trim();
  if (custom) return custom;
  return getDefaultAvatarUrl({ id: user?.id, gender: user?.gender });
}

export function userHasCustomAvatar(user) {
  return Boolean(user?.avatar_url?.trim());
}
