"""
Basic usage examples for the Constitutional SDK.
"""

import os
from constitutional import Constitutional


def main():
    # Initialize the client
    client = Constitutional(
        api_key=os.environ.get("CONSTITUTIONAL_API_KEY", "your-api-key"),
        # Optional: use a regional endpoint
        # region="us-west",
    )

    # ==========================================
    # Bills API
    # ==========================================

    print("\n--- Bills ---")

    # List bills with filtering
    bills = client.bills.list(status="voting", category="infrastructure", limit=5)
    print(f"Found {len(bills.data)} voting bills")

    # Get a specific bill
    if bills.data:
        bill = client.bills.get(bills.data[0].id)
        print(f"Bill: {bill.title}")
        print(f"Status: {bill.status}")
        print(f"Version: {bill.version}")

    # Iterate through all bills (pagination handled automatically)
    print("\nIterating through all voting bills:")
    count = 0
    for bill in client.bills.list_all(status="voting"):
        print(f"- {bill.title}")
        count += 1
        if count >= 3:
            break

    # ==========================================
    # Votes API
    # ==========================================

    print("\n--- Votes ---")

    sessions = client.votes.list_sessions(status="active")
    print(f"Found {len(sessions.data)} active voting sessions")

    if sessions.data:
        tally = client.votes.get_tally(sessions.data[0].id)
        print(f"\nTally for session {tally.session_id}:")
        print(f"  Yes: {tally.overall.yes}")
        print(f"  No: {tally.overall.no}")
        print(f"  Abstain: {tally.overall.abstain}")
        print(f"  Participation: {tally.participation_rate}%")

    # ==========================================
    # Regions API
    # ==========================================

    print("\n--- Regions ---")

    regions = client.regions.list(type="state", limit=5)
    print(f"Found {len(regions.data)} states")

    if regions.data:
        metrics = client.regions.get_metrics(
            regions.data[0].id,
            period="last_30_days",
        )
        print(f"\nMetrics for {metrics.region_name}:")
        print(f"  TBL Score: {metrics.tbl.overall}")
        print(f"  Participation: {metrics.participation.rate}%")

    # ==========================================
    # Metrics API
    # ==========================================

    print("\n--- Platform Metrics ---")

    overview = client.metrics.get_overview()
    print(f"Total Citizens: {overview.platform.total_citizens:,}")
    print(f"Active Bills: {overview.platform.active_bills}")
    print(f"Average Participation: {overview.participation.average_rate}%")

    tbl = client.metrics.get_tbl()
    print(f"\nTBL Scores:")
    print(f"  Overall: {tbl.scores.overall}")
    print(f"  People: {tbl.scores.people.score}")
    print(f"  Planet: {tbl.scores.planet.score}")
    print(f"  Profit: {tbl.scores.profit.score}")

    # ==========================================
    # Search API
    # ==========================================

    print("\n--- Search ---")

    search_results = client.search.bills(query="renewable energy", limit=3)
    print(f"Found {search_results.meta.total_results} results in {search_results.meta.search_time}s")
    for result in search_results.data:
        print(f"- {result.title} (score: {result.relevance_score})")

    print("\nDone!")

    # Clean up
    client.close()


if __name__ == "__main__":
    main()
