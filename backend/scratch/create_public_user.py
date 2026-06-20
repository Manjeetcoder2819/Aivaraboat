import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

project_root = r"C:\Users\Manjeet Gupta\LLM-chatbot_ai\Aivara.ai\backend"
load_dotenv(dotenv_path=os.path.join(project_root, ".env"))

async def create_public_user():
    db_url = os.getenv("DATABASE_URL")
    print(f"DATABASE_URL: {db_url}")
    if not db_url:
        print("DATABASE_URL is not set!")
        return
        
    engine = create_async_engine(db_url, connect_args={"statement_cache_size": 0})
    async with engine.begin() as conn:
        print("Cleaning up conflicting users...")
        try:
            # Delete any existing user with the same email or ID
            await conn.execute(text("DELETE FROM public.users WHERE email = 'doctor.admin@aivara.ai' OR id = '00000000-0000-0000-0000-000000000000';"))
            print("Cleanup successful.")
            
            # Insert the mock user fresh
            insert_query = """
            INSERT INTO public.users (
                id, 
                email, 
                username, 
                hashed_password, 
                full_name, 
                role,
                is_active
            ) 
            VALUES (
                '00000000-0000-0000-0000-000000000000', 
                'doctor.admin@aivara.ai', 
                'doctor_admin', 
                '$2b$12$e7.S/mockpasswordhash/dummyvalue', 
                'Aivara Demo User', 
                'doctor',
                true
            );
            """
            print("Inserting fresh mock user into public.users...")
            await conn.execute(text(insert_query))
            print("Mock user successfully created in public.users!")
            
        except Exception as e:
            print(f"Failed to insert public user: {e}", file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(create_public_user())
