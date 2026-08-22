import os
import re
import sqlite3
from contextlib import contextmanager

from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Cria a tabela de usuarios caso ainda nao exista. Chamar no inicio da app."""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                name          TEXT    NOT NULL,
                email         TEXT    NOT NULL UNIQUE,
                phone         TEXT    NOT NULL,
                password_hash TEXT    NOT NULL,
                created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
            )
            """
        )


def email_exists(email: str) -> bool:
    """Verifica se ja existe um usuario cadastrado com esse e-mail."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM users WHERE email = ? LIMIT 1", (email.lower(),)
        ).fetchone()
        return row is not None


def create_user(name: str, email: str, phone: str, password: str):
    """
    Valida e cria um novo usuario.

    Retorna uma tupla (success: bool, message: str, user_id: int | None)
    """
    name = (name or "").strip()
    email = (email or "").strip().lower()
    phone = (phone or "").strip()

    if not name:
        return False, "O nome e obrigatorio.", None

    if not EMAIL_REGEX.match(email):
        return False, "E-mail invalido.", None

    if not phone:
        return False, "O telefone e obrigatorio.", None

    if not password or len(password) < 8:
        return False, "A senha deve ter no minimo 8 caracteres.", None

    if email_exists(email):
        return False, "Ja existe uma conta com esse e-mail.", None

    password_hash = generate_password_hash(password)

    try:
        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (name, email, phone, password_hash)
                VALUES (?, ?, ?, ?)
                """,
                (name, email, phone, password_hash),
            )
            return True, "Usuario criado!", cursor.lastrowid
    except sqlite3.IntegrityError:
        return False, "Ja existe uma conta com esse e-mail.", None


def get_user_by_email(email: str):
    """Retorna o registro do usuario (sem o hash da senha) ou None."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, name, email, phone, created_at FROM users WHERE email = ?",
            ((email or "").strip().lower(),),
        ).fetchone()
        return dict(row) if row else None


def authenticate_user(email: str, password: str):
    """
    Confere e-mail e senha.

    Retorna o usuario (sem o hash) em caso de sucesso, ou None se as
    credenciais forem invalidas.
    """
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?",
            ((email or "").strip().lower(),),
        ).fetchone()

    if row is None:
        return None

    if not check_password_hash(row["password_hash"], password or ""):
        return None

    user = dict(row)
    user.pop("password_hash")
    return user