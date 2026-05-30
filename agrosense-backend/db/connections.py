from contextlib import contextmanager

import mysql.connector
from mysql.connector import pooling

from config import settings

_pool: pooling.MySQLConnectionPool | None = None


def get_pool() -> pooling.MySQLConnectionPool:
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="agrosense_pool",
            pool_size=settings.mysql_pool_size,
            host=settings.mysql_host,
            port=settings.mysql_port,
            user=settings.mysql_user,
            password=settings.mysql_password,
            database=settings.mysql_database,
            autocommit=False,
        )
    return _pool


@contextmanager
def get_connection():
    conn = get_pool().get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def database_available() -> bool:
    try:
        with get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT 1")
            cur.fetchone()
        return True
    except mysql.connector.Error:
        return False
