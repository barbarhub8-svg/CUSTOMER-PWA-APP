-- ============================================================
-- NEXORA CUSTOMER PWA - COMPLETE SUPABASE SCHEMA
-- Single SQL file: Tables + Enums + RLS + Storage + Triggers + Functions
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- CUSTOM ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'super_admin', 'shop_owner', 'shop_manager', 'staff', 'customer', 
  'growth_partner', 'distributor'
);

CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 
  'rejected', 'no_show'
);

CREATE TYPE referral_status AS ENUM (
  'clicked', 'signed_up', 'pending', 'qualified', 'rewarded', 
  'rejected', 'reversed'
);

CREATE TYPE reward_entry_type AS ENUM (
  'booking_reward', 'referral_reward', 'promotion', 'redemption', 
  'expiry', 'reversal', 'admin_adjustment'
);

CREATE TYPE membership_status AS ENUM (
  'pending', 'active', 'expired', 'cancelled', 'suspended'
);

CREATE TYPE notification_status AS ENUM (
  'unread', 'read', 'archived'
);

-- ============================================================
-- TABLES
-- ============================================================

-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  mobile TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender_preference TEXT,
  preferred_city TEXT,
  preferred_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- shops
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  category_id UUID,
  description TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  whatsapp TEXT,
  cover_image_url TEXT,
  logo_url TEXT,
  rating_average NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  approval_status TEXT DEFAULT 'pending',
  opening_status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- service_categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  gender TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role_title TEXT,
  experience_years INTEGER,
  bio TEXT,
  image_url TEXT,
  rating_average NUMERIC(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- staff_services
CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(staff_id, service_id)
);

-- staff_schedules
CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN DEFAULT TRUE
);

-- blocked_slots
CREATE TABLE blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- shop_holidays
CREATE TABLE shop_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  holiday_date DATE NOT NULL,
  reason TEXT
);

-- bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  shop_id UUID REFERENCES shops(id) NOT NULL,
  staff_id UUID REFERENCES staff(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subtotal_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  membership_discount_amount NUMERIC(10,2) DEFAULT 0,
  reward_redeemed_amount NUMERIC(10,2) DEFAULT 0,
  final_amount NUMERIC(10,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  customer_note TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- booking_items
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  service_name_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10,2) NOT NULL,
  duration_snapshot INTEGER NOT NULL
);

-- booking_status_history
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  old_status booking_status,
  new_status booking_status,
  changed_by UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  customer_id UUID REFERENCES auth.users(id),
  shop_id UUID REFERENCES shops(id),
  staff_id UUID REFERENCES staff(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  owner_reply TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- favourites
CREATE TABLE favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id),
  staff_id UUID REFERENCES staff(id),
  service_id UUID REFERENCES services(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, shop_id, staff_id, service_id)
);

-- recent_searches
CREATE TABLE recent_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- recently_viewed_shops
CREATE TABLE recently_viewed_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- customer_addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- reward_wallets
CREATE TABLE reward_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  available_balance NUMERIC(10,2) DEFAULT 0,
  pending_balance NUMERIC(10,2) DEFAULT 0,
  lifetime_earned NUMERIC(10,2) DEFAULT 0,
  lifetime_redeemed NUMERIC(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- reward_ledger
CREATE TABLE reward_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES reward_wallets(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  entry_type reward_entry_type NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  credit_amount NUMERIC(10,2) DEFAULT 0,
  debit_amount NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'completed',
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- referral_codes
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  referral_link TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_customer_id UUID REFERENCES auth.users(id),
  referred_customer_id UUID REFERENCES auth.users(id),
  referral_code TEXT,
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  qualifying_transaction_id UUID,
  status referral_status DEFAULT 'clicked',
  rejection_reason TEXT,
  device_fingerprint_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- referral_campaigns
CREATE TABLE referral_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  referrer_reward NUMERIC(10,2),
  referred_reward NUMERIC(10,2),
  minimum_payment_amount NUMERIC(10,2) DEFAULT 100,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- customer_memberships
CREATE TABLE customer_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id),
  plan_id UUID,
  status membership_status DEFAULT 'pending',
  start_date DATE,
  expiry_date DATE,
  amount_paid NUMERIC(10,2),
  payment_reference TEXT,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- membership_plans
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  benefit_percent NUMERIC(5,2),
  price NUMERIC(10,2),
  validity_days INTEGER,
  benefits_json JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- membership_usage
CREATE TABLE membership_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID REFERENCES customer_memberships(id),
  booking_id UUID REFERENCES bookings(id),
  benefit_amount NUMERIC(10,2),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  status notification_status DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- support_tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id),
  category TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  booking_id UUID REFERENCES bookings(id),
  transaction_reference TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- support_ticket_messages
CREATE TABLE support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  message TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_shop ON bookings(shop_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_services_shop ON services(shop_id);
CREATE INDEX idx_staff_shop ON staff(shop_id);
CREATE INDEX idx_favourites_customer ON favourites(customer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_reward_ledger_wallet ON reward_ledger(wallet_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- shops (public read for approved active shops)
CREATE POLICY "Public can view approved active shops" ON shops 
FOR SELECT USING (is_active = TRUE AND approval_status = 'approved');

-- services
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = TRUE);

-- staff
CREATE POLICY "Public can view active staff" ON staff FOR SELECT USING (is_active = TRUE);

-- bookings
CREATE POLICY "Customers can view own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = customer_id);

-- reviews
CREATE POLICY "Customers can create review for own completed booking" ON reviews 
FOR INSERT WITH CHECK (
  auth.uid() = customer_id AND 
  EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND status = 'completed' AND customer_id = auth.uid())
);
CREATE POLICY "Customers can view own reviews" ON reviews FOR SELECT USING (auth.uid() = customer_id);

-- favourites
CREATE POLICY "Customers manage own favourites" ON favourites FOR ALL USING (auth.uid() = customer_id);

-- reward_wallets
CREATE POLICY "Customers can view own wallet" ON reward_wallets FOR SELECT USING (auth.uid() = customer_id);

-- reward_ledger
CREATE POLICY "Customers can view own ledger" ON reward_ledger FOR SELECT USING (auth.uid() = customer_id);

-- referrals
CREATE POLICY "Customers can view own referrals" ON referrals 
FOR SELECT USING (auth.uid() = referrer_customer_id OR auth.uid() = referred_customer_id);

-- customer_memberships
CREATE POLICY "Customers can view own memberships" ON customer_memberships FOR SELECT USING (auth.uid() = customer_id);

-- notifications
CREATE POLICY "Customers manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- support_tickets
CREATE POLICY "Customers manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = customer_id);

-- ============================================================
-- STORAGE BUCKETS + POLICIES
-- ============================================================

-- Note: Run these in Supabase Dashboard or via Edge Functions if needed.
-- These are documentation + policies for reference.

-- 1. avatars
-- Bucket: avatars (public)
-- Policy: Users can upload/update only their own avatar (path starts with user id)

-- 2. salon-media
-- Bucket: salon-media (public)
-- Policy: Read-only for customers (no upload from customer app)

-- 3. support-attachments
-- Bucket: support-attachments (private)
-- Policy: Customers can upload/read only their own ticket folder

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Auto create customer profile + role + wallet + referral code
CREATE OR REPLACE FUNCTION public.handle_new_customer_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Assign customer role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, 'customer');

  -- Create reward wallet
  INSERT INTO public.reward_wallets (customer_id) VALUES (NEW.id);

  -- Generate unique referral code
  ref_code := 'NX' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
  
  INSERT INTO public.referral_codes (customer_id, referral_code, referral_link)
  VALUES (NEW.id, ref_code, 'https://nexora.app/ref/' || ref_code);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer_user();

-- Function: Generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_reference := 'NXB-' || 
    UPPER(SUBSTRING(MD5(NEW.shop_id::TEXT || NEW.customer_id::TEXT) FROM 1 FOR 3)) || 
    '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_booking_ref
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Function: Booking status history
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_booking_status_history
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();

-- Function: Update shop rating (simplified)
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shops 
  SET rating_average = (
    SELECT AVG(rating) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE
  ),
  review_count = (
    SELECT COUNT(*) FROM reviews WHERE shop_id = NEW.shop_id AND is_visible = TRUE
  )
  WHERE id = NEW.shop_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_shop_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_shop_rating();

-- ============================================================
-- END OF COMPLETE SCHEMA
-- ============================================================