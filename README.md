# Mythos: Epic Card Battle Game 🐉⚔️

Mythos is an immersive card battle game that combines strategic gameplay with mythical creatures and powerful abilities. Players build their decks, collect rare cards, and battle against AI opponents in an epic arena setting.

## 🌟 Features

- **Strategic Card Battles**: Engage in intense 1v1 battles with AI opponents
- **Unique Card Mechanics**:
  - Guard Cards: Defensive units that can block attacks and protect adjacent lanes
  - Thief Cards: Stealthy units that bypass enemy defenses
  - Curse Cards: Powerful cards that deal damage even when destroyed
- **Dynamic Economy System**:
  - Earn gems through victories
  - Purchase new cards from the marketplace
  - Welcome gift of 100 gems for new players
- **Deck Building**:
  - Customize your deck with 20 cards
  - Balance your strategy between attack and defense
  - Collect and trade rare cards
- **User-Friendly Interface**:
  - Modern, responsive design
  - Real-time battle animations
  - Detailed game statistics and analytics
- **Progressive System**:
  - Start with a balanced starter deck
  - Unlock new cards through gameplay
  - Build your collection over time

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 14.0 or higher
- SQLite3

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mythos.git
cd mythos
```

2. Set up the backend:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py
```

3. Set up the frontend:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the backend server (from the server directory):
```bash
flask run -p 5555
```

2. Start the frontend development server (from the client directory):
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## 🎮 Gameplay

### Basic Rules

- Each player starts with 100 Life Points
- Players take turns playing cards from their hand
- Cards can attack enemy cards or directly target the opponent
- Special abilities (Guard, Thief, Curse) add strategic depth to battles
- Victory is achieved by reducing the opponent's Life Points to 0

### Special Card Abilities

- **Guard Cards**: Can block attacks from adjacent lanes and are able to block thief cards
- **Thief Cards**: Bypass enemy defenses to deal direct damage
- **Curse Cards**: Deal damage to the opponent when destroyed

## 🛠️ Technical Stack

- **Frontend**: React.js with modern CSS animations
- **Backend**: Python Flask with SQLAlchemy
- **Database**: SQLite with custom models for cards, decks, and user data
- **Authentication**: Secure user sessions with password hashing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Card artwork sourced from google and AI generated images, card designs created by myself in Adobe PS
- Special thanks to Isabelle Amorello for her unwavering support
- Built with passion for the glory of all nerds
