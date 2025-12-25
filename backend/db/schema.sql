-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'courier', 'merchant', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    password_hash TEXT, -- Added for basic auth flow
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Merchants Table
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    business_name VARCHAR(100) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    address_text TEXT,
    is_open BOOLEAN DEFAULT TRUE,
    prep_time_minutes INT DEFAULT 15,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Couriers Table
CREATE TABLE couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('bicycle', 'motorcycle', 'car', 'van')),
    license_plate VARCHAR(20),
    is_online BOOLEAN DEFAULT FALSE,
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    wallet_balance_ghs DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pricing Rules Table
CREATE TABLE pricing_rules (
    id SERIAL PRIMARY KEY,
    vehicle_type VARCHAR(20) NOT NULL,
    base_fare_ghs DECIMAL(10, 2) NOT NULL,
    per_km_ghs DECIMAL(10, 2) NOT NULL,
    per_min_ghs DECIMAL(10, 2) DEFAULT 0.00,
    surge_multiplier DECIMAL(3, 2) DEFAULT 1.00,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id),
    merchant_id UUID REFERENCES merchants(id), -- Nullable for P2P parcel
    courier_id UUID REFERENCES couriers(id),
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'assigned', 'picked_up', 'en_route', 'delivered', 'cancelled', 'completed')),
    
    -- Locations stored as simple JSON for flexibility or splitting lat/lng columns
    pickup_lat DECIMAL(10, 8) NOT NULL,
    pickup_lng DECIMAL(11, 8) NOT NULL,
    pickup_address TEXT,
    pickup_landmark TEXT,
    pickup_phone VARCHAR(20),
    
    dropoff_lat DECIMAL(10, 8) NOT NULL,
    dropoff_lng DECIMAL(11, 8) NOT NULL,
    dropoff_address TEXT,
    dropoff_landmark TEXT,
    dropoff_phone VARCHAR(20),

    -- Pricing snapshot
    pricing_details JSONB, -- Stores full breakdown: base, distance, surge, fees
    total_amount_ghs DECIMAL(10, 2) NOT NULL,
    
    items JSONB, -- Stores array of [{ name, price, quantity, itemId }]

    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

    payment_method VARCHAR(20) DEFAULT 'momo' CHECK (payment_method IN ('momo', 'card', 'cash')),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    provider VARCHAR(20) NOT NULL, -- paystack, flutterwave, mtn_momo
    amount_ghs DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    provider_reference VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for geospatial queries (simple B-tree on lat/lng for bounding box queries, or use PostGIS if available later)
CREATE INDEX idx_couriers_location ON couriers (current_lat, current_lng);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Menu Items Table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_merchant ON menu_items (merchant_id);
CREATE INDEX idx_menu_category ON menu_items (category);

