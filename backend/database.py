from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "skinvision.db"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                skin_type TEXT,
                overall_score INTEGER,
                redness_score INTEGER,
                spot_score INTEGER,
                acne_score INTEGER,
                result_json TEXT NOT NULL,
                image_url TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                category TEXT,
                ingredient TEXT,
                started_at TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS routine_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                log_date TEXT NOT NULL,
                morning_done INTEGER NOT NULL DEFAULT 0,
                evening_done INTEGER NOT NULL DEFAULT 0,
                face_wash_done INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                UNIQUE(user_id, log_date),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
            CREATE INDEX IF NOT EXISTS idx_routine_user_date ON routine_logs(user_id, log_date);
            """
        )


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return dict(row)


def create_user(username: str, email: str, password_hash: str, is_admin: bool = False) -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO users (username, email, password_hash, is_admin, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (username, email.lower(), password_hash, int(is_admin), _utc_now()),
        )
        user_id = cur.lastrowid
    return get_user_by_id(user_id)  # type: ignore[return-value]


def get_user_by_id(user_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    user = row_to_dict(row)
    if user:
        user["is_admin"] = bool(user["is_admin"])
    return user


def get_user_by_username(username: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    user = row_to_dict(row)
    if user:
        user["is_admin"] = bool(user["is_admin"])
    return user


def get_user_by_email(email: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
    user = row_to_dict(row)
    if user:
        user["is_admin"] = bool(user["is_admin"])
    return user


def list_users() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return [{**dict(r), "is_admin": bool(r["is_admin"])} for r in rows]


def save_analysis(
    user_id: int,
    skin_type: str,
    scores: dict,
    result_json: dict,
    image_url: str | None,
) -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO analyses (
                user_id, skin_type, overall_score, redness_score, spot_score, acne_score,
                result_json, image_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                skin_type,
                scores.get("overall_score"),
                scores.get("redness_score"),
                scores.get("spot_score"),
                scores.get("acne_score"),
                json.dumps(result_json, ensure_ascii=False),
                image_url,
                _utc_now(),
            ),
        )
        analysis_id = cur.lastrowid
    return get_analysis_by_id(analysis_id, user_id)  # type: ignore[return-value]


def get_analysis_by_id(analysis_id: int, user_id: int | None = None) -> dict | None:
    with get_connection() as conn:
        if user_id is not None:
            row = conn.execute(
                "SELECT * FROM analyses WHERE id = ? AND user_id = ?", (analysis_id, user_id)
            ).fetchone()
        else:
            row = conn.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,)).fetchone()
    item = row_to_dict(row)
    if item:
        item["result"] = json.loads(item.pop("result_json"))
    return item


def list_analyses(user_id: int, limit: int = 50) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, skin_type, overall_score, redness_score, spot_score, acne_score,
                   image_url, created_at
            FROM analyses WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
    return [dict(r) for r in rows]


def add_product(
    user_id: int,
    name: str,
    category: str,
    ingredient: str,
    started_at: str,
    notes: str = "",
) -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO user_products (user_id, name, category, ingredient, started_at, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, name, category, ingredient, started_at, notes, _utc_now()),
        )
        product_id = cur.lastrowid
    return get_product(product_id, user_id)  # type: ignore[return-value]


def get_product(product_id: int, user_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM user_products WHERE id = ? AND user_id = ?", (product_id, user_id)
        ).fetchone()
    return row_to_dict(row)


def list_products(user_id: int) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM user_products WHERE user_id = ? ORDER BY started_at DESC", (user_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def delete_product(product_id: int, user_id: int) -> bool:
    with get_connection() as conn:
        cur = conn.execute(
            "DELETE FROM user_products WHERE id = ? AND user_id = ?", (product_id, user_id)
        )
    return cur.rowcount > 0


def upsert_routine_log(
    user_id: int,
    log_date: str,
    morning_done: bool,
    evening_done: bool,
    face_wash_done: bool,
    notes: str = "",
) -> dict:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO routine_logs (user_id, log_date, morning_done, evening_done, face_wash_done, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, log_date) DO UPDATE SET
                morning_done = excluded.morning_done,
                evening_done = excluded.evening_done,
                face_wash_done = excluded.face_wash_done,
                notes = excluded.notes
            """,
            (
                user_id,
                log_date,
                int(morning_done),
                int(evening_done),
                int(face_wash_done),
                notes,
            ),
        )
        row = conn.execute(
            "SELECT * FROM routine_logs WHERE user_id = ? AND log_date = ?", (user_id, log_date)
        ).fetchone()
    item = row_to_dict(row)
    if item:
        item["morning_done"] = bool(item["morning_done"])
        item["evening_done"] = bool(item["evening_done"])
        item["face_wash_done"] = bool(item["face_wash_done"])
    return item  # type: ignore[return-value]


def list_routine_logs(user_id: int, year: int, month: int) -> list[dict]:
    prefix = f"{year:04d}-{month:02d}"
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT * FROM routine_logs
            WHERE user_id = ? AND log_date LIKE ?
            ORDER BY log_date
            """,
            (user_id, f"{prefix}%"),
        ).fetchall()
    result = []
    for r in rows:
        item = dict(r)
        item["morning_done"] = bool(item["morning_done"])
        item["evening_done"] = bool(item["evening_done"])
        item["face_wash_done"] = bool(item["face_wash_done"])
        result.append(item)
    return result


def admin_stats() -> dict:
    with get_connection() as conn:
        users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        analyses = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
        products = conn.execute("SELECT COUNT(*) FROM user_products").fetchone()[0]
        logs = conn.execute("SELECT COUNT(*) FROM routine_logs").fetchone()[0]
    return {
        "user_count": users,
        "analysis_count": analyses,
        "product_count": products,
        "routine_log_count": logs,
    }
