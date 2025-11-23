"""Regions resource for the Constitutional SDK."""

from typing import Optional, Generator, Literal

from constitutional.utils.request import HttpClient
from constitutional.utils.pagination import paginate
from constitutional.types.common import PaginatedResponse, Pagination
from constitutional.types.regions import (
    Region,
    RegionType,
    DetailedRegionMetrics,
    Leaderboard,
)


MetricsPeriod = Literal["last_7_days", "last_30_days", "last_90_days", "last_year"]


class RegionsResource:
    """Regions API resource."""

    def __init__(self, client: HttpClient):
        self._client = client

    def list(
        self,
        type: Optional[RegionType] = None,
        parent_id: Optional[str] = None,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> PaginatedResponse[Region]:
        """
        List regions with optional filtering.

        Args:
            type: Filter by region type
            parent_id: Filter by parent region
            limit: Maximum number of results
            cursor: Pagination cursor

        Returns:
            Paginated list of regions
        """
        response = self._client.get(
            "/v1/regions",
            params={
                "type": type,
                "parentId": parent_id,
                "limit": limit,
                "cursor": cursor,
            },
        )

        return PaginatedResponse[Region](
            data=[Region(**r) for r in response["data"]],
            pagination=Pagination(**response["pagination"]),
        )

    def list_all(
        self,
        type: Optional[RegionType] = None,
        parent_id: Optional[str] = None,
    ) -> Generator[Region, None, None]:
        """
        Iterate through all regions matching the filters.

        Args:
            type: Filter by region type
            parent_id: Filter by parent region

        Yields:
            Regions matching the filters
        """
        return paginate(
            self.list,
            type=type,
            parent_id=parent_id,
        )

    def get(self, region_id: str) -> Region:
        """
        Get a specific region by ID.

        Args:
            region_id: The region ID

        Returns:
            The region with children
        """
        response = self._client.get(f"/v1/regions/{region_id}")
        return Region(**response["data"])

    def get_metrics(
        self,
        region_id: str,
        metrics: Optional[list[str]] = None,
        period: Optional[MetricsPeriod] = None,
    ) -> DetailedRegionMetrics:
        """
        Get detailed metrics for a region.

        Args:
            region_id: The region ID
            metrics: List of metrics to include
            period: Time period for metrics

        Returns:
            Detailed region metrics
        """
        response = self._client.get(
            f"/v1/regions/{region_id}/metrics",
            params={
                "metrics": ",".join(metrics) if metrics else None,
                "period": period,
            },
        )
        return DetailedRegionMetrics(**response["data"])

    def get_leaderboard(
        self,
        region_id: str,
        metric: Optional[str] = None,
    ) -> Leaderboard:
        """
        Get leaderboard for child regions.

        Args:
            region_id: The parent region ID
            metric: Metric to rank by

        Returns:
            Leaderboard of child regions
        """
        response = self._client.get(
            f"/v1/regions/{region_id}/leaderboard",
            params={"metric": metric},
        )
        return Leaderboard(**response["data"])

    def get_children(self, parent_id: str) -> list[Region]:
        """
        Get child regions of a parent region.

        Args:
            parent_id: The parent region ID

        Returns:
            List of child regions
        """
        response = self.list(parent_id=parent_id)
        return response.data
