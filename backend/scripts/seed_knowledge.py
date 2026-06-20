import os
import sys
import logging

# Add the project root to the python path to resolve app package imports
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Set up logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

from app.services.ingestion import IngestionService

def seed():
    logger.info("Initializing knowledge base seeding...")
    
    knowledge_dir = os.path.join(project_root, "data", "medical_knowledge")
    if not os.path.exists(knowledge_dir):
        logger.error(f"Knowledge directory not found: {knowledge_dir}")
        return

    # Find all text files in the knowledge directory
    files = [f for f in os.listdir(knowledge_dir) if f.endswith(".txt")]
    if not files:
        logger.warning(f"No plain text (.txt) files found in: {knowledge_dir}")
        return

    logger.info(f"Found {len(files)} documents to ingest.")
    
    ingest_service = IngestionService()
    
    for filename in sorted(files):
        filepath = os.path.join(knowledge_dir, filename)
        logger.info(f"Ingesting: {filename}...")
        try:
            doc_id = ingest_service.ingest_file(filepath)
            logger.info(f"Successfully seeded {filename} (ID: {doc_id})")
        except Exception as e:
            logger.error(f"Failed to seed {filename}: {e}", exc_info=True)

    logger.info("Knowledge base seeding completed.")

if __name__ == "__main__":
    seed()
