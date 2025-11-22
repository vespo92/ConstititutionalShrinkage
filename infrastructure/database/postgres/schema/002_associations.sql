-- Constitutional Shrinkage Database Schema
-- 002_associations.sql - Association and involvement tracking tables
-- Agent 3: Database & Schema Infrastructure
-- Generated: 2025-11-22

-- ============================================================================
-- ENUMS FOR ASSOCIATIONS
-- ============================================================================

-- Involvement types
CREATE TYPE involvement_type AS ENUM (
    -- Legislative
    'BILL_SPONSOR', 'BILL_COSPONSOR', 'BILL_AUTHOR', 'BILL_AMENDMENT_AUTHOR',
    'BILL_VOTER_FOR', 'BILL_VOTER_AGAINST', 'BILL_VOTER_ABSTAIN',
    'BILL_SIGNER', 'BILL_VETO', 'VETO_OVERRIDE_VOTER',
    'COMMITTEE_MEMBER', 'COMMITTEE_CHAIR', 'FLOOR_MANAGER', 'FILIBUSTER', 'CLOTURE_VOTER',
    -- Executive
    'EXECUTIVE_ORDER_AUTHOR', 'EXECUTIVE_ORDER_SIGNER',
    'PROCLAMATION_AUTHOR', 'PROCLAMATION_SIGNER',
    'REGULATION_AUTHOR', 'REGULATION_APPROVER',
    'BUDGET_AUTHOR', 'BUDGET_APPROVER',
    -- Judicial
    'CASE_PLAINTIFF', 'CASE_DEFENDANT', 'CASE_JUDGE', 'CASE_JUROR',
    'CASE_PROSECUTOR', 'CASE_DEFENSE_ATTORNEY', 'CASE_WITNESS', 'CASE_EXPERT_WITNESS',
    'AMICUS_CURIAE', 'OPINION_AUTHOR', 'OPINION_CONCURRENCE', 'OPINION_DISSENT',
    'SENTENCE_ISSUER', 'APPEAL_FILER', 'APPEAL_RESPONDENT',
    -- Appointment
    'NOMINEE', 'NOMINATOR', 'CONFIRMATION_VOTER_FOR', 'CONFIRMATION_VOTER_AGAINST',
    'APPOINTEE', 'APPOINTER',
    -- Financial
    'CAMPAIGN_DONOR', 'CAMPAIGN_RECIPIENT', 'PAC_CONTRIBUTOR', 'PAC_BENEFICIARY',
    'LOBBYIST', 'LOBBYING_CLIENT', 'CONTRACT_AWARDER', 'CONTRACT_RECIPIENT',
    'GRANT_AWARDER', 'GRANT_RECIPIENT', 'BUDGET_BENEFICIARY',
    -- Organizational
    'FOUNDER', 'OWNER', 'BOARD_MEMBER', 'BOARD_CHAIR',
    'CEO', 'CFO', 'COO', 'EXECUTIVE', 'DIRECTOR', 'MANAGER',
    'EMPLOYEE', 'CONTRACTOR', 'CONSULTANT', 'ADVISOR', 'INVESTOR', 'CREDITOR',
    'AUDITOR', 'REGISTERED_AGENT',
    -- Civic
    'PETITIONER', 'PETITION_SIGNER', 'PUBLIC_COMMENTER', 'HEARING_WITNESS',
    'REFERENDUM_PROPONENT', 'REFERENDUM_OPPONENT', 'BALLOT_INITIATIVE_AUTHOR',
    'RECALL_PROPONENT', 'RECALL_TARGET',
    -- Investigative
    'INVESTIGATION_TARGET', 'INVESTIGATION_LEAD', 'WHISTLEBLOWER',
    'COOPERATING_WITNESS', 'IMMUNITY_RECIPIENT', 'SUBPOENA_ISSUER', 'SUBPOENA_RECIPIENT',
    -- Delegation
    'VOTE_DELEGATOR', 'VOTE_DELEGATE'
);

-- Association object types
CREATE TYPE association_object_type AS ENUM (
    -- People & Orgs
    'PERSON', 'ORGANIZATION',
    -- Legislative
    'BILL', 'BILL_PROPOSAL', 'BILL_AMENDMENT', 'LAW', 'EXECUTIVE_ORDER', 'REGULATION',
    -- Judicial
    'LEGAL_CASE', 'COURT_RULING', 'COURT_ORDER',
    -- Voting
    'VOTE', 'VOTING_SESSION', 'ELECTION', 'REFERENDUM',
    -- Financial
    'BUDGET', 'CONTRACT', 'GRANT', 'CAMPAIGN', 'PAC', 'LOBBYING_REGISTRATION',
    -- Administrative
    'APPOINTMENT', 'NOMINATION', 'INVESTIGATION', 'HEARING', 'COMMITTEE'
);

-- Association types
CREATE TYPE association_type AS ENUM (
    'PERSON_TO_ORGANIZATION',
    'PERSON_TO_PERSON',
    'PERSON_TO_DOCUMENT',
    'PERSON_TO_PROCEEDING',
    'PERSON_TO_FINANCIAL',
    'ORG_TO_ORGANIZATION',
    'ORG_TO_DOCUMENT',
    'ORG_TO_PROCEEDING',
    'ORG_TO_FINANCIAL'
);

-- Significance levels
CREATE TYPE significance_level AS ENUM (
    'PRIMARY',
    'SECONDARY',
    'SUPPORTING',
    'PERIPHERAL'
);

-- Financial types
CREATE TYPE financial_involvement_type AS ENUM (
    'SALARY',
    'DONATION',
    'CONTRACT',
    'INVESTMENT',
    'GRANT',
    'OTHER'
);

-- Conflict types
CREATE TYPE conflict_type AS ENUM (
    'FINANCIAL_INTEREST',
    'EMPLOYMENT',
    'FAMILY_RELATIONSHIP',
    'CAMPAIGN_CONTRIBUTION',
    'LOBBYING_RELATIONSHIP',
    'BOARD_MEMBERSHIP',
    'OWNERSHIP_STAKE',
    'CONTRACTUAL',
    'REVOLVING_DOOR'
);

-- Conflict status
CREATE TYPE conflict_status AS ENUM (
    'DETECTED',
    'DISCLOSED',
    'RECUSED',
    'WAIVED',
    'VIOLATED'
);

-- Conflict severity
CREATE TYPE conflict_severity AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

-- ============================================================================
-- ASSOCIATIONS TABLE
-- ============================================================================

CREATE TABLE associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_type association_type NOT NULL,

    -- Subject (who is involved)
    subject_type VARCHAR(20) NOT NULL CHECK (subject_type IN ('PERSON', 'ORGANIZATION')),
    subject_id UUID NOT NULL,
    subject_name VARCHAR(500) NOT NULL,

    -- Object (what they're involved with)
    object_type association_object_type NOT NULL,
    object_id UUID NOT NULL,
    object_name VARCHAR(500) NOT NULL,

    -- How involved
    involvement_type involvement_type NOT NULL,
    role VARCHAR(100),
    description TEXT,

    -- When
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Weight/Significance
    significance significance_level NOT NULL DEFAULT 'SECONDARY',
    impact_score DECIMAL(5, 2) CHECK (impact_score >= 0 AND impact_score <= 100),

    -- Financial details (if applicable)
    financial_value DECIMAL(20, 2),
    financial_type financial_involvement_type,

    -- Verification
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES persons(id),
    verification_date TIMESTAMPTZ,
    source_documents TEXT[],

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES persons(id),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- INVOLVEMENT RECORDS TABLE
-- ============================================================================

CREATE TABLE involvement_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,

    -- Specific action
    action VARCHAR(500) NOT NULL,
    action_date TIMESTAMPTZ NOT NULL,
    action_location VARCHAR(255),

    -- Details
    details TEXT NOT NULL,
    public_statement TEXT,

    -- Documentation
    document_ids UUID[],
    media_urls TEXT[],

    -- Audit
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES persons(id),
    signature TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Witnesses to involvement records
CREATE TABLE involvement_witnesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    involvement_record_id UUID NOT NULL REFERENCES involvement_records(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES persons(id),
    person_name VARCHAR(255) NOT NULL,
    capacity VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CONFLICT OF INTEREST TABLE
-- ============================================================================

CREATE TABLE conflicts_of_interest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    person_name VARCHAR(255) NOT NULL,

    -- The conflict
    conflict_type conflict_type NOT NULL,
    description TEXT NOT NULL,
    severity conflict_severity NOT NULL DEFAULT 'MEDIUM',

    -- Government role
    government_org_id UUID REFERENCES organizations(id),
    government_org_name VARCHAR(500),
    government_role VARCHAR(255),

    -- Private interest
    private_entity_id UUID,
    private_entity_name VARCHAR(500),
    private_relationship_type VARCHAR(255),
    private_financial_value DECIMAL(20, 2),

    -- Affected actions (stored as JSONB array)
    affected_actions JSONB DEFAULT '[]'::jsonb,

    -- Status
    status conflict_status NOT NULL DEFAULT 'DETECTED',
    disclosure_date TIMESTAMPTZ,
    recusal_date TIMESTAMPTZ,
    waiver_granted_by UUID REFERENCES persons(id),

    -- Audit
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    detected_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- NETWORK GRAPH TABLES (for visualization)
-- ============================================================================

-- Precomputed network nodes for fast graph queries
CREATE TABLE network_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('PERSON', 'ORGANIZATION', 'DOCUMENT', 'PROCEEDING', 'FINANCIAL')),
    name VARCHAR(500) NOT NULL,

    -- Computed metrics
    connection_count INTEGER NOT NULL DEFAULT 0,
    centrality_score DECIMAL(10, 6) NOT NULL DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Updated
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (entity_id, entity_type)
);

-- Precomputed network edges
CREATE TABLE network_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL,
    target_id UUID NOT NULL,
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,

    involvement_type involvement_type NOT NULL,
    weight DECIMAL(10, 4) NOT NULL DEFAULT 1.0,

    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Computed
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT no_self_edge CHECK (source_id != target_id)
);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_associations_updated_at BEFORE UPDATE ON associations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conflicts_updated_at BEFORE UPDATE ON conflicts_of_interest
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
