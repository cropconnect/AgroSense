from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, Request, Response
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings
from db.connections import get_connection

AUTH_COOKIE_NAME = "agrosense_auth"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
USER_CLAIMS = ["id", "email", "name", "phone", "state", "location", "district", "land_size", "sensor_device_id"]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_token(user: dict[str, Any]) -> str:
    payload = {key: user.get(key) for key in USER_CLAIMS}
    payload["id"] = int(payload["id"])
    if payload.get("land_size") is not None:
        payload["land_size"] = float(payload["land_size"])
    payload["sub"] = str(payload["id"])
    payload["exp"] = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def set_auth_cookie(response: Response, user: dict[str, Any]) -> None:
    response.set_cookie(
        AUTH_COOKIE_NAME,
        create_token(user),
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        max_age=7 * 24 * 60 * 60,
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(AUTH_COOKIE_NAME)


def user_from_row(row: tuple[Any, ...] | None) -> dict[str, Any] | None:
    if not row:
        return None
    keys = ["id", "email", "name", "phone", "state", "location", "district", "land_size", "sensor_device_id"]
    return dict(zip(keys, row))


def get_current_user(request: Request) -> dict[str, Any]:
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id = int(payload.get("id") or payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid session")
    user = {key: payload.get(key) for key in USER_CLAIMS}
    user["id"] = user_id
    return user


def get_fresh_user(request: Request) -> dict[str, Any]:
    current_user = get_current_user(request)
    try:
        with get_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT id,email,name,phone,state,location,district,land_size,sensor_device_id FROM users WHERE id=%s",
                (current_user["id"],),
            )
            user = user_from_row(cur.fetchone())
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def find_user_by_email(email: str) -> tuple[Any, ...] | None:
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id,email,password,name,phone,state,location,district,land_size,sensor_device_id FROM users WHERE email=%s",
            (email.strip().lower(),),
        )
        return cur.fetchone()
