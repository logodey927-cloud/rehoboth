import React, { useState, useEffect } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeroPageSection from "../../components/sections/HeroPageSection";
import TeamForm from "../components/team/TeamForm";
import {
  createTeamMember,
  updateTeamMember,
  getTeamMemberByIdAdmin,
  updateTeamMemberSpecialisations,
  getTeamMemberAvailability,
  updateTeamMemberAvailability,
  uploadTeamImage,
} from "../../api/api";
import {
  swalError,
  swalSuccess,
  ensureSweetAlertReady,
} from "../../utils/swal";

export default function TeamFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [member, setMember] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      setFetching(true);
      setError(null);
      await ensureSweetAlertReady();
      const response = await getTeamMemberByIdAdmin(id);
      if (response.data?.success) {
        // Fetch availability separately
        let availability = null;
        try {
          const availabilityResponse = await getTeamMemberAvailability(id);
          if (availabilityResponse.data?.success) {
            availability = availabilityResponse.data.availability;
          }
        } catch (availErr) {
          // If availability fetch fails, use the availability from team member or null
          availability = response.data.teamMember?.availability || null;
        }
        
        // Merge availability into member data
        setMember({
          ...response.data.teamMember,
          availability: availability,
        });
      } else {
        const errorMsg = "Failed to load team member";
        setError(errorMsg);
        await swalError("Error", errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to load team member";
      setError(errorMsg);
      await swalError("Error", errorMsg);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await ensureSweetAlertReady();

      // Extract specialisations and availability from data
      const specialisations = data.specialisations || [];
      const availability = data.availability;
      
      // Remove specialisations and availability from submitData (will be handled separately)
      const { specialisations: _, availability: __, ...submitData } = data;
      
      // Check if image_url is a large base64 data URL and handle it separately
      let imageUrl = submitData.image_url;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const base64Size = imageUrl.length;
        const maxBase64Size = 5 * 1024 * 1024; // 5MB (base64 is ~33% larger than binary)
        
        if (base64Size > maxBase64Size) {
          // Image is too large, try to upload it separately first
          try {
            // Convert data URL to blob, then to File
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Determine file extension from mime type
            const mimeType = blob.type || 'image/jpeg';
            const extension = mimeType.split('/')[1] || 'jpg';
            const fileName = `team-image.${extension}`;
            const file = new File([blob], fileName, { type: mimeType });
            
            // Upload via the upload endpoint
            const uploadResponse = await uploadTeamImage(file);
            if (uploadResponse.data?.success && uploadResponse.data.url) {
              imageUrl = uploadResponse.data.url;
            } else {
              throw new Error(uploadResponse.data?.error || 'Failed to upload image');
            }
          } catch (uploadErr) {
            await swalError(
              'Image Too Large',
              'The image is too large to send in the request. Please upload it separately using the upload button, or use a smaller image (under 2MB).'
            );
            setLoading(false);
            return;
          }
        }
      }
      
      // Update submitData with the processed image URL
      submitData.image_url = imageUrl;

      let response;
      let teamMemberId = id;

      if (isEditMode) {
        response = await updateTeamMember(id, submitData);
      } else {
        response = await createTeamMember(submitData);
        if (response.data?.success) {
          teamMemberId = response.data.teamMember.id;
        }
      }

      if (response.data?.success) {
        // Update availability separately (non-blocking)
        if (teamMemberId && availability && typeof availability === "object") {
          try {
            await updateTeamMemberAvailability(teamMemberId, availability);
          } catch (availError) {
            // Show warning but don't fail the whole operation
            // Availability update failed, but team member was saved
          }
        }

        // Update specialisations separately (non-blocking)
        if (teamMemberId && specialisations && specialisations.length > 0) {
          try {
            // Format specialisations for API
            const specialisationData = specialisations
              .filter((spec) => spec && (spec.service_id || spec.id)) // Filter out invalid entries
              .map((spec) => ({
                service_id: spec.service_id || spec.id,
                service_item_id: spec.service_item_id || null,
              }));

            if (specialisationData.length > 0) {
              // Use Promise.race to add a timeout fallback
              await Promise.race([
                updateTeamMemberSpecialisations(teamMemberId, specialisationData),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Specialisations update timeout")), 55000)
                ),
              ]);
            }
          } catch (specError) {
            // Show warning but don't fail the whole operation
            // Team member is still created/updated successfully
            // Specialisations update failed, but team member was saved
          }
        }

        await swalSuccess(
          isEditMode ? "Team Member Updated" : "Team Member Created",
          isEditMode
            ? "The team member has been updated successfully."
            : "The team member has been created successfully."
        );
        navigate("/admin/team");
      } else {
        const errorMsg = response.data?.error || "Failed to save team member";
        setError(errorMsg);
        await swalError("Error", errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to save team member. Please try again.";
      setError(errorMsg);
      await swalError("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <HeroPageSection
        title={isEditMode ? "Edit Team Member" : "Add Team Member"}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Team Members", link: "/admin/team" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/team")}
          sx={{
            borderRadius: 0,
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to Team Members
        </Button>

        <TeamForm
          member={member}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onCancel={() => navigate("/admin/team")}
        />
      </Box>
    </Box>
  );
}

