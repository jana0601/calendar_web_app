#!/usr/bin/env python3
"""
Calendar Web App - Main Entry Point
Web-based calendar with event tracking, holiday support, timezone selection,
daily notes, and built-in calculators.
"""

import os
import sys
from flask import Flask, render_template, request, jsonify, redirect, url_for
from datetime import datetime, date, timedelta
import json

# Add project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db_manager import DatabaseManager
from utils.holiday_manager import HolidayManager
from utils.timezone_manager import TimezoneManager

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Initialize managers
db_manager = DatabaseManager()
db_manager.initialize_database()
holiday_manager = HolidayManager()
timezone_manager = TimezoneManager()

@app.route('/')
def index():
    """Main calendar page."""
    return render_template('calendar.html')

@app.route('/api/events')
def get_events():
    """Get events for a specific month."""
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    
    if not year or not month:
        return jsonify({'error': 'Year and month required'}), 400
    
    # Create date range for the month
    from datetime import datetime
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    events = db_manager.get_events(start_date, end_date)
    
    # Convert to JSON serializable format
    events_json = []
    for event in events:
        events_json.append({
            'id': event.id,
            'title': event.title,
            'description': event.description or '',
            'start_date': event.start_time.isoformat(),
            'end_date': event.end_time.isoformat() if event.end_time else event.start_time.isoformat(),
            'category': event.category,
            'recurrence': event.recurrence
        })
    
    return jsonify(events_json)

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new event."""
    data = request.get_json()
    
    try:
        from datetime import datetime
        
        # Parse dates - handle different formats
        start_date_str = data['start_date']
        if 'T' in start_date_str:
            start_time = datetime.fromisoformat(start_date_str.replace('Z', ''))
        else:
            start_time = datetime.fromisoformat(start_date_str + 'T00:00:00')
        
        end_time = None
        if data.get('end_date'):
            end_date_str = data['end_date']
            if 'T' in end_date_str:
                end_time = datetime.fromisoformat(end_date_str.replace('Z', ''))
            else:
                end_time = datetime.fromisoformat(end_date_str + 'T00:00:00')
        
        event = db_manager.create_event(
            title=data['title'],
            description=data.get('description', ''),
            start_time=start_time,
            end_time=end_time,
            category=data.get('category', 'General')
        )
        
        if event:
            # Create event data using the input data to avoid session binding issues
            event_data = {
                'id': event.id,
                'title': data['title'],
                'description': data.get('description', ''),
                'start_date': start_time.isoformat(),
                'end_date': end_time.isoformat() if end_time else start_time.isoformat(),
                'category': data.get('category', 'General'),
                'recurrence': None  # Default value since we're not using recurrence yet
            }
            return jsonify({
                'success': True, 
                'event': event_data
            })
        else:
            return jsonify({'error': 'Failed to create event'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    """Update an existing event."""
    data = request.get_json()
    
    try:
        # Parse the data and convert to proper format
        from datetime import datetime
        
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title']
        if 'description' in data:
            update_data['description'] = data['description']
        if 'start_date' in data:
            # Convert ISO string to datetime
            start_date_str = data['start_date']
            if 'T' in start_date_str:
                update_data['start_time'] = datetime.fromisoformat(start_date_str.replace('Z', ''))
            else:
                update_data['start_time'] = datetime.strptime(start_date_str, '%Y-%m-%d')
        if 'category' in data:
            update_data['category'] = data['category']
        
        event = db_manager.update_event(event_id, **update_data)
        if event:
            # Create event data using the input data to avoid session binding issues
            event_data = {
                'id': event_id,
                'title': update_data.get('title', data.get('title', '')),
                'description': update_data.get('description', data.get('description', '')),
                'start_date': update_data.get('start_time', data.get('start_date', '')).isoformat() if 'start_time' in update_data else data.get('start_date', ''),
                'category': update_data.get('category', data.get('category', 'General'))
            }
            return jsonify({'success': True, 'event': event_data})
        else:
            return jsonify({'error': 'Event not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event."""
    try:
        db_manager.delete_event(event_id)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/holidays')
def get_holidays():
    """Get holidays for a specific month."""
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    countries = request.args.getlist('countries')
    
    if not year or not month:
        return jsonify({'error': 'Year and month required'}), 400
    
    if not countries:
        countries = ['US', 'DE']  # Default to US and Germany
    
    holidays = holiday_manager.get_holidays_for_month(year, month, countries)
    
    # Convert to JSON serializable format
    holidays_json = {}
    for holiday_date, holiday_names in holidays.items():
        holidays_json[holiday_date.isoformat()] = holiday_names
    
    return jsonify(holidays_json)

@app.route('/api/notes')
def get_notes():
    """Get notes for a specific date."""
    date_str = request.args.get('date')
    
    if not date_str:
        return jsonify({'error': 'Date required'}), 400
    
    try:
        note_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        notes = db_manager.get_notes_for_date(note_date)
        
        # Return all notes for the date
        notes_data = []
        for note in notes:
            notes_data.append({
                'id': note.id,
                'content': note.content,
                'created_at': note.created_at.isoformat(),
                'updated_at': note.updated_at.isoformat()
            })
        
        return jsonify({'notes': notes_data})
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

@app.route('/api/notes', methods=['POST'])
def save_note():
    """Save a note for a specific date."""
    data = request.get_json()
    
    try:
        from datetime import datetime, date
        
        # Handle different date formats
        date_str = data['date']
        if 'T' in date_str:
            note_date = datetime.fromisoformat(date_str.replace('Z', '')).date()
        else:
            note_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        result = db_manager.create_or_update_note(note_date, data['content'])
        if result:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Failed to save note'}), 400
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/notes/new', methods=['POST'])
def create_new_note():
    """Create a new note for a specific date (always creates new, doesn't update existing)."""
    data = request.get_json()
    
    try:
        from datetime import datetime, date
        
        # Handle different date formats
        date_str = data['date']
        if 'T' in date_str:
            note_date = datetime.fromisoformat(date_str.replace('Z', '')).date()
        else:
            note_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        result = db_manager.create_new_note(note_date, data['content'])
        if result:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Failed to create new note'}), 400
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Error creating new note: {str(e)}'}), 500

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note_by_id(note_id):
    """Delete a note by its ID."""
    try:
        result = db_manager.delete_note_by_id(note_id)
        if result:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Error deleting note: {str(e)}'}), 500

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note_by_id(note_id):
    """Update a note by its ID."""
    data = request.get_json()
    
    try:
        result = db_manager.update_note_by_id(note_id, data.get('content', ''))
        if result:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Note not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Error updating note: {str(e)}'}), 500

@app.route('/api/notes', methods=['DELETE'])
def delete_note():
    """Delete a note for a specific date."""
    data = request.get_json()
    
    try:
        from datetime import datetime, date
        date_str = data['date']
        if 'T' in date_str:
            note_date = datetime.fromisoformat(date_str.replace('Z', '')).date()
        else:
            note_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        result = db_manager.delete_note(note_date)
        if result:
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Note not found'}), 404
    except ValueError as e:
        return jsonify({'error': f'Invalid date format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/calculator', methods=['POST'])
def calculate():
    """Perform calculations."""
    data = request.get_json()
    expression = data.get('expression', '')
    
    try:
        # Simple calculator - only allow safe operations
        allowed_chars = set('0123456789+-*/.() ')
        if not all(c in allowed_chars for c in expression):
            return jsonify({'error': 'Invalid characters in expression'}), 400
        
        # Replace * with * for multiplication
        expression = expression.replace('×', '*')
        
        # Basic validation
        if not expression.strip():
            return jsonify({'result': 0})
        
        # Evaluate the expression
        result = eval(expression)
        
        # Handle division by zero
        if isinstance(result, float) and (result == float('inf') or result == float('-inf')):
            return jsonify({'error': 'Division by zero'}), 400
        
        return jsonify({'result': result})
    except ZeroDivisionError:
        return jsonify({'error': 'Division by zero'}), 400
    except Exception as e:
        return jsonify({'error': 'Invalid expression'}), 400

@app.route('/api/timezones')
def get_timezones():
    """Get available timezones."""
    return jsonify(timezone_manager.get_timezones())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
