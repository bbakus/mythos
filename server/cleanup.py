#!/usr/bin/env python3

import os
import sys

# Add the parent directory to sys.path to enable absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.models import db, User
from server.app import app

def clean_users():
    with app.app_context():
        # Find test user or create one if it doesn't exist
        test_user = User.query.filter_by(username='testuser').first()
        if not test_user:
            print("Creating test user")
            test_user = User(
                username='testuser',
                email='test@example.com',
                wallet=100
            )
            # Set password using the proper hashing method
            test_user.password_hash = 'password'
            print(f"Created test user with password hash: {test_user._password_hash}")
            db.session.add(test_user)
            db.session.commit()
        else:
            print(f"Found test user: {test_user.username}, wallet: {test_user.wallet}")
            print(f"Current password hash: {test_user._password_hash}")
            # Reset password to ensure it's correct
            test_user.password_hash = 'password'
            db.session.commit()
            print(f"Updated password hash: {test_user._password_hash}")
        
        # Get all users for verification
        all_users = User.query.all()
        print(f'\nTotal users in database: {len(all_users)}')
        for user in all_users:
            print(f'User: {user.username}, email: {user.email}, wallet: {user.wallet}')
        
        print('\nDatabase cleanup complete!')

if __name__ == '__main__':
    clean_users() 