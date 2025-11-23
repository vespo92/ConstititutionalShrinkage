"""HTTP client for making API requests."""

import time
from typing import Optional, Any, TypeVar
import httpx

from constitutional.types.common import (
    ConstitutionalError,
    RateLimitError,
    AuthenticationError,
    NotFoundError,
)


T = TypeVar("T")

DEFAULT_BASE_URL = "https://api.constitutional.io"
DEFAULT_TIMEOUT = 30.0
DEFAULT_MAX_RETRIES = 3


class HttpClient:
    """HTTP client for Constitutional API."""

    def __init__(
        self,
        api_key: str,
        base_url: Optional[str] = None,
        region: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
    ):
        self.api_key = api_key
        self.base_url = base_url or DEFAULT_BASE_URL
        self.region = region
        self.timeout = timeout
        self.max_retries = max_retries

        if region:
            self.base_url = f"https://{region}.api.constitutional.io"

        self._client = httpx.Client(
            base_url=self.base_url,
            timeout=timeout,
            headers=self._build_headers(),
        )

    def _build_headers(self) -> dict[str, str]:
        """Build request headers."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-SDK-Version": "1.0.0",
            "X-SDK-Language": "python",
        }

    def get(
        self,
        path: str,
        params: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Make a GET request."""
        return self._request("GET", path, params=params)

    def post(
        self,
        path: str,
        json: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Make a POST request."""
        return self._request("POST", path, json=json)

    def put(
        self,
        path: str,
        json: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Make a PUT request."""
        return self._request("PUT", path, json=json)

    def delete(self, path: str) -> Optional[dict[str, Any]]:
        """Make a DELETE request."""
        return self._request("DELETE", path)

    def _request(
        self,
        method: str,
        path: str,
        params: Optional[dict[str, Any]] = None,
        json: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Make an HTTP request with retries."""
        url = f"/api{path}"

        # Filter out None values from params
        if params:
            params = {k: v for k, v in params.items() if v is not None}

        last_error: Optional[Exception] = None
        retries = 0

        while retries <= self.max_retries:
            try:
                response = self._client.request(
                    method=method,
                    url=url,
                    params=params,
                    json=json,
                )

                request_id = response.headers.get("x-request-id")

                if response.status_code == 204:
                    return {}

                if response.is_success:
                    return response.json()

                # Handle errors
                try:
                    error_body = response.json()
                except Exception:
                    error_body = {}

                error_message = error_body.get("error", {}).get("message", "Request failed")
                error_code = error_body.get("error", {}).get("code", "ERROR")

                if response.status_code == 429:
                    retry_after = int(response.headers.get("retry-after", "60"))
                    raise RateLimitError(
                        message=error_message,
                        retry_after=retry_after,
                        request_id=request_id,
                    )

                if response.status_code == 401:
                    raise AuthenticationError(
                        message=error_message,
                        request_id=request_id,
                    )

                if response.status_code == 404:
                    raise NotFoundError(
                        resource="Resource",
                        resource_id=path,
                        request_id=request_id,
                    )

                raise ConstitutionalError(
                    message=error_message,
                    code=error_code,
                    status_code=response.status_code,
                    details=error_body.get("error", {}).get("details"),
                    request_id=request_id,
                )

            except AuthenticationError:
                raise

            except RateLimitError as e:
                if retries < self.max_retries:
                    time.sleep(e.retry_after)
                    retries += 1
                    continue
                raise

            except httpx.TimeoutException:
                last_error = ConstitutionalError(
                    message="Request timed out",
                    code="TIMEOUT",
                    status_code=408,
                )
                if retries < self.max_retries:
                    time.sleep(2**retries)
                    retries += 1
                    continue
                raise last_error

            except httpx.HTTPError as e:
                last_error = ConstitutionalError(
                    message=str(e),
                    code="HTTP_ERROR",
                    status_code=500,
                )
                if retries < self.max_retries:
                    time.sleep(2**retries)
                    retries += 1
                    continue
                raise last_error

        if last_error:
            raise last_error
        raise ConstitutionalError("Request failed after retries", "RETRY_EXHAUSTED", 500)

    def close(self) -> None:
        """Close the HTTP client."""
        self._client.close()

    def __enter__(self) -> "HttpClient":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()
