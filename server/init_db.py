#!/usr/bin/env python3

import os
import sys

# Add the parent directory to sys.path to enable absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Use absolute imports
from flask import Flask
from server.models import db, User, Card, Inventory, Deck, CardInDeck, FriendRequest
from server.config import Config

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    # Drop all existing tables
    print("Dropping all existing tables...")
    db.drop_all()
    
    # Create tables from the original models
    print("Creating new tables...")
    db.create_all()
    
    print("Database initialization complete!") 