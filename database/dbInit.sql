-- ============================================
-- Very Simple Mobile Shop Database Schema
-- ============================================
-- Tables: users, products, orders
-- No UUID, just the basics
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert users
INSERT INTO users (username, email, password, full_name, phone, role) VALUES
  ('admin', 'admin@shop.com', 'admin123', 'Admin User', '0812345678', 'admin'),
  ('john', 'john@email.com', 'pass123', 'John Doe', '0898765432', 'customer'),
  ('jane', 'jane@email.com', 'pass123', 'Jane Smith', '0811223344', 'customer');

-- Insert products
INSERT INTO products (name, brand, price, stock, category) VALUES
  ('iPhone 15 Pro', 'Apple', 42900.00, 25, 'Smartphone'),
  ('Galaxy S24 Ultra', 'Samsung', 48900.00, 15, 'Smartphone'),
  ('iPhone 14', 'Apple', 29900.00, 30, 'Smartphone'),
  ('AirPods Pro', 'Apple', 8900.00, 50, 'Accessory'),
  ('Galaxy Buds2 Pro', 'Samsung', 6900.00, 40, 'Accessory');

-- Insert orders
INSERT INTO orders (user_id, product_id, quantity, price, total, status) VALUES
  (2, 1, 1, 42900.00, 42900.00, 'delivered'),
  (2, 4, 2, 8900.00, 17800.00, 'delivered'),
  (3, 2, 1, 48900.00, 48900.00, 'shipped'),
  (3, 5, 1, 6900.00, 6900.00, 'pending');

-- ============================================
-- DONE!
-- ============================================
SELECT 'Done! Created 3 tables with sample data.' as message;