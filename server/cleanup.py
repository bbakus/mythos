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
            test_user.password_hash = 'password123'
            db.session.add(test_user)
            db.session.commit()
        else:
            print(f"Found test user: {test_user.username}, wallet: {test_user.wallet}")
            # Ensure wallet is 100
            if test_user.wallet != 100:
                test_user.wallet = 100
                db.session.commit()
                print("Updated test user wallet to 100")
        
        # Delete all other users
        users_to_delete = User.query.filter(User.username != 'testuser').all()
        print(f'Found {len(users_to_delete)} users to delete')
        
        for user in users_to_delete:
            print(f'Deleting user: {user.username}')
            db.session.delete(user)
        
        db.session.commit()
        print('Database cleaned up')
        
        # Verify remaining users
        remaining_users = User.query.all()
        for user in remaining_users:
            print(f'Remaining user: {user.username}, wallet: {user.wallet}')

if __name__ == '__main__':
    clean_users() 