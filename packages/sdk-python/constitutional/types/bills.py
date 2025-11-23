"""Bill-related types."""

from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel


BillStatus = Literal[
    "draft", "submitted", "review", "voting", "passed", "rejected", "enacted", "sunset"
]


class BillAuthor(BaseModel):
    """Bill author information."""

    id: str
    display_name: str


class BillMetrics(BaseModel):
    """Bill engagement metrics."""

    supporters: int
    opposers: int
    comments: int


class Bill(BaseModel):
    """A bill in the governance system."""

    id: str
    title: str
    summary: str
    status: BillStatus
    category: str
    region: Optional[str] = None
    version: int
    created_at: str
    updated_at: str
    submitted_at: Optional[str] = None
    voting_ends_at: Optional[str] = None
    author: BillAuthor
    metrics: Optional[BillMetrics] = None

    def to_dict(self) -> dict:
        """Convert to dictionary for pandas compatibility."""
        return self.model_dump()


class BillVersion(BaseModel):
    """Bill version history entry."""

    version: int
    created_at: str
    author: BillAuthor
    summary: str


class BillDiffChange(BaseModel):
    """A change between bill versions."""

    section: str
    type: Literal["added", "modified", "removed"]
    before: Optional[str] = None
    after: Optional[str] = None


class BillDiff(BaseModel):
    """Diff between two bill versions."""

    bill_id: str
    from_version: int
    to_version: int
    changes: list[BillDiffChange]


class Amendment(BaseModel):
    """A proposed amendment to a bill."""

    id: str
    bill_id: str
    title: str
    status: str
    author: BillAuthor
    created_at: str
    supporters: int
