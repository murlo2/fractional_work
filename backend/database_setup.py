#!/usr/bin/env python3
"""
Complete database setup script - creates tables and loads data
"""
import requests
import sys
from app import app, db, Player

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
                player = Player(
                    name=player_data.get('Player name', ''),
                    position=player_data.get('position', ''),
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
