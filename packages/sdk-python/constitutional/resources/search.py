"""Search resource for the Constitutional SDK."""

from typing import Optional
from pydantic import BaseModel

from constitutional.utils.request import HttpClient
from constitutional.types.common import PaginatedResponse, Pagination


class BillSearchResult(BaseModel):
    """Bill search result."""

    id: str
    title: str
    summary: str
    status: str
    category: str
    region: Optional[str] = None
    relevance_score: float
    highlights: list[str]
    created_at: str


class RegionSearchResult(BaseModel):
    """Region search result."""

    id: str
    name: str
    type: str
    parent_name: Optional[str] = None
    relevance_score: float
    metrics: dict[str, float]


class SearchMeta(BaseModel):
    """Search metadata."""

    query: str
    total_results: int
    search_time: float
    filters: Optional[dict] = None


class SearchResponse(BaseModel):
    """Search API response."""

    data: list
    pagination: Pagination
    meta: SearchMeta


class Suggestion(BaseModel):
    """Search suggestion."""

    text: str
    type: str
    count: int


class SearchResource:
    """Search API resource."""

    def __init__(self, client: HttpClient):
        self._client = client

    def bills(
        self,
        query: str,
        status: Optional[str] = None,
        category: Optional[str] = None,
        region: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = None,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> SearchResponse:
        """
        Search bills with full-text search.

        Args:
            query: Search query
            status: Filter by status
            category: Filter by category
            region: Filter by region
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)
            limit: Maximum results
            cursor: Pagination cursor

        Returns:
            Search response with bill results
        """
        response = self._client.get(
            "/v1/search/bills",
            params={
                "query": query,
                "status": status,
                "category": category,
                "region": region,
                "sortBy": sort_by,
                "sortOrder": sort_order,
                "limit": limit,
                "cursor": cursor,
            },
        )

        return SearchResponse(
            data=[BillSearchResult(**r) for r in response["data"]],
            pagination=Pagination(**response["pagination"]),
            meta=SearchMeta(**response["meta"]),
        )

    def regions(
        self,
        query: str,
        type: Optional[str] = None,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> SearchResponse:
        """
        Search regions.

        Args:
            query: Search query
            type: Filter by region type
            limit: Maximum results
            cursor: Pagination cursor

        Returns:
            Search response with region results
        """
        response = self._client.get(
            "/v1/search/regions",
            params={
                "query": query,
                "type": type,
                "limit": limit,
                "cursor": cursor,
            },
        )

        return SearchResponse(
            data=[RegionSearchResult(**r) for r in response["data"]],
            pagination=Pagination(**response["pagination"]),
            meta=SearchMeta(**response["meta"]),
        )

    def suggestions(
        self,
        query: str,
        type: Optional[str] = None,
    ) -> list[Suggestion]:
        """
        Get search suggestions/autocomplete.

        Args:
            query: Partial query
            type: Filter by suggestion type

        Returns:
            List of suggestions
        """
        response = self._client.get(
            "/v1/search/suggestions",
            params={
                "query": query,
                "type": type,
            },
        )

        return [Suggestion(**s) for s in response["data"]["suggestions"]]
