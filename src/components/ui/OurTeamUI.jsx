import React, { useState, useEffect } from "react";
import { Box, Container, Grid, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InfoSection from "../common09/InfoSection";
import sectionIcon from "../../assets/effectImag/icon-section.webp";
import ProductCard02 from "../common09/ProductCard02";
import { getTeamMembers } from "../../api/api";

export default function OurTeamUI() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await getTeamMembers();
        if (response.data?.success) {
          // Map API response to match expected format and limit to first 3 for preview
          const mappedData = (response.data.teamMembers || [])
            .slice(0, 3)
            .map((member) => ({
              id: member.id,
              image: member.image_url || null,
              title: member.title,
              role: member.role,
              gender: member.gender || "",
              availability: member.availability || "",
              specialisation: member.specialisation || "",
              description: member.description || "",
            }));
          setTeamMembers(mappedData);
        } else {
          setError("Failed to load team members");
        }
      } catch (err) {
        setError("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/team/${id}`);
  };

  return (
    <Box className="OurTeamUI" component="section">
      <Container maxWidth="false" padding="0">
        {/* Section Header with InfoSection */}
        <InfoSection
          data-aos="fade-up"
          subtitle="Meet Our Experts"
          title="Our Professional Therapist Team"
          align="center"
          btnAlign="center"
          descriptionAlign="center"
          imgIcon={sectionIcon}
          description={`At Rehoboth Health & Wellness Clinic, our skilled therapists deliver personalized, compassionate care. From sports and deep tissue massage to advanced beauty and wellness treatments, we help you relax, recover, and rejuvenate nside and out.`}
          btnText="View All Team"
          btnLink="/team"
        />

        {/* Section Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            Unable to load team members. Please try again later.
          </Box>
        ) : teamMembers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            No team members available at this time.
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 4 }}>
            {teamMembers.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Box
                  onClick={() => handleCardClick(item.id)}
                  sx={{ cursor: "pointer" }}
                >
                  <ProductCard02 data-aos="zoom-in" heightSize="300px" {...item} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
