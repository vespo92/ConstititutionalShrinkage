"""Region-related types."""

from typing import Optional, Literal
from pydantic import BaseModel


RegionType = Literal["city", "county", "state", "federal"]


class RegionMetrics(BaseModel):
    """Basic region metrics."""

    tbl_score: float
    participation_rate: float
    bills_active: int
    bills_passed: int


class RegionChild(BaseModel):
    """Child region reference."""

    id: str
    name: str
    type: RegionType


class Region(BaseModel):
    """A governance region."""

    id: str
    name: str
    type: RegionType
    parent_id: Optional[str] = None
    population: int
    active_citizens: int
    metrics: RegionMetrics
    children: Optional[list[RegionChild]] = None


class TBLComponent(BaseModel):
    """TBL score component."""

    score: float
    components: dict[str, float]


class TBLScores(BaseModel):
    """Triple Bottom Line scores."""

    overall: float
    people: float
    planet: float
    profit: float
    trend: str


class ParticipationStats(BaseModel):
    """Participation statistics."""

    rate: float
    active_users: int
    total_eligible: int
    trend: str


class LegislationStats(BaseModel):
    """Legislation statistics."""

    bills_active: int
    bills_passed: int
    bills_rejected: int
    average_time_to_pass: str


class GovernanceStats(BaseModel):
    """Governance statistics."""

    delegation_rate: float
    average_comments_per_bill: int
    citizen_proposal_rate: float


class HistoricalEntry(BaseModel):
    """Historical metrics entry."""

    date: str
    tbl_score: float
    participation_rate: float


class DetailedRegionMetrics(BaseModel):
    """Detailed metrics for a region."""

    region_id: str
    region_name: str
    period: str
    tbl: TBLScores
    participation: ParticipationStats
    legislation: LegislationStats
    governance: GovernanceStats
    historical: list[HistoricalEntry]


class LeaderboardEntry(BaseModel):
    """Leaderboard entry."""

    rank: int
    region_id: str
    region_name: str
    score: float
    change: int


class ParentRegion(BaseModel):
    """Parent region reference."""

    id: str
    name: str


class Leaderboard(BaseModel):
    """Regional leaderboard."""

    parent_region: ParentRegion
    metric: str
    leaderboard: list[LeaderboardEntry]
