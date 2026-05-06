import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

_WINDOWS: dict[str, deque[float]] = defaultdict(deque)


def rate_limit(limit: int, window_seconds: int):
    async def dependency(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        key = f"{request.url.path}:{client_ip}"
        now = time.time()
        bucket = _WINDOWS[key]
        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()
        if len(bucket) >= limit:
            raise HTTPException(status_code=429, detail="Too many requests")
        bucket.append(now)

    return dependency
