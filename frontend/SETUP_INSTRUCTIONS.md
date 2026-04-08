# 🚀 PG CONNECT Setup Instructions

## ⚠️ CRITICAL - Database Setup Required

Before using the app, you **MUST** run the database migration script. Without this, login and all features will fail.

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to: https://dnggpufdfmkoypmdtlbt.supabase.co
   
2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Run the Migration**
   - Open the `database_migration.sql` file in your project
   - Copy the **ENTIRE** file contents
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for "Success. No rows returned" message

### Step 2: Configure Authentication URLs

1. **Go to Authentication Settings**
   - In Supabase Dashboard, click "Authentication" in sidebar
   - Click "URL Configuration"

2. **Set URLs**
   - **Site URL**: Set to your app URL (e.g., `https://your-app.lovable.app`)
   - **Redirect URLs**: Add your app URL to the list

3. **Optional - Disable Email Confirmation (for testing)**
   - Go to Authentication → Providers → Email
   - Toggle OFF "Confirm email"
   - This allows instant login during testing

### Step 3: Test the App

1. **Sign Up as a Tenant or Owner**
   - Go to `/signup`
   - Fill in details
   - Select role (Tenant or Owner)
   - Submit

2. **Login**
   - Go to `/login`
   - Enter credentials
   - Should redirect to appropriate dashboard

### Step 4: Test Property Features (Owner)

1. **List a Property**
   - Login as Owner
   - Click "List Property"
   - Fill in property details
   - Add room types
   - Submit

2. **View Properties**
   - Go to `/properties`
   - Your property should appear

### Step 5: Test Booking Features (Tenant)

1. **Browse Properties**
   - Go to `/properties`
   - Click "View Details" on any property

2. **Book a Room**
   - Select a sharing type
   - Choose "Pay at Property" or "Schedule Appointment"
   - Complete booking

## Common Errors and Solutions

### Error: "Could not find the table 'public.user_roles'"
**Solution**: You haven't run the database migration. Go back to Step 1.

### Error: "User role not found"
**Solution**: 
1. Make sure you ran the migration script completely
2. Try signing up again (the trigger will create the role)
3. Check that the `user_roles` table exists in Supabase

### Error: "requested path is invalid" on login
**Solution**: Configure authentication URLs in Step 2.

### Properties not showing
**Solution**: 
1. Check if `properties` table exists
2. Make sure you listed properties as an owner
3. Check browser console for errors

## Database Schema Overview

The migration creates these tables:
- `profiles` - User profile information
- `user_roles` - User roles (tenant/owner) - SEPARATE for security
- `properties` - PG property listings
- `rooms` - Room types for each property
- `bookings` - Tenant booking requests
- `appointments` - Scheduled property viewings
- `payments` - Payment tracking
- `maintenance_requests` - Maintenance issues
- `messages` - User messaging
- `notifications` - System notifications

## Security Features

✅ Row Level Security (RLS) enabled on all tables
✅ Roles stored in separate table (prevents privilege escalation)
✅ Security definer functions for safe role checking
✅ Proper authentication and authorization
✅ File upload permissions

## Need Help?

If you're still having issues:
1. Check the browser console for errors (F12)
2. Check the Supabase logs
3. Verify all migration steps completed successfully
4. Make sure you're using the correct Supabase URL and anon key

---

**Remember**: The database migration is MANDATORY. The app will not work without it!
