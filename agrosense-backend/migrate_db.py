from pathlib import Path
from time import sleep

import mysql.connector

from config import settings


def main():
    sql = Path("schema.sql").read_text(encoding="utf-8")
    conn = None
    for attempt in range(1, 31):
        try:
            conn = mysql.connector.connect(
                host=settings.mysql_host,
                port=settings.mysql_port,
                user=settings.mysql_user,
                password=settings.mysql_password,
            )
            break
        except mysql.connector.Error:
            if attempt == 30:
                raise
            sleep(2)
    if conn is None:
        raise RuntimeError("Could not connect to MySQL")
    cur = conn.cursor()
    for statement in [part.strip() for part in sql.split(";") if part.strip()]:
        cur.execute(statement)
    conn.commit()
    conn.close()
    print("AgroSense schema migrated")


if __name__ == "__main__":
    main()
