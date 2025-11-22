-- Constitutional Shrinkage Database Schema
-- 001_core_entities.sql - Core entity tables
-- Agent 3: Database & Schema Infrastructure
-- Generated: 2025-11-22

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Person verification levels
CREATE TYPE verification_level AS ENUM (
    'UNVERIFIED',
    'EMAIL_VERIFIED',
    'ID_VERIFIED',
    'BIOMETRIC',
    'FULL_KYC'
);

-- Person status
CREATE TYPE person_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'DECEASED',
    'EMIGRATED'
);

-- Expertise levels
CREATE TYPE expertise_level AS ENUM (
    'NOVICE',
    'INTERMEDIATE',
    'EXPERT',
    'AUTHORITY'
);

-- Organization types
CREATE TYPE organization_type AS ENUM (
    -- Government
    'FEDERAL_GOVERNMENT',
    'STATE_GOVERNMENT',
    'LOCAL_GOVERNMENT',
    'GOVERNMENT_AGENCY',
    'GOVERNMENT_CORPORATION',
    'LEGISLATIVE_BODY',
    'JUDICIAL_BODY',
    'EXECUTIVE_BRANCH',
    'REGULATORY_AGENCY',
    'LAW_ENFORCEMENT',
    'MILITARY',
    -- Business
    'CORPORATION',
    'LLC',
    'PARTNERSHIP',
    'SOLE_PROPRIETORSHIP',
    'COOPERATIVE',
    'B_CORPORATION',
    'PUBLIC_BENEFIT_CORP',
    'HOLDING_COMPANY',
    'SUBSIDIARY',
    'JOINT_VENTURE',
    -- Non-profit
    'NONPROFIT_501C3',
    'NONPROFIT_501C4',
    'FOUNDATION',
    'CHARITY',
    'RELIGIOUS_ORG',
    'EDUCATIONAL_INSTITUTION',
    'RESEARCH_INSTITUTION',
    -- Political
    'POLITICAL_PARTY',
    'PAC',
    'SUPER_PAC',
    'LOBBYING_FIRM',
    'CAMPAIGN_COMMITTEE',
    'ADVOCACY_GROUP',
    -- Labor/Professional
    'LABOR_UNION',
    'TRADE_ASSOCIATION',
    'PROFESSIONAL_ASSOCIATION',
    'GUILD',
    -- Financial
    'BANK',
    'CREDIT_UNION',
    'INVESTMENT_FUND',
    'HEDGE_FUND',
    'PRIVATE_EQUITY',
    'VENTURE_CAPITAL',
    'INSURANCE_COMPANY',
    'TRUST',
    'ESTATE'
);

-- Organization status
CREATE TYPE organization_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'DISSOLVED',
    'MERGED',
    'ACQUIRED',
    'BANKRUPT',
    'UNDER_INVESTIGATION'
);

-- License status
CREATE TYPE license_status AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'SUSPENDED',
    'REVOKED'
);

-- Regulatory filing status
CREATE TYPE filing_status AS ENUM (
    'SUBMITTED',
    'ACCEPTED',
    'REJECTED',
    'AMENDED'
);

-- Governance levels
CREATE TYPE governance_level AS ENUM (
    'IMMUTABLE',
    'FEDERAL',
    'REGIONAL',
    'LOCAL'
);

-- ============================================================================
-- REGIONS TABLE
-- ============================================================================

CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    level governance_level NOT NULL DEFAULT 'LOCAL',
    parent_region_id UUID REFERENCES regions(id),

    -- Geographic data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    boundary_geojson JSONB,

    -- Metadata
    population BIGINT,
    timezone VARCHAR(50),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,

    CONSTRAINT valid_hierarchy CHECK (id != parent_region_id)
);

-- ============================================================================
-- PERSONS TABLE
-- ============================================================================

CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_key TEXT NOT NULL UNIQUE,

    -- Basic info
    legal_name VARCHAR(255) NOT NULL,
    preferred_name VARCHAR(255),
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(255),

    -- Contact
    contact_email VARCHAR(255) NOT NULL UNIQUE,
    contact_phone VARCHAR(50),

    -- Location
    primary_region_id UUID NOT NULL REFERENCES regions(id),

    -- Verification
    verification_level verification_level NOT NULL DEFAULT 'UNVERIFIED',
    verification_date TIMESTAMPTZ,
    verified_by UUID REFERENCES persons(id),

    -- Governance participation
    voting_power DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
    reputation DECIMAL(5, 2) NOT NULL DEFAULT 50.0 CHECK (reputation >= 0 AND reputation <= 100),

    -- Status
    status person_status NOT NULL DEFAULT 'ACTIVE',
    status_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES persons(id),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Person regions (many-to-many)
CREATE TABLE person_regions (
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (person_id, region_id)
);

-- Person expertise areas
CREATE TABLE person_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    level expertise_level NOT NULL DEFAULT 'NOVICE',
    score DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    verified_credentials TEXT[],

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (person_id, category)
);

-- Endorsements between persons
CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endorser_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    endorsee_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    statement TEXT NOT NULL,
    weight DECIMAL(5, 2) NOT NULL DEFAULT 1.0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsee_id),
    UNIQUE (endorser_id, endorsee_id, category)
);

-- ============================================================================
-- ADDRESSES TABLE
-- ============================================================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    street1 VARCHAR(255) NOT NULL,
    street2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    tax_id VARCHAR(50),

    -- Basic info
    legal_name VARCHAR(500) NOT NULL,
    trade_name VARCHAR(500),
    type organization_type NOT NULL,
    industry VARCHAR(100),
    description TEXT,

    -- Location
    headquarters_address_id UUID REFERENCES addresses(id),
    jurisdiction_of_incorporation VARCHAR(100),

    -- Dates
    founded_date DATE,
    incorporation_date DATE,
    dissolution_date DATE,

    -- Contact
    public_contact_email VARCHAR(255),
    public_contact_phone VARCHAR(50),
    website VARCHAR(500),

    -- Financials
    employee_count INTEGER DEFAULT 0,
    annual_revenue DECIMAL(20, 2),
    market_cap DECIMAL(20, 2),
    fiscal_year_end VARCHAR(20),

    -- Public trading
    is_publicly_traded BOOLEAN NOT NULL DEFAULT FALSE,
    stock_symbol VARCHAR(20),
    stock_exchange VARCHAR(50),

    -- Hierarchy
    parent_organization_id UUID REFERENCES organizations(id),
    ultimate_parent_id UUID REFERENCES organizations(id),

    -- Status
    status organization_status NOT NULL DEFAULT 'ACTIVE',
    status_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES persons(id),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT valid_org_hierarchy CHECK (id != parent_organization_id)
);

-- Organization operating regions
CREATE TABLE organization_regions (
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    is_headquarters BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (organization_id, region_id)
);

-- Ownership stakes
CREATE TABLE ownership_stakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('PERSON', 'ORGANIZATION')),
    owner_name VARCHAR(500) NOT NULL,

    percentage_owned DECIMAL(7, 4) NOT NULL CHECK (percentage_owned >= 0 AND percentage_owned <= 100),
    share_class VARCHAR(100),
    voting_rights BOOLEAN NOT NULL DEFAULT TRUE,
    voting_power DECIMAL(7, 4),

    acquired_date DATE NOT NULL,
    acquisition_method VARCHAR(50) NOT NULL CHECK (acquisition_method IN ('FOUNDING', 'PURCHASE', 'GRANT', 'INHERITANCE', 'MERGER')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Beneficial owners (humans at end of ownership chain)
CREATE TABLE beneficial_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

    percentage_beneficial_ownership DECIMAL(7, 4) NOT NULL CHECK (percentage_beneficial_ownership >= 0 AND percentage_beneficial_ownership <= 100),
    ownership_chain UUID[], -- Array of organization IDs in chain
    control_type VARCHAR(20) NOT NULL CHECK (control_type IN ('OWNERSHIP', 'VOTING', 'OTHER_CONTROL')),

    verified_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (organization_id, person_id)
);

-- Licenses
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    type VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    expiration_date DATE,
    status license_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certifications
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    issuing_body VARCHAR(255) NOT NULL,
    issued_date DATE NOT NULL,
    expiration_date DATE,
    status license_status NOT NULL DEFAULT 'ACTIVE',
    verification_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Regulatory filings
CREATE TABLE regulatory_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    filing_type VARCHAR(100) NOT NULL,
    regulatory_body VARCHAR(255) NOT NULL,
    filing_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    document_url TEXT,
    status filing_status NOT NULL DEFAULT 'SUBMITTED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization relationships
CREATE TABLE organization_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    target_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN (
        'PARENT_SUBSIDIARY', 'JOINT_VENTURE', 'AFFILIATE', 'FRANCHISOR_FRANCHISEE',
        'CONTRACTOR', 'VENDOR_CLIENT', 'PARTNER', 'MERGER_TARGET', 'SPIN_OFF',
        'LOBBIES_FOR', 'REGULATES', 'FUNDS', 'COMPETES_WITH'
    )),
    description TEXT,

    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    financial_value DECIMAL(20, 2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT no_self_relationship CHECK (source_org_id != target_org_id)
);

-- ============================================================================
-- REGISTERED AGENTS TABLE
-- ============================================================================

CREATE TABLE registered_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    address_id UUID REFERENCES addresses(id),
    agent_type VARCHAR(20) NOT NULL CHECK (agent_type IN ('INDIVIDUAL', 'COMPANY')),
    appointed_date DATE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CATEGORIES TABLE (for bills, delegations)
-- ============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_category_hierarchy CHECK (id != parent_category_id)
);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_expertise_updated_at BEFORE UPDATE ON person_expertise
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ownership_stakes_updated_at BEFORE UPDATE ON ownership_stakes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficial_owners_updated_at BEFORE UPDATE ON beneficial_owners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regulatory_filings_updated_at BEFORE UPDATE ON regulatory_filings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_relationships_updated_at BEFORE UPDATE ON organization_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registered_agents_updated_at BEFORE UPDATE ON registered_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
