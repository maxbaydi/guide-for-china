-- Initialize PostgreSQL with pg_jieba extension for Chinese text search
-- This script runs automatically when the PostgreSQL container starts

-- Create pg_jieba extension
-- Note: pg_jieba needs to be pre-installed in the PostgreSQL image
-- We'll use a custom Dockerfile for this

-- For now, this script will be used for any initial setup
-- The actual pg_jieba extension will be created after migrations

-- Create database if not exists (handled by environment variables)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE chinese_guide TO postgres;

-- Note: pg_jieba extension will be created in migrations after Dictionary Service setup

