from fastapi import APIRouter, HTTPException, Request, Response
import mysql.connector

from db.connections import get_connection
from models import LoginIn, ProfileIn, SignupIn
from services.auth_service import clear_auth_cookie, find_user_by_email, get_current_user, hash_password, set_auth_cookie, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup")
def signup(payload: SignupIn, response: Response):
    email = payload.email.strip().lower()
    try:
        with get_connection() as conn:
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO users (email,password,name,phone,state,location,district,land_size,sensor_device_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    email,
                    hash_password(payload.password),
                    payload.name,
                    payload.phone,
                    payload.state,
                    payload.location,
                    payload.district,
                    payload.land_size,
                    payload.sensor_device_id or None,
                ),
            )
            user_id = cur.lastrowid
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=409, detail="Email or device already exists")
    set_auth_cookie(response, user_id)
    return {"id": user_id, "email": email, "name": payload.name}


@router.post("/login")
def login(payload: LoginIn, response: Response):
    row = find_user_by_email(payload.email)
    if not row or not verify_password(payload.password, row[2]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_auth_cookie(response, row[0])
    return {"id": row[0], "email": row[1], "name": row[3]}


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"ok": True}


@router.get("/me")
def me(request: Request):
    return get_current_user(request)


@router.put("/profile")
def update_profile(payload: ProfileIn, request: Request):
    user = get_current_user(request)
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        return user
    columns = ", ".join(f"{key}=%s" for key in updates)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(f"UPDATE users SET {columns} WHERE id=%s", (*updates.values(), user["id"]))
    return {**user, **updates}


@router.post("/forgot-password")
def forgot_password():
    return {"detail": "If the account exists, a reset token was generated."}


@router.post("/reset-password")
def reset_password():
    return {"detail": "Password reset endpoint is ready for token integration."}
