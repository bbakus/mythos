#!/usr/bin/env python3

import os
import sys

# Add the parent directory to sys.path to enable absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.models import db, User
from server.app import app

def update_schema():
    with app.app_context():
        print('Updating database schema...')
        db.create_all()
        
        # Ensure all users have wallet values
        users = User.query.all()
        for user in users:
            if user.wallet is None:
                print(f"Setting wallet for user {user.username}")
                user.wallet = 100
        
        db.session.commit()
        print('Schema update complete!')
        
        # Check users
        users = User.query.all()
        for user in users:
            print(f"User {user.username}: wallet = {user.wallet}")

if __name__ == '__main__':
    update_schema() 