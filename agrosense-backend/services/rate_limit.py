from collections import defaultdict, deque
from time import time

from fastapi import HTTPException, Request

_buckets: dict[str, deque[float]] = defaultdict(deque)


def enforce_rate_limit(request: Request, bucket: str, limit: int = 60, window_seconds: int = 60) -> None:
    host = request.client.host if request.client else "unknown"
    key = f"{bucket}:{host}"
    now = time()
    hits = _buckets[key]
    while hits and now - hits[0] > window_seconds:
        hits.popleft()
    if len(hits) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests")
    hits.append(now)
