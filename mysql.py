import os
from datetime import date, datetime
from decimal import Decimal
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()


def _database_url():
    url = os.getenv("DATABASE_URL")
    if url:
        return url

    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    database = os.getenv("MYSQL_DATABASE", "mindscope")

    if password:
        return (
            f"mysql+pymysql://{quote_plus(user)}:{quote_plus(password)}"
            f"@{host}:{port}/{database}"
        )
    return f"mysql+pymysql://{quote_plus(user)}@{host}:{port}/{database}"


DATABASE_URL = _database_url()
engine = create_engine(DATABASE_URL, echo=True)


def get_connection():
    return engine.connect()


def rows_to_json(rows):
    serialized = []
    for row in rows:
        item = dict(row)
        for key, value in item.items():
            if isinstance(value, Decimal):
                item[key] = float(value)
            elif isinstance(value, (datetime, date)):
                item[key] = value.isoformat()
        serialized.append(item)
    return serialized


def fetch_all(sql):
    with get_connection() as conn:
        result = conn.execute(text(sql)).mappings().all()
        return rows_to_json(result)
