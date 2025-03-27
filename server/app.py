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
from server.models import db, User, Card, Inventory, Deck, CardInDeck, FriendRequest
from server.config import Config

app = Flask(__name__)
app.config.from_object(Config)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

# Configure CORS
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:3000"],
         "supports_credentials": True,
         "allow_headers": ["Content-Type", "Authorization"],
         "methods": ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
         "expose_headers": ["Content-Type", "Authorization"]
     }})

api = Api(app)



# Define API Resources
class Users(Resource):
    def get(self):
        users = User.query.all()
        print("All users in database:", [(user.id, user.username, user.email) for user in users])
        return [user.to_dict() for user in users], 200
    
    def post(self):
        data = request.get_json()
        
        try:
            if not data.get('username'):
                return {'error': 'Username is required'}, 400
            if not data.get('email'):
                return {'error': 'Email is required'}, 400
            if not data.get('password'):
                return {'error': 'Password is required'}, 400
                
            new_user = User(
                username=data['username'],
                email=data['email'],
                wallet=100  # Set initial wallet value
            )
            
            try:
                new_user.password_hash = data['password']
            except Exception as e:
                print(f"Error setting password: {str(e)}")
                return {'error': f'Password error: {str(e)}'}, 400
            
            db.session.add(new_user)
            
            try:
                db.session.commit()
                
                # Create starter deck
                default_deck = Deck(
                    name="Starter Deck",
                    user_id=new_user.id,
                    volume=20
                )
                db.session.add(default_deck)
                db.session.flush()
                
                # Get starter cards
                guards = Card.query.filter_by(guard=True).limit(5).all()
                thieves = Card.query.filter_by(thief=True).limit(5).all()
                curses = Card.query.filter_by(curse=True).limit(5).all()
                regulars = Card.query.filter(
                    ~Card.id.in_([c.id for c in guards + thieves + curses])
                ).limit(5).all()
                
                deck_cards = []
                inventory_items = []
                
                for card in guards + thieves + curses + regulars:
                    # Add to deck
                    deck_card = CardInDeck(
                        deck_id=default_deck.id,
                        card_id=card.id,
                        quantity=1
                    )
                    deck_cards.append(deck_card)
                    
                    # Add to inventory
                    inventory_item = Inventory(
                        user_id=new_user.id,
                        card_id=card.id,
                        quantity=1
                    )
                    inventory_items.append(inventory_item)
                
                db.session.add_all(deck_cards)
                db.session.add_all(inventory_items)
                db.session.commit()
                
            except Exception as e:
                db.session.rollback()
                print(f"Database commit error: {str(e)}")
                return {'error': f'Database error: {str(e)}'}, 400
            
            session['user_id'] = new_user.id
            
            user_dict = new_user.to_dict()
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
        
        try:
            for attr in data:
                if attr == 'password':
                    user.password_hash = data['password']
                elif attr == 'wallet':
                    wallet_value = int(data['wallet'])
                    user.wallet = wallet_value
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
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        inventory = Inventory.query.filter_by(user_id=user_id).all()
        return [item.to_dict() for item in inventory], 200
    
    def post(self, user_id):
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        
        try:
            
            card = Card.query.filter_by(id=data['card_id']).first()
            if not card:
                return {'error': 'Card not found'}, 404
            
            
            existing_item = Inventory.query.filter_by(
                user_id=user_id, 
                card_id=data['card_id']
            ).first()
            
            if existing_item:
                
                existing_item.quantity += data.get('quantity', 1)
                db.session.commit()
                return existing_item.to_dict(), 200
            else:
            
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
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
            
       
        inventory_item = Inventory.query.filter_by(
            user_id=user_id,
            card_id=card_id
        ).first()
        
        if not inventory_item:
            return {'error': 'Card not found in user inventory'}, 404
            
        return inventory_item.to_dict(), 200
    
    def delete(self, user_id, card_id):
        
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
            
        data = request.get_json() or {}
        quantity = data.get('quantity', 1)
        
        if quantity >= inventory_item.quantity:
           
            db.session.delete(inventory_item)
        else:
            
            inventory_item.quantity -= quantity
            
        db.session.commit()
        
        return {'message': f'Removed {quantity} card(s) from inventory'}, 200

class UserDecks(Resource):
    def get(self, user_id):
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        
        decks = Deck.query.filter_by(user_id=user_id).all()
        return [deck.to_dict() for deck in decks], 200
    
    def post(self, user_id):
        
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
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        return deck.to_dict(), 200
    
    def patch(self, user_id, deck_id):
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        
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
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        db.session.delete(deck)
        db.session.commit()
        
        return {}, 204

class UserDeckCards(Resource):
    def get(self, user_id, deck_id):
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        
        deck_cards = CardInDeck.query.filter_by(deck_id=deck_id).all()
        
        
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
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        
        deck = Deck.query.filter_by(id=deck_id, user_id=user_id).first()
        if not deck:
            return {'error': 'Deck not found'}, 404
        
        data = request.get_json()
        
        try:
            
            card = Card.query.filter_by(id=data['card_id']).first()
            if not card:
                return {'error': 'Card not found'}, 404
            
            
            inventory_item = Inventory.query.filter_by(
                user_id=user_id,
                card_id=data['card_id']
            ).first()
            
            if not inventory_item:
                return {'error': 'Card not found in user inventory'}, 404
            
            
            existing_card = CardInDeck.query.filter_by(
                deck_id=deck_id,
                card_id=data['card_id']
            ).first()
            
            if existing_card:
                
                existing_card.quantity += data.get('quantity', 1)
                db.session.commit()
                
                
                card_data = existing_card.card.to_dict()
                result = {
                    'id': existing_card.id,
                    'deck_id': existing_card.deck_id,
                    'card': card_data,
                    'quantity': existing_card.quantity
                }
                
                return result, 200
            else:
                
                new_card = CardInDeck(
                    deck_id=deck_id,
                    card_id=data['card_id'],
                    quantity=data.get('quantity', 1)
                )
                
                db.session.add(new_card)
                db.session.commit()
                
               
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
        try:
            print("\n=== Login Attempt ===")
            data = request.get_json()
            print("Login data:", data)
            
            if not data or not data.get('email') or not data.get('password'):
                print("Missing email or password")
                return {'error': 'Email and password are required'}, 400
                
            user = User.query.filter_by(email=data['email']).first()
            print(f"User found: {user.username if user else 'None'}")
            
            if not user:
                print("User not found")
                return {'error': 'Invalid email or password'}, 401
            
            print(f"Attempting to authenticate with password: {data['password']}")
            print(f"Stored password hash: {user._password_hash}")
            
            if not user.authenticate(data['password']):
                print("Invalid password")
                return {'error': 'Invalid email or password'}, 401
                
            session['user_id'] = user.id
            print(f"Session created with user_id: {user.id}")
            
            user_dict = user.to_dict()
            print("Login successful")
            return user_dict, 200
            
        except Exception as e:
            print(f"Login error: {str(e)}")
            import traceback
            print("Traceback:", traceback.format_exc())
            return {'error': str(e)}, 500

class UserFriends(Resource):
    def get(self, user_id):
        try:
            print(f"Fetching friends for user {user_id}")
            user = User.query.get_or_404(user_id)
            print(f"Found user: {user.username}")
            
            received_requests = FriendRequest.query.filter_by(
                receiver_id=user_id,
                status='pending'
            ).all()
            print(f"Found {len(received_requests)} pending friend requests")
            
            # Convert friends to dict manually to avoid serialization issues
            friends_dict = []
            for friend in user.friends:
                try:
                    friend_dict = {
                        'id': friend.id,
                        'username': friend.username,
                        'email': friend.email
                    }
                    friends_dict.append(friend_dict)
                except Exception as e:
                    print(f"Error serializing friend {friend.id}: {str(e)}")
                    continue
            
            print(f"Found {len(friends_dict)} friends")
            
            return {
                'received_requests': [request.to_dict() for request in received_requests],
                'friends': friends_dict
            }, 200
            
        except Exception as e:
            print(f"Error in UserFriends.get: {str(e)}")
            return {'error': str(e)}, 500

class UserFriendRequests(Resource):
    def post(self, user_id):
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        receiver_username = data.get('username')
        
        if not receiver_username:
            return {'error': 'Username is required'}, 400
            
        receiver = User.query.filter_by(username=receiver_username).first()
        if not receiver:
            return {'error': 'User not found'}, 404
            
        if receiver.id == user_id:
            return {'error': 'Cannot send friend request to yourself'}, 400
            
        # Check if request already exists
        existing_request = FriendRequest.query.filter(
            ((FriendRequest.sender_id == user_id) & (FriendRequest.receiver_id == receiver.id)) |
            ((FriendRequest.sender_id == receiver.id) & (FriendRequest.receiver_id == user_id))
        ).first()
        
        if existing_request:
            return {'error': 'Friend request already exists'}, 400
            
        # Check if already friends
        if receiver in user.friends:
            return {'error': 'Already friends with this user'}, 400
            
        friend_request = FriendRequest(
            sender_id=user_id,
            receiver_id=receiver.id,
            status='pending'
        )
        
        db.session.add(friend_request)
        db.session.commit()
        
        return friend_request.to_dict(), 201

class UserFriendRequestResponse(Resource):
    def post(self, user_id, request_id):
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        action = data.get('action')
        
        if action not in ['accept', 'reject']:
            return {'error': 'Invalid action'}, 400
            
        friend_request = FriendRequest.query.get_or_404(request_id)
        
        if friend_request.receiver_id != user_id:
            return {'error': 'Not authorized'}, 403
            
        if friend_request.status != 'pending':
            return {'error': 'Request already processed'}, 400
            
        if action == 'accept':
            friend_request.status = 'accepted'
            # Add to friends list
            friend = User.query.get(friend_request.sender_id)
            user.friends.append(friend)
            friend.friends.append(user)
            
        else:  # reject
            friend_request.status = 'rejected'
            
        db.session.commit()
        return friend_request.to_dict(), 200

api.add_resource(UserDeckCards, '/users/<int:user_id>/decks/<int:deck_id>/cards')
api.add_resource(UserDeckById, '/users/<int:user_id>/decks/<int:deck_id>')
api.add_resource(UserDecks, '/users/<int:user_id>/decks')
api.add_resource(UserInventoryCard, '/users/<int:user_id>/inventory/<int:card_id>')
api.add_resource(UserInventory, '/users/<int:user_id>/inventory')
api.add_resource(UserById, '/users/<int:id>')
api.add_resource(Users, '/users')
api.add_resource(CardById, '/cards/<int:id>')
api.add_resource(Cards, '/cards')
api.add_resource(Login, '/auth/login')
api.add_resource(UserFriends, '/users/<int:user_id>/friends')
api.add_resource(UserFriendRequests, '/users/<int:user_id>/friend-requests')
api.add_resource(UserFriendRequestResponse, '/users/<int:user_id>/friend-requests/<int:request_id>/response')

# Add debug route handler
@app.before_request
def log_request_info():
    print('\n=== New Request ===')
    print('URL:', request.url)
    print('Method:', request.method)
    print('Headers:', dict(request.headers))
    print('Body:', request.get_data())
    print('================\n')

@app.after_request
def log_response_info(response):
    print('\n=== Response ===')
    print('Status:', response.status)
    print('Headers:', dict(response.headers))
    print('================\n')
    return response

if __name__ == '__main__':
    app.run(port=5555, debug=True)
