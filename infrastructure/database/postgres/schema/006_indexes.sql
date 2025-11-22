-- Constitutional Shrinkage Database Schema
-- 006_indexes.sql - Performance indexes
-- Agent 3: Database & Schema Infrastructure
-- Generated: 2025-11-22

-- ============================================================================
-- REGIONS INDEXES
-- ============================================================================

CREATE INDEX idx_regions_parent ON regions(parent_region_id);
CREATE INDEX idx_regions_level ON regions(level);
CREATE INDEX idx_regions_code ON regions(code);

-- ============================================================================
-- PERSONS INDEXES
-- ============================================================================

CREATE INDEX idx_persons_email ON persons(contact_email);
CREATE INDEX idx_persons_region ON persons(primary_region_id);
CREATE INDEX idx_persons_verification ON persons(verification_level);
CREATE INDEX idx_persons_status ON persons(status);
CREATE INDEX idx_persons_name_search ON persons USING gin(to_tsvector('english', legal_name || ' ' || COALESCE(preferred_name, '')));

-- Composite indexes for common queries
CREATE INDEX idx_persons_region_status ON persons(primary_region_id, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_persons_verification_active ON persons(verification_level) WHERE status = 'ACTIVE';

-- ============================================================================
-- PERSON EXPERTISE INDEXES
-- ============================================================================

CREATE INDEX idx_person_expertise_person ON person_expertise(person_id);
CREATE INDEX idx_person_expertise_category ON person_expertise(category);
CREATE INDEX idx_person_expertise_level ON person_expertise(level);

-- ============================================================================
-- ENDORSEMENTS INDEXES
-- ============================================================================

CREATE INDEX idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX idx_endorsements_endorsee ON endorsements(endorsee_id);
CREATE INDEX idx_endorsements_category ON endorsements(category);

-- ============================================================================
-- ORGANIZATIONS INDEXES
-- ============================================================================

CREATE INDEX idx_org_type ON organizations(type);
CREATE INDEX idx_org_status ON organizations(status);
CREATE INDEX idx_org_parent ON organizations(parent_organization_id);
CREATE INDEX idx_org_ultimate_parent ON organizations(ultimate_parent_id);
CREATE INDEX idx_org_industry ON organizations(industry);
CREATE INDEX idx_org_jurisdiction ON organizations(jurisdiction_of_incorporation);
CREATE INDEX idx_org_name_search ON organizations USING gin(to_tsvector('english', legal_name || ' ' || COALESCE(trade_name, '')));

-- Composite indexes
CREATE INDEX idx_org_type_status ON organizations(type, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_org_publicly_traded ON organizations(stock_symbol) WHERE is_publicly_traded = TRUE;

-- ============================================================================
-- OWNERSHIP STAKES INDEXES
-- ============================================================================

CREATE INDEX idx_ownership_org ON ownership_stakes(organization_id);
CREATE INDEX idx_ownership_owner ON ownership_stakes(owner_id, owner_type);
CREATE INDEX idx_ownership_percentage ON ownership_stakes(percentage_owned DESC);

-- ============================================================================
-- BENEFICIAL OWNERS INDEXES
-- ============================================================================

CREATE INDEX idx_beneficial_org ON beneficial_owners(organization_id);
CREATE INDEX idx_beneficial_person ON beneficial_owners(person_id);
CREATE INDEX idx_beneficial_percentage ON beneficial_owners(percentage_beneficial_ownership DESC);

-- ============================================================================
-- ASSOCIATIONS INDEXES
-- ============================================================================

CREATE INDEX idx_assoc_subject ON associations(subject_id, subject_type);
CREATE INDEX idx_assoc_object ON associations(object_id, object_type);
CREATE INDEX idx_assoc_involvement ON associations(involvement_type);
CREATE INDEX idx_assoc_type ON associations(association_type);
CREATE INDEX idx_assoc_dates ON associations(start_date, end_date);
CREATE INDEX idx_assoc_active ON associations(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_assoc_significance ON associations(significance);
CREATE INDEX idx_assoc_financial ON associations(financial_value) WHERE financial_value IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_assoc_subject_active ON associations(subject_id, subject_type, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_assoc_object_active ON associations(object_id, object_type, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- INVOLVEMENT RECORDS INDEXES
-- ============================================================================

CREATE INDEX idx_involvement_association ON involvement_records(association_id);
CREATE INDEX idx_involvement_action_date ON involvement_records(action_date DESC);

-- ============================================================================
-- CONFLICTS OF INTEREST INDEXES
-- ============================================================================

CREATE INDEX idx_conflict_person ON conflicts_of_interest(person_id);
CREATE INDEX idx_conflict_type ON conflicts_of_interest(conflict_type);
CREATE INDEX idx_conflict_severity ON conflicts_of_interest(severity);
CREATE INDEX idx_conflict_status ON conflicts_of_interest(status);

-- ============================================================================
-- NETWORK GRAPH INDEXES
-- ============================================================================

CREATE INDEX idx_network_node_entity ON network_nodes(entity_id, entity_type);
CREATE INDEX idx_network_node_centrality ON network_nodes(centrality_score DESC);

CREATE INDEX idx_network_edge_source ON network_edges(source_id);
CREATE INDEX idx_network_edge_target ON network_edges(target_id);
CREATE INDEX idx_network_edge_weight ON network_edges(weight DESC);

-- ============================================================================
-- VOTING SESSIONS INDEXES
-- ============================================================================

CREATE INDEX idx_voting_session_bill ON voting_sessions(bill_id);
CREATE INDEX idx_voting_session_status ON voting_sessions(status);
CREATE INDEX idx_voting_session_dates ON voting_sessions(start_date, end_date);
CREATE INDEX idx_voting_session_active ON voting_sessions(status) WHERE status = 'ACTIVE';

-- ============================================================================
-- VOTES INDEXES
-- ============================================================================

CREATE INDEX idx_votes_session ON votes(session_id);
CREATE INDEX idx_votes_citizen ON votes(citizen_id);
CREATE INDEX idx_votes_choice ON votes(choice);
CREATE INDEX idx_votes_timestamp ON votes(timestamp DESC);
CREATE INDEX idx_votes_delegated ON votes(session_id) WHERE array_length(delegation_chain, 1) > 0;

-- ============================================================================
-- DELEGATIONS INDEXES
-- ============================================================================

CREATE INDEX idx_delegation_delegator ON delegations(delegator_id);
CREATE INDEX idx_delegation_delegate ON delegations(delegate_id);
CREATE INDEX idx_delegation_scope ON delegations(scope);
CREATE INDEX idx_delegation_category ON delegations(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_delegation_bill ON delegations(bill_id) WHERE bill_id IS NOT NULL;
CREATE INDEX idx_delegation_active ON delegations(active) WHERE active = TRUE;
CREATE INDEX idx_delegation_expires ON delegations(expires_at) WHERE expires_at IS NOT NULL;

-- Composite indexes for delegation lookup
CREATE INDEX idx_delegation_lookup ON delegations(delegator_id, scope, active) WHERE active = TRUE;

-- ============================================================================
-- BILLS INDEXES
-- ============================================================================

CREATE INDEX idx_bill_status ON bills(status);
CREATE INDEX idx_bill_category ON bills(category_id);
CREATE INDEX idx_bill_region ON bills(region_id);
CREATE INDEX idx_bill_sponsor ON bills(sponsor_id);
CREATE INDEX idx_bill_governance_level ON bills(governance_level);
CREATE INDEX idx_bill_sunset ON bills(sunset_date) WHERE sunset_date IS NOT NULL;
CREATE INDEX idx_bill_forked_from ON bills(forked_from_id) WHERE forked_from_id IS NOT NULL;
CREATE INDEX idx_bill_voting_session ON bills(voting_session_id);
CREATE INDEX idx_bill_created ON bills(created_at DESC);
CREATE INDEX idx_bill_title_search ON bills USING gin(to_tsvector('english', title || ' ' || COALESCE(summary, '')));

-- Composite indexes
CREATE INDEX idx_bill_status_date ON bills(status, created_at DESC);
CREATE INDEX idx_bill_region_status ON bills(region_id, status);

-- ============================================================================
-- AMENDMENTS INDEXES
-- ============================================================================

CREATE INDEX idx_amendment_bill ON amendments(bill_id);
CREATE INDEX idx_amendment_status ON amendments(status);
CREATE INDEX idx_amendment_proposer ON amendments(proposed_by);

-- ============================================================================
-- BILL VERSIONS INDEXES
-- ============================================================================

CREATE INDEX idx_bill_version_bill ON bill_versions(bill_id);
CREATE INDEX idx_bill_version_commit ON bill_versions(commit_hash);

-- ============================================================================
-- COMMITTEES INDEXES
-- ============================================================================

CREATE INDEX idx_committee_region ON committees(region_id);
CREATE INDEX idx_committee_parent ON committees(parent_committee_id);
CREATE INDEX idx_committee_active ON committees(active) WHERE active = TRUE;

-- ============================================================================
-- DOCUMENTS INDEXES
-- ============================================================================

CREATE INDEX idx_document_type ON documents(type);
CREATE INDEX idx_document_bill ON documents(bill_id) WHERE bill_id IS NOT NULL;
CREATE INDEX idx_document_amendment ON documents(amendment_id) WHERE amendment_id IS NOT NULL;
CREATE INDEX idx_document_committee ON documents(committee_id) WHERE committee_id IS NOT NULL;
CREATE INDEX idx_document_public ON documents(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_document_title_search ON documents USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- METRICS INDEXES
-- ============================================================================

CREATE INDEX idx_metric_def_category ON metric_definitions(category);
CREATE INDEX idx_metric_def_active ON metric_definitions(active) WHERE active = TRUE;

CREATE INDEX idx_metric_value_metric ON metric_values(metric_id);
CREATE INDEX idx_metric_value_date ON metric_values(measurement_date DESC);
CREATE INDEX idx_metric_value_region ON metric_values(region_id) WHERE region_id IS NOT NULL;
CREATE INDEX idx_metric_value_org ON metric_values(organization_id) WHERE organization_id IS NOT NULL;

-- Composite index for time series queries
CREATE INDEX idx_metric_value_series ON metric_values(metric_id, measurement_date DESC);

-- ============================================================================
-- TBL SCORES INDEXES
-- ============================================================================

CREATE INDEX idx_tbl_entity ON tbl_scores(entity_type, entity_id);
CREATE INDEX idx_tbl_date ON tbl_scores(score_date DESC);
CREATE INDEX idx_tbl_composite ON tbl_scores(composite_score DESC);

-- ============================================================================
-- CHANGE RECORDS INDEXES
-- ============================================================================

CREATE INDEX idx_change_entity ON change_records(entity_type, entity_id);
CREATE INDEX idx_change_author ON change_records(changed_by_person_id);
CREATE INDEX idx_change_timestamp ON change_records(timestamp DESC);
CREATE INDEX idx_change_parent ON change_records(parent_commit_hash);
CREATE INDEX idx_change_type ON change_records(change_type);
CREATE INDEX idx_change_verification ON change_records(verification_status);

-- ============================================================================
-- AUDIT LOG INDEXES
-- ============================================================================

CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_category ON audit_log(action_category);
CREATE INDEX idx_audit_actor ON audit_log(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_session ON audit_log(session_id) WHERE session_id IS NOT NULL;

-- ============================================================================
-- SUNSET TRACKING INDEXES
-- ============================================================================

CREATE INDEX idx_sunset_bill ON sunset_tracking(bill_id);
CREATE INDEX idx_sunset_date ON sunset_tracking(sunset_date);
CREATE INDEX idx_sunset_review ON sunset_tracking(review_date) WHERE review_date IS NOT NULL;
CREATE INDEX idx_sunset_pending ON sunset_tracking(sunset_date) WHERE review_initiated = FALSE;

-- ============================================================================
-- PARTIAL INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Active delegations for a specific scope
CREATE INDEX idx_delegation_all_active ON delegations(delegator_id, delegate_id)
    WHERE scope = 'ALL' AND active = TRUE;

-- Bills currently in voting
CREATE INDEX idx_bill_voting ON bills(id, voting_session_id)
    WHERE status = 'VOTING';

-- Unresolved conflicts
CREATE INDEX idx_conflict_unresolved ON conflicts_of_interest(person_id, severity)
    WHERE status NOT IN ('RECUSED', 'WAIVED');

-- Pending change verifications
CREATE INDEX idx_change_pending_verification ON change_records(timestamp DESC)
    WHERE verification_status = 'PENDING';
