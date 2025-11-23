"""Votes resource for the Constitutional SDK."""

from typing import Optional, Generator

from constitutional.utils.request import HttpClient
from constitutional.utils.pagination import paginate
from constitutional.types.common import PaginatedResponse, Pagination
from constitutional.types.votes import (
    VoteSession,
    VoteSessionStatus,
    DetailedTally,
    VotingStatistics,
)


class VotesResource:
    """Votes API resource."""

    def __init__(self, client: HttpClient):
        self._client = client

    def list_sessions(
        self,
        status: Optional[VoteSessionStatus] = None,
        bill_id: Optional[str] = None,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> PaginatedResponse[VoteSession]:
        """
        List voting sessions with optional filtering.

        Args:
            status: Filter by session status
            bill_id: Filter by bill ID
            limit: Maximum number of results
            cursor: Pagination cursor

        Returns:
            Paginated list of voting sessions
        """
        response = self._client.get(
            "/v1/votes/sessions",
            params={
                "status": status,
                "billId": bill_id,
                "limit": limit,
                "cursor": cursor,
            },
        )

        return PaginatedResponse[VoteSession](
            data=[VoteSession(**s) for s in response["data"]],
            pagination=Pagination(**response["pagination"]),
        )

    def list_all_sessions(
        self,
        status: Optional[VoteSessionStatus] = None,
        bill_id: Optional[str] = None,
    ) -> Generator[VoteSession, None, None]:
        """
        Iterate through all voting sessions matching the filters.

        Args:
            status: Filter by session status
            bill_id: Filter by bill ID

        Yields:
            Voting sessions matching the filters
        """
        return paginate(
            self.list_sessions,
            status=status,
            bill_id=bill_id,
        )

    def get_session(self, session_id: str) -> VoteSession:
        """
        Get a specific voting session by ID.

        Args:
            session_id: The session ID

        Returns:
            The voting session
        """
        response = self._client.get(f"/v1/votes/sessions/{session_id}")
        return VoteSession(**response["data"])

    def get_tally(self, session_id: str) -> DetailedTally:
        """
        Get detailed tally for a voting session.

        Args:
            session_id: The session ID

        Returns:
            Detailed voting tally
        """
        response = self._client.get(f"/v1/votes/sessions/{session_id}/tally")
        return DetailedTally(**response["data"])

    def get_statistics(self, period: Optional[str] = None) -> VotingStatistics:
        """
        Get overall voting statistics.

        Args:
            period: Time period for statistics

        Returns:
            Voting statistics
        """
        response = self._client.get(
            "/v1/votes/statistics",
            params={"period": period},
        )
        return VotingStatistics(**response["data"])

    def get_session_for_bill(self, bill_id: str) -> Optional[VoteSession]:
        """
        Get voting session for a specific bill.

        Args:
            bill_id: The bill ID

        Returns:
            Voting session or None if not found
        """
        response = self.list_sessions(bill_id=bill_id, limit=1)
        return response.data[0] if response.data else None
