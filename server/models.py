from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
    "ix": "ix_%(table_name)s_%(column_0_name)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
})

db = SQLAlchemy(metadata=metadata)





class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    _password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    wallet = db.Column(db.Integer, nullable=False)
    wins = db.Column(db.Integer, default=0)
    
    inventory = db.relationship('Inventory', back_populates='user', cascade='all, delete-orphan')
    decks = db.relationship('Deck', back_populates='user', cascade='all, delete-orphan')
    sent_friend_requests = db.relationship('FriendRequest', foreign_keys='FriendRequest.sender_id', back_populates='sender', cascade='all, delete-orphan')
    received_friend_requests = db.relationship('FriendRequest', foreign_keys='FriendRequest.receiver_id', back_populates='receiver', cascade='all, delete-orphan')
    friends = db.relationship('User', secondary='friend_relationships',
                            primaryjoin='User.id==friend_relationships.c.user_id',
                            secondaryjoin='User.id==friend_relationships.c.friend_id',
                            backref=db.backref('friend_of', lazy='dynamic'),
                            lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'wallet': self.wallet,
            'wins': self.wins,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @validates('wallet')
    def validate_wallet(self, key, wallet):
        
        try:
            
            if wallet is None:
                if self.id is None:
                    
                    return 100
                elif wallet == 0:
                    
                    return 0
            
            wallet_int = int(wallet)
            
            if wallet_int < 0:
                
                return 0
            
            return wallet_int
            
        except (ValueError, TypeError) as e:
            print(f"Error converting wallet: {e}, setting to 0")
            return 0  # Set to 0 on conversion error
    
    @validates('username')
    def validate_username(self, key, username):
        if not username or len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")
        return username
    
    @validates('email')
    def validate_email(self, key, email):
        if not email or '@' not in email:
            raise ValueError("Valid email address required")
        return email
    
    @validates('wins')
    def validate_wins(self, key, wins):
        if wins is None:
            return 0
        try:
            wins_int = int(wins)
            if wins_int < 0:
                return 0
            return wins_int
        except (ValueError, TypeError):
            return 0
    
    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hashes may not be viewed.")
    
    @password_hash.setter
    def password_hash(self, password):
        from werkzeug.security import generate_password_hash
        self._password_hash = generate_password_hash(password)
    
    def authenticate(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self._password_hash, password)





class Card(db.Model, SerializerMixin):
    __tablename__ = 'cards'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    image = db.Column(db.Text, nullable=False)
    power = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Integer, nullable=False)
    thief = db.Column(db.Boolean, default=False)
    guard = db.Column(db.Boolean, default=False)
    curse = db.Column(db.Boolean, default=False)
    
    
    inventories = db.relationship('Inventory', back_populates='card')
    cards_in_deck = db.relationship('CardInDeck', back_populates='card')
    
    serialize_rules = ('-inventories', '-cards_in_deck')
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name) < 1:
            raise ValueError("Card name cannot be empty")
        return name
    



class Inventory(db.Model, SerializerMixin):
    __tablename__ = 'inventories'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    card_id = db.Column(db.Integer, db.ForeignKey('cards.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    
    
    user = db.relationship('User', back_populates='inventory')
    card = db.relationship('Card', back_populates='inventories')
    
    
    serialize_rules = ('-user', '-card.inventories')
    
    @validates('quantity')
    def validate_quantity(self, key, quantity):
        if quantity < 0:
            raise ValueError("Quantity cannot be negative")
        return quantity





class Deck(db.Model, SerializerMixin):
    __tablename__ = 'decks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    volume = db.Column(db.Integer, default=20)
    
    
    user = db.relationship('User', back_populates='decks')
    cards_in_deck = db.relationship('CardInDeck', back_populates='deck', cascade='all, delete-orphan')
    
    serialize_rules = ('-user', '-cards_in_deck.deck')
    
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name) < 3:
            raise ValueError("Deck name must be at least 3 characters long")
        return name
    
    @validates('volume')
    def validate_volume(self, key, value):
        if value < 20:
            raise ValueError("Deck must be 20 cards!")
        return value




class CardInDeck(db.Model, SerializerMixin):
    __tablename__ = 'cards_in_deck'
    
    id = db.Column(db.Integer, primary_key=True)
    deck_id = db.Column(db.Integer, db.ForeignKey('decks.id'), nullable=False)
    card_id = db.Column(db.Integer, db.ForeignKey('cards.id'), nullable=False)
    quantity = db.Column(db.Integer, default=20)
    

    
    
    deck = db.relationship('Deck', back_populates='cards_in_deck')
    card = db.relationship('Card', back_populates='cards_in_deck')
    
    
    serialize_rules = ('-deck', '-card.cards_in_deck')


    
    


    
    


class FriendRequest(db.Model, SerializerMixin):
    __tablename__ = 'friend_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    sender = db.relationship('User', foreign_keys=[sender_id], back_populates='sent_friend_requests')
    receiver = db.relationship('User', foreign_keys=[receiver_id], back_populates='received_friend_requests')
    
    serialize_rules = ('-sender.password_hash', '-receiver.password_hash')
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender': {
                'id': self.sender.id,
                'username': self.sender.username
            },
            'receiver': {
                'id': self.receiver.id,
                'username': self.receiver.username
            },
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

# Association table for friend relationships
friend_relationships = db.Table('friend_relationships',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('friend_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)


    
    


    
    

