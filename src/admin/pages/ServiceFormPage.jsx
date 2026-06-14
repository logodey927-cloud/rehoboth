import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeroPageSection from "../../components/sections/HeroPageSection";
import ServiceForm from "../components/services/ServiceForm";
import {
  createService,
  updateService,
  getServiceByIdAdmin,
  getServiceTeamMembers,
  assignServiceTeamMembers,
} from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

export default function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([]);
  const [_loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setFetching(true);
      const response = await getServiceByIdAdmin(id);
      if (response.data?.success) {
        setService(response.data.service);
        
        // Fetch team member assignments
        await fetchTeamMemberAssignments(id);
      } else {
        setError("Failed to load service");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load service");
    } finally {
      setFetching(false);
    }
  };

  const fetchTeamMemberAssignments = async (serviceId) => {
    try {
      setLoadingTeamMembers(true);
      const response = await getServiceTeamMembers(serviceId);
      if (response.data?.success) {
        const teamMemberIds = (response.data.teamMembers || []).map((tm) => tm.id);
        setSelectedTeamMemberIds(teamMemberIds);
      }
    } catch (err) {
      // Don't set error - this is non-critical
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await ensureSweetAlertReady();

      // Transform data for API
      const submitData = {
        ...data,
        benefits: data.benefits || [],
        items: data.items || [],
      };

      let response;
      let serviceId = id;

      if (isEditMode) {
        response = await updateService(id, submitData);
      } else {
        response = await createService(submitData);
        // For new services, get the created service ID
        if (response.data?.success && response.data?.service?.id) {
          serviceId = response.data.service.id;
        }
      }

      if (response.data?.success) {
        // Save team member assignments
        if (serviceId) {
          try {
            await assignServiceTeamMembers(serviceId, selectedTeamMemberIds);
          } catch (assignErr) {
            // Don't fail the whole operation
            await swalError(
              "Warning",
              "Service saved, but there was an error assigning team members. Please check the team member assignments."
            );
            navigate("/admin/services");
            return;
          }
        }

        await swalSuccess(
          isEditMode ? "Service Updated" : "Service Created",
          isEditMode
            ? "The service has been updated successfully."
            : "The service has been created successfully."
        );
        navigate("/admin/services");
      } else {
        const errorMsg = response.data?.error || "Failed to save service";
        // Create a short, meaningful title
        const lowerMessage = errorMsg.toLowerCase();
        let errorTitle = "Save Error";
        if (lowerMessage.includes("not available") || lowerMessage.includes("unavailable")) {
          errorTitle = "Not Available";
        } else if (lowerMessage.includes("invalid") || lowerMessage.includes("required")) {
          errorTitle = "Validation Error";
        } else if (lowerMessage.includes("duplicate") || lowerMessage.includes("already exists")) {
          errorTitle = "Duplicate Entry";
        }
        setError(errorMsg);
        await swalError(errorTitle, errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to save service. Please try again.";
      
      // Determine if it's a network/server error or a validation error
      const isNetworkError = !err.response || 
                             err.code === "ECONNABORTED" || 
                             err.code === "ERR_NETWORK" ||
                             err.message?.includes("Network Error") ||
                             err.message?.includes("timeout") ||
                             err.message?.includes("CONNECTION_REFUSED");
      
      // Create a short, meaningful title
      let errorTitle;
      if (isNetworkError) {
        errorTitle = "Connection Error";
      } else {
        // Extract a short title based on error content
        const lowerMessage = errorMsg.toLowerCase();
        if (lowerMessage.includes("not available") || lowerMessage.includes("unavailable")) {
          errorTitle = "Not Available";
        } else if (lowerMessage.includes("invalid") || lowerMessage.includes("required")) {
          errorTitle = "Validation Error";
        } else if (lowerMessage.includes("duplicate") || lowerMessage.includes("already exists")) {
          errorTitle = "Duplicate Entry";
        } else {
          errorTitle = "Save Error";
        }
      }
      
      setError(errorMsg);
      await swalError(errorTitle, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamMembersChange = (teamMemberIds) => {
    setSelectedTeamMemberIds(teamMemberIds);
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
        title={isEditMode ? "Edit Service" : "Create Service"}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Services", link: "/admin/services" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3, px: { xs: 2, md: 0 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/services")}
          sx={{
            borderRadius: 0,
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to Services
        </Button>

        <ServiceForm
          service={service}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          showActions={true}
          onCancel={() => navigate("/admin/services")}
          selectedTeamMembers={selectedTeamMemberIds}
          onTeamMembersChange={handleTeamMembersChange}
        />
      </Box>
    </Box>
  );
}

