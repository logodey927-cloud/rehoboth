import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Chip,
  Divider,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import HeroPageSection from "../components/sections/HeroPageSection";
import { useParams, useNavigate } from "react-router-dom";
import TeamSidebar from "../components/common09/TeamSidebar";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SEO from "../components/common09/SEO";
import AvailabilityDisplay from "../components/common09/AvailabilityDisplay";
import { getTeamMemberById, getTeamMembers, getTeamMemberSpecialisationsPublic } from "../api/api";
import defaultTeamImage from "../assets/backgroundImg/rehoboth-spa-bg.png";

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [activeSpecialisation, setActiveSpecialisation] = useState("");
  const [specialisationsFromTable, setSpecialisationsFromTable] = useState([]);

  // Fetch all members for sidebar filters
  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const response = await getTeamMembers();
        if (response.data?.success) {
          setAllMembers(response.data.teamMembers || []);
        }
      } catch (err) {
        // Error handled silently
      }
    };
    fetchAllMembers();
  }, []);

  // Extract unique roles and specialisations for sidebar
  const roles = useMemo(() => {
    const roleSet = new Set();
    allMembers.forEach((m) => {
      const baseRole = m.role?.split("(")[0].trim() || m.role;
      if (baseRole) roleSet.add(baseRole);
    });
    return Array.from(roleSet);
  }, [allMembers]);

  const specialisations = useMemo(() => {
    const specSet = new Set();
    allMembers.forEach((m) => {
      if (m.specialisation) {
        const specs = m.specialisation
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        specs.forEach((spec) => specSet.add(spec));
      }
    });
    return Array.from(specSet);
  }, [allMembers]);

  useEffect(() => {
    const fetchTeamMember = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTeamMemberById(id);
        if (response.data?.success && response.data.teamMember) {
          // Map API response to match expected format
          const mappedMember = {
            id: response.data.teamMember.id,
            image: response.data.teamMember.image_url || null,
            title: response.data.teamMember.title,
            role: response.data.teamMember.role,
            gender: response.data.teamMember.gender || "",
            availability: response.data.teamMember.availability || "",
            specialisation: response.data.teamMember.specialisation || "",
            description: response.data.teamMember.description || "",
          };
          setMember(mappedMember);
        } else {
          setError("Team member not found");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Team member not found");
        } else {
          setError("Failed to load team member. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchSpecialisations = async () => {
      try {
        const response = await getTeamMemberSpecialisationsPublic(id);
        if (response.data?.success && response.data.specialisations) {
          // Extract specialisation names from the response
          const specs = response.data.specialisations.map((spec) => {
            if (spec.service_items && spec.service_items.name) {
              return spec.service_items.name;
            } else if (spec.services && spec.services.title) {
              return spec.services.title;
            }
            return null;
          }).filter(Boolean);
          setSpecialisationsFromTable(specs);
        }
      } catch (err) {
        // Error handled silently
      }
    };

    if (id) {
      fetchTeamMember();
      fetchSpecialisations();
    }
  }, [id]);

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

  if (error || !member) {
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
          {error || "Team member not found."}
        </Alert>
      </Box>
    );
  }

  // Parse specialisations into array from both sources
  const specialisationListFromText = member.specialisation
    ? member.specialisation
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];
  
  // Combine specialisations from text field and specialisations table
  const allSpecialisations = [
    ...specialisationListFromText,
    ...specialisationsFromTable
  ];
  
  // Remove duplicates
  const specialisationList = [...new Set(allSpecialisations)];

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://rehoboth.example/team/${id}`;
  const encodedShare = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`${member.title} - ${member.role}`);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#ffffff" }}
    >
      <SEO
        title={`${member.title} - ${member.role} | Rehoboth Health & Wellness Clinic`}
        description={`Learn more about ${member.title}, ${
          member.role
        } at Rehoboth Health & Wellness Clinic. ${member.description.substring(
          0,
          150
        )}...`}
        image={member.image || defaultTeamImage}
        keywords={`${member.title}, ${member.role}, ${member.specialisation}, Rehoboth, wellness, therapy`}
      />
      <HeroPageSection
        title={member.title}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Our Team", link: "/team" },
          { label: member.title },
        ]}
      />

      <Grid
        container
        spacing={2}
        sx={{ py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 6 } }}
      >
        {/* Main content */}
        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{ px: { xs: 0, md: 2 }, py: { xs: 3, md: 4 } }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 0,
              width: "100%",
            }}
          >
            <Grid
              container
              spacing={2}
              sx={{ py: { xs: 6, sm: 8 }, px: { xs: 2, sm: 6 } }}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                {/* Team member image */}
                <Box
                  component="img"
                  src={member.image || defaultTeamImage}
                  alt={member.title}
                  sx={{
                    width: "100%",
                    height: { xs: 400, md: 300 },
                    objectFit: "cover",
                    mb: 3,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {/* About / Description */}
                {member.description && (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "#1a1f2e",
                      }}
                    >
                      About
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#495057",
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                        lineHeight: 1.8,
                        textAlign: "justify",
                        fontFamily: '"Raleway", sans-serif',
                        whiteSpace: "pre-line",
                      }}
                    >
                      {member.description}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>

            {/* Name and role */}
            <Typography variant="overline" sx={{ color: "secondary.dark" }}>
              {member.role}
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                textTransform: "capitalize",
                fontWeight: 300,
                mb: 2,
                fontSize: { xs: "1.8rem", sm: "2.2rem", lg: "2.8rem" },
              }}
            >
              {member.title}
            </Typography>

            {/* Specialisations */}
            {specialisationList.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "#1a1f2e",
                  }}
                >
                  Specialisations
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1.2}>
                  {specialisationList.map((spec) => (
                    <Chip
                      key={spec}
                      label={spec}
                      variant="outlined"
                      sx={{ borderRadius: 0 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Gender */}
            {member.gender && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "text.disabled", mb: 0.5 }}
                >
                  Gender
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {member.gender}
                </Typography>
              </Box>
            )}

            {/* Availability */}
            {member.availability && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "#1a1f2e",
                  }}
                >
                  Availability
                </Typography>
                <AvailabilityDisplay availability={member.availability} />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Share icons */}
            <Stack direction="row" alignItems="center" gap={1}>
              <ShareIcon sx={{ color: "#888" }} />
              <Typography variant="body2" sx={{ color: "#666", mr: 1 }}>
                Share
              </Typography>
              <IconButton
                aria-label="share on facebook"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodedShare}`,
                    "_blank"
                  )
                }
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="share on twitter"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodedShare}&text=${encodedTitle}`,
                    "_blank"
                  )
                }
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                aria-label="share on linkedin"
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShare}`,
                    "_blank"
                  )
                }
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                aria-label="share on whatsapp"
                onClick={() =>
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedShare}`,
                    "_blank"
                  )
                }
              >
                <WhatsAppIcon />
              </IconButton>
            </Stack>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
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
              onSearchChange={(v) => setSearchTerm(v)}
              roles={roles}
              activeRole={selectedRole}
              onRoleChange={(v) => {
                setSelectedRole(v);
                navigate("/team");
              }}
              specialisations={specialisations}
              activeSpecialisation={activeSpecialisation}
              onSpecialisationChange={(spec) => {
                setActiveSpecialisation(spec);
                navigate("/team");
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Testimonials */}
      <TestimonialsSection />
    </Box>
  );
}
