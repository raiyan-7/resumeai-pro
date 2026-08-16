import fitz  # PyMuPDF
import os
import logging
from typing import Dict, Any

logger = logging.getLogger("app.parser")

class ParserService:
    @staticmethod
    def extract_text_and_metadata(file_path: str, filename: str) -> Dict[str, Any]:
        """
        Extracts text content and structured metadata from a PDF file using PyMuPDF.
        """
        if not os.path.exists(file_path):
            logger.error(f"Parser failed: file not found at {file_path}")
            raise FileNotFoundError(f"PDF file not found at: {file_path}")
        
        text = ""
        page_count = 0
        file_size = os.path.getsize(file_path)
        
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            for page in doc:
                page_text = page.get_text()
                if page_text:
                    text += page_text + "\n"
            doc.close()
        except Exception as e:
            logger.error(f"Failed to extract text from PDF {file_path}: {str(e)}")
            raise RuntimeError(f"Failed to process PDF file structure: {str(e)}")
            
        cleaned_text = text.strip()
        
        return {
            "raw_text": cleaned_text,
            "metadata": {
                "filename": filename,
                "page_count": page_count,
                "file_size": file_size,
                "char_count": len(cleaned_text),
                "word_count": len(cleaned_text.split()) if cleaned_text else 0
            }
        }
