#!/usr/bin/env python3

import sys
from faker import Faker
import os

# Add the parent directory to sys.path if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.app import app
from server.models import db, User

fake = Faker()

def clear_db():
    """Clear the database tables"""
    print("Clearing database...")
    User.query.delete()
    db.session.commit()
    print("Database cleared!")

def create_users():
    """Create sample users"""
    print("Creating users...")
    users = []
    for i in range(5):
        user = User(
            username=fake.user_name(),
            email=fake.email()
        )
        user.password_hash = "password"
        users.append(user)
    
    # Add a test user with known credentials
    test_user = User(
        username="testuser",
        email="test@example.com"
    )
    test_user.password_hash = "password"
    users.append(test_user)
    
    db.session.add_all(users)
    db.session.commit()
    print(f"Created {len(users)} users!")
    return users






if __name__ == "__main__":
    with app.app_context():
        clear_db()
        users = create_users()
        print("Seeding completed successfully!")
