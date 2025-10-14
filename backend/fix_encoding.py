#!/usr/bin/env python3
"""
Script to fix character encoding issues in player names
Replaces accented characters with their English equivalents
"""

from app import app, db, Player

def fix_player_names():
    """Fix accented characters in player names"""
    
    # Character mapping for common accented characters
    char_mapping = {
        'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a', 'ã': 'a',
        'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
        'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
        'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'õ': 'o',
        'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
        'ñ': 'n', 'ç': 'c',
        'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A', 'Ã': 'A',
        'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E',
        'Í': 'I', 'Ì': 'I', 'Ï': 'I', 'Î': 'I',
        'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O', 'Õ': 'O',
        'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U',
        'Ñ': 'N', 'Ç': 'C'
    }
    
    with app.app_context():
        # Get all players
        players = Player.query.all()
        updated_count = 0
        
        print("🔧 Fixing character encoding in player names...")
        print("=" * 50)
        
        for player in players:
            original_name = player.name
            fixed_name = original_name
            
            # Replace accented characters
            for accented, replacement in char_mapping.items():
                fixed_name = fixed_name.replace(accented, replacement)
            
            # Only update if the name changed
            if fixed_name != original_name:
                print(f"Fixing: '{original_name}' → '{fixed_name}'")
                player.name = fixed_name
                updated_count += 1
        
        if updated_count > 0:
            db.session.commit()
            print(f"\n✅ Successfully fixed {updated_count} player names!")
        else:
            print("\n✅ No character encoding issues found.")
        
        print("\n📊 Sample of fixed names:")
        print("-" * 30)
        
        # Show some examples of the fixes
        sample_players = Player.query.filter(
            Player.name.in_(['A Beltran', 'C Beltran', 'E Encarnacion', 'J Baez', 'P Alvarez', 'M Sano'])
        ).all()
        
        for player in sample_players:
            print(f"✅ {player.name}")

if __name__ == '__main__':
    print("🏟️  Baseball Stats - Character Encoding Fix")
    print("=" * 50)
    fix_player_names()
    print("\n🎉 Character encoding fix complete!")
