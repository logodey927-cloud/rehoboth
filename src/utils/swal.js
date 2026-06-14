// Lightweight SweetAlert2 loader using CDN, so we don't need a local dependency.
// Falls back to window.alert if CDN fails.

export const ensureSweetAlertReady = async () => {
  if (typeof window !== "undefined" && window.Swal) return true;
  try {
    await new Promise((resolve, reject) => {
      const id = "swal2-cdn-script";
      if (document.getElementById(id)) return resolve();
      const script = document.createElement("script");
      script.id = id;
      script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return true;
  } catch {
    return false;
  }
};

export const swalSuccess = async (title, text) => {
  const ok = await ensureSweetAlertReady();
  if (ok && window.Swal) return window.Swal.fire({ icon: "success", title, text, confirmButtonColor: "#0C6E6D" });
  // Fallback - only use alert in development
  if (import.meta.env.DEV || import.meta.env.MODE === "development") {
    alert(`${title}\n${text}`);
  } else {
    // In production, log to console instead of alert
    console.error(`${title}: ${text}`);
  }
};

export const swalError = async (title, text) => {
  const ok = await ensureSweetAlertReady();
  if (ok && window.Swal) return window.Swal.fire({ icon: "error", title, text, confirmButtonColor: "#d32f2f" });
  // Fallback - only use alert in development
  if (import.meta.env.DEV || import.meta.env.MODE === "development") {
    alert(`${title}\n${text}`);
  } else {
    // In production, log to console instead of alert
    console.error(`${title}: ${text}`);
  }
};

export const swalConfirm = async (title, text, confirmText = "Yes", cancelText = "Cancel") => {
  const ok = await ensureSweetAlertReady();
  if (ok && window.Swal) {
    const result = await window.Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: "#0C6E6D",
      cancelButtonColor: "#6c757d",
    });
    return result; // Return the full result object so result.isConfirmed works
  }
  // Fallback - return object with isConfirmed property
  const confirmed = confirm(`${title}\n${text}`);
  return { isConfirmed: confirmed, isDenied: false, isDismissed: !confirmed };
};

