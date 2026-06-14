# Team Member Authentication, Auto-Assignment & Profile Management Implementation Plan

## Overview
This document outlines the implementation plan for:
1. Multi-select specialisations from services in admin team form
2. Auto-assignment of team members based on specialisations and gender during appointment booking
3. Gender selection in appointment booking form
4. Admin appointment assignment/reassignment interface
5. Team member authentication system (login, profile, password management)
6. Team member dashboard (view appointments, edit profile, upload image)
7. Email notifications for team members

---

## Table of Contents
1. [Database Schema Updates](#database-schema-updates)
2. [Backend API Development](#backend-api-development)
3. [Frontend Admin Updates](#frontend-admin-updates)
4. [Frontend Appointment Booking Updates](#frontend-appointment-booking-updates)
5. [Team Member Authentication System](#team-member-authentication-system)
6. [Team Member Dashboard](#team-member-dashboard)
7. [Email Notifications](#email-notifications)
8. [Testing Checklist](#testing-checklist)

---

## 1. Database Schema Updates

### Step 1.1: Update team_members table
**File:** `server/database/update_team_members_auth.sql`

```sql
-- Add authentication fields to team_members table
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_reset_token ON team_members(reset_password_token);

-- Add unique constraint on email (if not already exists)
-- Note: This may fail if duplicate emails exist - handle manually
-- ALTER TABLE team_members ADD CONSTRAINT unique_team_member_email UNIQUE (email);
```

### Step 1.2: Create team_member_specialisations junction table
**File:** `server/database/create_team_member_specialisations.sql`

```sql
-- Junction table linking team members to services (specialisations)
CREATE TABLE IF NOT EXISTS team_member_specialisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_item_id UUID REFERENCES service_items(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, service_id, service_item_id)
);

CREATE INDEX IF NOT EXISTS idx_team_member_specs_member ON team_member_specialisations(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_specs_service ON team_member_specialisations(service_id);
CREATE INDEX IF NOT EXISTS idx_team_member_specs_item ON team_member_specialisations(service_item_id);

COMMENT ON TABLE team_member_specialisations IS 'Links team members to their specialisations (services/treatments they can perform)';
```

### Step 1.3: Update appointments table for gender
**File:** `server/database/add_gender_to_appointments.sql`

```sql
-- Add gender field to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS client_gender VARCHAR(20) CHECK (client_gender IN ('male', 'female', 'other', NULL));

CREATE INDEX IF NOT EXISTS idx_appointments_gender ON appointments(client_gender);

COMMENT ON COLUMN appointments.client_gender IS 'Client gender for matching with team member gender preferences';
```

### Step 1.4: Add gender preferences to team_members
**File:** `server/database/add_gender_preferences_to_team.sql`

```sql
-- Add gender preferences (who they can work with)
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS works_with_gender VARCHAR(50) DEFAULT 'all';

COMMENT ON COLUMN team_members.works_with_gender IS 'Gender preference: all, male, female, male_female (both but not other)';
```

---

## 2. Backend API Development

### Step 2.1: Create Authentication Utilities
**File:** `server/utils/authHelpers.js`

```javascript
import bcrypt from "bcryptjs";
import crypto from "crypto";
import logger from "../logger/index.js";

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate reset password token
 */
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash reset token for storage
 */
export const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
```

### Step 2.2: Create Team Member Auth Controller
**File:** `server/controllers/teamMemberAuthController.js`

```javascript
import supabase from "../config/supabase.js";
import logger from "../logger/index.js";
import { hashPassword, comparePassword, generateResetToken, hashResetToken } from "../utils/authHelpers.js";
import { sendTeamMemberPasswordResetEmail, sendTeamMemberPasswordChangedEmail } from "../utils/teamMemberEmailService.js";

/**
 * Team member login
 * POST /api/team/auth/login
 */
export const loginTeamMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find team member by email
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !teamMember) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if password is set
    if (!teamMember.password_hash) {
      return res.status(401).json({
        success: false,
        error: "Account not activated. Please contact admin to set up your password.",
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, teamMember.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if team member is active
    if (!teamMember.is_active) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated. Please contact admin.",
      });
    }

    // Update last login
    await supabase
      .from("team_members")
      .update({ last_login: new Date().toISOString() })
      .eq("id", teamMember.id);

    // Remove sensitive data before sending response
    const { password_hash, reset_password_token, reset_password_expires, ...safeMember } = teamMember;

    logger.info("Team member logged in", { teamMemberId: teamMember.id, email });

    res.json({
      success: true,
      teamMember: safeMember,
      token: "team_member_" + teamMember.id, // Simple token for now, can upgrade to JWT later
    });
  } catch (err) {
    logger.error("Team member login error", { error: err.message });
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
};

/**
 * Request password reset
 * POST /api/team/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("id, email, title")
      .eq("email", email.trim().toLowerCase())
      .single();

    // Don't reveal if email exists or not (security best practice)
    if (!error && teamMember) {
      const resetToken = generateResetToken();
      const hashedToken = hashResetToken(resetToken);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      await supabase
        .from("team_members")
        .update({
          reset_password_token: hashedToken,
          reset_password_expires: expiresAt.toISOString(),
        })
        .eq("id", teamMember.id);

      // Send reset email
      try {
        await sendTeamMemberPasswordResetEmail(teamMember, resetToken);
      } catch (emailError) {
        logger.error("Failed to send password reset email", { error: emailError.message });
      }
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err) {
    logger.error("Forgot password error", { error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to process request. Please try again.",
    });
  }
};

/**
 * Reset password with token
 * POST /api/team/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    const hashedToken = hashResetToken(token);

    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("id, reset_password_expires")
      .eq("reset_password_token", hashedToken)
      .single();

    if (error || !teamMember) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    // Check if token expired
    if (new Date(teamMember.reset_password_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Reset token has expired. Please request a new one.",
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await supabase
      .from("team_members")
      .update({
        password_hash: passwordHash,
        reset_password_token: null,
        reset_password_expires: null,
      })
      .eq("id", teamMember.id);

    logger.info("Team member password reset", { teamMemberId: teamMember.id });

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now login.",
    });
  } catch (err) {
    logger.error("Reset password error", { error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to reset password. Please try again.",
    });
  }
};

/**
 * Change password (requires authentication)
 * POST /api/team/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const teamMemberId = req.teamMember?.id; // From auth middleware

    if (!teamMemberId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    // Get current password hash
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("password_hash, email, title")
      .eq("id", teamMemberId)
      .single();

    if (error || !teamMember) {
      return res.status(404).json({
        success: false,
        error: "Team member not found",
      });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, teamMember.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await supabase
      .from("team_members")
      .update({ password_hash: passwordHash })
      .eq("id", teamMemberId);

    // Send notification email
    try {
      await sendTeamMemberPasswordChangedEmail(teamMember);
    } catch (emailError) {
      logger.error("Failed to send password changed email", { error: emailError.message });
    }

    logger.info("Team member password changed", { teamMemberId });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    logger.error("Change password error", { error: err.message });
    res.status(500).json({
      success: false,
      error: "Failed to change password. Please try again.",
    });
  }
};
```

### Step 2.3: Create Team Member Auth Middleware
**File:** `server/middleware/teamMemberAuth.js`

```javascript
import supabase from "../config/supabase.js";
import logger from "../logger/index.js";

/**
 * Middleware to authenticate team member requests
 */
export const authenticateTeamMember = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Simple token validation (can upgrade to JWT later)
    if (!token.startsWith("team_member_")) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication token",
      });
    }

    const teamMemberId = token.replace("team_member_", "");

    // Fetch team member
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("id, title, email, role, is_active")
      .eq("id", teamMemberId)
      .single();

    if (error || !teamMember) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication token",
      });
    }

    if (!teamMember.is_active) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated",
      });
    }

    req.teamMember = teamMember;
    next();
  } catch (err) {
    logger.error("Team member authentication error", { error: err.message });
    res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};
```

### Step 2.4: Update Team Member Controller for Specialisations
**File:** `server/controllers/teamMemberController.js` (additions)

```javascript
/**
 * Get team member specialisations
 * GET /api/team/:id/specialisations
 */
export const getTeamMemberSpecialisations = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("team_member_specialisations")
      .select(`
        *,
        services (id, title, category),
        service_items (id, name)
      `)
      .eq("team_member_id", id);

    if (error) throw error;

    res.json({
      success: true,
      specialisations: data || [],
    });
  } catch (err) {
    logger.error("Failed to get team member specialisations", { error: err.message });
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * Update team member specialisations (admin)
 * PUT /api/admin/team/:id/specialisations
 */
export const updateTeamMemberSpecialisations = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialisations } = req.body; // Array of { service_id, service_item_id? }

    // Validate team member exists
    const { data: teamMember, error: memberError } = await supabase
      .from("team_members")
      .select("id")
      .eq("id", id)
      .single();

    if (memberError || !teamMember) {
      return res.status(404).json({
        success: false,
        error: "Team member not found",
      });
    }

    // Delete existing specialisations
    await supabase
      .from("team_member_specialisations")
      .delete()
      .eq("team_member_id", id);

    // Insert new specialisations
    if (specialisations && specialisations.length > 0) {
      const specialisationData = specialisations.map((spec) => ({
        team_member_id: id,
        service_id: spec.service_id,
        service_item_id: spec.service_item_id || null,
      }));

      const { error: insertError } = await supabase
        .from("team_member_specialisations")
        .insert(specialisationData);

      if (insertError) throw insertError;
    }

    logger.info("Team member specialisations updated", { teamMemberId: id });

    res.json({
      success: true,
      message: "Specialisations updated successfully",
    });
  } catch (err) {
    logger.error("Failed to update team member specialisations", { error: err.message });
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
```

### Step 2.5: Create Auto-Assignment Logic
**File:** `server/utils/teamMemberAssignment.js`

```javascript
import supabase from "../config/supabase.js";
import logger from "../logger/index.js";

/**
 * Auto-assign team member to appointment based on service and gender
 * @param {string} serviceName - Name of the service/treatment
 * @param {string} serviceItemName - Name of the specific treatment item (optional)
 * @param {string} clientGender - Client gender: 'male', 'female', 'other'
 * @returns {Promise<Object|null>} - Team member object or null
 */
export const autoAssignTeamMember = async (serviceName, serviceItemName, clientGender) => {
  try {
    // Step 1: Find service and service item IDs
    let serviceId = null;
    let serviceItemId = null;

    // Find service by title
    const { data: service } = await supabase
      .from("services")
      .select("id, title")
      .ilike("title", `%${serviceName}%`)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (service) {
      serviceId = service.id;

      // Find service item if provided
      if (serviceItemName) {
        const { data: serviceItem } = await supabase
          .from("service_items")
          .select("id, name")
          .eq("service_id", serviceId)
          .ilike("name", `%${serviceItemName}%`)
          .limit(1)
          .single();

        if (serviceItem) {
          serviceItemId = serviceItem.id;
        }
      }
    }

    if (!serviceId) {
      logger.warn("Service not found for auto-assignment", { serviceName, serviceItemName });
      return null;
    }

    // Step 2: Find team members with matching specialisations
    let query = supabase
      .from("team_member_specialisations")
      .select(`
        team_member_id,
        team_members (
          id,
          title,
          role,
          email,
          gender,
          works_with_gender,
          is_active,
          availability
        )
      `)
      .eq("service_id", serviceId);

    if (serviceItemId) {
      query = query.or(`service_item_id.eq.${serviceItemId},service_item_id.is.null`);
    } else {
      query = query.is("service_item_id", null);
    }

    const { data: specialisations, error } = await query;

    if (error) {
      logger.error("Error fetching team member specialisations", { error: error.message });
      return null;
    }

    if (!specialisations || specialisations.length === 0) {
      logger.info("No team members found with matching specialisation", { serviceId, serviceItemId });
      return null;
    }

    // Step 3: Filter by gender compatibility
    const compatibleMembers = specialisations
      .map((spec) => spec.team_members)
      .filter((member) => {
        if (!member || !member.is_active) return false;

        const worksWith = member.works_with_gender || "all";
        
        // Gender matching logic
        if (worksWith === "all") return true;
        if (worksWith === clientGender) return true;
        if (worksWith === "male_female" && (clientGender === "male" || clientGender === "female")) return true;
        
        // Check if team member gender matches client preference
        // Female therapists often work with female clients, male with male
        if (member.gender === clientGender) return true;
        
        return false;
      });

    if (compatibleMembers.length === 0) {
      logger.info("No gender-compatible team members found", { clientGender, serviceId });
      return null;
    }

    // Step 4: Select best match (prefer exact service item match, then by availability)
    // For now, just return the first compatible member
    // Can be enhanced with availability checking, workload balancing, etc.
    const selectedMember = compatibleMembers[0];

    logger.info("Auto-assigned team member", {
      teamMemberId: selectedMember.id,
      teamMemberName: selectedMember.title,
      serviceName,
      serviceItemName,
      clientGender,
    });

    return selectedMember;
  } catch (err) {
    logger.error("Auto-assignment error", { error: err.message });
    return null;
  }
};
```

### Step 2.6: Update Appointment Controller for Auto-Assignment
**File:** `server/controllers/appointmentController.js` (modifications)

```javascript
import { autoAssignTeamMember } from "../utils/teamMemberAssignment.js";

// In bookAppointment function, add after service validation:
export const bookAppointment = async (req, res) => {
  try {
    const { full_name, email, phone, service, date, time, note, voucher_code, duration, team_member_id, client_gender, treatment } = req.body;

    // ... existing validation code ...

    // Auto-assign team member if not provided
    let assignedTeamMemberId = team_member_id;
    
    if (!assignedTeamMemberId && client_gender && service) {
      const autoAssignedMember = await autoAssignTeamMember(
        service,
        treatment, // service item name
        client_gender
      );

      if (autoAssignedMember) {
        assignedTeamMemberId = autoAssignedMember.id;
        logger.info("Auto-assigned team member to appointment", {
          appointmentService: service,
          teamMemberId: autoAssignedMember.id,
          clientGender: client_gender,
        });
      }
    }

    // ... rest of booking logic, use assignedTeamMemberId instead of team_member_id ...
    
    const appointmentData = {
      // ... existing fields ...
      team_member_id: assignedTeamMemberId,
      client_gender: client_gender || null,
    };

    // ... insert appointment ...

    // Send notification to assigned team member
    if (assignedTeamMemberId) {
      try {
        await sendTeamMemberAppointmentNotification(assignedTeamMemberId, appointment);
      } catch (emailError) {
        logger.error("Failed to send team member appointment notification", {
          error: emailError.message,
          teamMemberId: assignedTeamMemberId,
        });
      }
    }

    // ... rest of function ...
  } catch (err) {
    // ... error handling ...
  }
};
```

### Step 2.7: Create Team Member Profile Controller
**File:** `server/controllers/teamMemberProfileController.js`

```javascript
import supabase from "../config/supabase.js";
import logger from "../logger/index.js";
import { authenticateTeamMember } from "../middleware/teamMemberAuth.js";

/**
 * Get team member profile (authenticated)
 * GET /api/team/profile
 */
export const getTeamMemberProfile = async (req, res) => {
  try {
    const teamMemberId = req.teamMember?.id;

    if (!teamMemberId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select(`
        *,
        team_member_specialisations (
          id,
          service_id,
          service_item_id,
          services (id, title, category),
          service_items (id, name)
        )
      `)
      .eq("id", teamMemberId)
      .single();

    if (error || !teamMember) {
      return res.status(404).json({
        success: false,
        error: "Profile not found",
      });
    }

    // Remove sensitive data
    const { password_hash, reset_password_token, reset_password_expires, ...safeProfile } = teamMember;

    res.json({
      success: true,
      profile: safeProfile,
    });
  } catch (err) {
    logger.error("Failed to get team member profile", { error: err.message });
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * Update team member profile (authenticated)
 * PUT /api/team/profile
 */
export const updateTeamMemberProfile = async (req, res) => {
  try {
    const teamMemberId = req.teamMember?.id;
    const {
      title,
      phone,
      description,
      availability,
      image_url,
    } = req.body;

    if (!teamMemberId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (availability !== undefined) updateData.availability = availability?.trim() || null;
    if (image_url !== undefined) updateData.image_url = image_url || null;

    const { data: updatedMember, error } = await supabase
      .from("team_members")
      .update(updateData)
      .eq("id", teamMemberId)
      .select()
      .single();

    if (error) throw error;

    const { password_hash, reset_password_token, reset_password_expires, ...safeProfile } = updatedMember;

    logger.info("Team member profile updated", { teamMemberId });

    res.json({
      success: true,
      profile: safeProfile,
      message: "Profile updated successfully",
    });
  } catch (err) {
    logger.error("Failed to update team member profile", { error: err.message });
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * Get team member appointments
 * GET /api/team/appointments
 */
export const getTeamMemberAppointments = async (req, res) => {
  try {
    const teamMemberId = req.teamMember?.id;
    const { status, upcoming_only } = req.query;

    if (!teamMemberId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    let query = supabase
      .from("appointments")
      .select(`
        *,
        voucher_issues!appointments_voucher_id_fkey (
          id,
          code,
          vouchers (id, title, discount_type, discount_value)
        )
      `)
      .eq("team_member_id", teamMemberId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    if (upcoming_only === "true") {
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("date", today);
    }

    const { data: appointments, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      appointments: appointments || [],
    });
  } catch (err) {
    logger.error("Failed to get team member appointments", { error: err.message });
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
```

### Step 2.8: Create Routes
**File:** `server/routes/teamMemberAuthRoutes.js`

```javascript
import express from "express";
import {
  loginTeamMember,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/teamMemberAuthController.js";
import {
  getTeamMemberProfile,
  updateTeamMemberProfile,
  getTeamMemberAppointments,
} from "../controllers/teamMemberProfileController.js";
import { authenticateTeamMember } from "../middleware/teamMemberAuth.js";

const router = express.Router();

// Public routes
router.post("/login", loginTeamMember);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.use(authenticateTeamMember);
router.get("/profile", getTeamMemberProfile);
router.put("/profile", updateTeamMemberProfile);
router.get("/appointments", getTeamMemberAppointments);
router.post("/change-password", changePassword);

export default router;
```

### Step 2.9: Update Server.js
**File:** `server/server.js` (additions)

```javascript
import teamMemberAuthRoutes from "./routes/teamMemberAuthRoutes.js";

// ... existing code ...

app.use("/api/team/auth", teamMemberAuthRoutes);
```

---

## 3. Frontend Admin Updates

### Step 3.1: Update Team Form for Multi-Select Specialisations
**File:** `rehoboth/src/admin/components/team/TeamForm.jsx` (modifications)

```jsx
// Add imports
import { getServices } from "../../../api/api";
import { Autocomplete, Chip, TextField } from "@mui/material";

// Add state for services
const [services, setServices] = useState([]);
const [servicesLoading, setServicesLoading] = useState(true);

// Fetch services on mount
useEffect(() => {
  const fetchServices = async () => {
    try {
      const response = await getServices();
      if (response.data?.success) {
        // Flatten services and service items into a single list
        const allServices = [];
        response.data.services.forEach((service) => {
          // Add service itself
          allServices.push({
            id: service.id,
            name: service.title,
            type: "service",
            category: service.category,
          });
          
          // Add service items
          if (service.items && service.items.length > 0) {
            service.items.forEach((item) => {
              allServices.push({
                id: `${service.id}_${item.id}`,
                name: item.name,
                type: "item",
                service_id: service.id,
                service_item_id: item.id,
                category: service.category,
              });
            });
          }
        });
        setServices(allServices);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setServicesLoading(false);
    }
  };
  fetchServices();
}, []);

// Replace specialisation field with multi-select
<Autocomplete
  multiple
  options={services}
  getOptionLabel={(option) => option.name}
  value={selectedSpecialisations}
  onChange={(event, newValue) => {
    setSelectedSpecialisations(newValue);
    setValue("specialisations", newValue);
  }}
  loading={servicesLoading}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Specialisations"
      placeholder="Select services/treatments"
      error={!!errors.specialisations}
      helperText={errors.specialisations?.message}
    />
  )}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        key={option.id}
        label={option.name}
        size="small"
      />
    ))
  }
  sx={{ mb: 2 }}
/>
```

### Step 3.2: Update Team Form Submission
**File:** `rehoboth/src/admin/components/team/TeamForm.jsx` (modifications)

```jsx
const onSubmit = async (data) => {
  try {
    // Format specialisations for API
    const specialisations = selectedSpecialisations.map((spec) => ({
      service_id: spec.service_id || spec.id,
      service_item_id: spec.service_item_id || null,
    }));

    const formData = {
      ...data,
      specialisations, // Send as array
    };

    if (teamMemberId) {
      await updateTeamMember(teamMemberId, formData);
    } else {
      await createTeamMember(formData);
    }
    
    // ... rest of submission logic ...
  } catch (err) {
    // ... error handling ...
  }
};
```

### Step 3.3: Update API Service
**File:** `rehoboth/src/api/api.jsx` (additions)

```javascript
// Update team member with specialisations
export const updateTeamMemberSpecialisations = (id, specialisations) =>
  api.put(`/admin/team/${id}/specialisations`, { specialisations });

// Get services for specialisation selection
export const getServices = () => api.get("/services");
```

### Step 3.4: Update Admin Appointments Page for Assignment
**File:** `rehoboth/src/admin/pages/AppointmentsPage.jsx` (already has reassignment, ensure it's complete)

The reassignment dialog is already implemented. Ensure it calls:
```javascript
await updateAppointmentTeamMember(appointmentId, teamMemberId);
```

---

## 4. Frontend Appointment Booking Updates

### Step 4.1: Add Gender Selection to Appointment Form
**File:** `rehoboth/src/components/AppointmentForm.jsx` (modifications)

```jsx
// Add to validation schema
const validationSchema = yup.object({
  // ... existing fields ...
  client_gender: yup.string().oneOf(["male", "female", "other"]).required("Please select your gender"),
});

// Add to form (Step 1 - Personal Info)
<FormControl component="fieldset" error={!!errors.client_gender}>
  <FormLabel component="legend" sx={{ mb: 1 }}>
    Gender <span style={{ color: "red" }}>*</span>
  </FormLabel>
  <RadioGroup
    row
    value={watch("client_gender") || ""}
    onChange={(e) => setValue("client_gender", e.target.value)}
  >
    <FormControlLabel value="male" control={<Radio />} label="Male" />
    <FormControlLabel value="female" control={<Radio />} label="Female" />
    <FormControlLabel value="other" control={<Radio />} label="Other" />
  </RadioGroup>
  {errors.client_gender && (
    <FormHelperText>{errors.client_gender.message}</FormHelperText>
  )}
</FormControl>

// Include in booking data
const bookingData = {
  ...formData,
  client_gender: formData.client_gender,
  // ... rest of data ...
};
```

---

## 5. Team Member Authentication System

### Step 5.1: Create Team Member Login Page
**File:** `rehoboth/src/pages/team/TeamLogin.jsx`

```jsx
import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Alert, Link } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { loginTeamMember } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";

export default function TeamLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginTeamMember(formData);
      if (response.data?.success) {
        // Store token and team member data
        localStorage.setItem("teamMemberToken", response.data.token);
        localStorage.setItem("teamMember", JSON.stringify(response.data.teamMember));
        
        await swalSuccess("Login successful!", "Redirecting to your dashboard...");
        navigate("/team/dashboard");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMsg);
      await swalError("Login Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
          Team Member Login
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link component={RouterLink} to="/team/forgot-password">
            Forgot Password?
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
```

### Step 5.2: Create Forgot Password Page
**File:** `rehoboth/src/pages/team/ForgotPassword.jsx`

```jsx
import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { forgotPassword } from "../../api/api";
import { swalSuccess } from "../../utils/swal";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess(true);
      await swalSuccess("Email Sent", "If an account exists, a password reset link has been sent.");
    } catch (err) {
      await swalSuccess("Email Sent", "If an account exists, a password reset link has been sent.");
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
          Forgot Password
        </Typography>
        
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            If an account exists with this email, a password reset link has been sent.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
        
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link component={RouterLink} to="/team/login">
            Back to Login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
```

### Step 5.3: Create Reset Password Page
**File:** `rehoboth/src/pages/team/ResetPassword.jsx`

```jsx
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ token, newPassword: formData.password });
      await swalSuccess("Password Reset", "Your password has been reset. You can now login.");
      navigate("/team/login");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to reset password";
      setError(errorMsg);
      await swalError("Reset Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
          <Alert severity="error">Invalid reset link</Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
          Reset Password
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            sx={{ mb: 2 }}
            required
            helperText="Must be at least 8 characters"
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
```

### Step 5.4: Create Auth Context/Provider
**File:** `rehoboth/src/contexts/TeamMemberAuthContext.jsx`

```jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TeamMemberAuthContext = createContext();

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
        console.error("Error parsing team member data:", err);
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

  return (
    <TeamMemberAuthContext.Provider value={{ teamMember, login, logout, loading }}>
      {children}
    </TeamMemberAuthContext.Provider>
  );
};
```

### Step 5.5: Create Protected Route Component
**File:** `rehoboth/src/components/team/ProtectedRoute.jsx`

```jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";

export default function ProtectedRoute({ children }) {
  const { teamMember, loading } = useTeamMemberAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!teamMember) {
    return <Navigate to="/team/login" replace />;
  }

  return children;
}
```

### Step 5.6: Update API Service for Auth
**File:** `rehoboth/src/api/api.jsx` (additions)

```javascript
// Team member auth API
export const loginTeamMember = (data) => api.post("/team/auth/login", data);
export const forgotPassword = (data) => api.post("/team/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/team/auth/reset-password", data);
export const changePassword = (data) => {
  const token = localStorage.getItem("teamMemberToken");
  return api.post("/team/auth/change-password", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Team member profile API
export const getTeamMemberProfile = () => {
  const token = localStorage.getItem("teamMemberToken");
  return api.get("/team/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateTeamMemberProfile = (data) => {
  const token = localStorage.getItem("teamMemberToken");
  return api.put("/team/auth/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getTeamMemberAppointments = (params = {}) => {
  const token = localStorage.getItem("teamMemberToken");
  return api.get("/team/auth/appointments", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
};
```

---

## 6. Team Member Dashboard

### Step 6.1: Create Dashboard Layout
**File:** `rehoboth/src/components/team/TeamDashboardLayout.jsx`

```jsx
import React, { useState } from "react";
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

export default function TeamDashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamMember, logout } = useTeamMemberAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/team/dashboard" },
    { text: "My Appointments", icon: <CalendarIcon />, path: "/team/appointments" },
    { text: "My Profile", icon: <PersonIcon />, path: "/team/profile" },
    { text: "Change Password", icon: <LockIcon />, path: "/team/change-password" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/team/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Team Member Portal
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={teamMember?.image_url} sx={{ width: 32, height: 32 }} />
            <Typography variant="body2">{teamMember?.title}</Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {/* Drawer content */}
      </Drawer>
      
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
```

### Step 6.2: Create Dashboard Home Page
**File:** `rehoboth/src/pages/team/Dashboard.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import { getTeamMemberAppointments } from "../../api/api";
import TeamDashboardLayout from "../../components/team/TeamDashboardLayout";
import ProtectedRoute from "../../components/team/ProtectedRoute";

export default function Dashboard() {
  const { teamMember } = useTeamMemberAuth();
  const [stats, setStats] = useState({ total: 0, upcoming: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getTeamMemberAppointments({ upcoming_only: true });
        const appointments = response.data?.appointments || [];
        const today = new Date().toISOString().split("T")[0];
        
        setStats({
          total: appointments.length,
          upcoming: appointments.filter(apt => apt.date >= today).length,
          today: appointments.filter(apt => apt.date === today).length,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <TeamDashboardLayout>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Welcome, {teamMember?.title}!
        </Typography>
        
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Appointments
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming
                  </Typography>
                  <Typography variant="h4">{stats.upcoming}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Today
                  </Typography>
                  <Typography variant="h4">{stats.today}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TeamDashboardLayout>
    </ProtectedRoute>
  );
}
```

### Step 6.3: Create Appointments List Page
**File:** `rehoboth/src/pages/team/MyAppointments.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress } from "@mui/material";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import { getTeamMemberAppointments } from "../../api/api";
import TeamDashboardLayout from "../../components/team/TeamDashboardLayout";
import ProtectedRoute from "../../components/team/ProtectedRoute";

export default function MyAppointments() {
  const { teamMember } = useTeamMemberAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getTeamMemberAppointments({ upcoming_only: true });
        setAppointments(response.data?.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "success";
      case "pending": return "warning";
      case "completed": return "info";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  return (
    <ProtectedRoute>
      <TeamDashboardLayout>
        <Typography variant="h4" sx={{ mb: 3 }}>
          My Appointments
        </Typography>
        
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>{apt.full_name}</TableCell>
                      <TableCell>{apt.service}</TableCell>
                      <TableCell>
                        <Chip label={apt.status} color={getStatusColor(apt.status)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TeamDashboardLayout>
    </ProtectedRoute>
  );
}
```

### Step 6.4: Create Profile Edit Page
**File:** `rehoboth/src/pages/team/MyProfile.jsx`

```jsx
import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, Paper, Avatar, IconButton } from "@mui/material";
import { useTeamMemberAuth } from "../../contexts/TeamMemberAuthContext";
import { getTeamMemberProfile, updateTeamMemberProfile, uploadTeamImage } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import TeamDashboardLayout from "../../components/team/TeamDashboardLayout";
import ProtectedRoute from "../../components/team/ProtectedRoute";
import ImageUploadField from "../../admin/components/common/ImageUploadField";

export default function MyProfile() {
  const { teamMember: authMember, login } = useTeamMemberAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    phone: "",
    description: "",
    availability: "",
    image_url: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getTeamMemberProfile();
        const profileData = response.data?.profile;
        setProfile(profileData);
        setFormData({
          title: profileData.title || "",
          phone: profileData.phone || "",
          description: profileData.description || "",
          availability: profileData.availability || "",
          image_url: profileData.image_url || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await updateTeamMemberProfile(formData);
      await swalSuccess("Profile Updated", "Your profile has been updated successfully.");
      
      // Update auth context
      const updatedProfile = response.data?.profile;
      const token = localStorage.getItem("teamMemberToken");
      login(token, updatedProfile);
      
      setProfile(updatedProfile);
    } catch (err) {
      await swalError("Update Failed", err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const response = await uploadTeamImage(file);
      if (response.data?.success) {
        setFormData({ ...formData, image_url: response.data.imageUrl });
      }
    } catch (err) {
      await swalError("Upload Failed", "Failed to upload image");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <TeamDashboardLayout>
          <CircularProgress />
        </TeamDashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <TeamDashboardLayout>
        <Typography variant="h4" sx={{ mb: 3 }}>
          My Profile
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Avatar
                src={formData.image_url}
                sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
              />
              <ImageUploadField
                value={formData.image_url}
                onChange={handleImageUpload}
                label="Profile Image"
              />
            </Box>
            
            <TextField
              fullWidth
              label="Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Availability"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Paper>
      </TeamDashboardLayout>
    </ProtectedRoute>
  );
}
```

### Step 6.5: Create Change Password Page
**File:** `rehoboth/src/pages/team/ChangePassword.jsx`

```jsx
import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { changePassword } from "../../api/api";
import { swalSuccess, swalError } from "../../utils/swal";
import TeamDashboardLayout from "../../components/team/TeamDashboardLayout";
import ProtectedRoute from "../../components/team/ProtectedRoute";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      await swalSuccess("Password Changed", "Your password has been changed successfully.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to change password";
      setError(errorMsg);
      await swalError("Change Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <TeamDashboardLayout>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Change Password
        </Typography>
        
        <Paper sx={{ p: 3, maxWidth: 500 }}>
          {error && (
            <Box sx={{ mb: 2, p: 1, bgcolor: "error.light", color: "error.contrastText", borderRadius: 1 }}>
              {error}
            </Box>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              sx={{ mb: 2 }}
              required
              helperText="Must be at least 8 characters"
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </Paper>
      </TeamDashboardLayout>
    </ProtectedRoute>
  );
}
```

### Step 6.6: Update App.jsx Routes
**File:** `rehoboth/src/App.jsx` (additions)

```jsx
// Add imports
import TeamLogin from "./pages/team/TeamLogin";
import ForgotPassword from "./pages/team/ForgotPassword";
import ResetPassword from "./pages/team/ResetPassword";
import Dashboard from "./pages/team/Dashboard";
import MyAppointments from "./pages/team/MyAppointments";
import MyProfile from "./pages/team/MyProfile";
import ChangePassword from "./pages/team/ChangePassword";
import { TeamMemberAuthProvider } from "./contexts/TeamMemberAuthContext";

// Wrap app with provider
<TeamMemberAuthProvider>
  {/* ... existing routes ... */}
  
  {/* Team member routes */}
  <Route path="/team/login" element={<TeamLogin />} />
  <Route path="/team/forgot-password" element={<ForgotPassword />} />
  <Route path="/team/reset-password" element={<ResetPassword />} />
  <Route path="/team/dashboard" element={<Dashboard />} />
  <Route path="/team/appointments" element={<MyAppointments />} />
  <Route path="/team/profile" element={<MyProfile />} />
  <Route path="/team/change-password" element={<ChangePassword />} />
</TeamMemberAuthProvider>
```

---

## 7. Email Notifications

### Step 7.1: Update Team Member Email Service
**File:** `server/utils/teamMemberEmailService.js` (additions)

```javascript
/**
 * Send appointment assignment notification to team member
 */
export const sendTeamMemberAppointmentNotification = async (teamMemberId, appointment) => {
  try {
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("email, title")
      .eq("id", teamMemberId)
      .single();

    if (!teamMember || !teamMember.email) {
      logger.warn("Skipping appointment notification - no email", { teamMemberId });
      return;
    }

    const mailOptions = {
      from: `"Rehoboth Health & Wellness Clinic" <${process.env.EMAIL_USER}>`,
      to: teamMember.email,
      subject: `New Appointment Assigned: ${appointment.full_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="padding: 30px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #84994f 0%, #a5b86c 100%); text-align: center; padding: 35px 25px;">
                ${getLogoHtml(150, "auto")}
                <h1 style="color: #ffffff; margin: 15px 0 0; font-size: 26px;">New Appointment Assigned</h1>
              </div>
              
              <div style="padding: 35px 30px;">
                <h2 style="color: #2c3e50; margin: 0 0 20px;">Dear ${teamMember.title},</h2>
                
                <p style="font-size: 17px; color: #495057; margin: 0 0 25px;">
                  A new appointment has been assigned to you:
                </p>
                
                <div style="background: #f8f9fa; border-left: 4px solid #84994f; border-radius: 8px; padding: 25px; margin: 25px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; font-weight: 600; color: #495057; width: 120px;">Client:</td>
                      <td style="padding: 12px 0; color: #212529;">${appointment.full_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; font-weight: 600; color: #495057;">Service:</td>
                      <td style="padding: 12px 0; color: #212529;">${appointment.service}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; font-weight: 600; color: #495057;">Date:</td>
                      <td style="padding: 12px 0; color: #212529;">${new Date(appointment.date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; font-weight: 600; color: #495057;">Time:</td>
                      <td style="padding: 12px 0; color: #212529;">${appointment.time}</td>
                    </tr>
                    ${appointment.phone ? `
                    <tr>
                      <td style="padding: 12px 0; font-weight: 600; color: #495057;">Phone:</td>
                      <td style="padding: 12px 0; color: #212529;">${appointment.phone}</td>
                    </tr>
                    ` : ''}
                    ${appointment.note ? `
                    <tr>
                      <td style="padding: 12px 0; font-weight: 600; color: #495057; vertical-align: top;">Notes:</td>
                      <td style="padding: 12px 0; color: #212529;">${appointment.note}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
                
                <p style="font-size: 16px; color: #495057; margin: 25px 0 0;">
                  Please log in to your dashboard to view all your appointments.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info("Appointment notification sent to team member", {
      teamMemberId,
      appointmentId: appointment.id,
    });
  } catch (error) {
    logger.error("Failed to send appointment notification", {
      error: error.message,
      teamMemberId,
    });
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendTeamMemberPasswordResetEmail = async (teamMember, resetToken) => {
  // Implementation similar to above
  // Include reset link: `${process.env.FRONTEND_URL}/team/reset-password?token=${resetToken}`
};

/**
 * Send password changed confirmation email
 */
export const sendTeamMemberPasswordChangedEmail = async (teamMember) => {
  // Implementation similar to above
};
```

---

## 8. Testing Checklist

### Database
- [ ] Run all SQL migration files
- [ ] Verify team_members table has new columns
- [ ] Verify team_member_specialisations table exists
- [ ] Verify appointments table has client_gender column
- [ ] Test foreign key constraints

### Backend
- [ ] Test team member login
- [ ] Test password reset flow
- [ ] Test password change
- [ ] Test profile update
- [ ] Test appointment fetching for team members
- [ ] Test auto-assignment logic
- [ ] Test specialisation updates
- [ ] Test email notifications

### Frontend Admin
- [ ] Test multi-select specialisations in team form
- [ ] Test saving team member with specialisations
- [ ] Test appointment reassignment in admin
- [ ] Verify specialisations are saved correctly

### Frontend Appointment Booking
- [ ] Test gender selection in booking form
- [ ] Test auto-assignment based on gender and service
- [ ] Verify assigned team member appears in appointment

### Team Member Portal
- [ ] Test login page
- [ ] Test forgot password flow
- [ ] Test reset password with token
- [ ] Test dashboard displays correctly
- [ ] Test appointments list
- [ ] Test profile edit
- [ ] Test image upload
- [ ] Test password change
- [ ] Test logout

### Email Notifications
- [ ] Test appointment assignment email
- [ ] Test password reset email
- [ ] Test password changed email
- [ ] Verify email templates render correctly

---

## Implementation Order

1. **Phase 1: Database & Backend Foundation**
   - Run database migrations
   - Create auth utilities and controllers
   - Create auto-assignment logic
   - Update appointment controller

2. **Phase 2: Admin Updates**
   - Update team form for multi-select
   - Update API calls
   - Test specialisation saving

3. **Phase 3: Appointment Booking**
   - Add gender selection
   - Integrate auto-assignment
   - Test end-to-end booking

4. **Phase 4: Team Member Auth**
   - Create login/forgot/reset pages
   - Create auth context
   - Create protected routes

5. **Phase 5: Team Member Dashboard**
   - Create dashboard layout
   - Create appointments list
   - Create profile edit
   - Create password change

6. **Phase 6: Email Notifications**
   - Implement all email templates
   - Test email sending
   - Verify notifications trigger correctly

7. **Phase 7: Testing & Polish**
   - Complete testing checklist
   - Fix any bugs
   - Optimize performance

---

## Notes

- Password hashing uses bcryptjs (already in dependencies)
- Token system is simple - can be upgraded to JWT later
- Email notifications are non-blocking (won't fail appointment creation)
- Auto-assignment can be enhanced with availability checking and workload balancing
- Gender matching logic can be refined based on business rules
- Consider adding team member role-based permissions in future

---

## Future Enhancements

1. JWT token authentication
2. Team member availability calendar integration
3. Workload balancing for auto-assignment
4. Team member ratings/reviews
5. Team member performance analytics
6. Mobile app for team members
7. Push notifications for appointments
8. Team member scheduling preferences

