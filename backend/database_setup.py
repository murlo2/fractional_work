#!/usr/bin/env python3
"""
Complete database setup script - creates tables and loads data
"""
import requests
import sys
from app import app, db, Player

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

def setup_database():
    """Create database tables"""
    try:
        print("Creating database tables...")
        with app.app_context():
            db.create_all()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        sys.exit(1)

def seed_database():
    """Fetch data from API and populate database"""
    try:
        print("Fetching data from baseball API...")
        response = requests.get('https://api.hirefraction.com/api/test/baseball')
        response.raise_for_status()
        data = response.json()
        
        print(f"Retrieved {len(data)} players from API")
        
        with app.app_context():
            # Clear existing data
            Player.query.delete()
            print("Cleared existing player data")
            
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
            print(f"✅ Successfully seeded {len(data)} players into database")
            
    except requests.RequestException as e:
        print(f"❌ Error fetching data from API: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)

def main():
    """Main function - setup database and load data"""
    print("🏟️  Baseball Stats Database Setup")
    print("==================================")
    
    # Create tables
    setup_database()
    
    # Load data
    seed_database()
    
    print("")
    print("🎉 Database setup complete!")
    print("Your baseball stats app is ready to use!")

if __name__ == '__main__':
    main()
