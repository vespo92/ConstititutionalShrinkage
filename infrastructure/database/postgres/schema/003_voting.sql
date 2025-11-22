-- Constitutional Shrinkage Database Schema
-- 003_voting.sql - Voting and delegation tables
-- Agent 3: Database & Schema Infrastructure
-- Generated: 2025-11-22

-- ============================================================================
-- ENUMS FOR VOTING
-- ============================================================================

-- Vote choices
CREATE TYPE vote_choice AS ENUM (
    'FOR',
    'AGAINST',
    'ABSTAIN',
    'NOT_VOTING',
    'PRESENT'
);

-- Voting session status
CREATE TYPE voting_status AS ENUM (
    'PENDING',
    'ACTIVE',
    'CLOSED',
    'FINALIZED',
    'CANCELLED'
);

-- Delegation scope
CREATE TYPE delegation_scope AS ENUM (
    'ALL',
    'CATEGORY',
    'SINGLE_BILL'
);

-- ============================================================================
-- VOTING SESSIONS TABLE
-- ============================================================================

CREATE TABLE voting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL, -- Will be FK to bills table

    -- Timing
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,

    -- Quorum rules
    minimum_participation DECIMAL(5, 4) NOT NULL DEFAULT 0.2000,  -- e.g., 0.20 for 20%
    approval_threshold DECIMAL(5, 4) NOT NULL DEFAULT 0.5001,     -- e.g., 0.50 for majority
    urgency_modifier DECIMAL(5, 4),                               -- Faster for emergencies
    impact_scaling DECIMAL(5, 4),                                 -- Higher threshold for bigger changes

    -- Status
    status voting_status NOT NULL DEFAULT 'PENDING',

    -- Results (calculated)
    for_count INTEGER NOT NULL DEFAULT 0,
    against_count INTEGER NOT NULL DEFAULT 0,
    abstain_count INTEGER NOT NULL DEFAULT 0,
    total_votes INTEGER NOT NULL DEFAULT 0,
    weighted_for DECIMAL(20, 4) NOT NULL DEFAULT 0,
    weighted_against DECIMAL(20, 4) NOT NULL DEFAULT 0,
    weighted_abstain DECIMAL(20, 4) NOT NULL DEFAULT 0,
    participation_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
    quorum_met BOOLEAN NOT NULL DEFAULT FALSE,
    passed BOOLEAN,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalized_at TIMESTAMPTZ,
    finalized_by UUID REFERENCES persons(id),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT valid_voting_period CHECK (end_date > start_date)
);

-- ============================================================================
-- VOTES TABLE
-- ============================================================================

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES persons(id),

    -- Vote
    choice vote_choice NOT NULL,
    weight DECIMAL(10, 4) NOT NULL DEFAULT 1.0,

    -- Timing
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Cryptographic proof
    cryptographic_proof TEXT NOT NULL,

    -- Delegation chain (array of person IDs if vote was delegated)
    delegation_chain UUID[],

    -- Privacy
    is_public BOOLEAN NOT NULL DEFAULT FALSE,

    -- Explanation (optional)
    explanation TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- One vote per citizen per session
    UNIQUE (session_id, citizen_id)
);

-- ============================================================================
-- DELEGATIONS TABLE
-- ============================================================================

CREATE TABLE delegations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delegator_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    delegate_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

    -- Scope
    scope delegation_scope NOT NULL DEFAULT 'ALL',
    category_id UUID REFERENCES categories(id),
    bill_id UUID, -- Will be FK to bills table for single-bill delegation

    -- Timing
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    -- Status
    active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Priority (lower = higher priority when multiple delegations match)
    priority INTEGER NOT NULL DEFAULT 100,

    -- Audit
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT no_self_delegation CHECK (delegator_id != delegate_id)
);

-- ============================================================================
-- DELEGATION CHAINS TABLE (for tracking multi-hop delegations)
-- ============================================================================

CREATE TABLE delegation_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_delegator_id UUID NOT NULL REFERENCES persons(id),
    final_delegate_id UUID NOT NULL REFERENCES persons(id),

    -- Chain path (array of person IDs from delegator to delegate)
    chain_path UUID[] NOT NULL,

    -- Scope context
    scope delegation_scope NOT NULL,
    category_id UUID REFERENCES categories(id),
    bill_id UUID,

    -- Computed weight (product of all weights in chain)
    final_weight DECIMAL(10, 6) NOT NULL DEFAULT 1.0,

    -- Validity
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    invalidated_at TIMESTAMPTZ,
    invalidation_reason TEXT,

    -- Audit
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- VOTING STATS TABLE (precomputed for performance)
-- ============================================================================

CREATE TABLE voting_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,

    -- Counts
    total_eligible INTEGER NOT NULL DEFAULT 0,
    total_voted INTEGER NOT NULL DEFAULT 0,

    -- Rates
    participation_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
    average_time_to_vote INTERVAL,
    delegation_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,

    -- Distribution
    direct_votes INTEGER NOT NULL DEFAULT 0,
    delegated_votes INTEGER NOT NULL DEFAULT 0,

    -- Demographics (JSONB for flexibility)
    region_breakdown JSONB DEFAULT '{}'::jsonb,
    verification_level_breakdown JSONB DEFAULT '{}'::jsonb,

    -- Audit
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- VOTE VERIFICATION TABLE (for audit trail)
-- ============================================================================

CREATE TABLE vote_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,

    -- Verification
    verifier_public_key TEXT NOT NULL,
    verification_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_result BOOLEAN NOT NULL,
    verification_proof TEXT NOT NULL,

    -- Challenge (if disputed)
    challenged BOOLEAN NOT NULL DEFAULT FALSE,
    challenge_reason TEXT,
    challenge_resolved BOOLEAN,
    challenge_resolution TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_voting_sessions_updated_at BEFORE UPDATE ON voting_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delegations_updated_at BEFORE UPDATE ON delegations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voting_stats_updated_at BEFORE UPDATE ON voting_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Check for circular delegations
-- ============================================================================

CREATE OR REPLACE FUNCTION check_circular_delegation()
RETURNS TRIGGER AS $$
DECLARE
    current_delegate UUID;
    visited UUID[];
BEGIN
    -- Start with the new delegation's delegate
    current_delegate := NEW.delegate_id;
    visited := ARRAY[NEW.delegator_id];

    -- Walk the delegation chain
    WHILE current_delegate IS NOT NULL LOOP
        -- Check if we've seen this person before (circular)
        IF current_delegate = ANY(visited) THEN
            RAISE EXCEPTION 'Circular delegation detected: % would create a cycle', NEW.delegator_id;
        END IF;

        -- Add to visited
        visited := array_append(visited, current_delegate);

        -- Find next delegate in chain
        SELECT d.delegate_id INTO current_delegate
        FROM delegations d
        WHERE d.delegator_id = current_delegate
          AND d.active = TRUE
          AND (d.scope = 'ALL' OR d.scope = NEW.scope)
          AND (d.category_id IS NULL OR d.category_id = NEW.category_id)
        ORDER BY d.priority
        LIMIT 1;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_delegation_cycle
    BEFORE INSERT OR UPDATE ON delegations
    FOR EACH ROW
    WHEN (NEW.active = TRUE)
    EXECUTE FUNCTION check_circular_delegation();

-- ============================================================================
-- FUNCTION: Update voting session counts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_session_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE voting_sessions
        SET
            total_votes = total_votes + 1,
            for_count = for_count + CASE WHEN NEW.choice = 'FOR' THEN 1 ELSE 0 END,
            against_count = against_count + CASE WHEN NEW.choice = 'AGAINST' THEN 1 ELSE 0 END,
            abstain_count = abstain_count + CASE WHEN NEW.choice = 'ABSTAIN' THEN 1 ELSE 0 END,
            weighted_for = weighted_for + CASE WHEN NEW.choice = 'FOR' THEN NEW.weight ELSE 0 END,
            weighted_against = weighted_against + CASE WHEN NEW.choice = 'AGAINST' THEN NEW.weight ELSE 0 END,
            weighted_abstain = weighted_abstain + CASE WHEN NEW.choice = 'ABSTAIN' THEN NEW.weight ELSE 0 END,
            updated_at = NOW()
        WHERE id = NEW.session_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE voting_sessions
        SET
            total_votes = total_votes - 1,
            for_count = for_count - CASE WHEN OLD.choice = 'FOR' THEN 1 ELSE 0 END,
            against_count = against_count - CASE WHEN OLD.choice = 'AGAINST' THEN 1 ELSE 0 END,
            abstain_count = abstain_count - CASE WHEN OLD.choice = 'ABSTAIN' THEN 1 ELSE 0 END,
            weighted_for = weighted_for - CASE WHEN OLD.choice = 'FOR' THEN OLD.weight ELSE 0 END,
            weighted_against = weighted_against - CASE WHEN OLD.choice = 'AGAINST' THEN OLD.weight ELSE 0 END,
            weighted_abstain = weighted_abstain - CASE WHEN OLD.choice = 'ABSTAIN' THEN OLD.weight ELSE 0 END,
            updated_at = NOW()
        WHERE id = OLD.session_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_vote_counts
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_session_vote_counts();
