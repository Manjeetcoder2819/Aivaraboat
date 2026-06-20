import os
import logging
from sentence_transformers import SentenceTransformer
from app.core.config import get_settings

# Force offline mode for Hugging Face Hub
os.environ["HF_HUB_OFFLINE"] = "1"

logger = logging.getLogger(__name__)

class Embedder:
    def __init__(self):
        settings = get_settings()
        # Use hf_embedding_model if available, else embedding_model
        model_name = settings.hf_embedding_model or settings.embedding_model
        logger.info(f"Initializing embedding model: {model_name}")
        try:
            self.model = SentenceTransformer(model_name, local_files_only=True)
            logger.info("Embedding model loaded successfully.")
        except Exception as e:
            logger.warning(
                f"Failed to load embedding model '{model_name}' locally: {e}. "
                "Falling back to 'sentence-transformers/all-MiniLM-L6-v2'."
            )
            try:
                self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", local_files_only=True)
                logger.info("Fallback embedding model loaded successfully.")
            except Exception as ex:
                logger.error(f"Failed to load fallback embedding model: {ex}")
                raise ex

    def embed_query(self, text: str) -> list[float]:
        """Generate embedding vector for a single query string."""
        return self.model.encode(text).tolist()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Generate embedding vectors for multiple document strings."""
        if not texts:
            return []
        embeddings = self.model.encode(texts)
        return [emb.tolist() for emb in embeddings]

_embedder = None

def get_embedder() -> Embedder:
    global _embedder
    if _embedder is None:
        _embedder = Embedder()
    return _embedder
