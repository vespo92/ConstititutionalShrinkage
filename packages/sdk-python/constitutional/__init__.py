"""
Constitutional Platform Python SDK

Official Python SDK for the Constitutional Platform Public API.

Usage:
    from constitutional import Constitutional

    client = Constitutional(api_key="your-api-key")

    # List bills
    bills = client.bills.list(status="voting")

    # Get a specific bill
    bill = client.bills.get("bill_abc123")
"""

from constitutional.client import Constitutional
from constitutional.types.common import (
    ConstitutionalError,
    RateLimitError,
    AuthenticationError,
    NotFoundError,
    PaginatedResponse,
)
from constitutional.types.bills import Bill, BillStatus, Amendment
from constitutional.types.votes import VoteSession, VoteTally, DetailedTally
from constitutional.types.regions import Region, RegionMetrics

__version__ = "1.0.0"
__all__ = [
    "Constitutional",
    "ConstitutionalError",
    "RateLimitError",
    "AuthenticationError",
    "NotFoundError",
    "PaginatedResponse",
    "Bill",
    "BillStatus",
    "Amendment",
    "VoteSession",
    "VoteTally",
    "DetailedTally",
    "Region",
    "RegionMetrics",
]
