import React, { createContext, useContext, useState, useEffect } from "react";

const TeamMemberAuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTeamMemberAuth = () => {
  const context = useContext(TeamMemberAuthContext);
  if (!context) {
    throw new Error("useTeamMemberAuth must be used within TeamMemberAuthProvider");
  }
  return context;
};

export const TeamMemberAuthProvider = ({ children }) => {
  const [teamMember, setTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("teamMemberToken");
    const memberData = localStorage.getItem("teamMember");
    
    if (token && memberData) {
      try {
        setTeamMember(JSON.parse(memberData));
      } catch (err) {
        localStorage.removeItem("teamMemberToken");
        localStorage.removeItem("teamMember");
      }
    }
    setLoading(false);
  }, []);

  const login = (token, member) => {
    localStorage.setItem("teamMemberToken", token);
    localStorage.setItem("teamMember", JSON.stringify(member));
    setTeamMember(member);
  };

  const logout = () => {
    localStorage.removeItem("teamMemberToken");
    localStorage.removeItem("teamMember");
    setTeamMember(null);
  };

  const updateMember = (member) => {
    const token = localStorage.getItem("teamMemberToken");
    if (token) {
      localStorage.setItem("teamMember", JSON.stringify(member));
      setTeamMember(member);
    }
  };

  return (
    <TeamMemberAuthContext.Provider value={{ teamMember, login, logout, updateMember, loading }}>
      {children}
    </TeamMemberAuthContext.Provider>
  );
};

