# constitutional-sdk

Official Python SDK for the Constitutional Platform Public API.

## Installation

```bash
pip install constitutional-sdk
```

## Quick Start

```python
from constitutional import Constitutional

# Initialize the client
client = Constitutional(api_key="your-api-key")

# List bills currently in voting
bills = client.bills.list(status="voting")
for bill in bills.data:
    print(bill.title)

# Get a specific bill
bill = client.bills.get("bill_abc123")
print(bill.title)
```

## Features

- Full type hints with Pydantic models
- Automatic pagination with generators
- Built-in rate limiting and retry logic
- Comprehensive error handling
- Context manager support

## API Resources

### Bills

```python
# List bills with filters
bills = client.bills.list(
    status="voting",
    category="infrastructure",
    region="CA",
    limit=20,
)

# Iterate through ALL bills (handles pagination automatically)
for bill in client.bills.list_all(status="voting"):
    print(bill.title)

# Get bill details
bill = client.bills.get("bill_abc123")

# Get version history
versions = client.bills.get_versions("bill_abc123")

# Get diff between versions
diff = client.bills.diff("bill_abc123", from_version=1, to_version=3)

# Get amendments
amendments = client.bills.get_amendments("bill_abc123")
```

### Votes

```python
# List voting sessions
sessions = client.votes.list_sessions(status="active")

# Get session details
session = client.votes.get_session("session_xyz")

# Get detailed tally with regional breakdown
tally = client.votes.get_tally("session_xyz")
print(f"Yes: {tally.overall.yes}, No: {tally.overall.no}")

# Get voting statistics
stats = client.votes.get_statistics(period="last_30_days")
```

### Regions

```python
# List regions
regions = client.regions.list(type="city")

# Get region with children
region = client.regions.get("CA")

# Get detailed metrics
metrics = client.regions.get_metrics("CA-SF", period="last_30_days")

# Get leaderboard
leaderboard = client.regions.get_leaderboard("CA", metric="tbl_score")
```

### Metrics

```python
# Platform overview
overview = client.metrics.get_overview()

# Triple Bottom Line scores
tbl = client.metrics.get_tbl(region_id="CA")

# Governance health
governance = client.metrics.get_governance()

# Compare regions
comparison = client.metrics.compare(
    regions=["CA-SF", "CA-LA", "NY-NYC"],
    metrics=["tbl_score", "participation_rate"],
)
```

### Search

```python
# Search bills
results = client.search.bills(
    query="renewable energy infrastructure",
    status="voting",
    category="environment",
)

# Search regions
regions = client.search.regions(query="San")

# Get autocomplete suggestions
suggestions = client.search.suggestions(query="renew", type="bill")
```

### Webhooks

```python
# Create a webhook
webhook = client.webhooks.create(
    url="https://myapp.com/webhooks/constitutional",
    events=["bill.passed", "vote.session_ended"],
)
# Store webhook.secret securely!

# List webhooks
webhooks = client.webhooks.list()

# Update webhook
client.webhooks.update(
    "webhook_id",
    events=["bill.passed", "bill.rejected"],
)

# Delete webhook
client.webhooks.delete("webhook_id")

# Verify webhook signature (in your webhook handler)
from constitutional.resources.webhooks import WebhooksResource

is_valid = WebhooksResource.verify_signature(
    payload=request.body,
    signature=request.headers["X-Webhook-Signature"],
    secret=webhook_secret,
)
```

## Error Handling

```python
from constitutional import (
    Constitutional,
    ConstitutionalError,
    RateLimitError,
    AuthenticationError,
    NotFoundError,
)

try:
    bill = client.bills.get("invalid_id")
except NotFoundError as e:
    print(f"Bill not found: {e.resource_id}")
except RateLimitError as e:
    print(f"Rate limited. Retry in {e.retry_after} seconds")
except AuthenticationError:
    print("Invalid API key")
except ConstitutionalError as e:
    print(f"Error: {e.message} ({e.code})")
```

## Configuration

```python
client = Constitutional(
    # Required
    api_key="csk_...",

    # Optional
    base_url="https://api.constitutional.io",  # Custom API URL
    region="us-west",  # Use regional endpoint
    timeout=30.0,  # Request timeout (seconds)
    max_retries=3,  # Max retry attempts
)
```

## Context Manager

```python
with Constitutional(api_key="your-api-key") as client:
    bills = client.bills.list(status="voting")
    # Client is automatically closed when exiting the context
```

## Data Analysis with Pandas

```python
import pandas as pd
from constitutional import Constitutional

client = Constitutional(api_key="your-api-key")

# Collect all bills and convert to DataFrame
all_bills = list(client.bills.list_all(status="enacted"))
df = pd.DataFrame([b.to_dict() for b in all_bills])

# Analyze by category
print(df.groupby("category")["id"].count())
```

## License

MIT
