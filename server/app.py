#!/usr/bin/env python3

from flask import Flask, request, make_response, jsonify, session
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.exceptions import NotFound, Unauthorized
import os
import sys

# Add the parent directory to sys.path to enable absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Use absolute imports
from server.models import db, User, Card, Inventory, Deck, CardInDeck
from server.config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)
api = Api(app)

# Define API Resources
class Users(Resource):
    def get(self):
        users = User.query.all()
        return [user.to_dict() for user in users], 200
    
    def post(self):
        data = request.get_json()
        print("Received user creation data:", data)
        
        try:
            # Check that required fields are present
            if not data.get('username'):
                return {'error': 'Username is required'}, 400
            if not data.get('email'):
                return {'error': 'Email is required'}, 400
            if not data.get('password'):
                return {'error': 'Password is required'}, 400
                
            new_user = User(
                username=data['username'],
                email=data['email']
            )
            
            # Handle password setting
            try:
                new_user.password_hash = data['password']
            except Exception as e:
                print(f"Error setting password: {str(e)}")
                return {'error': f'Password error: {str(e)}'}, 400
            
            # Let the validator handle the initial wallet value
            print("Adding user to database session")
            db.session.add(new_user)
            
            try:
                print("Committing to database")
                db.session.commit()
                
                # Verify wallet was set
                print(f"User created with wallet: {new_user.wallet}")
                
                print(f"User created successfully with ID: {new_user.id}")
            except Exception as e:
                db.session.rollback()
                print(f"Database commit error: {str(e)}")
                return {'error': f'Database error: {str(e)}'}, 400
            
            session['user_id'] = new_user.id
            
            user_dict = new_user.to_dict()
            print("Returning user data:", user_dict)
            return user_dict, 201
            
        except ValueError as e:
            print(f"ValueError in user creation: {str(e)}")
            return {'error': str(e)}, 400
        except Exception as e:
            print(f"Exception in user creation: {str(e)}")
            return {'error': str(e)}, 400

class UserById(Resource):
    def get(self, id):
        user = User.query.filter_by(id=id).first()
        if not user:
            return {'error': 'User not found'}, 404
        return user.to_dict(), 200
    
    def patch(self, id):
        user = User.query.filter_by(id=id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        print(f"PATCH request for user {id}, data:", data)
        
        try:
            for attr in data:
                if attr == 'password':
                    user.password_hash = data['password']
                elif attr == 'wallet':
                    # Handle wallet updates through the validator
                    print(f"Updating wallet from {user.wallet} to {data['wallet']}")
                    # Convert to int first to ensure proper validation
                    wallet_value = int(data['wallet'])
                    user.wallet = wallet_value
                    print(f"Wallet after update: {user.wallet}")
                else:
                    setattr(user, attr, data[attr])
            
            db.session.commit()
            return user.to_dict(), 200
        except Exception as e:
            print(f"Error in PATCH: {str(e)}")
            return {'error': str(e)}, 400
    
    def delete(self, id):
        user = User.query.filter_by(id=id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        db.session.delete(user)
        db.session.commit()
        
        return {}, 204

class Cards(Resource):
    def get(self):
        cards = Card.query.all()
        return [card.to_dict() for card in cards], 200
    
    

class CardById(Resource):
    def get(self, id):
        card = Card.query.filter_by(id=id).first()
        if not card:
            return {'error': 'Card not found'}, 404
        return card.to_dict(), 200
    

class UserInventory(Resource):
    def get(self, user_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Get all inventory items for the user
        inventory = Inventory.query.filter_by(user_id=user_id).all()
        return [item.to_dict() for item in inventory], 200
    
    def post(self, user_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        
        try:
            # Check if card exists
            card = Card.query.filter_by(id=data['card_id']).first()
            if not card:
                return {'error': 'Card not found'}, 404
            
            # Check if card is already in inventory
            existing_item = Inventory.query.filter_by(
                user_id=user_id, 
                card_id=data['card_id']
            ).first()
            
            if existing_item:
                # Update quantity
                existing_item.quantity += data.get('quantity', 1)
                db.session.commit()
                return existing_item.to_dict(), 200
            else:
                # Create new inventory item
                new_item = Inventory(
                    user_id=user_id,
                    card_id=data['card_id'],
                    quantity=data.get('quantity', 1)
                )
                
                db.session.add(new_item)
                db.session.commit()
                
                return new_item.to_dict(), 201
                
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': str(e)}, 400


class UserInventoryCard(Resource):
    def get(self, user_id, card_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
            
        # Find the specific inventory item
        inventory_item = Inventory.query.filter_by(
            user_id=user_id,
            card_id=card_id
        ).first()
        
        if not inventory_item:
            return {'error': 'Card not found in user inventory'}, 404
            
        return inventory_item.to_dict(), 200
    
    def delete(self, user_id, card_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
            
        # Check if the inventory item exists
        inventory_item = Inventory.query.filter_by(
            user_id=user_id,
            card_id=card_id
        ).first()
        
        if not inventory_item:
            return {'error': 'Card not found in user inventory'}, 404
            
        # Check quantity parameter
        data = request.get_json() or {}
        quantity = data.get('quantity', 1)
        
        if quantity >= inventory_item.quantity:
            # Remove the item completely
            db.session.delete(inventory_item)
        else:
            # Reduce the quantity
            inventory_item.quantity -= quantity
            
        db.session.commit()
        
        return {'message': f'Removed {quantity} card(s) from inventory'}, 200

class UserDecks(Resource):
    def get(self, user_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Get all decks for the user
        decks = Deck.query.filter_by(user_id=user_id).all()
        return [deck.to_dict() for deck in decks], 200
    
    def post(self, user_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        
        try:
            new_deck = Deck(
                name=data['name'],
                user_id=user_id,
                volume=data.get('volume', 20)
            )
            
            db.session.add(new_deck)
            db.session.commit()
            
            return new_deck.to_dict(), 201
            
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': str(e)}, 400

class UserDeckById(Resource):
    def get(self, user_id, deck_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Check if deck exists and belongs to user
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        return deck.to_dict(), 200
    
    def patch(self, user_id, deck_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Check if deck exists and belongs to user
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        data = request.get_json()
        
        try:
            for attr in data:
                setattr(deck, attr, data[attr])
            
            db.session.commit()
            return deck.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400
    
    def delete(self, user_id, deck_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Check if deck exists and belongs to user
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        db.session.delete(deck)
        db.session.commit()
        
        return {}, 204

class UserDeckCards(Resource):
    def get(self, user_id, deck_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Check if deck exists and belongs to user
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        # Get all cards in the deck
        deck_cards = CardInDeck.query.filter_by(deck_id=deck_id).all()
        
        # Manually construct response to avoid circular references
        result = []
        for deck_card in deck_cards:
            card_data = deck_card.card.to_dict()
            result.append({
                'id': deck_card.id,
                'deck_id': deck_card.deck_id,
                'card': card_data,
                'quantity': deck_card.quantity
            })
        
        return result, 200
    
    def post(self, user_id, deck_id):
        # Check if user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        # Check if deck exists and belongs to user
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        data = request.get_json()
        
        try:
            # Check if card exists
            card = Card.query.filter_by(id=data['card_id']).first()
            if not card:
                return {'error': 'Card not found'}, 404
            
            # Check if user has this card in inventory
            inventory_item = Inventory.query.filter_by(
                user_id=user_id,
                card_id=data['card_id']
            ).first()
            
            if not inventory_item:
                return {'error': 'Card not found in user inventory'}, 404
            
            # Check if card is already in deck
            existing_card = CardInDeck.query.filter_by(
                deck_id=deck_id,
                card_id=data['card_id']
            ).first()
            
            if existing_card:
                # Update quantity
                existing_card.quantity += data.get('quantity', 1)
                db.session.commit()
                
                # Construct response
                card_data = existing_card.card.to_dict()
                result = {
                    'id': existing_card.id,
                    'deck_id': existing_card.deck_id,
                    'card': card_data,
                    'quantity': existing_card.quantity
                }
                
                return result, 200
            else:
                # Create new card in deck
                new_card = CardInDeck(
                    deck_id=deck_id,
                    card_id=data['card_id'],
                    quantity=data.get('quantity', 1)
                )
                
                db.session.add(new_card)
                db.session.commit()
                
                # Construct response
                card_data = new_card.card.to_dict()
                result = {
                    'id': new_card.id,
                    'deck_id': new_card.deck_id,
                    'card': card_data,
                    'quantity': new_card.quantity
                }
                
                return result, 201
                
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': str(e)}, 400

class Login(Resource):
    def post(self):
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return {'error': 'Email and password are required'}, 400
            
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return {'error': 'Invalid email or password'}, 401
            
        # Check password
        if not user.authenticate(data['password']):
            return {'error': 'Invalid email or password'}, 401
            
        # Set user in session
        session['user_id'] = user.id
        
        return user.to_dict(), 200

# Add resources to API
api.add_resource(Login, '/auth/login')
api.add_resource(UserDeckCards, '/users/<int:user_id>/decks/<int:deck_id>/cards')
api.add_resource(UserDeckById, '/users/<int:user_id>/decks/<int:deck_id>')
api.add_resource(UserDecks, '/users/<int:user_id>/decks')
api.add_resource(UserInventoryCard, '/users/<int:user_id>/inventory/<int:card_id>')
api.add_resource(UserInventory, '/users/<int:user_id>/inventory')
api.add_resource(Users, '/users')
api.add_resource(UserById, '/users/<int:id>')
api.add_resource(Cards, '/cards')
api.add_resource(CardById, '/cards/<int:id>')

# Error handlers
@app.errorhandler(NotFound)
def handle_not_found(e):
    return {"error": "Not Found"}, 404

@app.errorhandler(Unauthorized)
def handle_unauthorized(e):
    return {"error": "Unauthorized"}, 401

if __name__ == '__main__':
    app.run(port=5555, debug=True)
