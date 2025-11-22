-- Constitutional Shrinkage - Development Seed Data
-- Agent 3: Database & Schema Infrastructure
-- Generated: 2025-11-22

-- ============================================================================
-- RESET (for development only)
-- ============================================================================

-- Truncate all tables in reverse dependency order
TRUNCATE TABLE audit_log CASCADE;
TRUNCATE TABLE change_disputes CASCADE;
TRUNCATE TABLE change_records CASCADE;
TRUNCATE TABLE sunset_tracking CASCADE;
TRUNCATE TABLE tbl_scores CASCADE;
TRUNCATE TABLE metric_values CASCADE;
TRUNCATE TABLE metric_definitions CASCADE;
TRUNCATE TABLE network_edges CASCADE;
TRUNCATE TABLE network_nodes CASCADE;
TRUNCATE TABLE conflicts_of_interest CASCADE;
TRUNCATE TABLE involvement_witnesses CASCADE;
TRUNCATE TABLE involvement_records CASCADE;
TRUNCATE TABLE associations CASCADE;
TRUNCATE TABLE vote_verifications CASCADE;
TRUNCATE TABLE voting_stats CASCADE;
TRUNCATE TABLE delegation_chains CASCADE;
TRUNCATE TABLE delegations CASCADE;
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE voting_sessions CASCADE;
TRUNCATE TABLE public_comments CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE bill_committee_assignments CASCADE;
TRUNCATE TABLE committee_members CASCADE;
TRUNCATE TABLE committees CASCADE;
TRUNCATE TABLE bill_versions CASCADE;
TRUNCATE TABLE amendments CASCADE;
TRUNCATE TABLE bill_cosponsors CASCADE;
TRUNCATE TABLE bills CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE registered_agents CASCADE;
TRUNCATE TABLE organization_relationships CASCADE;
TRUNCATE TABLE regulatory_filings CASCADE;
TRUNCATE TABLE certifications CASCADE;
TRUNCATE TABLE licenses CASCADE;
TRUNCATE TABLE beneficial_owners CASCADE;
TRUNCATE TABLE ownership_stakes CASCADE;
TRUNCATE TABLE organization_regions CASCADE;
TRUNCATE TABLE organizations CASCADE;
TRUNCATE TABLE addresses CASCADE;
TRUNCATE TABLE endorsements CASCADE;
TRUNCATE TABLE person_expertise CASCADE;
TRUNCATE TABLE person_regions CASCADE;
TRUNCATE TABLE persons CASCADE;
TRUNCATE TABLE regions CASCADE;

-- ============================================================================
-- REGIONS
-- ============================================================================

INSERT INTO regions (id, name, code, level, latitude, longitude, population, timezone) VALUES
    ('00000000-0000-0000-0000-000000000001', 'United States', 'US', 'FEDERAL', 38.8951, -77.0364, 331000000, 'America/New_York'),
    ('00000000-0000-0000-0000-000000000002', 'California', 'US-CA', 'REGIONAL', 36.7783, -119.4179, 39500000, 'America/Los_Angeles'),
    ('00000000-0000-0000-0000-000000000003', 'New York', 'US-NY', 'REGIONAL', 40.7128, -74.0060, 19400000, 'America/New_York'),
    ('00000000-0000-0000-0000-000000000004', 'Texas', 'US-TX', 'REGIONAL', 31.9686, -99.9018, 29100000, 'America/Chicago'),
    ('00000000-0000-0000-0000-000000000005', 'San Francisco', 'US-CA-SF', 'LOCAL', 37.7749, -122.4194, 875000, 'America/Los_Angeles'),
    ('00000000-0000-0000-0000-000000000006', 'Los Angeles', 'US-CA-LA', 'LOCAL', 34.0522, -118.2437, 3970000, 'America/Los_Angeles'),
    ('00000000-0000-0000-0000-000000000007', 'New York City', 'US-NY-NYC', 'LOCAL', 40.7128, -74.0060, 8340000, 'America/New_York'),
    ('00000000-0000-0000-0000-000000000008', 'Austin', 'US-TX-AUS', 'LOCAL', 30.2672, -97.7431, 978000, 'America/Chicago');

-- Set region hierarchies
UPDATE regions SET parent_region_id = '00000000-0000-0000-0000-000000000001' WHERE code LIKE 'US-%' AND code NOT LIKE 'US-%-%%';
UPDATE regions SET parent_region_id = '00000000-0000-0000-0000-000000000002' WHERE code LIKE 'US-CA-%';
UPDATE regions SET parent_region_id = '00000000-0000-0000-0000-000000000003' WHERE code LIKE 'US-NY-%';
UPDATE regions SET parent_region_id = '00000000-0000-0000-0000-000000000004' WHERE code LIKE 'US-TX-%';

-- ============================================================================
-- CATEGORIES (for bills)
-- ============================================================================

INSERT INTO categories (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Healthcare', 'Legislation related to healthcare, public health, and medical services'),
    ('10000000-0000-0000-0000-000000000002', 'Environment', 'Environmental protection, climate change, and sustainability'),
    ('10000000-0000-0000-0000-000000000003', 'Education', 'Public education, higher education, and educational funding'),
    ('10000000-0000-0000-0000-000000000004', 'Economy', 'Economic policy, taxation, and financial regulation'),
    ('10000000-0000-0000-0000-000000000005', 'Infrastructure', 'Transportation, utilities, and public works'),
    ('10000000-0000-0000-0000-000000000006', 'Civil Rights', 'Civil liberties, voting rights, and equality'),
    ('10000000-0000-0000-0000-000000000007', 'Technology', 'Digital policy, privacy, and technology regulation'),
    ('10000000-0000-0000-0000-000000000008', 'Housing', 'Housing policy, zoning, and urban development');

-- ============================================================================
-- ADDRESSES
-- ============================================================================

INSERT INTO addresses (id, street1, city, state, postal_code, country, latitude, longitude) VALUES
    ('20000000-0000-0000-0000-000000000001', '1600 Pennsylvania Avenue NW', 'Washington', 'DC', '20500', 'USA', 38.8977, -77.0365),
    ('20000000-0000-0000-0000-000000000002', '100 Market Street', 'San Francisco', 'CA', '94105', 'USA', 37.7938, -122.3960),
    ('20000000-0000-0000-0000-000000000003', '350 5th Avenue', 'New York', 'NY', '10118', 'USA', 40.7484, -73.9857),
    ('20000000-0000-0000-0000-000000000004', '1 Apple Park Way', 'Cupertino', 'CA', '95014', 'USA', 37.3346, -122.0090);

-- ============================================================================
-- PERSONS (Sample Citizens)
-- ============================================================================

INSERT INTO persons (id, public_key, legal_name, preferred_name, date_of_birth, contact_email, primary_region_id, verification_level, voting_power, reputation, status) VALUES
    ('30000000-0000-0000-0000-000000000001', 'pk_alice_johnson_001', 'Alice Johnson', 'Alice', '1985-03-15', 'alice.johnson@example.com', '00000000-0000-0000-0000-000000000005', 'FULL_KYC', 1.0, 85.0, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000002', 'pk_bob_smith_002', 'Robert Smith', 'Bob', '1978-07-22', 'bob.smith@example.com', '00000000-0000-0000-0000-000000000007', 'FULL_KYC', 1.0, 72.0, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000003', 'pk_carol_williams_003', 'Carol Williams', 'Carol', '1990-11-08', 'carol.williams@example.com', '00000000-0000-0000-0000-000000000008', 'ID_VERIFIED', 1.0, 68.0, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000004', 'pk_david_brown_004', 'David Brown', 'Dave', '1982-05-30', 'david.brown@example.com', '00000000-0000-0000-0000-000000000006', 'BIOMETRIC', 1.0, 90.0, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000005', 'pk_emma_davis_005', 'Emma Davis', 'Emma', '1995-09-12', 'emma.davis@example.com', '00000000-0000-0000-0000-000000000005', 'FULL_KYC', 1.0, 78.0, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000006', 'pk_frank_miller_006', 'Frank Miller', 'Frank', '1970-02-28', 'frank.miller@example.com', '00000000-0000-0000-0000-000000000007', 'FULL_KYC', 1.0, 95.0, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000007', 'pk_grace_wilson_007', 'Grace Wilson', 'Grace', '1988-12-05', 'grace.wilson@example.com', '00000000-0000-0000-0000-000000000008', 'EMAIL_VERIFIED', 1.0, 55.0, 'ACTIVE'),
    ('30000000-0000-0000-0000-000000000008', 'pk_henry_taylor_008', 'Henry Taylor', 'Hank', '1965-08-18', 'henry.taylor@example.com', '00000000-0000-0000-0000-000000000006', 'FULL_KYC', 1.0, 82.0, 'ACTIVE');

-- Person regions (additional region affiliations)
INSERT INTO person_regions (person_id, region_id, is_primary, joined_at) VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', TRUE, NOW()),
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', FALSE, NOW()),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', TRUE, NOW()),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', FALSE, NOW()),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', TRUE, NOW()),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', TRUE, NOW()),
    ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', TRUE, NOW()),
    ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', TRUE, NOW()),
    ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', TRUE, NOW()),
    ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', TRUE, NOW());

-- Person expertise
INSERT INTO person_expertise (id, person_id, category, level, score, verified_credentials) VALUES
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000001', 'Technology', 'EXPERT', 88.0, ARRAY['MS Computer Science', 'AWS Certified']),
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000002', 'Finance', 'EXPERT', 92.0, ARRAY['CPA', 'MBA Finance']),
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000003', 'Environment', 'INTERMEDIATE', 65.0, ARRAY['BS Environmental Science']),
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000004', 'Healthcare', 'AUTHORITY', 98.0, ARRAY['MD', 'Board Certified']),
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000005', 'Education', 'EXPERT', 85.0, ARRAY['PhD Education', 'Teaching Certificate']),
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000006', 'Law', 'AUTHORITY', 96.0, ARRAY['JD', 'Bar Admission']);

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

INSERT INTO organizations (id, registration_number, legal_name, trade_name, type, industry, description, headquarters_address_id, jurisdiction_of_incorporation, employee_count, status) VALUES
    ('40000000-0000-0000-0000-000000000001', 'GOV-US-001', 'United States Federal Government', 'US Government', 'FEDERAL_GOVERNMENT', 'Government', 'Federal government of the United States', '20000000-0000-0000-0000-000000000001', 'Washington, DC', 2800000, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000002', 'GOV-CA-001', 'State of California', 'California', 'STATE_GOVERNMENT', 'Government', 'State government of California', NULL, 'California', 240000, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000003', 'BUS-TECH-001', 'TechCorp Industries Inc.', 'TechCorp', 'CORPORATION', 'Technology', 'Leading technology company', '20000000-0000-0000-0000-000000000002', 'Delaware', 5000, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000004', 'BUS-FIN-001', 'First National Financial LLC', 'First National', 'LLC', 'Finance', 'Financial services company', '20000000-0000-0000-0000-000000000003', 'New York', 1200, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000005', 'NPO-ENV-001', 'Green Future Foundation', 'Green Future', 'NONPROFIT_501C3', 'Environment', 'Environmental advocacy nonprofit', NULL, 'California', 50, 'ACTIVE'),
    ('40000000-0000-0000-0000-000000000006', 'POL-PAC-001', 'Citizens for Transparency PAC', 'CFT PAC', 'PAC', 'Political', 'Political action committee for government transparency', NULL, 'Washington, DC', 10, 'ACTIVE');

-- Organization regions
INSERT INTO organization_regions (organization_id, region_id, is_headquarters) VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', TRUE),
    ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', TRUE),
    ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', TRUE),
    ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', FALSE),
    ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', TRUE),
    ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', TRUE),
    ('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', TRUE);

-- ============================================================================
-- COMMITTEES
-- ============================================================================

INSERT INTO committees (id, name, description, jurisdiction, region_id, active, established_date) VALUES
    ('50000000-0000-0000-0000-000000000001', 'Technology and Innovation Committee', 'Reviews legislation related to technology and digital policy', 'Technology', '00000000-0000-0000-0000-000000000002', TRUE, '2020-01-01'),
    ('50000000-0000-0000-0000-000000000002', 'Environmental Protection Committee', 'Reviews environmental legislation', 'Environment', '00000000-0000-0000-0000-000000000002', TRUE, '2018-01-01'),
    ('50000000-0000-0000-0000-000000000003', 'Budget and Finance Committee', 'Reviews budget and financial legislation', 'Finance', '00000000-0000-0000-0000-000000000001', TRUE, '2015-01-01');

-- Committee members
INSERT INTO committee_members (committee_id, person_id, role, active) VALUES
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'CHAIR', TRUE),
    ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', 'MEMBER', TRUE),
    ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'CHAIR', TRUE),
    ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'MEMBER', TRUE),
    ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'CHAIR', TRUE),
    ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', 'VICE_CHAIR', TRUE);

-- ============================================================================
-- BILLS
-- ============================================================================

INSERT INTO bills (id, title, short_title, bill_number, content, summary, version, status, sponsor_id, category_id, region_id, governance_level, sunset_date, auto_expire) VALUES
    ('60000000-0000-0000-0000-000000000001', 'Digital Privacy Protection Act of 2025', 'DPPA 2025', 'CA-2025-001',
     'An act to establish comprehensive digital privacy protections for citizens of California...

Section 1. Purpose
This act establishes the right of citizens to control their personal digital data.

Section 2. Definitions
(a) "Personal data" means any information relating to an identified or identifiable natural person.
(b) "Processing" means any operation performed on personal data.

Section 3. Rights
Every citizen shall have the right to:
(a) Know what personal data is being collected
(b) Access their personal data
(c) Request deletion of their personal data
(d) Opt out of data sales

Section 4. Enforcement
The Attorney General shall enforce this act.',
     'Establishes digital privacy rights including data access, deletion, and opt-out of sales.',
     1, 'VOTING', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'REGIONAL', '2030-12-31', TRUE),

    ('60000000-0000-0000-0000-000000000002', 'Clean Energy Transition Act', 'CETA', 'CA-2025-002',
     'An act to accelerate the transition to clean energy sources...

Section 1. Clean Energy Goals
California shall achieve 100% clean electricity by 2035.

Section 2. Incentives
Tax credits for renewable energy investments.

Section 3. Reporting
Annual progress reports required.',
     'Mandates 100% clean electricity by 2035 with tax incentives for renewable energy.',
     1, 'IN_COMMITTEE', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'REGIONAL', '2035-12-31', TRUE),

    ('60000000-0000-0000-0000-000000000003', 'Healthcare Access Improvement Act', 'HAIA', 'US-2025-001',
     'An act to improve healthcare access for all citizens...

Section 1. Expansion
Expand coverage to all citizens.

Section 2. Cost Controls
Implement price negotiation.',
     'Expands healthcare coverage and implements cost control measures.',
     1, 'DRAFT', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'FEDERAL', '2032-12-31', FALSE);

-- Bill co-sponsors
INSERT INTO bill_cosponsors (bill_id, person_id) VALUES
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005'),
    ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006'),
    ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001'),
    ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002');

-- ============================================================================
-- VOTING SESSIONS
-- ============================================================================

INSERT INTO voting_sessions (id, bill_id, start_date, end_date, minimum_participation, approval_threshold, status) VALUES
    ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', 0.20, 0.50, 'ACTIVE');

-- Update bill with voting session
UPDATE bills SET voting_session_id = '70000000-0000-0000-0000-000000000001' WHERE id = '60000000-0000-0000-0000-000000000001';

-- ============================================================================
-- VOTES
-- ============================================================================

INSERT INTO votes (id, session_id, citizen_id, choice, weight, cryptographic_proof, is_public, explanation) VALUES
    (uuid_generate_v4(), '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'FOR', 1.0, 'proof_hash_001', TRUE, 'Strong privacy protections are essential'),
    (uuid_generate_v4(), '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'FOR', 1.0, 'proof_hash_002', TRUE, NULL),
    (uuid_generate_v4(), '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'AGAINST', 1.0, 'proof_hash_003', FALSE, NULL),
    (uuid_generate_v4(), '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'FOR', 1.0, 'proof_hash_004', TRUE, 'Supports individual rights'),
    (uuid_generate_v4(), '70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', 'FOR', 1.0, 'proof_hash_005', TRUE, NULL);

-- Update voting session counts
UPDATE voting_sessions SET
    for_count = 4,
    against_count = 1,
    abstain_count = 0,
    total_votes = 5,
    weighted_for = 4.0,
    weighted_against = 1.0,
    weighted_abstain = 0.0,
    participation_rate = 0.625
WHERE id = '70000000-0000-0000-0000-000000000001';

-- ============================================================================
-- DELEGATIONS
-- ============================================================================

INSERT INTO delegations (id, delegator_id, delegate_id, scope, category_id, active, priority) VALUES
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000001', 'CATEGORY', '10000000-0000-0000-0000-000000000007', TRUE, 100),
    (uuid_generate_v4(), '30000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', 'CATEGORY', '10000000-0000-0000-0000-000000000001', TRUE, 100);

-- ============================================================================
-- METRIC DEFINITIONS
-- ============================================================================

INSERT INTO metric_definitions (id, name, description, category, unit, data_type, target_value, weight, collection_frequency, active) VALUES
    ('80000000-0000-0000-0000-000000000001', 'Citizen Participation Rate', 'Percentage of eligible citizens participating in votes', 'PEOPLE', 'percentage', 'PERCENTAGE', 80.0, 1.0, 'MONTHLY', TRUE),
    ('80000000-0000-0000-0000-000000000002', 'Carbon Emissions Reduction', 'Year-over-year reduction in carbon emissions', 'PLANET', 'percentage', 'PERCENTAGE', 5.0, 1.0, 'YEARLY', TRUE),
    ('80000000-0000-0000-0000-000000000003', 'Government Efficiency Index', 'Cost per citizen service delivered', 'PROFIT', 'dollars', 'DECIMAL', 100.0, 1.0, 'QUARTERLY', TRUE),
    ('80000000-0000-0000-0000-000000000004', 'Voter Satisfaction Score', 'Average satisfaction rating from citizen surveys', 'PEOPLE', 'score', 'DECIMAL', 4.0, 0.8, 'QUARTERLY', TRUE),
    ('80000000-0000-0000-0000-000000000005', 'Renewable Energy Percentage', 'Percentage of energy from renewable sources', 'PLANET', 'percentage', 'PERCENTAGE', 50.0, 1.0, 'MONTHLY', TRUE);

-- ============================================================================
-- TBL SCORES
-- ============================================================================

INSERT INTO tbl_scores (id, entity_type, entity_id, entity_name, people_score, planet_score, profit_score, composite_score, score_date) VALUES
    (uuid_generate_v4(), 'REGION', '00000000-0000-0000-0000-000000000002', 'California', 78.5, 82.0, 71.0, 77.2, CURRENT_DATE),
    (uuid_generate_v4(), 'REGION', '00000000-0000-0000-0000-000000000003', 'New York', 75.0, 68.0, 85.0, 76.0, CURRENT_DATE),
    (uuid_generate_v4(), 'ORGANIZATION', '40000000-0000-0000-0000-000000000003', 'TechCorp Industries Inc.', 72.0, 65.0, 88.0, 75.0, CURRENT_DATE),
    (uuid_generate_v4(), 'BILL', '60000000-0000-0000-0000-000000000001', 'Digital Privacy Protection Act', 92.0, 45.0, 60.0, 65.7, CURRENT_DATE);

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Print summary
DO $$
BEGIN
    RAISE NOTICE 'Development seed data loaded successfully!';
    RAISE NOTICE 'Regions: %', (SELECT COUNT(*) FROM regions);
    RAISE NOTICE 'Persons: %', (SELECT COUNT(*) FROM persons);
    RAISE NOTICE 'Organizations: %', (SELECT COUNT(*) FROM organizations);
    RAISE NOTICE 'Bills: %', (SELECT COUNT(*) FROM bills);
    RAISE NOTICE 'Committees: %', (SELECT COUNT(*) FROM committees);
    RAISE NOTICE 'Votes: %', (SELECT COUNT(*) FROM votes);
END $$;
