from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(20))
    games = db.Column(db.Integer, default=0)
    at_bat = db.Column(db.Integer, default=0)
    runs = db.Column(db.Integer, default=0)
    hits = db.Column(db.Integer, default=0)
    double_2b = db.Column(db.Integer, default=0)
    third_baseman = db.Column(db.Integer, default=0)
    home_runs = db.Column(db.Integer, default=0)
    rbi = db.Column(db.Integer, default=0)
    walks = db.Column(db.Integer, default=0)
    strikeouts = db.Column(db.Integer, default=0)
    stolen_bases = db.Column(db.Integer, default=0)
    caught_stealing = db.Column(db.Integer, default=0)
    batting_average = db.Column(db.Float)
    on_base_percentage = db.Column(db.Float)
    slugging_percentage = db.Column(db.Float)
    on_base_plus_slugging = db.Column(db.Float)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        # Calculate HitsPerGame on the fly
        hits_per_game = round(self.hits / self.games, 3) if self.games > 0 else 0.0
        
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'games': self.games,
            'at_bat': self.at_bat,
            'runs': self.runs,
            'hits': self.hits,
            'double_2b': self.double_2b,
            'third_baseman': self.third_baseman,
            'home_runs': self.home_runs,
            'rbi': self.rbi,
            'walks': self.walks,
            'strikeouts': self.strikeouts,
            'stolen_bases': self.stolen_bases,
            'caught_stealing': self.caught_stealing,
            'batting_average': self.batting_average,
            'on_base_percentage': self.on_base_percentage,
            'slugging_percentage': self.slugging_percentage,
            'on_base_plus_slugging': self.on_base_plus_slugging,
            'hits_per_game': hits_per_game,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Player {self.name}>'
