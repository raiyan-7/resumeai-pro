import os
import sys
import traceback

try:
    # Inject backend path for Vercel module resolution
    backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
    sys.path.insert(0, backend_path)

    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse

    app = FastAPI()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    def error_handler(path: str):
        error_msg = f"Failed to initialize FastAPI app:\n"
        error_msg += f"Exception: {str(e)}\n\n"
        error_msg += f"Traceback:\n{traceback.format_exc()}\n"
        error_msg += f"sys.path: {sys.path}\n"
        error_msg += f"Current Dir: {os.getcwd()}\n"
        error_msg += f"Current Dir files: {os.listdir(os.getcwd())}\n"
        parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        error_msg += f"Parent Dir files: {os.listdir(parent_dir) if os.path.exists(parent_dir) else 'not found'}\n"
        if 'backend_path' in locals() and os.path.exists(backend_path):
            error_msg += f"Backend Dir files: {os.listdir(backend_path)}\n"
        else:
            error_msg += f"Backend path is not defined or does not exist!\n"
        return PlainTextResponse(error_msg, status_code=500)
