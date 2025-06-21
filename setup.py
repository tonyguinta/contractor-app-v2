#!/usr/bin/env python3
"""
Setup script for BuildCraftPro
This script helps set up the development environment and run the application.
"""

import os
import sys
import subprocess
import platform

def run_command(command, cwd=None):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, check=True, 
                              capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version.split()[0]} detected")

def check_node_version():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True, check=True)
        print(f"✓ Node.js {result.stdout.strip()} detected")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠ Node.js not found. Please install Node.js 16+ for frontend development")
        return False

def setup_backend():
    """Set up the backend environment"""
    print("\n🔧 Setting up backend...")
    
    backend_dir = "backend"
    if not os.path.exists(backend_dir):
        print(f"Error: {backend_dir} directory not found")
        return False
    
    # Create virtual environment
    venv_dir = os.path.join(backend_dir, "venv")
    if not os.path.exists(venv_dir):
        print("Creating virtual environment...")
        if not run_command(f"python -m venv {venv_dir}"):
            return False
    
    # Determine activation script based on OS
    if platform.system() == "Windows":
        activate_script = os.path.join(venv_dir, "Scripts", "activate")
        pip_cmd = os.path.join(venv_dir, "Scripts", "pip")
    else:
        activate_script = os.path.join(venv_dir, "bin", "activate")
        pip_cmd = os.path.join(venv_dir, "bin", "pip")
    
    # Install dependencies
    print("Installing backend dependencies...")
    requirements_file = os.path.join(backend_dir, "requirements.txt")
    if os.path.exists(requirements_file):
        if not run_command(f"{pip_cmd} install -r requirements.txt", cwd=backend_dir):
            return False
    else:
        print(f"Warning: {requirements_file} not found")
    
    print("✓ Backend setup complete")
    return True

def setup_frontend():
    """Set up the frontend environment"""
    print("\n🔧 Setting up frontend...")
    
    frontend_dir = "frontend"
    if not os.path.exists(frontend_dir):
        print(f"Error: {frontend_dir} directory not found")
        return False
    
    # Install dependencies
    print("Installing frontend dependencies...")
    if not run_command("npm install", cwd=frontend_dir):
        return False
    
    print("✓ Frontend setup complete")
    return True

def create_env_file():
    """Create a basic .env file for the backend"""
    env_file = os.path.join("backend", ".env")
    if not os.path.exists(env_file):
        print("Creating .env file...")
        with open(env_file, "w") as f:
            f.write("SECRET_KEY=your-secret-key-change-in-production\n")
            f.write("DATABASE_URL=sqlite:///./buildcraftpro.db\n")
        print("✓ Created .env file")

def print_instructions():
    """Print instructions for running the application"""
    print("\n🎉 Setup complete!")
    print("\nTo run the application:")
    print("\n1. Start the backend server:")
    if platform.system() == "Windows":
        print("   cd backend")
        print("   venv\\Scripts\\activate")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("   cd backend")
        print("   source venv/bin/activate")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    print("\n2. In a new terminal, start the frontend:")
    print("   cd frontend")
    print("   npm run dev")
    
    print("\n3. Open your browser and go to:")
    print("   Frontend: http://localhost:3000")
    print("   API Docs: http://localhost:8000/docs")
    
    print("\n📝 Note: Make sure to change the SECRET_KEY in backend/.env for production!")

def main():
    """Main setup function"""
    print("🚀 BuildCraftPro Setup")
    print("=" * 50)
    
    # Check requirements
    check_python_version()
    node_available = check_node_version()
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Create environment file
    create_env_file()
    
    # Setup frontend if Node.js is available
    if node_available:
        if not setup_frontend():
            print("❌ Frontend setup failed")
            sys.exit(1)
    else:
        print("⚠ Skipping frontend setup (Node.js not available)")
    
    # Print final instructions
    print_instructions()

if __name__ == "__main__":
    main() 