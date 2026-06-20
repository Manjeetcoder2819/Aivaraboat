import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    db_url = os.getenv("DATABASE_URL")
    print("Connecting to:", db_url)
    engine = create_async_engine(db_url)
    async with engine.connect() as conn:
        print("\n--- conversations Columns ---")
        res = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'conversations';
        """))
        for row in res.fetchall():
            print(f"Column: {row[0]}, Type: {row[1]}, Nullable: {row[2]}")

        print("\n--- messages Columns ---")
        res = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'messages';
        """))
        for row in res.fetchall():
            print(f"Column: {row[0]}, Type: {row[1]}, Nullable: {row[2]}")

if __name__ == "__main__":
    asyncio.run(main())
