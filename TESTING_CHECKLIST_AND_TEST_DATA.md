# Testing Checklist & Test Data Guide

## Overview

This document provides a comprehensive testing checklist and test data for the Team Member Authentication, Auto-Assignment & Profile Management features.

---

## Table of Contents

1. [Database Migration Checklist](#database-migration-checklist)
2. [Test Data Setup](#test-data-setup)
3. [Backend Testing](#backend-testing)
4. [Frontend Admin Testing](#frontend-admin-testing)
5. [Frontend Appointment Booking Testing](#frontend-appointment-booking-testing)
6. [Team Member Portal Testing](#team-member-portal-testing)
7. [Email Notifications Testing](#email-notifications-testing)
8. [Test Data](#test-data)

---

## 1. Database Migration Checklist

### Step 1: Run All SQL Migration Files

Run these SQL files in order in your Supabase SQL Editor:

1. ✅ `server/database/create_team_members_table.sql`
2. ✅ `server/database/update_team_members_auth.sql`
3. ✅ `server/database/create_team_member_specialisations.sql`
4. ✅ `server/database/add_gender_to_appointments.sql`
5. ✅ `server/database/add_gender_preferences_to_team.sql`
6. ✅ `server/database/add_team_member_to_appointments.sql`
7. ✅ `server/database/add_admin_reset_password.sql`

### Step 2: Verify Database Schema

Run these queries to verify the schema:

```sql
-- Verify team_members table has new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'team_members'
ORDER BY ordinal_position;

-- Expected columns:
-- password_hash, email_verified, reset_password_token, reset_password_expires,
-- last_login, works_with_gender

-- Verify team_member_specialisations table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'team_member_specialisations';

-- Verify appointments table has client_gender column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'client_gender';

-- Verify admin_users table has reset password columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'admin_users'
AND column_name IN ('reset_password_token', 'reset_password_expires');

-- Test foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('team_member_specialisations', 'appointments');
```

---

## 2. Test Data Setup

### Admin User Test Data

**Create Admin User:**

```sql
-- Use the API endpoint: POST /api/auth/initialize
-- Or manually insert (password will be hashed by bcrypt):
-- Password: TestAdmin123!
-- Username: test-admin
-- Email: admin@rehobothhealthmassage.com
```

**Test Admin Credentials:**

- **Username:** `test-admin`
- **Password:** `TestAdmin123!`
- **Email:** `admin@rehobothhealthmassage.com`

### Team Member Test Data

**Team Member 1 - Female Therapist (Female Clients Only):**

```json
{
  "title": "Sarah Johnson",
  "role": "Massage Therapist",
  "gender": "female",
  "works_with_gender": "female",
  "email": "sarah.johnson@rehobothhealthmassage.com",
  "phone": "+44 7700 900123",
  "availability": "monday:10am-4pm,tuesday:10am-4pm,wednesday:10am-4pm,friday:10am-4pm",
  "description": "Sarah is a professional massage therapist specializing in Swedish massage, deep tissue massage, and aromatherapy. She works exclusively with female clients.",
  "is_active": true,
  "display_order": 1
}
```

**Team Member 2 - Male Therapist (All Genders):**

```json
{
  "title": "Michael Chen",
  "role": "Sports Massage Therapist",
  "gender": "male",
  "works_with_gender": "all",
  "email": "michael.chen@rehobothhealthmassage.com",
  "phone": "+44 7700 900456",
  "availability": "monday:9am-5pm,tuesday:9am-5pm,wednesday:9am-5pm,thursday:9am-5pm,friday:9am-5pm",
  "description": "Michael is a highly skilled Sports Massage Therapist with extensive experience in helping clients improve mobility and recover from injuries.",
  "is_active": true,
  "display_order": 2
}
```

**Team Member 3 - Female Therapist (All Genders):**

```json
{
  "title": "Emma Williams",
  "role": "Therapeutic Massage Therapist",
  "gender": "female",
  "works_with_gender": "all",
  "email": "emma.williams@rehobothhealthmassage.com",
  "phone": "+44 7700 900789",
  "availability": "monday:10am-6pm,tuesday:10am-6pm,wednesday:10am-6pm,thursday:10am-6pm,saturday:10am-4pm",
  "description": "Emma specializes in therapeutic massage, hot stone massage, and reflexology. She works with clients of all genders.",
  "is_active": true,
  "display_order": 3
}
```

**Team Member 4 - Male Therapist (Male Clients Only):**

```json
{
  "title": "David Thompson",
  "role": "Deep Tissue Massage Specialist",
  "gender": "male",
  "works_with_gender": "male",
  "email": "david.thompson@rehobothhealthmassage.com",
  "phone": "+44 7700 900321",
  "availability": "monday:11am-7pm,tuesday:11am-7pm,wednesday:11am-7pm,thursday:11am-7pm",
  "description": "David specializes in deep tissue massage and sports massage. He works exclusively with male clients.",
  "is_active": true,
  "display_order": 4
}
```

### Services & Service Items Test Data

**Service 1 - Swedish Massage:**

```json
{
  "title": "Swedish Massage",
  "category": "Massage",
  "is_active": true,
  "items": [
    {
      "name": "60 Minute Swedish Massage",
      "duration": 60,
      "price": 65
    },
    {
      "name": "90 Minute Swedish Massage",
      "duration": 90,
      "price": 95
    }
  ]
}
```

**Service 2 - Deep Tissue Massage:**

```json
{
  "title": "Deep Tissue Massage",
  "category": "Massage",
  "is_active": true,
  "items": [
    {
      "name": "60 Minute Deep Tissue",
      "duration": 60,
      "price": 75
    },
    {
      "name": "90 Minute Deep Tissue",
      "duration": 90,
      "price": 110
    }
  ]
}
```

**Service 3 - Hot Stone Massage:**

```json
{
  "title": "Hot Stone Massage",
  "category": "Massage",
  "is_active": true,
  "items": [
    {
      "name": "90 Minute Hot Stone Massage",
      "duration": 90,
      "price": 120
    }
  ]
}
```

**Service 4 - Sports Massage:**

```json
{
  "title": "Sports Massage",
  "category": "Massage",
  "is_active": true,
  "items": [
    {
      "name": "60 Minute Sports Massage",
      "duration": 60,
      "price": 70
    },
    {
      "name": "90 Minute Sports Massage",
      "duration": 90,
      "price": 100
    }
  ]
}
```

### Team Member Specialisations Test Data

**Sarah Johnson's Specialisations:**

- Swedish Massage (Service)
- Deep Tissue Massage (Service)
- Hot Stone Massage (Service)
- 60 Minute Swedish Massage (Service Item)
- 90 Minute Swedish Massage (Service Item)

**Michael Chen's Specialisations:**

- Sports Massage (Service)
- Deep Tissue Massage (Service)
- 60 Minute Sports Massage (Service Item)
- 90 Minute Sports Massage (Service Item)
- 60 Minute Deep Tissue (Service Item)

**Emma Williams's Specialisations:**

- Swedish Massage (Service)
- Hot Stone Massage (Service)
- Deep Tissue Massage (Service)
- All service items for these services

**David Thompson's Specialisations:**

- Deep Tissue Massage (Service)
- Sports Massage (Service)
- All service items for these services

### Appointment Test Data

**Test Appointment 1 - Female Client, Swedish Massage:**

```json
{
  "full_name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+44 7700 123456",
  "service": "Swedish Massage",
  "treatment": "60 Minute Swedish Massage",
  "date": "2025-01-15",
  "time": "14:00",
  "client_gender": "female",
  "note": "First time client, prefers gentle pressure",
  "status": "pending"
}
```

**Test Appointment 2 - Male Client, Sports Massage:**

```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+44 7700 654321",
  "service": "Sports Massage",
  "treatment": "90 Minute Sports Massage",
  "date": "2025-01-16",
  "time": "10:00",
  "client_gender": "male",
  "note": "Post-workout recovery",
  "status": "pending"
}
```

**Test Appointment 3 - Female Client, Hot Stone Massage:**

```json
{
  "full_name": "Mary Johnson",
  "email": "mary.johnson@example.com",
  "phone": "+44 7700 789012",
  "service": "Hot Stone Massage",
  "treatment": "90 Minute Hot Stone Massage",
  "date": "2025-01-17",
  "time": "15:00",
  "client_gender": "female",
  "note": "Relaxation session",
  "status": "pending"
}
```

---

## 3. Backend Testing

### 3.1 Team Member Authentication

#### Test 3.1.1: Team Member Login

**Endpoint:** `POST /api/team/auth/login`

**Test Case 1: Valid Login**

```json
{
  "email": "sarah.johnson@rehobothhealthmassage.com",
  "password": "Sarah123!"
}
```

**Expected:** 200 OK, returns token and team member data

**Test Case 2: Invalid Email**

```json
{
  "email": "wrong@email.com",
  "password": "Sarah123!"
}
```

**Expected:** 401 Unauthorized, "Invalid email or password"

**Test Case 3: Invalid Password**

```json
{
  "email": "sarah.johnson@rehobothhealthmassage.com",
  "password": "WrongPassword123!"
}
```

**Expected:** 401 Unauthorized, "Invalid email or password"

**Test Case 4: Inactive Account**

```json
{
  "email": "inactive@rehobothhealthmassage.com",
  "password": "Password123!"
}
```

**Expected:** 403 Forbidden, "Your account has been deactivated"

**Test Case 5: Missing Fields**

```json
{
  "email": "sarah.johnson@rehobothhealthmassage.com"
}
```

**Expected:** 400 Bad Request, "Email and password are required"

#### Test 3.1.2: Forgot Password

**Endpoint:** `POST /api/team/auth/forgot-password`

**Test Case 1: Valid Email**

```json
{
  "email": "sarah.johnson@rehobothhealthmassage.com"
}
```

**Expected:** 200 OK, "If an account exists with this email, a password reset link has been sent."
**Verify:** Check database for `reset_password_token` and `reset_password_expires`

**Test Case 2: Invalid Email**

```json
{
  "email": "nonexistent@email.com"
}
```

**Expected:** 200 OK (security: don't reveal if email exists)

**Test Case 3: Missing Email**

```json
{}
```

**Expected:** 400 Bad Request, "Email is required"

#### Test 3.1.3: Reset Password

**Endpoint:** `POST /api/team/auth/reset-password`

**Test Case 1: Valid Token**

```json
{
  "token": "<reset_token_from_email>",
  "newPassword": "NewPassword123!"
}
```

**Expected:** 200 OK, "Password has been reset successfully"
**Verify:** Check database - `reset_password_token` should be null

**Test Case 2: Expired Token**

```json
{
  "token": "<expired_token>",
  "newPassword": "NewPassword123!"
}
```

**Expected:** 400 Bad Request, "Reset token has expired"

**Test Case 3: Invalid Token**

```json
{
  "token": "invalid_token_12345",
  "newPassword": "NewPassword123!"
}
```

**Expected:** 400 Bad Request, "Invalid or expired reset token"

**Test Case 4: Weak Password**

```json
{
  "token": "<valid_token>",
  "newPassword": "123"
}
```

**Expected:** 400 Bad Request, "Password must be at least 8 characters long"

#### Test 3.1.4: Change Password

**Endpoint:** `POST /api/team/auth/change-password` (Requires Authentication)

**Headers:** `Authorization: Bearer team_member_<id>`

**Test Case 1: Valid Change**

```json
{
  "currentPassword": "Sarah123!",
  "newPassword": "NewPassword123!"
}
```

**Expected:** 200 OK, "Password changed successfully"
**Verify:** Email notification sent

**Test Case 2: Wrong Current Password**

```json
{
  "currentPassword": "WrongPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Expected:** 401 Unauthorized, "Current password is incorrect"

**Test Case 3: Weak New Password**

```json
{
  "currentPassword": "Sarah123!",
  "newPassword": "123"
}
```

**Expected:** 400 Bad Request, "Password must be at least 8 characters long"

### 3.2 Team Member Profile

#### Test 3.2.1: Get Profile

**Endpoint:** `GET /api/team/auth/profile` (Requires Authentication)

**Expected:** 200 OK, returns team member profile with specialisations

#### Test 3.2.2: Update Profile

**Endpoint:** `PUT /api/team/auth/profile` (Requires Authentication)

**Test Case 1: Update Name and Phone**

```json
{
  "title": "Sarah Johnson Updated",
  "phone": "+44 7700 999999"
}
```

**Expected:** 200 OK, returns updated profile

**Test Case 2: Update Availability**

```json
{
  "availability": "monday:9am-5pm,tuesday:9am-5pm,wednesday:9am-5pm"
}
```

**Expected:** 200 OK, availability updated

**Test Case 3: Update Image**

```json
{
  "image_url": "https://example.com/new-image.jpg"
}
```

**Expected:** 200 OK, image_url updated

#### Test 3.2.3: Get Appointments

**Endpoint:** `GET /api/team/auth/appointments` (Requires Authentication)

**Query Parameters:**

- `upcoming_only=true` - Only future appointments
- `status=confirmed` - Filter by status

**Expected:** 200 OK, returns array of appointments assigned to team member

### 3.3 Auto-Assignment Logic

#### Test 3.3.1: Auto-Assign Female Client to Female Therapist

**Scenario:** Book appointment with:

- Service: "Swedish Massage"
- Treatment: "60 Minute Swedish Massage"
- Client Gender: "female"

**Expected:** Auto-assigned to Sarah Johnson (female, works_with_gender: female)

#### Test 3.3.2: Auto-Assign Male Client to Male Therapist

**Scenario:** Book appointment with:

- Service: "Sports Massage"
- Treatment: "60 Minute Sports Massage"
- Client Gender: "male"

**Expected:** Auto-assigned to Michael Chen or David Thompson (male therapists)

#### Test 3.3.3: Auto-Assign Based on Specialisation

**Scenario:** Book appointment with:

- Service: "Hot Stone Massage"
- Treatment: "90 Minute Hot Stone Massage"
- Client Gender: "female"

**Expected:** Auto-assigned to Sarah Johnson or Emma Williams (have Hot Stone Massage specialisation)

#### Test 3.3.4: No Match Found

**Scenario:** Book appointment with:

- Service: "Non-existent Service"
- Client Gender: "female"

**Expected:** No auto-assignment, `team_member_id` remains null

### 3.4 Specialisations Management

#### Test 3.4.1: Get Team Member Specialisations

**Endpoint:** `GET /api/admin/team/:id/specialisations`

**Expected:** 200 OK, returns array of specialisations with service and service_item details

#### Test 3.4.2: Update Team Member Specialisations

**Endpoint:** `PUT /api/admin/team/:id/specialisations`

**Test Case 1: Add Specialisations**

```json
{
  "specialisations": [
    {
      "service_id": "<swedish_massage_service_id>",
      "service_item_id": null
    },
    {
      "service_id": "<deep_tissue_service_id>",
      "service_item_id": "<60_minute_item_id>"
    }
  ]
}
```

**Expected:** 200 OK, old specialisations deleted, new ones inserted

**Test Case 2: Remove All Specialisations**

```json
{
  "specialisations": []
}
```

**Expected:** 200 OK, all specialisations removed

---

## 4. Frontend Admin Testing

### 4.1 Team Member Form - Multi-Select Specialisations

#### Test 4.1.1: Create Team Member with Specialisations

1. Navigate to `/admin/team/new`
2. Fill in basic information:
   - Name: "Test Therapist"
   - Role: "Massage Therapist"
   - Email: "test@example.com"
   - Gender: "female"
   - Works With: "all"
3. In Specialisations field:
   - Click the multi-select dropdown
   - Select "Swedish Massage" (service)
   - Select "60 Minute Swedish Massage" (service item)
   - Select "Deep Tissue Massage" (service)
4. Set availability using day checkboxes
5. Click "Save"

**Expected:**

- Team member created successfully
- Specialisations saved correctly
- Welcome email sent to team member

#### Test 4.1.2: Edit Team Member Specialisations

1. Navigate to `/admin/team/edit/:id`
2. Modify specialisations:
   - Remove "Swedish Massage"
   - Add "Hot Stone Massage"
3. Click "Save"

**Expected:**

- Specialisations updated correctly
- Old specialisations removed
- New specialisations added

#### Test 4.1.3: Availability Selector

1. Navigate to `/admin/team/new`
2. Test availability selector:
   - Check "Monday" checkbox
   - Enter time: "10am-4pm"
   - Check "Tuesday" checkbox
   - Enter time: "9am-5pm"
   - Uncheck "Monday"
3. Verify format: "tuesday:9am-5pm"

**Expected:**

- Only checked days with times are saved
- Format: "day:time,day:time"

### 4.2 Appointment Reassignment

#### Test 4.2.1: Assign Team Member to Appointment

1. Navigate to `/admin/appointments`
2. Find an appointment without team member
3. Click "Assign Team Member"
4. Select a team member from dropdown
5. Click "Assign"

**Expected:**

- Appointment updated with team member
- Email notification sent to team member
- Success message displayed

#### Test 4.2.2: Reassign Appointment

1. Navigate to `/admin/appointments`
2. Find an appointment with assigned team member
3. Click "Reassign"
4. Select different team member
5. Click "Update"

**Expected:**

- Appointment updated with new team member
- Email notification sent to new team member
- Success message displayed

---

## 5. Frontend Appointment Booking Testing

### 5.1 Gender Selection

#### Test 5.1.1: Select Gender in Booking Form

1. Navigate to `/book-appointment`
2. Step 1 (Personal Info):
   - Fill in name, email, phone
   - Select gender: "Female" (radio button)
3. Continue to next step

**Expected:**

- Gender selection required
- Form validation prevents submission without gender
- Gender value saved in form state

#### Test 5.1.2: Gender Validation

1. Navigate to `/book-appointment`
2. Fill all fields except gender
3. Try to proceed

**Expected:**

- Validation error: "Please select your gender"
- Cannot proceed to next step

### 5.2 Auto-Assignment

#### Test 5.2.1: Auto-Assign Female Client

1. Navigate to `/book-appointment`
2. Complete form:
   - Gender: "Female"
   - Service: "Swedish Massage"
   - Treatment: "60 Minute Swedish Massage"
   - Date and time
3. Submit booking

**Expected:**

- Appointment created successfully
- Auto-assigned to female therapist (Sarah Johnson or Emma Williams)
- Email notification sent to assigned team member

#### Test 5.2.2: Auto-Assign Male Client

1. Navigate to `/book-appointment`
2. Complete form:
   - Gender: "Male"
   - Service: "Sports Massage"
   - Treatment: "60 Minute Sports Massage"
   - Date and time
3. Submit booking

**Expected:**

- Appointment created successfully
- Auto-assigned to male therapist (Michael Chen or David Thompson)
- Email notification sent to assigned team member

#### Test 5.2.3: Manual Assignment Overrides Auto

1. Navigate to `/book-appointment`
2. Complete form with gender and service
3. Admin manually assigns different team member before booking

**Expected:**

- Manual assignment takes precedence
- Auto-assignment skipped

---

## 6. Team Member Portal Testing

### 6.1 Login & Authentication

#### Test 6.1.1: Team Member Login

1. Navigate to `/team/login`
2. Enter credentials:
   - Email: `sarah.johnson@rehobothhealthmassage.com`
   - Password: `Sarah123!`
3. Click "Login"

**Expected:**

- Redirects to `/team/dashboard`
- Token stored in localStorage
- Team member data stored in localStorage

#### Test 6.1.2: Forgot Password Flow

1. Navigate to `/team/forgot-password`
2. Enter email: `sarah.johnson@rehobothhealthmassage.com`
3. Click "Send Reset Link"

**Expected:**

- Success message displayed
- Email sent with reset link
- Link format: `/team/reset-password?token=<token>`

#### Test 6.1.3: Reset Password Flow

1. Click reset link from email
2. Enter new password: `NewPassword123!`
3. Confirm password: `NewPassword123!`
4. Click "Reset Password"

**Expected:**

- Password reset successfully
- Redirects to login page
- Can login with new password

### 6.2 Dashboard

#### Test 6.2.1: Dashboard Stats

1. Login as team member
2. Navigate to `/team/dashboard`

**Expected:**

- Welcome message with team member name
- Stats cards display:
  - Total Appointments
  - Upcoming Appointments
  - Today's Appointments
- Stats are accurate

### 6.3 My Appointments

#### Test 6.3.1: View Appointments List

1. Navigate to `/team/appointments`

**Expected:**

- Table displays all assigned appointments
- Columns: Date, Time, Client, Service, Phone, Status
- Status chips with correct colors
- Empty state if no appointments

#### Test 6.3.2: Appointments Filtering

1. Navigate to `/team/appointments`
2. Check API call includes `upcoming_only=true`

**Expected:**

- Only future appointments displayed
- Past appointments filtered out

### 6.4 My Profile

#### Test 6.4.1: View Profile

1. Navigate to `/team/profile`

**Expected:**

- Profile form pre-filled with current data
- Image displayed
- Email and Role fields disabled (read-only)

#### Test 6.4.2: Update Profile

1. Navigate to `/team/profile`
2. Update fields:
   - Name: "Sarah Johnson Updated"
   - Phone: "+44 7700 999999"
   - Description: "Updated description"
3. Click "Save Changes"

**Expected:**

- Profile updated successfully
- Success message displayed
- Auth context updated with new data

#### Test 6.4.3: Upload Profile Image

1. Navigate to `/team/profile`
2. Click "Upload" button in Image Upload Field
3. Select image file
4. Wait for upload

**Expected:**

- Image uploaded successfully
- Preview displayed
- Image URL updated in form

#### Test 6.4.4: Update Availability

1. Navigate to `/team/profile`
2. Use Availability Selector:
   - Check "Monday", enter "10am-4pm"
   - Check "Tuesday", enter "9am-5pm"
   - Uncheck "Wednesday"
3. Click "Save Changes"

**Expected:**

- Availability updated
- Format: "monday:10am-4pm,tuesday:9am-5pm"
- Only checked days saved

### 6.5 Change Password

#### Test 6.5.1: Change Password

1. Navigate to `/team/change-password`
2. Enter:
   - Current Password: `Sarah123!`
   - New Password: `NewPassword123!`
   - Confirm Password: `NewPassword123!`
3. Click "Change Password"

**Expected:**

- Password changed successfully
- Success message displayed
- Email notification sent
- Can login with new password

#### Test 6.5.2: Password Validation

1. Navigate to `/team/change-password`
2. Enter weak password: `123`
3. Try to submit

**Expected:**

- Validation error: "Password must be at least 8 characters long"
- Cannot submit

#### Test 6.5.3: Password Mismatch

1. Navigate to `/team/change-password`
2. Enter:
   - New Password: `Password123!`
   - Confirm Password: `DifferentPassword123!`
3. Try to submit

**Expected:**

- Validation error: "Passwords do not match"
- Cannot submit

### 6.6 Logout

#### Test 6.6.1: Logout

1. Click logout button in sidebar or header menu
2. Confirm logout

**Expected:**

- Redirects to `/team/login`
- Token removed from localStorage
- Team member data removed from localStorage

---

## 7. Email Notifications Testing

### 7.1 Appointment Assignment Email

#### Test 7.1.1: New Appointment Assignment

1. Book appointment with auto-assignment or manual assignment
2. Check team member's email inbox

**Expected:**

- Email received with subject: "New Appointment Assigned: [Client Name]"
- Email includes:
  - Client name
  - Service
  - Date and time
  - Phone number (if provided)
  - Notes (if provided)
  - Link to dashboard

#### Test 7.1.2: Appointment Reassignment Email

1. Admin reassigns appointment to different team member
2. Check new team member's email inbox

**Expected:**

- Email received with appointment details
- Email sent only to newly assigned team member

### 7.2 Password Reset Email

#### Test 7.2.1: Password Reset Request

1. Request password reset from `/team/forgot-password`
2. Check team member's email inbox

**Expected:**

- Email received with subject: "Password Reset Request"
- Email includes reset link with token
- Link format: `/team/reset-password?token=<token>`
- Token expires in 1 hour

### 7.3 Password Changed Email

#### Test 7.3.1: Password Changed Confirmation

1. Change password from `/team/change-password`
2. Check team member's email inbox

**Expected:**

- Email received with subject: "Password Changed"
- Email includes security notice
- Confirmation that password was changed

### 7.4 Welcome Email

#### Test 7.4.1: Team Member Welcome Email

1. Admin creates new team member with email
2. Check team member's email inbox

**Expected:**

- Email received with subject: "Welcome to Rehoboth Health & Wellness Clinic"
- Email includes:
  - Welcome message
  - Profile details
  - Availability information
  - Contact information

---

## 8. Test Data

### 8.1 SQL Test Data Scripts

Create a file `server/database/seed_test_data.sql` with the following:

```sql
-- ============================================
-- TEST DATA FOR TEAM MEMBER AUTHENTICATION
-- ============================================

-- 1. Create Test Admin User
-- Password: TestAdmin123! (hash with bcrypt)
INSERT INTO admin_users (username, password_hash, email)
VALUES (
  'test-admin',
  '$2a$10$YourBcryptHashHere', -- Replace with actual bcrypt hash
  'admin@rehobothhealthmassage.com'
) ON CONFLICT (username) DO NOTHING;

-- 2. Create Test Team Members
-- Note: Passwords need to be set via API or manually hashed

-- Team Member 1: Sarah Johnson (Female, Female Clients Only)
INSERT INTO team_members (
  title, role, gender, works_with_gender, email, phone,
  availability, description, is_active, display_order
)
VALUES (
  'Sarah Johnson',
  'Massage Therapist',
  'female',
  'female',
  'sarah.johnson@rehobothhealthmassage.com',
  '+44 7700 900123',
  'monday:10am-4pm,tuesday:10am-4pm,wednesday:10am-4pm,friday:10am-4pm',
  'Sarah is a professional massage therapist specializing in Swedish massage, deep tissue massage, and aromatherapy. She works exclusively with female clients.',
  true,
  1
) ON CONFLICT DO NOTHING;

-- Team Member 2: Michael Chen (Male, All Genders)
INSERT INTO team_members (
  title, role, gender, works_with_gender, email, phone,
  availability, description, is_active, display_order
)
VALUES (
  'Michael Chen',
  'Sports Massage Therapist',
  'male',
  'all',
  'michael.chen@rehobothhealthmassage.com',
  '+44 7700 900456',
  'monday:9am-5pm,tuesday:9am-5pm,wednesday:9am-5pm,thursday:9am-5pm,friday:9am-5pm',
  'Michael is a highly skilled Sports Massage Therapist with extensive experience in helping clients improve mobility and recover from injuries.',
  true,
  2
) ON CONFLICT DO NOTHING;

-- Team Member 3: Emma Williams (Female, All Genders)
INSERT INTO team_members (
  title, role, gender, works_with_gender, email, phone,
  availability, description, is_active, display_order
)
VALUES (
  'Emma Williams',
  'Therapeutic Massage Therapist',
  'female',
  'all',
  'emma.williams@rehobothhealthmassage.com',
  '+44 7700 900789',
  'monday:10am-6pm,tuesday:10am-6pm,wednesday:10am-6pm,thursday:10am-6pm,saturday:10am-4pm',
  'Emma specializes in therapeutic massage, hot stone massage, and reflexology. She works with clients of all genders.',
  true,
  3
) ON CONFLICT DO NOTHING;

-- Team Member 4: David Thompson (Male, Male Clients Only)
INSERT INTO team_members (
  title, role, gender, works_with_gender, email, phone,
  availability, description, is_active, display_order
)
VALUES (
  'David Thompson',
  'Deep Tissue Massage Specialist',
  'male',
  'male',
  'david.thompson@rehobothhealthmassage.com',
  '+44 7700 900321',
  'monday:11am-7pm,tuesday:11am-7pm,wednesday:11am-7pm,thursday:11am-7pm',
  'David specializes in deep tissue massage and sports massage. He works exclusively with male clients.',
  true,
  4
) ON CONFLICT DO NOTHING;

-- 3. Set Passwords for Team Members
-- Note: These should be set via API endpoint or manually hashed
-- Use POST /api/team/auth/change-password after initial login setup
-- Or use bcrypt to hash passwords and update directly

-- Example password hashes (for testing):
-- Password: "TeamMember123!" -> Hash: $2a$10$...
-- You can generate hashes using: bcrypt.hash("TeamMember123!", 10)

-- 4. Create Test Appointments
-- These will be created through the booking form, but here are examples:

-- Test Appointment 1: Female client, Swedish Massage
-- Expected auto-assignment: Sarah Johnson or Emma Williams
INSERT INTO appointments (
  full_name, email, phone, service, date, time,
  client_gender, note, status, payment_status
)
VALUES (
  'Jane Smith',
  'jane.smith@example.com',
  '+44 7700 123456',
  'Swedish Massage',
  '2025-01-15',
  '14:00',
  'female',
  'First time client, prefers gentle pressure',
  'pending',
  'pending'
) ON CONFLICT DO NOTHING;

-- Test Appointment 2: Male client, Sports Massage
-- Expected auto-assignment: Michael Chen or David Thompson
INSERT INTO appointments (
  full_name, email, phone, service, date, time,
  client_gender, note, status, payment_status
)
VALUES (
  'John Doe',
  'john.doe@example.com',
  '+44 7700 654321',
  'Sports Massage',
  '2025-01-16',
  '10:00',
  'male',
  'Post-workout recovery',
  'pending',
  'pending'
) ON CONFLICT DO NOTHING;

-- 5. Verify Test Data
SELECT
  tm.id,
  tm.title,
  tm.email,
  tm.gender,
  tm.works_with_gender,
  COUNT(DISTINCT tms.id) as specialisation_count,
  COUNT(DISTINCT apt.id) as appointment_count
FROM team_members tm
LEFT JOIN team_member_specialisations tms ON tm.id = tms.team_member_id
LEFT JOIN appointments apt ON tm.id = apt.team_member_id
WHERE tm.email LIKE '%@rehobothhealthmassage.com'
GROUP BY tm.id, tm.title, tm.email, tm.gender, tm.works_with_gender
ORDER BY tm.display_order;
```

### 8.2 API Test Credentials

**Admin User:**

- Username: `test-admin`
- Password: `TestAdmin123!`
- Email: `admin@rehobothhealthmassage.com`

**Team Member 1 (Sarah Johnson):**

- Email: `sarah.johnson@rehobothhealthmassage.com`
- Password: `Sarah123!` (set via API or manually)
- Gender: Female
- Works With: Female clients only

**Team Member 2 (Michael Chen):**

- Email: `michael.chen@rehobothhealthmassage.com`
- Password: `Michael123!` (set via API or manually)
- Gender: Male
- Works With: All genders

**Team Member 3 (Emma Williams):**

- Email: `emma.williams@rehobothhealthmassage.com`
- Password: `Emma123!` (set via API or manually)
- Gender: Female
- Works With: All genders

**Team Member 4 (David Thompson):**

- Email: `david.thompson@rehobothhealthmassage.com`
- Password: `David123!` (set via API or manually)
- Gender: Male
- Works With: Male clients only

### 8.3 Test Scenarios Summary

#### Scenario 1: Female Client Books Swedish Massage

- **Client Gender:** Female
- **Service:** Swedish Massage
- **Expected Assignment:** Sarah Johnson or Emma Williams
- **Reason:** Both are female therapists with Swedish Massage specialisation

#### Scenario 2: Male Client Books Sports Massage

- **Client Gender:** Male
- **Service:** Sports Massage
- **Expected Assignment:** Michael Chen or David Thompson
- **Reason:** Both are male therapists with Sports Massage specialisation

#### Scenario 3: Female Client Books Hot Stone Massage

- **Client Gender:** Female
- **Service:** Hot Stone Massage
- **Expected Assignment:** Sarah Johnson or Emma Williams
- **Reason:** Both have Hot Stone Massage specialisation

#### Scenario 4: Gender Preference Mismatch

- **Client Gender:** Male
- **Service:** Swedish Massage
- **Expected Assignment:** Michael Chen or Emma Williams (not Sarah)
- **Reason:** Sarah only works with female clients

---

## 9. Quick Test Checklist

### Database Setup

- [ ] Run all migration SQL files
- [ ] Verify all tables exist
- [ ] Verify all columns exist
- [ ] Run test data seed script

### Backend API

- [ ] Test team member login (valid/invalid credentials)
- [ ] Test forgot password flow
- [ ] Test reset password with token
- [ ] Test change password
- [ ] Test get profile
- [ ] Test update profile
- [ ] Test get appointments
- [ ] Test auto-assignment logic
- [ ] Test specialisations CRUD

### Frontend Admin

- [ ] Test create team member with specialisations
- [ ] Test edit team member specialisations
- [ ] Test availability selector
- [ ] Test appointment reassignment

### Frontend Booking

- [ ] Test gender selection in form
- [ ] Test auto-assignment on booking
- [ ] Test manual assignment override

### Team Member Portal

- [ ] Test login page
- [ ] Test forgot password page
- [ ] Test reset password page
- [ ] Test dashboard stats
- [ ] Test appointments list
- [ ] Test profile edit
- [ ] Test image upload
- [ ] Test password change
- [ ] Test logout

### Email Notifications

- [ ] Test appointment assignment email
- [ ] Test appointment reassignment email
- [ ] Test password reset email
- [ ] Test password changed email
- [ ] Test welcome email

---

## 10. Common Issues & Troubleshooting

### Issue 1: Team Member Cannot Login

**Possible Causes:**

- Password not set (password_hash is NULL)
- Account is inactive (is_active = false)
- Email mismatch

**Solution:**

- Set password via API: `POST /api/team/auth/change-password` (if admin)
- Or use forgot password flow
- Check `is_active` status in database

### Issue 2: Auto-Assignment Not Working

**Possible Causes:**

- No team members with matching specialisations
- Gender mismatch
- Service name doesn't match exactly

**Solution:**

- Verify team member specialisations are set correctly
- Check `works_with_gender` field
- Verify service names match exactly (case-insensitive)

### Issue 3: Email Notifications Not Sending

**Possible Causes:**

- Email service not configured
- Invalid email addresses
- Network issues

**Solution:**

- Check `EMAIL_USER` and `EMAIL_PASS` environment variables
- Verify email addresses are valid
- Check server logs for email errors

### Issue 4: Password Reset Token Invalid

**Possible Causes:**

- Token expired (1 hour limit)
- Token already used
- Token hash mismatch

**Solution:**

- Request new password reset
- Verify token expiration time
- Check database for token hash

---

## 11. Performance Testing

### Load Testing Scenarios

1. **Multiple Concurrent Logins**

   - Test 10+ team members logging in simultaneously
   - Expected: All logins succeed

2. **Bulk Appointment Creation**

   - Create 50+ appointments with auto-assignment
   - Expected: All appointments assigned correctly

3. **Profile Updates**
   - Multiple team members updating profiles simultaneously
   - Expected: No conflicts, all updates succeed

---

## 12. Security Testing

### Security Checklist

- [ ] Password hashing verified (bcrypt)
- [ ] Reset tokens expire after 1 hour
- [ ] Tokens are hashed before storage
- [ ] Email enumeration prevented (always return success)
- [ ] Protected routes require authentication
- [ ] Team members can only see their own data
- [ ] Password strength validation enforced
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)

---

## Notes

- All passwords in test data should be hashed using bcrypt before insertion
- Email addresses should be valid for testing email notifications
- Test data can be cleaned up after testing using DELETE statements
- Always test in a development environment first
- Keep test data separate from production data

---

## Support

For issues or questions during testing:

1. Check server logs for detailed error messages
2. Verify database schema matches migration files
3. Check API endpoints are registered correctly
4. Verify environment variables are set
5. Check email service configuration

---

**Last Updated:** 2025-01-XX
**Version:** 1.0
