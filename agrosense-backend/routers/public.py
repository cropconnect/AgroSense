from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health")
def health():
    return {"status": "ok", "service": "agrosense"}
