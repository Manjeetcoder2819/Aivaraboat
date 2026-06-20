import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Load env
project_root = r"C:\Users\Manjeet Gupta\LLM-chatbot_ai\Aivara.ai\backend"
load_dotenv(dotenv_path=os.path.join(project_root, ".env"))

async def test_insert():
    db_url = os.getenv("DATABASE_URL")
    print(f"DATABASE_URL: {db_url}")
    if not db_url:
        print("DATABASE_URL is not set!")
        return
        
    engine = create_async_engine(db_url, connect_args={"statement_cache_size": 0})
    async with engine.begin() as conn:
        # First check if the mock user exists in auth.users
        print("Checking if mock user '00000000-0000-0000-0000-000000000000' exists...")
        res = await conn.execute(text("SELECT id, email FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000';"))
        row = res.fetchone()
        if row:
            print(f"User exists: ID={row[0]}, Email={row[1]}")
        else:
            print("User DOES NOT exist! Attempting to insert mock user...")
            try:
                insert_user = """
                INSERT INTO auth.users (
                    id, 
                    email, 
                    email_confirmed_at, 
                    raw_app_meta_data, 
                    raw_user_meta_data, 
                    created_at, 
                    updated_at, 
                    role, 
                    aud
                )
                VALUES (
                    '00000000-0000-0000-0000-000000000000', 
                    'doctor.admin@aivara.ai', 
                    now(), 
                    '{"provider":"email","providers":["email"]}', 
                    '{"full_name":"Aivara Demo User"}', 
                    now(), 
                    now(), 
                    'authenticated', 
                    'authenticated'
                )
                ON CONFLICT (id) DO NOTHING;
                """
                await conn.execute(text(insert_user))
                print("Mock user inserted successfully!")
            except Exception as e:
                print(f"Failed to insert mock user: {e}", file=sys.stderr)
        
        # Now try to insert a conversation
        print("Attempting to insert a mock conversation...")
        try:
            insert_conv = """
            INSERT INTO conversations (
                user_id,
                title,
                specialty,
                mode,
                is_active
            )
            VALUES (
                '00000000-0000-0000-0000-000000000000',
                'Test Consultation',
                'General',
                'Chat',
                true
            )
            RETURNING id;
            """
            res = await conn.execute(text(insert_conv))
            conv_id = res.scalar()
            print(f"Conversation inserted successfully! ID={conv_id}")
        except Exception as e:
            print(f"Failed to insert conversation: {e}", file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(test_insert())
