import os
import uuid
import shutil
import logging
from fastapi import UploadFile, HTTPException, status

logger = logging.getLogger("app.storage")

class StorageService:
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSION = ".pdf"
    
    def __init__(self, upload_dir: str):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
        
    def validate_file(self, file: UploadFile):
        """
        Validates file type and enforces size limitations.
        """
        # Validate extension
        if not file.filename.lower().endswith(self.ALLOWED_EXTENSION):
            logger.warning(f"File validation failed: invalid extension for {file.filename}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF format is currently supported."
            )
            
        # Validate content type if present
        if file.content_type and file.content_type.lower() not in ["application/pdf", "application/x-pdf"]:
            logger.warning(f"File validation failed: invalid content type {file.content_type} for {file.filename}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF format is currently supported."
            )
            
        # Validate size by seeking to the end of stream
        try:
            file.file.seek(0, os.SEEK_END)
            size = file.file.tell()
            file.file.seek(0)  # Reset pointer to start
            
            if size > self.MAX_FILE_SIZE:
                logger.warning(f"File validation failed: file {file.filename} size ({size} bytes) exceeds limit of 10MB.")
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File size exceeds the maximum limit of 10 MB."
                )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            logger.error(f"Error validating file size: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error validating uploaded file size limits."
            )

    def save_file(self, file: UploadFile, user_id: int) -> str:
        """
        Saves the file to a user-specific subdirectory with a unique UUID name prefix.
        Returns the absolute local file path.
        """
        self.validate_file(file)
        
        user_dir = os.path.join(self.upload_dir, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        
        # Clean filename to prevent traversal
        base_name = os.path.basename(file.filename)
        # Create a secure unique file name
        unique_name = f"{uuid.uuid4().hex}_{base_name}"
        file_path = os.path.join(user_dir, unique_name)
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            logger.info(f"File securely saved for user {user_id} at {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Failed to write file to disk: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not write file to storage: {str(e)}"
            )
            
    def delete_file(self, file_path: str):
        """
        Removes file from disk if it exists.
        """
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"File deleted from disk: {file_path}")
            except Exception as e:
                logger.error(f"Error removing file from disk: {str(e)}")
