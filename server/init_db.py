#!/usr/bin/env python3

import os
import sys

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.app import app, db
from flask_migrate import upgrade, migrate, init, stamp

def init_db():
    """Initialize the database with migrations."""
    with app.app_context():
        # Create the migrations directory if it doesn't exist
        if not os.path.exists("server/migrations"):
            print("Initializing migrations directory...")
            init()
            stamp()
        
        # Create database tables
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully!")

if __name__ == "__main__":
    init_db() 