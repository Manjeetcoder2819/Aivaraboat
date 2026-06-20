import os
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class FileParser:
    def parse_file(self, filepath: str) -> Dict[str, str]:
        """
        Parse a document and return its plain text and metadata.
        Currently supports: .txt
        """
        filename = os.path.basename(filepath)
        title, _ = os.path.splitext(filename)
        # Clean title (e.g., replace underscores with spaces, capitalize)
        title = title.replace("_", " ").title()
        
        content = ""
        ext = os.path.splitext(filepath)[1].lower()
        
        try:
            if ext == ".txt":
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            else:
                # Fallback to reading as text if extension is unknown
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
        except Exception as e:
            logger.error(f"Error parsing file {filepath}: {e}")
            raise e

        return {
            "filename": filename,
            "title": title,
            "content": content
        }
