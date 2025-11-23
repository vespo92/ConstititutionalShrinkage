"""Metrics resource for the Constitutional SDK."""

from typing import Optional
from pydantic import BaseModel

from constitutional.utils.request import HttpClient


class PlatformStats(BaseModel):
    """Platform-wide statistics."""

    total_regions: int
    total_citizens: int
    active_citizens: int
    total_bills: int
    active_bills: int


class ParticipationOverview(BaseModel):
    """Participation overview."""

    average_rate: float
    trend: str
    highest_region: dict
    lowest_region: dict


class LegislationOverview(BaseModel):
    """Legislation overview."""

    bills_passed_this_month: int
    bills_rejected_this_month: int
    average_time_to_pass: str
    citizen_proposals: int


class TBLOverview(BaseModel):
    """TBL overview."""

    average_score: float
    people: float
    planet: float
    profit: float


class PlatformOverview(BaseModel):
    """Platform-wide metrics overview."""

    timestamp: str
    platform: PlatformStats
    participation: ParticipationOverview
    legislation: LegislationOverview
    tbl: TBLOverview


class TBLComponent(BaseModel):
    """TBL component with sub-metrics."""

    score: float
    components: dict[str, float]


class TBLScores(BaseModel):
    """Detailed TBL scores."""

    overall: float
    people: TBLComponent
    planet: TBLComponent
    profit: TBLComponent


class TBLTrends(BaseModel):
    """TBL score trends."""

    weekly: list[float]
    monthly: list[float]


class TopPerformer(BaseModel):
    """Top performing region."""

    region_id: str
    name: str
    score: float


class TBLMetrics(BaseModel):
    """Triple Bottom Line metrics."""

    period: str
    region_id: str
    scores: TBLScores
    trends: TBLTrends
    top_performers: list[TopPerformer]


class GovernanceMetrics(BaseModel):
    """Governance health metrics."""

    efficiency: dict[str, object]
    transparency: dict[str, float]
    participation: dict[str, float]
    accountability: dict[str, object]
    cost: dict[str, float]


class ComparisonData(BaseModel):
    """Region comparison data."""

    region_id: str
    region_name: str
    values: dict[str, float]


class ComparisonResult(BaseModel):
    """Comparison result across regions."""

    regions: list[str]
    metrics: list[str]
    data: list[ComparisonData]


class MetricsResource:
    """Metrics API resource."""

    def __init__(self, client: HttpClient):
        self._client = client

    def get_overview(self) -> PlatformOverview:
        """
        Get platform-wide metrics overview.

        Returns:
            Platform overview
        """
        response = self._client.get("/v1/metrics/overview")
        return PlatformOverview(**response["data"])

    def get_tbl(
        self,
        region_id: Optional[str] = None,
        period: Optional[str] = None,
    ) -> TBLMetrics:
        """
        Get Triple Bottom Line scores.

        Args:
            region_id: Region to get scores for
            period: Time period

        Returns:
            TBL metrics
        """
        response = self._client.get(
            "/v1/metrics/tbl",
            params={
                "regionId": region_id,
                "period": period,
            },
        )
        return TBLMetrics(**response["data"])

    def get_governance(self) -> GovernanceMetrics:
        """
        Get governance health metrics.

        Returns:
            Governance metrics
        """
        response = self._client.get("/v1/metrics/governance")
        return GovernanceMetrics(**response["data"])

    def compare(
        self,
        regions: list[str],
        metrics: Optional[list[str]] = None,
    ) -> ComparisonResult:
        """
        Compare metrics across regions.

        Args:
            regions: List of region IDs to compare
            metrics: List of metrics to compare

        Returns:
            Comparison result
        """
        response = self._client.get(
            "/v1/metrics/compare",
            params={
                "regions": ",".join(regions),
                "metrics": ",".join(metrics) if metrics else None,
            },
        )
        return ComparisonResult(**response["data"])

    def get_region_tbl(
        self,
        region_id: str,
        period: Optional[str] = None,
    ) -> TBLMetrics:
        """
        Get TBL score for a specific region.

        Args:
            region_id: Region ID
            period: Time period

        Returns:
            TBL metrics for the region
        """
        return self.get_tbl(region_id=region_id, period=period)
