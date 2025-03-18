#!/usr/bin/env python3

from flask import Flask, request, make_response, jsonify, session
from flask_restful import Api, Resource
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.exceptions import NotFound, Unauthorized
import os
import sys

# Use standard imports, not relative imports
from server.models import db, User
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
        
        try:
            new_user = User(
                username=data['username'],
                email=data['email']
            )
            new_user.password_hash = data['password']
            
            db.session.add(new_user)
            db.session.commit()
            
            session['user_id'] = new_user.id
            
            return new_user.to_dict(), 201
            
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
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
                else:
                    setattr(user, attr, data[attr])
            
            db.session.commit()
            return user.to_dict(), 200
        except Exception as e:
            return {'error': str(e)}, 400
    
    def delete(self, id):
        user = User.query.filter_by(id=id).first()
        if not user:
            return {'error': 'User not found'}, 404
        
        db.session.delete(user)
        db.session.commit()
        
        return {}, 204

class Login(Resource):
    def post(self):
        data = request.get_json()
        
        user = User.query.filter_by(username=data.get('username')).first()
        
        if not user or not user.authenticate(data.get('password')):
            return {'error': 'Invalid username or password'}, 401
        
        session['user_id'] = user.id
        
        return user.to_dict(), 200

class Logout(Resource):
    def delete(self):
        session.clear()
        return {}, 204

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        
        if not user_id:
            return {'error': 'Not authorized'}, 401
            
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return {'error': 'Not authorized'}, 401
            
        return user.to_dict(), 200

# Add resources to API
api.add_resource(Users, '/users')
api.add_resource(UserById, '/users/<int:id>')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(CheckSession, '/check_session')

# Error handlers
@app.errorhandler(NotFound)
def handle_not_found(e):
    return {"error": "Not Found"}, 404

@app.errorhandler(Unauthorized)
def handle_unauthorized(e):
    return {"error": "Unauthorized"}, 401

if __name__ == '__main__':
    app.run(port=5555, debug=True)
