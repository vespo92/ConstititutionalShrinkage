"""Pagination utilities for the Constitutional SDK."""

from typing import TypeVar, Generator, Callable, Optional
from constitutional.types.common import PaginatedResponse


T = TypeVar("T")


def paginate(
    fetch_page: Callable[..., PaginatedResponse[T]],
    **kwargs: object,
) -> Generator[T, None, None]:
    """
    Iterate through all pages of a paginated endpoint.

    Args:
        fetch_page: Function to fetch a page of results
        **kwargs: Arguments to pass to fetch_page

    Yields:
        Individual items from each page
    """
    cursor: Optional[str] = None
    has_more = True

    while has_more:
        response = fetch_page(cursor=cursor, **kwargs)

        for item in response.data:
            yield item

        has_more = response.pagination.has_more
        cursor = response.pagination.cursor


def collect_all(
    fetch_page: Callable[..., PaginatedResponse[T]],
    max_items: Optional[int] = None,
    **kwargs: object,
) -> list[T]:
    """
    Collect all items from a paginated endpoint into a list.

    Args:
        fetch_page: Function to fetch a page of results
        max_items: Maximum number of items to collect (optional)
        **kwargs: Arguments to pass to fetch_page

    Returns:
        List of all items
    """
    items: list[T] = []

    for item in paginate(fetch_page, **kwargs):
        items.append(item)
        if max_items and len(items) >= max_items:
            break

    return items
