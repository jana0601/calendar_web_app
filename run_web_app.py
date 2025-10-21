#!/usr/bin/env python3
"""
Calendar Web App Launcher
Starts the Flask web application
"""

import webbrowser
import time
import threading
from web_app import app

def open_browser():
    """Open browser after a short delay."""
    time.sleep(1.5)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    print("=" * 50)
    print("Calendar Web App")
    print("=" * 50)
    print("Starting web server...")
    print("The calendar will open in your browser automatically.")
    print("If it doesn't open, go to: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Start browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start Flask app
    app.run(debug=False, host='0.0.0.0', port=5000)
