import secrets

from fastapi import APIRouter, HTTPException, Request, Response
import mysql.connector

from db.connections import get_connection
from models import ForgotPasswordIn, LoginIn, ProfileIn, ResetPasswordIn, SignupIn
from services.auth_service import clear_auth_cookie, find_user_by_email, get_fresh_user, hash_password, set_auth_cookie, user_from_row, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
ALLOWED_PROFILE_KEYS = {"name", "phone", "state", "location", "district", "land_size", "sensor_device_id"}


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
    user = {
        "id": user_id,
        "email": email,
        "name": payload.name,
        "phone": payload.phone,
        "state": payload.state,
        "location": payload.location,
        "district": payload.district,
        "land_size": payload.land_size,
        "sensor_device_id": payload.sensor_device_id or None,
    }
    set_auth_cookie(response, user)
    return {"id": user_id, "email": email, "name": payload.name}


@router.post("/login")
def login(payload: LoginIn, response: Response):
    row = find_user_by_email(payload.email)
    if not row or not verify_password(payload.password, row[2]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = {
        "id": row[0],
        "email": row[1],
        "name": row[3],
        "phone": row[4],
        "state": row[5],
        "location": row[6],
        "district": row[7],
        "land_size": row[8],
        "sensor_device_id": row[9],
    }
    set_auth_cookie(response, user)
    return {"id": row[0], "email": row[1], "name": row[3]}


@router.post("/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"ok": True}


@router.get("/me")
def me(request: Request):
    return get_fresh_user(request)


@router.put("/profile")
def update_profile(payload: ProfileIn, request: Request, response: Response):
    user = get_fresh_user(request)
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if k in ALLOWED_PROFILE_KEYS}
    if not updates:
        return user
    columns = ", ".join(f"{key}=%s" for key in updates)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(f"UPDATE users SET {columns} WHERE id=%s", (*updates.values(), user["id"]))
    updated_user = {**user, **updates}
    set_auth_cookie(response, updated_user)
    return updated_user


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordIn):
    row = find_user_by_email(payload.email)
    if not row:
        return {"detail": "If the account exists, a reset token was generated."}
    token = secrets.token_hex(32)
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (%s, %s, NOW() + INTERVAL 1 HOUR)
            """,
            (row[0], token),
        )
    return {"token": token, "detail": "Use this token to reset your password"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordIn):
    with get_connection() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT id, user_id
            FROM password_reset_tokens
            WHERE token=%s AND used=0 AND expires_at > NOW()
            LIMIT 1
            """,
            (payload.token,),
        )
        reset_token = cur.fetchone()
        if not reset_token:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        cur.execute(
            "UPDATE users SET password=%s WHERE id=%s",
            (hash_password(payload.new_password), reset_token["user_id"]),
        )
        cur.execute("UPDATE password_reset_tokens SET used=1 WHERE id=%s", (reset_token["id"],))
    return {"detail": "Password reset successful"}
