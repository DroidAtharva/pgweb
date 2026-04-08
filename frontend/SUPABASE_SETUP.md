# Supabase Setup Instructions

## Database Setup

Your application is now connected to Supabase! To complete the setup, you need to run the SQL migration in your Supabase project.

### Steps:

1. **Go to your Supabase Dashboard**
   - Visit: https://dnggpufdfmkoypmdtlbt.supabase.co

2. **Navigate to SQL Editor**
   - Click on the SQL Editor in the left sidebar

3. **Run the Migration SQL**
   - Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql` into the SQL editor
   - Click "Run" to execute the migration

### What the Migration Creates:

✅ **User Management:**
- `profiles` table - User profile information
- `user_roles` table - Role-based access control (tenant/owner)
- Automatic profile creation trigger on user signup

✅ **Property Management:**
- `properties` table - Property listings
- `rooms` table - Individual rooms within properties
- `bookings` table - Tenant bookings and lease information
- `payments` table - Rent payment tracking
- `maintenance_requests` table - Maintenance issue tracking

✅ **Communication:**
- `messages` table - Direct messaging between tenants and owners
- `notifications` table - System notifications

✅ **Storage Buckets:**
- `property-images` - Property photos (public)
- `maintenance-images` - Maintenance request photos (public)
- `lease-documents` - Lease documents (private)

✅ **Security:**
- Row Level Security (RLS) policies on all tables
- Role-based access control using `has_role()` function
- Secure user authentication

## Authentication Configuration

### Important: Email Redirect URLs

After running the migration, configure the authentication URLs:

1. Go to **Authentication → URL Configuration** in Supabase Dashboard

2. Set the **Site URL** to:
   - Development: Your preview URL (e.g., `https://your-project.lovable.app`)
   - Production: Your custom domain

3. Add **Redirect URLs** (one per line):
   ```
   http://localhost:5173/
   https://your-project.lovable.app/
   https://your-custom-domain.com/
   ```

### Optional: Disable Email Confirmation (for testing)

To speed up testing during development:

1. Go to **Authentication → Providers → Email**
2. Disable "Confirm email"
3. Remember to re-enable this in production!

## Features Enabled

### ✅ Authentication System
- Role-based signup (Tenant/Owner)
- Email/password authentication
- Automatic profile creation
- Role-based dashboard routing

### ✅ Tenant Features
- View current booking and property details
- Track rent payments
- Submit maintenance requests
- Message property owner
- View lease documents

### ✅ Owner Features
- Manage multiple properties
- Track all bookings and tenants
- Monitor rent payments
- Handle maintenance requests
- Communicate with tenants
- Analytics dashboard

## Testing the Application

### Create Test Accounts:

1. **Create a Tenant Account:**
   - Go to `/signup?role=tenant`
   - Fill in the form and submit
   - Check email for verification (if enabled)
   - Login and access tenant dashboard

2. **Create an Owner Account:**
   - Go to `/signup?role=owner`
   - Fill in the form and submit
   - Check email for verification (if enabled)
   - Login and access owner dashboard

## Next Steps

Once the database is set up, you can:

1. **Add Sample Data:**
   - Create properties as an owner
   - Add rooms to properties
   - Create bookings as a tenant

2. **Test Features:**
   - Property listings and search
   - Booking workflow
   - Payment tracking
   - Maintenance requests
   - Messaging system

3. **Customize:**
   - Add more fields to tables as needed
   - Modify RLS policies for your use case
   - Add additional storage buckets
   - Extend the API with edge functions

## Database Schema Overview

```
auth.users (Supabase managed)
  ↓
profiles (user info)
user_roles (tenant/owner)
  ↓
properties (owner creates)
  ↓
rooms (linked to properties)
  ↓
bookings (tenant books room/property)
  ↓
payments (linked to bookings)
maintenance_requests (tenant creates)
messages (tenant ↔ owner)
notifications (system generated)
```

## Security Features

- **Row Level Security (RLS):** All tables have RLS enabled
- **Role-Based Access:** Separate roles for tenants and owners
- **Secure Functions:** `has_role()` uses SECURITY DEFINER
- **Authentication Required:** All operations require authentication
- **Data Isolation:** Users can only access their own data

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify SQL migration ran successfully
3. Ensure authentication URLs are configured
4. Check RLS policies are enabled

For more information, visit the Supabase documentation: https://supabase.com/docs
