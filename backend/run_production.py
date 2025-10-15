#!/usr/bin/env python3
"""
Production server runner for Baseball Stats App
Uses Gunicorn WSGI server for production deployment
"""

import os
import sys
from app import app

if __name__ == '__main__':
    # Production configuration
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 Starting Baseball Stats API server in {'DEBUG' if debug else 'PRODUCTION'} mode...")
    print(f"📡 Server will be available at: http://{host}:{port}")
    print(f"🔍 Health check: http://{host}:{port}/api/health")
    print(f"🌱 To seed database: POST http://{host}:{port}/api/seed")
    
    # For production, use Gunicorn (installed via requirements.txt)
    if not debug and os.environ.get('USE_GUNICORN', 'true').lower() == 'true':
        try:
            import gunicorn.app.wsgiapp as wsgi
            sys.argv = [
                'gunicorn',
                '--bind', f'{host}:{port}',
                '--workers', '4',
                '--worker-class', 'sync',
                '--worker-connections', '1000',
                '--max-requests', '1000',
                '--max-requests-jitter', '100',
                '--timeout', '30',
                '--keep-alive', '2',
                '--preload',
                '--access-logfile', '-',
                '--error-logfile', '-',
                '--log-level', 'info',
                'app:app'
            ]
            wsgi.run()
        except ImportError:
            print("⚠️  Gunicorn not available, falling back to Flask development server")
            app.run(debug=debug, host=host, port=port)
    else:
        # Development server
        app.run(debug=debug, host=host, port=port)
