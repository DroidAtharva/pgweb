-- ========================================
-- PG CONNECT - Database Migration Script
-- ========================================
-- ⚠️ CRITICAL: You MUST run this script before using the app!
-- 
-- Steps to run:
-- 1. Go to: https://dnggpufdfmkoypmdtlbt.supabase.co
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste this ENTIRE file
-- 5. Click "Run" or press Cmd/Ctrl + Enter
-- 6. Wait for "Success. No rows returned" message
-- 
-- After running:
-- 1. Go to Authentication → URL Configuration
-- 2. Set Site URL to your app URL
-- 3. Add your app URL to Redirect URLs
-- ========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for roles
create type public.app_role as enum ('tenant', 'owner');

-- Create enum for occupancy type
create type public.occupancy_type as enum ('boys', 'girls', 'coed');

-- Create enum for sharing type
create type public.sharing_type as enum ('single', 'double', 'triple');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create user_roles table (SECURITY: separate table for roles)
create table public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- User roles policies
create policy "Users can view own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Create security definer function to check roles (prevents RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create properties table
create table public.properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  location text not null,
  description text,
  price_per_month decimal(10,2) not null,
  occupancy_type occupancy_type not null,
  amenities text[], -- Array of amenity names
  image_url text,
  images text[], -- Array of image URLs
  available boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on properties
alter table public.properties enable row level security;

-- Properties policies
create policy "Anyone can view available properties"
  on public.properties for select
  using (available = true or auth.uid() = owner_id);

create policy "Owners can insert own properties"
  on public.properties for insert
  with check (public.has_role(auth.uid(), 'owner') and auth.uid() = owner_id);

create policy "Owners can update own properties"
  on public.properties for update
  using (public.has_role(auth.uid(), 'owner') and auth.uid() = owner_id);

create policy "Owners can delete own properties"
  on public.properties for delete
  using (public.has_role(auth.uid(), 'owner') and auth.uid() = owner_id);

-- Create rooms table
create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  sharing_type sharing_type not null,
  available_count integer not null default 0,
  price_per_month decimal(10,2) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on rooms
alter table public.rooms enable row level security;

-- Rooms policies
create policy "Anyone can view rooms"
  on public.rooms for select
  using (true);

create policy "Owners can manage rooms for own properties"
  on public.rooms for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = rooms.property_id
      and properties.owner_id = auth.uid()
    )
  );

-- Create bookings table
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  room_id uuid references public.rooms(id) on delete set null,
  sharing_type sharing_type,
  booking_date timestamp with time zone default now(),
  move_in_date date,
  status text default 'pending', -- pending, confirmed, cancelled
  payment_method text, -- 'pay_at_property', 'online'
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on bookings
alter table public.bookings enable row level security;

-- Bookings policies
create policy "Tenants can view own bookings"
  on public.bookings for select
  using (auth.uid() = tenant_id);

create policy "Owners can view bookings for own properties"
  on public.bookings for select
  using (
    exists (
      select 1 from public.properties
      where properties.id = bookings.property_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can create bookings"
  on public.bookings for insert
  with check (public.has_role(auth.uid(), 'tenant') and auth.uid() = tenant_id);

create policy "Tenants can update own bookings"
  on public.bookings for update
  using (auth.uid() = tenant_id);

create policy "Owners can update bookings for own properties"
  on public.bookings for update
  using (
    exists (
      select 1 from public.properties
      where properties.id = bookings.property_id
      and properties.owner_id = auth.uid()
    )
  );

-- Create appointments table
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  tenant_name text not null,
  appointment_date date not null,
  appointment_time time not null,
  status text default 'scheduled', -- scheduled, completed, cancelled
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on appointments
alter table public.appointments enable row level security;

-- Appointments policies
create policy "Tenants can view own appointments"
  on public.appointments for select
  using (auth.uid() = tenant_id);

create policy "Owners can view appointments for own properties"
  on public.appointments for select
  using (
    exists (
      select 1 from public.properties
      where properties.id = appointments.property_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can create appointments"
  on public.appointments for insert
  with check (public.has_role(auth.uid(), 'tenant') and auth.uid() = tenant_id);

-- Create payments table
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references public.bookings(id) on delete cascade not null,
  tenant_id uuid references auth.users(id) on delete cascade not null,
  amount decimal(10,2) not null,
  payment_date timestamp with time zone default now(),
  payment_method text,
  status text default 'pending', -- pending, completed, failed
  created_at timestamp with time zone default now()
);

-- Enable RLS on payments
alter table public.payments enable row level security;

-- Payments policies
create policy "Tenants can view own payments"
  on public.payments for select
  using (auth.uid() = tenant_id);

create policy "Owners can view payments for own properties"
  on public.payments for select
  using (
    exists (
      select 1 from public.bookings b
      join public.properties p on p.id = b.property_id
      where b.id = payments.booking_id
      and p.owner_id = auth.uid()
    )
  );

-- Create maintenance_requests table
create table public.maintenance_requests (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  title text not null,
  description text not null,
  status text default 'submitted', -- submitted, in_progress, completed
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on maintenance_requests
alter table public.maintenance_requests enable row level security;

-- Maintenance requests policies
create policy "Tenants can view own requests"
  on public.maintenance_requests for select
  using (auth.uid() = tenant_id);

create policy "Owners can view requests for own properties"
  on public.maintenance_requests for select
  using (
    exists (
      select 1 from public.properties
      where properties.id = maintenance_requests.property_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can create requests"
  on public.maintenance_requests for insert
  with check (public.has_role(auth.uid(), 'tenant') and auth.uid() = tenant_id);

create policy "Owners can update requests for own properties"
  on public.maintenance_requests for update
  using (
    exists (
      select 1 from public.properties
      where properties.id = maintenance_requests.property_id
      and properties.owner_id = auth.uid()
    )
  );

-- Create messages table
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  message_text text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS on messages
alter table public.messages enable row level security;

-- Messages policies
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Create notifications table
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

-- Notifications policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('property-images', 'property-images', true),
  ('maintenance-images', 'maintenance-images', true),
  ('lease-documents', 'lease-documents', false)
on conflict do nothing;

-- Storage policies for property images
create policy "Anyone can view property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "Owners can upload property images"
  on storage.objects for insert
  with check (
    bucket_id = 'property-images' 
    and public.has_role(auth.uid(), 'owner')
  );

-- Storage policies for maintenance images
create policy "Anyone can view maintenance images"
  on storage.objects for select
  using (bucket_id = 'maintenance-images');

create policy "Tenants can upload maintenance images"
  on storage.objects for insert
  with check (
    bucket_id = 'maintenance-images'
    and public.has_role(auth.uid(), 'tenant')
  );

-- Storage policies for lease documents
create policy "Users can view own lease documents"
  on storage.objects for select
  using (
    bucket_id = 'lease-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  
  -- Insert user role
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::app_role, 'tenant')
  );
  
  return new;
end;
$$;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.rooms
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
  before update on public.maintenance_requests
  for each row execute procedure public.handle_updated_at();

-- ========================================
-- Migration Complete!
-- ========================================
-- Next steps:
-- 1. Go to Authentication → URL Configuration
-- 2. Set Site URL and add Redirect URLs
-- 3. (Optional) Disable email confirmation for testing
-- ========================================
