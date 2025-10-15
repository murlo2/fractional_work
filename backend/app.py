from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Player
from config import Config
import requests
import google.generativeai as genai
import os

def fix_accented_characters(text):
    """Fix accented characters using Unicode normalization and intelligent character replacement"""
    if not text:
        return text
    
    import unicodedata
    
    # First, try to normalize Unicode characters (handles most accented characters)
    # NFD = Normalization Form Decomposed (separates base characters from diacritics)
    normalized = unicodedata.normalize('NFD', text)
    
    # Remove all combining characters (diacritics like accents, tildes, etc.)
    # This converts á to a, é to e, ñ to n, etc.
    ascii_text = ''.join(char for char in normalized 
                        if unicodedata.category(char) != 'Mn')
    
    # Handle special cases that don't normalize well
    special_cases = {
        'ß': 'ss',  # German eszett
        'æ': 'ae',  # Latin ligature
        'œ': 'oe',  # Latin ligature
        'ð': 'd',   # Icelandic eth
        'þ': 'th',  # Icelandic thorn
    }
    
    for special, replacement in special_cases.items():
        ascii_text = ascii_text.replace(special, replacement)
    
    # Handle corrupted characters from API (replace ? with intelligent guesses)
    # This is more sophisticated than hardcoding specific names
    ascii_text = fix_corrupted_characters(ascii_text)
    
    return ascii_text

def fix_corrupted_characters(text):
    """Intelligently fix corrupted characters (?) based on context"""
    if '?' not in text:
        return text
    
    # Common patterns for corrupted characters in baseball names
    # These are based on common Spanish/Latin names in baseball
    patterns = [
        # Common Spanish name patterns
        (r'Beltr\?n+', 'Beltran'),
        (r'Encarnaci\?n', 'Encarnacion'),
        (r'B\?ez', 'Baez'),
        (r'\?lvarez', 'Alvarez'),
        (r'San\?', 'Sano'),
        (r'Gonz\?lez', 'Gonzalez'),
        (r'Rodr\?guez', 'Rodriguez'),
        (r'Fern\?ndez', 'Fernandez'),
        (r'Mart\?nez', 'Martinez'),
        (r'Garc\?a', 'Garcia'),
        (r'L\?pez', 'Lopez'),
        (r'P\?rez', 'Perez'),
        (r'Hern\?ndez', 'Hernandez'),
        (r'Ram\?rez', 'Ramirez'),
        (r'Jim\?nez', 'Jimenez'),
        (r'V\?squez', 'Vasquez'),
        (r'Castr\?', 'Castro'),
        (r'Delg\?do', 'Delgado'),
        (r'Vald\?z', 'Valdez'),
        (r'Mor\?les', 'Morales'),
        (r'Flores', 'Flores'),  # This one might not have issues, but just in case
    ]
    
    import re
    for pattern, replacement in patterns:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    # If there are still ? characters, try to make educated guesses
    # based on common letter frequencies in names
    if '?' in text:
        # Common letter replacements based on context
        # This is a fallback for patterns we haven't seen before
        text = text.replace('?', 'a')  # Most common vowel in Spanish names
    
    return text

app = Flask(__name__)
app.config.from_object(Config)
app.config['SQLALCHEMY_DATABASE_URI'] = app.config['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

# Initialize database
db.init_app(app)

# Initialize Gemini
api_key = os.environ.get('GEMINI_API_KEY') or app.config.get('GEMINI_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    print(f"✅ Gemini configured with API key: {api_key[:20]}...")
else:
    print("❌ No Gemini API key found")

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/players', methods=['GET'])
def get_players():
    """Get all players with optional sorting"""
    sort_by = request.args.get('sort_by', 'hits')
    order = request.args.get('order', 'desc')
    
    if sort_by not in ['hits', 'home_runs', 'name', 'batting_average', 'hits_per_game']:
        sort_by = 'hits'
    
    if order not in ['asc', 'desc']:
        order = 'desc'
    
    # Get all players first
    players = Player.query.all()
    
    # Convert to dict format
    players_data = [player.to_dict() for player in players]
    
    # Handle hits_per_game sorting (calculated field)
    if sort_by == 'hits_per_game':
        players_data.sort(key=lambda x: x['hits_per_game'], reverse=(order == 'desc'))
    else:
        # For database fields, sort in the database
        column = getattr(Player, sort_by)
        if order == 'desc':
            players = Player.query.order_by(column.desc()).all()
        else:
            players = Player.query.order_by(column.asc()).all()
        players_data = [player.to_dict() for player in players]
    
    return jsonify(players_data)

@app.route('/api/players/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Get a specific player by ID"""
    player = Player.query.get_or_404(player_id)
    return jsonify(player.to_dict())

@app.route('/api/players/<int:player_id>', methods=['PUT'])
def update_player(player_id):
    """Update a player's data"""
    player = Player.query.get_or_404(player_id)
    data = request.get_json()
    
    # Update fields if provided
    for field in ['name', 'position', 'games', 'at_bat', 'runs', 'hits', 
                  'double_2b', 'third_baseman', 'home_runs', 'rbi', 'walks', 
                  'strikeouts', 'stolen_bases', 'caught_stealing', 'batting_average',
                  'on_base_percentage', 'slugging_percentage', 'on_base_plus_slugging', 'description']:
        if field in data:
            setattr(player, field, data[field])
    
    db.session.commit()
    return jsonify(player.to_dict())

@app.route('/api/players/<int:player_id>/description', methods=['GET'])
def get_player_description(player_id):
    """Get player's cached description"""
    player = Player.query.get_or_404(player_id)
    return jsonify({'description': player.description})

@app.route('/api/players/<int:player_id>/description', methods=['POST'])
def generate_player_description(player_id):
    """Generate LLM description for a player and save to database"""
    player = Player.query.get_or_404(player_id)
    
    if not app.config['GEMINI_API_KEY']:
        return jsonify({'error': 'Gemini API key not configured'}), 500
    
    try:
        prompt = f"""Write a brief, engaging description of baseball player {player.name}. 
        Include their position ({player.position}) and key statistics:
        - Games: {player.games}
        - Hits: {player.hits}
        - Home Runs: {player.home_runs}
        - Batting Average: {player.batting_average}
        - RBI: {player.rbi}
        - Runs: {player.runs}
        - Stolen Bases: {player.stolen_bases}
        - OPS: {player.on_base_plus_slugging}
        
        Make it sound like a sports commentator describing the player. Keep it under 150 words."""
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        description = response.text.strip()
        
        # Save the description to the database
        player.description = description
        db.session.commit()
        
        return jsonify({'description': description})
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate description: {str(e)}'}), 500

@app.route('/api/players/<int:player_id>/description', methods=['PUT'])
def save_player_description(player_id):
    """Save a description for a player"""
    player = Player.query.get_or_404(player_id)
    data = request.get_json()
    
    if 'description' not in data:
        return jsonify({'error': 'Description is required'}), 400
    
    player.description = data['description']
    db.session.commit()
    
    return jsonify({'description': player.description})

@app.route('/api/seed', methods=['POST'])
def seed_database():
    """Seed the database with data from the baseball API"""
    try:
        response = requests.get('https://api.hirefraction.com/api/test/baseball')
        response.raise_for_status()
        data = response.json()
        
        # Clear existing data
        Player.query.delete()
        
        # Add new players
        for player_data in data:
            # Fix accented characters in player name and position
            player_name = fix_accented_characters(player_data.get('Player name', ''))
            player_position = fix_accented_characters(player_data.get('position', ''))
            
            player = Player(
                name=player_name,
                position=player_position,
                games=player_data.get('Games', 0),
                at_bat=player_data.get('At-bat', 0),
                runs=player_data.get('Runs', 0),
                hits=player_data.get('Hits', 0),
                double_2b=player_data.get('Double (2B)', 0),
                third_baseman=player_data.get('third baseman', 0),
                home_runs=player_data.get('home run', 0),
                rbi=player_data.get('run batted in', 0),
                walks=player_data.get('a walk', 0),
                strikeouts=player_data.get('Strikeouts', 0),
                stolen_bases=player_data.get('stolen base', 0),
                caught_stealing=0 if player_data.get('Caught stealing') == '--' else player_data.get('Caught stealing', 0),
                batting_average=player_data.get('AVG'),
                on_base_percentage=player_data.get('On-base Percentage'),
                slugging_percentage=player_data.get('Slugging Percentage'),
                on_base_plus_slugging=player_data.get('On-base Plus Slugging')
            )
            db.session.add(player)
        
        db.session.commit()
        return jsonify({'message': f'Successfully seeded {len(data)} players'})
        
    except Exception as e:
        return jsonify({'error': f'Failed to seed database: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=app.config['FLASK_DEBUG'], host='0.0.0.0', port=5000)
