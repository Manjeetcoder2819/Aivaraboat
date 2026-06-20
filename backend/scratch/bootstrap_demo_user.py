import asyncio
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv("backend/.env")

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"


async def main():
    engine = create_async_engine(
        os.getenv("DATABASE_URL"),
        connect_args={"statement_cache_size": 0},
    )
    async with engine.begin() as conn:
        await conn.execute(
            text(
                """
                INSERT INTO public.users (
                    id,
                    email,
                    username,
                    hashed_password,
                    full_name,
                    is_active
                )
                VALUES (
                    :id,
                    'doctor.admin@aivara.ai',
                    'aivara_demo',
                    'demo-auth-disabled',
                    'Aivara Demo User',
                    true
                )
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    username = EXCLUDED.username,
                    full_name = EXCLUDED.full_name,
                    is_active = EXCLUDED.is_active,
                    updated_at = NOW()
                """
            ),
            {"id": DEMO_USER_ID},
        )
    await engine.dispose()
    print(f"Demo user ready: {DEMO_USER_ID}")


if __name__ == "__main__":
    asyncio.run(main())
