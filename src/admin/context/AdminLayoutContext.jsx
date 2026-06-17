import React, { createContext, useContext } from "react";

const AdminLayoutContext = createContext(null);

export function AdminLayoutProvider({ sidebarOpen, children }) {
  return (
    <AdminLayoutContext.Provider value={{ sidebarOpen }}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) {
    throw new Error("useAdminLayout must be used within an AdminLayoutProvider");
  }
  return ctx;
}
