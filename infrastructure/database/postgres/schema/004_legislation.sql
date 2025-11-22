-- Constitutional Shrinkage Database Schema
-- 004_legislation.sql - Bills, amendments, and legislative tracking
-- Agent 3: Database & Schema Infrastructure
-- Generated: 2025-11-22

-- ============================================================================
-- ENUMS FOR LEGISLATION
-- ============================================================================

-- Bill status
CREATE TYPE bill_status AS ENUM (
    'DRAFT',
    'IN_COMMITTEE',
    'SCHEDULED',
    'VOTING',
    'PASSED',
    'REJECTED',
    'VETOED',
    'ACTIVE',
    'REPEALED',
    'EXPIRED'
);

-- Amendment status
CREATE TYPE amendment_status AS ENUM (
    'PROPOSED',
    'UNDER_REVIEW',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
    'MERGED'
);

-- Document type
CREATE TYPE document_type AS ENUM (
    'BILL',
    'LAW',
    'EXECUTIVE_ORDER',
    'REGULATION',
    'AMENDMENT',
    'COMMITTEE_REPORT',
    'FISCAL_ANALYSIS',
    'LEGAL_OPINION',
    'PUBLIC_COMMENT'
);

-- ============================================================================
-- BILLS TABLE
-- ============================================================================

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info
    title VARCHAR(500) NOT NULL,
    short_title VARCHAR(255),
    bill_number VARCHAR(50) UNIQUE,
    content TEXT NOT NULL,
    summary TEXT,

    -- Versioning (git-style)
    version INTEGER NOT NULL DEFAULT 1,
    git_branch VARCHAR(255),
    latest_commit_hash VARCHAR(64),
    previous_version_id UUID REFERENCES bills(id),

    -- Status
    status bill_status NOT NULL DEFAULT 'DRAFT',
    status_reason TEXT,
    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Sponsorship
    sponsor_id UUID NOT NULL REFERENCES persons(id),

    -- Classification
    category_id UUID REFERENCES categories(id),
    region_id UUID REFERENCES regions(id),
    governance_level governance_level NOT NULL DEFAULT 'LOCAL',

    -- Constitutional compliance
    constitutional_check_passed BOOLEAN,
    constitutional_check_date TIMESTAMPTZ,
    constitutional_check_notes TEXT,

    -- Impact analysis
    estimated_cost DECIMAL(20, 2),
    estimated_benefit DECIMAL(20, 2),
    impact_score DECIMAL(5, 2),
    affected_population INTEGER,

    -- Forking (if derived from another bill)
    forked_from_id UUID REFERENCES bills(id),
    fork_reason TEXT,

    -- Sunset provisions
    sunset_date DATE,
    sunset_review_date DATE,
    auto_expire BOOLEAN NOT NULL DEFAULT FALSE,

    -- Voting session reference
    voting_session_id UUID REFERENCES voting_sessions(id),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES persons(id),
    enacted_at TIMESTAMPTZ,
    repealed_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add foreign key from voting_sessions to bills
ALTER TABLE voting_sessions
    ADD CONSTRAINT fk_voting_session_bill
    FOREIGN KEY (bill_id) REFERENCES bills(id);

-- Add foreign key from delegations to bills
ALTER TABLE delegations
    ADD CONSTRAINT fk_delegation_bill
    FOREIGN KEY (bill_id) REFERENCES bills(id);

-- ============================================================================
-- BILL CO-SPONSORS TABLE
-- ============================================================================

CREATE TABLE bill_cosponsors (
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    cosponsored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawn BOOLEAN NOT NULL DEFAULT FALSE,
    withdrawn_at TIMESTAMPTZ,
    withdrawal_reason TEXT,

    PRIMARY KEY (bill_id, person_id)
);

-- ============================================================================
-- AMENDMENTS TABLE
-- ============================================================================

CREATE TABLE amendments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

    -- Basic info
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    amendment_number VARCHAR(50),

    -- Content changes (git-style diff)
    diff TEXT NOT NULL,
    affected_sections TEXT[],

    -- Status
    status amendment_status NOT NULL DEFAULT 'PROPOSED',
    status_reason TEXT,
    status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Proposer
    proposed_by UUID NOT NULL REFERENCES persons(id),

    -- Voting (if separate vote needed)
    voting_session_id UUID REFERENCES voting_sessions(id),
    requires_separate_vote BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- BILL VERSIONS TABLE (full version history)
-- ============================================================================

CREATE TABLE bill_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    commit_hash VARCHAR(64) NOT NULL,
    parent_commit_hash VARCHAR(64),

    -- Change info
    change_summary TEXT,
    changed_by UUID NOT NULL REFERENCES persons(id),
    change_reason TEXT,

    -- Amendments included in this version
    included_amendments UUID[],

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (bill_id, version_number)
);

-- ============================================================================
-- COMMITTEES TABLE
-- ============================================================================

CREATE TABLE committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    jurisdiction TEXT,

    -- Organization
    region_id UUID REFERENCES regions(id),
    parent_committee_id UUID REFERENCES committees(id),

    -- Status
    active BOOLEAN NOT NULL DEFAULT TRUE,
    established_date DATE NOT NULL,
    dissolved_date DATE,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Committee members
CREATE TABLE committee_members (
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('CHAIR', 'VICE_CHAIR', 'RANKING_MEMBER', 'MEMBER')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (committee_id, person_id)
);

-- ============================================================================
-- BILL COMMITTEE ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE bill_committee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,

    -- Assignment
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES persons(id),

    -- Review
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'TABLED')),
    review_date TIMESTAMPTZ,
    review_notes TEXT,

    -- Hearing
    hearing_scheduled BOOLEAN NOT NULL DEFAULT FALSE,
    hearing_date TIMESTAMPTZ,

    -- Audit
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (bill_id, committee_id)
);

-- ============================================================================
-- DOCUMENTS TABLE (supporting documents)
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info
    title VARCHAR(500) NOT NULL,
    type document_type NOT NULL,
    description TEXT,

    -- Content
    content TEXT,
    file_path TEXT,
    file_hash VARCHAR(128),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),

    -- Related entities
    bill_id UUID REFERENCES bills(id),
    amendment_id UUID REFERENCES amendments(id),
    committee_id UUID REFERENCES committees(id),

    -- Author
    author_id UUID REFERENCES persons(id),
    author_organization_id UUID REFERENCES organizations(id),

    -- Status
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- PUBLIC COMMENTS TABLE
-- ============================================================================

CREATE TABLE public_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

    -- Author (can be person or anonymous)
    author_id UUID REFERENCES persons(id),
    author_name VARCHAR(255),
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,

    -- Content
    content TEXT NOT NULL,
    sentiment VARCHAR(20) CHECK (sentiment IN ('SUPPORT', 'OPPOSE', 'NEUTRAL', 'QUESTION')),

    -- Moderation
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID REFERENCES persons(id),
    approved_at TIMESTAMPTZ,
    rejected BOOLEAN NOT NULL DEFAULT FALSE,
    rejection_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amendments_updated_at BEFORE UPDATE ON amendments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_committees_updated_at BEFORE UPDATE ON committees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_committee_assignments_updated_at BEFORE UPDATE ON bill_committee_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_comments_updated_at BEFORE UPDATE ON public_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Update bill status history
-- ============================================================================

CREATE OR REPLACE FUNCTION log_bill_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.status_changed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_bill_status
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION log_bill_status_change();

-- ============================================================================
-- FUNCTION: Validate sunset date
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_sunset_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sunset_date IS NOT NULL AND NEW.sunset_date <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Sunset date must be in the future';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_bill_sunset
    BEFORE INSERT OR UPDATE ON bills
    FOR EACH ROW
    WHEN (NEW.status IN ('DRAFT', 'IN_COMMITTEE', 'SCHEDULED', 'VOTING'))
    EXECUTE FUNCTION validate_sunset_date();
