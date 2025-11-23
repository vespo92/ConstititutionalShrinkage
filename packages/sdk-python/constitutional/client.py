"""Constitutional Platform Python SDK Client."""

from typing import Optional

from constitutional.utils.request import HttpClient
from constitutional.resources.bills import BillsResource
from constitutional.resources.votes import VotesResource
from constitutional.resources.regions import RegionsResource
from constitutional.resources.metrics import MetricsResource
from constitutional.resources.search import SearchResource
from constitutional.resources.webhooks import WebhooksResource


class Constitutional:
    """
    Constitutional Platform SDK Client.

    Example:
        ```python
        from constitutional import Constitutional

        client = Constitutional(api_key="your-api-key")

        # List bills
        bills = client.bills.list(status="voting")
        for bill in bills.data:
            print(bill.title)

        # Iterate through all bills
        for bill in client.bills.list_all(status="voting"):
            print(bill.title)
        ```
    """

    def __init__(
        self,
        api_key: str,
        base_url: Optional[str] = None,
        region: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3,
    ):
        """
        Initialize the Constitutional SDK client.

        Args:
            api_key: Your API key (required)
            base_url: Custom API base URL (optional)
            region: Regional endpoint to use (optional)
            timeout: Request timeout in seconds (default: 30)
            max_retries: Maximum number of retries (default: 3)
        """
        if not api_key:
            raise ValueError(
                "API key is required. Get one at https://developers.constitutional.io"
            )

        self._client = HttpClient(
            api_key=api_key,
            base_url=base_url,
            region=region,
            timeout=timeout,
            max_retries=max_retries,
        )

        # Initialize resources
        self.bills = BillsResource(self._client)
        self.votes = VotesResource(self._client)
        self.regions = RegionsResource(self._client)
        self.metrics = MetricsResource(self._client)
        self.search = SearchResource(self._client)
        self.webhooks = WebhooksResource(self._client)

    def close(self) -> None:
        """Close the client and release resources."""
        self._client.close()

    def __enter__(self) -> "Constitutional":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()
