import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  Pagination,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeroPageSection from "../components/sections/HeroPageSection";
import TeamSidebar from "../components/common09/TeamSidebar";
import TeamMuiCard from "../components/common09/TeamMuiCard";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SEO from "../components/common09/SEO";
import { getTeamMembers } from "../api/api";

export default function Team() {
  const navigate = useNavigate();
  const teamListPanelRef = useRef(null);
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [activeSpecialisation, setActiveSpecialisation] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTeamMembers();
      if (response.data?.success) {
        // Map API response to match expected format
        const mappedData = (response.data.teamMembers || []).map((member) => ({
          id: member.id,
          image: member.image_url || null,
          title: member.title,
          role: member.role,
          gender: member.gender || "",
          availability: member.availability || "",
          specialisation: member.specialisation || "",
          description: member.description || "",
        }));
        setTeamData(mappedData);
      } else {
        setError("Failed to load team members");
      }
    } catch (err) {
      setError("Failed to load team members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique roles from team data
  const roles = useMemo(() => {
    const roleSet = new Set();
    teamData.forEach((member) => {
      // Extract base role (remove parenthetical info for filtering)
      const baseRole = member.role.split("(")[0].trim();
      roleSet.add(baseRole);
    });
    return Array.from(roleSet);
  }, [teamData]);

  // Extract unique specialisations from team data
  const specialisations = useMemo(() => {
    const specSet = new Set();
    teamData.forEach((member) => {
      if (member.specialisation) {
        // Split by comma and clean up
        const specs = member.specialisation
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        specs.forEach((spec) => specSet.add(spec));
      }
    });
    return Array.from(specSet);
  }, [teamData]);

  // Filter team members based on search and filters
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return teamData
      .filter((member) => {
        // Search filter
        const matchesSearch =
          q === "" ||
          member.title.toLowerCase().includes(q) ||
          member.role.toLowerCase().includes(q) ||
          (member.specialisation &&
            member.specialisation.toLowerCase().includes(q)) ||
          (member.description && member.description.toLowerCase().includes(q));

        // Role filter
        const memberBaseRole = member.role.split("(")[0].trim();
        const matchesRole =
          selectedRole === "All" || memberBaseRole === selectedRole;

        // Specialisation filter
        const matchesSpecialisation =
          !activeSpecialisation ||
          (member.specialisation &&
            member.specialisation
              .toLowerCase()
              .includes(activeSpecialisation.toLowerCase()));

        return matchesSearch && matchesRole && matchesSpecialisation;
      })
      .sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by name
  }, [teamData, searchTerm, selectedRole, activeSpecialisation]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const openTeamMember = (id) => navigate(`/team/${id}`);

  if (loading) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      className="team-page"
      sx={{ minHeight: "100vh", backgroundColor: "#fff", p: 0 }}
    >
      <SEO
        title="Our Team - Rehoboth Health & Wellness Clinic"
        description="Meet our professional team of therapists and wellness experts at Rehoboth Health & Wellness Clinic. Experienced, certified professionals dedicated to your health and relaxation."
        keywords="team, therapists, wellness experts, massage therapists, beauty therapists, Rochdale, Manchester"
      />
      <HeroPageSection
        title="Our Team"
        breadcrumb={[{ label: "Home", link: "/" }, { label: "Our Team" }]}
      />

      <Grid
        container
        spacing={2}
        sx={{ py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 6 } }}
      >
        {/* Main Content */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ px: { xs: 0, md: 2 }, py: { xs: 3, md: 4 } }}
        >
          <Box
            id="team-list-panel"
            ref={teamListPanelRef}
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 300,
                mb: 3,
                fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
              }}
            >
              {searchTerm || selectedRole !== "All" || activeSpecialisation
                ? `Search Results (${filtered.length})`
                : `All Team Members (${filtered.length})`}
            </Typography>
            {filtered.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 0 }}>
                No team members found matching your criteria.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {pageItems.map((member) => (
                  <Grid key={member.id} size={{ xs: 12, sm: 6 }}>
                    <TeamMuiCard
                      id={member.id}
                      title={member.title}
                      role={member.role}
                      image={member.image}
                      specialisation={member.specialisation}
                      onClick={() => openTeamMember(member.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => {
                    setPage(v);
                    if (teamListPanelRef.current)
                      teamListPanelRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    else window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  variant="outlined"
                  shape="rounded"
                  sx={{ "& .MuiPaginationItem-root": { borderRadius: 0 } }}
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
              p: { xs: 2, md: 3 },
              borderLeft: { xs: "none", md: "1px solid #eee" },
            }}
          >
            <TeamSidebar
              searchTerm={searchTerm}
              onSearchChange={(v) => {
                setPage(1);
                setSearchTerm(v);
              }}
              roles={roles}
              activeRole={selectedRole}
              onRoleChange={(v) => {
                setPage(1);
                setSelectedRole(v);
              }}
              specialisations={specialisations}
              activeSpecialisation={activeSpecialisation}
              onSpecialisationChange={(spec) => {
                setPage(1);
                setActiveSpecialisation(spec);
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* TestimonialsSection */}
      <TestimonialsSection />
    </Box>
  );
}
