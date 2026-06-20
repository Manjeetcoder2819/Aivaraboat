import sys
import os

# Add the backend root directory to Python path to resolve imports
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# Import the FastAPI app from the parent main.py
from main import app
