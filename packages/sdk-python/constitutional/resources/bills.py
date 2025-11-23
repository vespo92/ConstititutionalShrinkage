"""Bills resource for the Constitutional SDK."""

from typing import Optional, Generator

from constitutional.utils.request import HttpClient
from constitutional.utils.pagination import paginate
from constitutional.types.common import PaginatedResponse, Pagination
from constitutional.types.bills import Bill, BillVersion, BillDiff, Amendment, BillStatus


class BillsResource:
    """Bills API resource."""

    def __init__(self, client: HttpClient):
        self._client = client

    def list(
        self,
        status: Optional[BillStatus] = None,
        category: Optional[str] = None,
        region: Optional[str] = None,
        search: Optional[str] = None,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> PaginatedResponse[Bill]:
        """
        List bills with optional filtering.

        Args:
            status: Filter by bill status
            category: Filter by category
            region: Filter by region
            search: Search query
            limit: Maximum number of results
            cursor: Pagination cursor

        Returns:
            Paginated list of bills
        """
        response = self._client.get(
            "/v1/bills",
            params={
                "status": status,
                "category": category,
                "region": region,
                "search": search,
                "limit": limit,
                "cursor": cursor,
            },
        )

        return PaginatedResponse[Bill](
            data=[Bill(**b) for b in response["data"]],
            pagination=Pagination(**response["pagination"]),
        )

    def list_all(
        self,
        status: Optional[BillStatus] = None,
        category: Optional[str] = None,
        region: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Generator[Bill, None, None]:
        """
        Iterate through all bills matching the filters.

        Args:
            status: Filter by bill status
            category: Filter by category
            region: Filter by region
            search: Search query

        Yields:
            Bills matching the filters
        """
        return paginate(
            self.list,
            status=status,
            category=category,
            region=region,
            search=search,
        )

    def get(self, bill_id: str) -> Bill:
        """
        Get a specific bill by ID.

        Args:
            bill_id: The bill ID

        Returns:
            The bill
        """
        response = self._client.get(f"/v1/bills/{bill_id}")
        return Bill(**response["data"])

    def get_versions(self, bill_id: str) -> list[BillVersion]:
        """
        Get version history for a bill.

        Args:
            bill_id: The bill ID

        Returns:
            List of bill versions
        """
        response = self._client.get(f"/v1/bills/{bill_id}/versions")
        return [BillVersion(**v) for v in response["data"]]

    def diff(
        self,
        bill_id: str,
        from_version: Optional[int] = None,
        to_version: Optional[int] = None,
    ) -> BillDiff:
        """
        Get diff between two versions of a bill.

        Args:
            bill_id: The bill ID
            from_version: Starting version
            to_version: Ending version

        Returns:
            Diff between versions
        """
        response = self._client.get(
            f"/v1/bills/{bill_id}/diff",
            params={
                "fromVersion": from_version,
                "toVersion": to_version,
            },
        )
        return BillDiff(**response["data"])

    def get_amendments(
        self,
        bill_id: str,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> PaginatedResponse[Amendment]:
        """
        Get amendments for a bill.

        Args:
            bill_id: The bill ID
            limit: Maximum number of results
            cursor: Pagination cursor

        Returns:
            Paginated list of amendments
        """
        response = self._client.get(
            f"/v1/bills/{bill_id}/amendments",
            params={"limit": limit, "cursor": cursor},
        )
        return PaginatedResponse[Amendment](
            data=[Amendment(**a) for a in response["data"]],
            pagination=Pagination(**response["pagination"]),
        )
