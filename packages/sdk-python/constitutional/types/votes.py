"""Vote-related types."""

from typing import Optional, Literal
from pydantic import BaseModel


VoteSessionStatus = Literal["scheduled", "active", "ended"]


class VoteTally(BaseModel):
    """Vote counts."""

    yes: int
    no: int
    abstain: int


class VoteSession(BaseModel):
    """A voting session for a bill."""

    id: str
    bill_id: str
    status: VoteSessionStatus
    started_at: str
    ends_at: str
    tally: VoteTally
    participation_rate: float
    quorum_met: bool


class RegionalTally(BaseModel):
    """Tally breakdown by region."""

    region_id: str
    region_name: str
    tally: VoteTally
    participation_rate: float


class AgeGroupTally(BaseModel):
    """Tally breakdown by age group."""

    group: str
    yes: int
    no: int
    abstain: int


class DemographicBreakdown(BaseModel):
    """Demographic breakdown of votes."""

    age_groups: list[AgeGroupTally]


class TimelineEntry(BaseModel):
    """Vote timeline entry."""

    timestamp: str
    cumulative_votes: int


class DetailedTally(BaseModel):
    """Detailed voting tally with breakdowns."""

    session_id: str
    bill_id: str
    overall: VoteTally
    participation_rate: float
    quorum_met: bool
    total_eligible_voters: int
    total_votes_cast: int
    by_region: list[RegionalTally]
    by_demographic: Optional[DemographicBreakdown] = None
    timeline: list[TimelineEntry]


class CategoryStats(BaseModel):
    """Statistics for a bill category."""

    category: str
    sessions: int
    avg_participation: float


class VotingStatistics(BaseModel):
    """Overall voting statistics."""

    period: str
    total_sessions: int
    active_sessions: int
    completed_sessions: int
    average_participation_rate: float
    average_votes_per_session: int
    pass_rate: float
    top_categories: list[CategoryStats]
