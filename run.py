#!/usr/bin/env python3
"""
Development server runner for BuildCraftPro
This script runs the FastAPI backend server with hot reload.
"""

import os
import sys
import subprocess

def main():
    """Run the FastAPI development server"""
    backend_dir = "backend"
    
    if not os.path.exists(backend_dir):
        print("Error: backend directory not found")
        print("Please run 'python setup.py' first")
        sys.exit(1)
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_exists = os.path.exists("venv")
    if not venv_exists:
        print("Error: Virtual environment not found")
        print("Please run 'python setup.py' first")
        sys.exit(1)
    
    print("🚀 Starting BuildCraftPro Backend Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Run uvicorn with hot reload
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 