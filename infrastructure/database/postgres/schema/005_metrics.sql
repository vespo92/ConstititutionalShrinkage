-- Constitutional Shrinkage Database Schema
-- 005_metrics.sql - Metrics, change tracking, and audit tables
-- Agent 3: Database & Schema Infrastructure
-- Generated: 2025-11-22

-- ============================================================================
-- ENUMS FOR METRICS AND AUDIT
-- ============================================================================

-- Metric category (triple bottom line)
CREATE TYPE metric_category AS ENUM (
    'PEOPLE',
    'PLANET',
    'PROFIT'
);

-- Change types
CREATE TYPE change_type AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE',
    'ARCHIVE',
    'MERGE',
    'FORK',
    'STATUS_CHANGE'
);

-- Entity types for change tracking
CREATE TYPE tracked_entity_type AS ENUM (
    'PERSON',
    'ORGANIZATION',
    'BILL',
    'AMENDMENT',
    'VOTE',
    'DELEGATION',
    'ASSOCIATION',
    'COMMITTEE',
    'DOCUMENT',
    'REGION',
    'CATEGORY'
);

-- Verification status
CREATE TYPE verification_status AS ENUM (
    'PENDING',
    'VERIFIED',
    'DISPUTED',
    'REJECTED'
);

-- ============================================================================
-- METRICS DEFINITIONS TABLE
-- ============================================================================

CREATE TABLE metric_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic info
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category metric_category NOT NULL,

    -- Measurement
    unit VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL DEFAULT 'DECIMAL' CHECK (data_type IN ('INTEGER', 'DECIMAL', 'PERCENTAGE', 'BOOLEAN', 'INDEX')),

    -- Targets
    target_value DECIMAL(20, 4),
    minimum_threshold DECIMAL(20, 4),
    maximum_threshold DECIMAL(20, 4),

    -- Weighting
    weight DECIMAL(5, 4) NOT NULL DEFAULT 1.0,

    -- Collection
    collection_frequency VARCHAR(50) DEFAULT 'MONTHLY' CHECK (collection_frequency IN ('REAL_TIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),
    source_system VARCHAR(255),
    calculation_formula TEXT,

    -- Status
    active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES persons(id),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- METRIC VALUES TABLE (time series data)
-- ============================================================================

CREATE TABLE metric_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_id UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,

    -- Value
    value DECIMAL(20, 4) NOT NULL,
    previous_value DECIMAL(20, 4),
    change_percentage DECIMAL(10, 4),

    -- Context
    region_id UUID REFERENCES regions(id),
    organization_id UUID REFERENCES organizations(id),
    bill_id UUID REFERENCES bills(id),

    -- Time
    measurement_date DATE NOT NULL,
    measurement_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_start DATE,
    period_end DATE,

    -- Quality
    confidence_level DECIMAL(5, 4) DEFAULT 1.0 CHECK (confidence_level >= 0 AND confidence_level <= 1),
    data_quality VARCHAR(20) DEFAULT 'VERIFIED' CHECK (data_quality IN ('ESTIMATED', 'PRELIMINARY', 'VERIFIED', 'AUDITED')),

    -- Source
    source_document_id UUID REFERENCES documents(id),
    notes TEXT,

    -- Audit
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES persons(id),

    -- Partition hint
    CONSTRAINT metric_value_date_check CHECK (measurement_date <= CURRENT_DATE + INTERVAL '1 day')
);

-- Create index for time-series queries
CREATE INDEX idx_metric_values_time ON metric_values (metric_id, measurement_date DESC);

-- ============================================================================
-- TRIPLE BOTTOM LINE SCORES TABLE
-- ============================================================================

CREATE TABLE tbl_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Entity being scored
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('REGION', 'ORGANIZATION', 'BILL', 'POLICY')),
    entity_id UUID NOT NULL,
    entity_name VARCHAR(500),

    -- Scores
    people_score DECIMAL(5, 2) NOT NULL CHECK (people_score >= 0 AND people_score <= 100),
    planet_score DECIMAL(5, 2) NOT NULL CHECK (planet_score >= 0 AND planet_score <= 100),
    profit_score DECIMAL(5, 2) NOT NULL CHECK (profit_score >= 0 AND profit_score <= 100),
    composite_score DECIMAL(5, 2) NOT NULL CHECK (composite_score >= 0 AND composite_score <= 100),

    -- Weights used
    people_weight DECIMAL(5, 4) NOT NULL DEFAULT 0.3333,
    planet_weight DECIMAL(5, 4) NOT NULL DEFAULT 0.3333,
    profit_weight DECIMAL(5, 4) NOT NULL DEFAULT 0.3334,

    -- Tradeoffs (JSONB array)
    tradeoffs JSONB DEFAULT '[]'::jsonb,

    -- Time
    score_date DATE NOT NULL,
    score_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_start DATE,
    period_end DATE,

    -- Audit
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    computed_by VARCHAR(255) DEFAULT 'SYSTEM',

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    UNIQUE (entity_type, entity_id, score_date)
);

-- ============================================================================
-- CHANGE RECORDS TABLE (git-style audit trail)
-- ============================================================================

CREATE TABLE change_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Git-style identifiers
    commit_hash VARCHAR(64) NOT NULL UNIQUE,
    parent_commit_hash VARCHAR(64) REFERENCES change_records(commit_hash),

    -- What changed
    entity_type tracked_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    change_type change_type NOT NULL,

    -- Field changes (JSONB array)
    field_changes JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Format: [{"field": "name", "old": "value1", "new": "value2", "reason": "..."}]

    -- Who changed it
    changed_by_person_id UUID NOT NULL REFERENCES persons(id),
    changed_by_person_name VARCHAR(255) NOT NULL,
    changed_by_role VARCHAR(100),
    official_capacity BOOLEAN NOT NULL DEFAULT FALSE,

    -- When
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Why
    reason TEXT NOT NULL,
    legal_basis TEXT,
    related_documents UUID[],

    -- Verification
    signature TEXT,
    witnesses UUID[],
    verification_status verification_status NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES persons(id),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- CHANGE RECORD DISPUTES TABLE
-- ============================================================================

CREATE TABLE change_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_record_id UUID NOT NULL REFERENCES change_records(id) ON DELETE CASCADE,

    -- Dispute info
    disputed_by UUID NOT NULL REFERENCES persons(id),
    dispute_reason TEXT NOT NULL,

    -- Evidence
    evidence_documents UUID[],
    evidence_description TEXT,

    -- Resolution
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED')),
    resolved_by UUID REFERENCES persons(id),
    resolution_date TIMESTAMPTZ,
    resolution_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- AUDIT LOG TABLE (system-level logging)
-- ============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Action
    action VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL CHECK (action_category IN ('AUTH', 'READ', 'WRITE', 'DELETE', 'ADMIN', 'SYSTEM')),

    -- Actor
    actor_id UUID,
    actor_type VARCHAR(50) CHECK (actor_type IN ('PERSON', 'SYSTEM', 'API_KEY', 'SERVICE')),
    actor_ip_address INET,
    actor_user_agent TEXT,

    -- Resource
    resource_type VARCHAR(100),
    resource_id UUID,
    resource_name VARCHAR(500),

    -- Details
    request_data JSONB,
    response_status INTEGER,
    error_message TEXT,

    -- Timing
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_ms INTEGER,

    -- Session
    session_id UUID,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Partition audit_log by timestamp for performance
-- Note: In production, you'd create partitions per month/quarter

-- ============================================================================
-- SUNSET TRACKING TABLE
-- ============================================================================

CREATE TABLE sunset_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

    -- Sunset info
    sunset_date DATE NOT NULL,
    review_date DATE,

    -- Notifications
    notification_90_days BOOLEAN NOT NULL DEFAULT FALSE,
    notification_30_days BOOLEAN NOT NULL DEFAULT FALSE,
    notification_7_days BOOLEAN NOT NULL DEFAULT FALSE,

    -- Review status
    review_initiated BOOLEAN NOT NULL DEFAULT FALSE,
    review_initiated_by UUID REFERENCES persons(id),
    review_initiated_at TIMESTAMPTZ,

    -- Extension
    extension_requested BOOLEAN NOT NULL DEFAULT FALSE,
    extension_bill_id UUID REFERENCES bills(id),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    UNIQUE (bill_id)
);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_metric_definitions_updated_at BEFORE UPDATE ON metric_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_change_disputes_updated_at BEFORE UPDATE ON change_disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sunset_tracking_updated_at BEFORE UPDATE ON sunset_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Generate commit hash
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_commit_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.commit_hash IS NULL THEN
        NEW.commit_hash = encode(
            digest(
                NEW.entity_type::text ||
                NEW.entity_id::text ||
                NEW.change_type::text ||
                NEW.timestamp::text ||
                COALESCE(NEW.parent_commit_hash, 'root'),
                'sha256'
            ),
            'hex'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_commit_hash
    BEFORE INSERT ON change_records
    FOR EACH ROW
    EXECUTE FUNCTION generate_commit_hash();

-- ============================================================================
-- FUNCTION: Create change record on entity changes
-- ============================================================================

-- This is a template that can be applied to tracked tables
CREATE OR REPLACE FUNCTION create_change_record()
RETURNS TRIGGER AS $$
DECLARE
    v_entity_type tracked_entity_type;
    v_change_type change_type;
    v_field_changes JSONB;
BEGIN
    -- Determine entity type from table name
    v_entity_type := TG_TABLE_NAME::tracked_entity_type;

    IF TG_OP = 'INSERT' THEN
        v_change_type := 'CREATE';
        v_field_changes := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_change_type := 'UPDATE';
        -- Calculate differences
        v_field_changes := (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'field', key,
                    'old', old_value,
                    'new', new_value
                )
            )
            FROM jsonb_each(to_jsonb(OLD)) AS o(key, old_value)
            JOIN jsonb_each(to_jsonb(NEW)) AS n(key, new_value) ON o.key = n.key
            WHERE o.old_value IS DISTINCT FROM n.new_value
        );
    ELSIF TG_OP = 'DELETE' THEN
        v_change_type := 'DELETE';
        v_field_changes := to_jsonb(OLD);
    END IF;

    -- Record will be created by application layer with proper attribution
    -- This function serves as documentation of the pattern

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
