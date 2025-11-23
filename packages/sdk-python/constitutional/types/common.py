"""Common types and exceptions for the Constitutional SDK."""

from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel


T = TypeVar("T")


class Pagination(BaseModel):
    """Pagination metadata."""

    cursor: Optional[str] = None
    has_more: bool
    total: Optional[int] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated API response."""

    data: list[T]
    pagination: Pagination


class ConstitutionalError(Exception):
    """Base exception for Constitutional SDK errors."""

    def __init__(
        self,
        message: str,
        code: str = "ERROR",
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None,
        request_id: Optional[str] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}
        self.request_id = request_id


class RateLimitError(ConstitutionalError):
    """Rate limit exceeded error."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: int = 60,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message=message,
            code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details={"retry_after": retry_after},
            request_id=request_id,
        )
        self.retry_after = retry_after


class AuthenticationError(ConstitutionalError):
    """Authentication failed error."""

    def __init__(
        self,
        message: str = "Invalid API key",
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message=message,
            code="AUTHENTICATION_ERROR",
            status_code=401,
            request_id=request_id,
        )


class NotFoundError(ConstitutionalError):
    """Resource not found error."""

    def __init__(
        self,
        resource: str,
        resource_id: str,
        request_id: Optional[str] = None,
    ):
        super().__init__(
            message=f"{resource} {resource_id} not found",
            code="NOT_FOUND",
            status_code=404,
            details={"resource": resource, "id": resource_id},
            request_id=request_id,
        )
        self.resource = resource
        self.resource_id = resource_id
