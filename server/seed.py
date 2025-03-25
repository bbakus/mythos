#!/usr/bin/env python3

import os
import sys
import json



sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from server.app import app
from server.models import db, User, Card, Inventory, Deck, CardInDeck





def create_users():
    
    users = []
    
    existing_user = User.query.filter_by(email="test@example.com").first()
    if existing_user:
        
        return []
        
    
    test_user = User(
        username="testuser",
        email="test@example.com"
    )
    test_user.password_hash = "password"
    users.append(test_user)
    
    db.session.add_all(users)
    db.session.commit()
    
    return users

def seed_cards_from_json():
    
    Card.query.delete()
    db.session.commit()
    
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    json_path = os.path.join(script_dir, 'data', 'cards.json')
    
    with open(json_path) as f:
        cards_data = json.load(f)
    
    cards = []
    for card_data in cards_data:
        card = Card(
            name=card_data['name'],
            image=card_data['image'],
            power=card_data['power'],
            cost=card_data['cost'],
            thief=card_data.get('thief', False),
            guard=card_data.get('guard', False),
            curse=card_data.get('curse', False)
        )
        cards.append(card)
    
    db.session.add_all(cards)
    db.session.commit()
    return cards

def create_default_deck():
    
    user = User.query.filter_by(username="testuser").first()
    if not user:
        
        return
        
    
    existing_deck = Deck.query.filter_by(user_id=user.id).first()
    if existing_deck:
        return
        
    
    default_deck = Deck(
        name="Starter Deck",
        user_id=user.id,
        volume=20
    )
    db.session.add(default_deck)
    db.session.flush()  
    
    guards = Card.query.filter_by(guard=True).limit(5).all()
    thieves = Card.query.filter_by(thief=True).limit(5).all()
    curses = Card.query.filter_by(curse=True).limit(5).all()
    regulars = Card.query.filter(
        ~Card.id.in_([c.id for c in guards + thieves + curses])
    ).limit(5).all()
    
    deck_cards = []
    position = 0
    
    for card in guards + thieves + curses + regulars:
        deck_card = CardInDeck(
            deck_id=default_deck.id,
            card_id=card.id,
            quantity=1
        )
        deck_cards.append(deck_card)
        position += 1
    
    db.session.add_all(deck_cards)
    db.session.commit()
    



if __name__ == "__main__":
    with app.app_context():
       
        db.create_all()
       
        create_users()
        cards = seed_cards_from_json()
        create_default_deck()
        
        print("Seeding completed successfully!")
