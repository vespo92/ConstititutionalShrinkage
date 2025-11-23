"""Webhooks resource for the Constitutional SDK."""

from typing import Optional, Literal
import hmac
import hashlib
import time

from pydantic import BaseModel

from constitutional.utils.request import HttpClient


WebhookEvent = Literal[
    "bill.created",
    "bill.updated",
    "bill.status_changed",
    "bill.submitted",
    "bill.passed",
    "bill.rejected",
    "bill.sunset",
    "vote.session_created",
    "vote.session_started",
    "vote.session_ended",
    "vote.threshold_reached",
    "region.pod_created",
    "region.metrics_updated",
    "system.maintenance",
    "system.rate_limit_warning",
]


class Webhook(BaseModel):
    """Webhook subscription."""

    id: str
    url: str
    events: list[str]
    secret: str
    is_active: bool
    created_at: str
    updated_at: str


class WebhookDelivery(BaseModel):
    """Webhook delivery attempt."""

    id: str
    webhook_id: str
    event_id: str
    status: str
    attempts: int
    last_attempt_at: Optional[str] = None
    response: Optional[dict] = None


class WebhookEventInfo(BaseModel):
    """Webhook event information."""

    event: str
    description: str


class WebhooksResource:
    """Webhooks API resource."""

    def __init__(self, client: HttpClient):
        self._client = client

    def create(
        self,
        url: str,
        events: list[WebhookEvent],
    ) -> Webhook:
        """
        Create a new webhook subscription.

        Args:
            url: Webhook endpoint URL
            events: List of events to subscribe to

        Returns:
            Created webhook with secret (store securely!)
        """
        response = self._client.post(
            "/v1/webhooks",
            json={"url": url, "events": list(events)},
        )
        return Webhook(**response["data"])

    def list(self) -> list[Webhook]:
        """
        List all webhooks for the current API key.

        Returns:
            List of webhooks
        """
        response = self._client.get("/v1/webhooks")
        return [Webhook(**w) for w in response["data"]]

    def get(self, webhook_id: str) -> Webhook:
        """
        Get a specific webhook by ID.

        Args:
            webhook_id: The webhook ID

        Returns:
            The webhook
        """
        response = self._client.get(f"/v1/webhooks/{webhook_id}")
        return Webhook(**response["data"])

    def update(
        self,
        webhook_id: str,
        url: Optional[str] = None,
        events: Optional[list[WebhookEvent]] = None,
        is_active: Optional[bool] = None,
    ) -> Webhook:
        """
        Update a webhook.

        Args:
            webhook_id: The webhook ID
            url: New URL
            events: New events list
            is_active: Enable/disable webhook

        Returns:
            Updated webhook
        """
        payload = {}
        if url is not None:
            payload["url"] = url
        if events is not None:
            payload["events"] = list(events)
        if is_active is not None:
            payload["isActive"] = is_active

        response = self._client.put(f"/v1/webhooks/{webhook_id}", json=payload)
        return Webhook(**response["data"])

    def delete(self, webhook_id: str) -> None:
        """
        Delete a webhook.

        Args:
            webhook_id: The webhook ID
        """
        self._client.delete(f"/v1/webhooks/{webhook_id}")

    def enable(self, webhook_id: str) -> Webhook:
        """
        Enable a webhook.

        Args:
            webhook_id: The webhook ID

        Returns:
            Updated webhook
        """
        return self.update(webhook_id, is_active=True)

    def disable(self, webhook_id: str) -> Webhook:
        """
        Disable a webhook.

        Args:
            webhook_id: The webhook ID

        Returns:
            Updated webhook
        """
        return self.update(webhook_id, is_active=False)

    def get_deliveries(self, webhook_id: str) -> list[WebhookDelivery]:
        """
        Get delivery history for a webhook.

        Args:
            webhook_id: The webhook ID

        Returns:
            List of delivery attempts
        """
        response = self._client.get(f"/v1/webhooks/{webhook_id}/deliveries")
        return [WebhookDelivery(**d) for d in response["data"]]

    def list_events(self) -> list[WebhookEventInfo]:
        """
        List all available webhook event types.

        Returns:
            List of event types with descriptions
        """
        response = self._client.get("/v1/webhooks/events/list")
        return [WebhookEventInfo(**e) for e in response["data"]]

    @staticmethod
    def verify_signature(
        payload: str,
        signature: str,
        secret: str,
        tolerance: int = 300,
    ) -> bool:
        """
        Verify webhook signature.

        Args:
            payload: Raw request body
            signature: X-Webhook-Signature header value
            secret: Webhook secret
            tolerance: Maximum age in seconds (default 5 minutes)

        Returns:
            True if signature is valid
        """
        try:
            # Parse signature header: t=timestamp,v1=signature
            parts = dict(p.split("=", 1) for p in signature.split(","))
            timestamp = int(parts["t"])
            provided_sig = parts["v1"]

            # Check timestamp age
            if abs(time.time() - timestamp) > tolerance:
                return False

            # Compute expected signature
            signed_payload = f"{timestamp}.{payload}"
            expected_sig = hmac.new(
                secret.encode(),
                signed_payload.encode(),
                hashlib.sha256,
            ).hexdigest()

            return hmac.compare_digest(provided_sig, expected_sig)
        except Exception:
            return False
