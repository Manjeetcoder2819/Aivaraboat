from typing import List

class Chunker:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str) -> List[str]:
        """
        Split a string of text into smaller chunks.
        Splits by sentences or paragraphs where possible, falls back to characters.
        """
        if not text:
            return []

        # Simple character-based sliding window that tries to split on double newlines or spaces
        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            # End position of window
            end = min(start + self.chunk_size, text_len)
            
            # If we are not at the end of the text, try to split at a logical boundary (paragraph, newline, space)
            if end < text_len:
                # Look for paragraph boundary first (double newline) in the last 100 characters of the window
                search_start = max(start, end - 100)
                para_idx = text.rfind("\n\n", search_start, end)
                if para_idx != -1:
                    end = para_idx + 2
                else:
                    # Look for single newline
                    nl_idx = text.rfind("\n", search_start, end)
                    if nl_idx != -1:
                        end = nl_idx + 1
                    else:
                        # Look for space
                        space_idx = text.rfind(" ", search_start, end)
                        if space_idx != -1:
                            end = space_idx + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            # Move window start forward (subtracting overlap)
            start = max(start + 1, end - self.chunk_overlap)

        return chunks
