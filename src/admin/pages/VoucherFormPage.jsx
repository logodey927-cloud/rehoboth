import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeroPageSection from "../../components/sections/HeroPageSection";
import VoucherForm from "../components/vouchers/VoucherForm";
import {
  createVoucher,
  updateVoucher,
  getVoucherByIdAdmin,
} from "../../api/api";
import { swalError, swalSuccess, ensureSweetAlertReady } from "../../utils/swal";

export default function VoucherFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [voucher, setVoucher] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchVoucher();
    }
  }, [id]);

  const fetchVoucher = async () => {
    try {
      setFetching(true);
      const response = await getVoucherByIdAdmin(id);
      if (response.data?.success) {
        setVoucher(response.data.voucher);
      } else {
        setError("Failed to load voucher");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load voucher");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await ensureSweetAlertReady();

      let response;
      if (isEditMode) {
        response = await updateVoucher(id, data);
      } else {
        response = await createVoucher(data);
      }

      if (response.data?.success) {
        await swalSuccess(
          isEditMode ? "Voucher Updated" : "Voucher Created",
          isEditMode
            ? "The voucher has been updated successfully."
            : "The voucher has been created successfully."
        );
        navigate("/admin/vouchers");
      } else {
        const errorMsg = response.data?.error || "Failed to save voucher";
        setError(errorMsg);
        await swalError("Error", errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Failed to save voucher. Please try again.";
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
        title={isEditMode ? "Edit Voucher" : "Create Voucher"}
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Admin", link: "/admin" },
          { label: "Vouchers", link: "/admin/vouchers" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
        borderRadius={true}
      />

      <Box sx={{ mt: 4, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/vouchers")}
          sx={{
            borderRadius: 0,
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to Vouchers
        </Button>

        <VoucherForm
          voucher={voucher}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onCancel={() => navigate("/admin/vouchers")}
        />
      </Box>
    </Box>
  );
}

