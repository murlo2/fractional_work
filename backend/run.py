#!/usr/bin/env python3
"""
Simple script to run the Flask application
"""
from app import app

if __name__ == '__main__':
    print("Starting Baseball Stats API server...")
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("To seed database: POST http://localhost:5000/api/seed")
    app.run(debug=True, host='0.0.0.0', port=5000)
