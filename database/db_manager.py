"""
Database manager for the Calendar App.
"""

import os
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from .models import Base, Event, Note, Setting


class DatabaseManager:
    """Manages database operations for the calendar app."""
    
    def __init__(self, db_path="calendar_app.db"):
        """Initialize database manager."""
        self.db_path = db_path
        self.engine = None
        self.SessionLocal = None
        
    def initialize_database(self):
        """Initialize database connection and create tables."""
        try:
            # Create database engine
            self.engine = create_engine(f"sqlite:///{self.db_path}", echo=False)
            
            # Create all tables
            Base.metadata.create_all(bind=self.engine)
            
            # Create session factory
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
            
            # Initialize default settings
            self._initialize_default_settings()
            
        except SQLAlchemyError as e:
            print(f"Database initialization error: {e}")
            raise
    
    def _initialize_default_settings(self):
        """Initialize default application settings."""
        session = self.SessionLocal()
        try:
            # Check if settings already exist
            if session.query(Setting).count() == 0:
                default_settings = [
                    Setting(key="timezone", value="UTC"),
                    Setting(key="holiday_countries", value="US,DE,CN"),
                    Setting(key="theme", value="light"),
                    Setting(key="calendar_view", value="month"),
                ]
                
                for setting in default_settings:
                    session.add(setting)
                
                session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error initializing default settings: {e}")
        finally:
            session.close()
    
    def get_session(self):
        """Get a database session."""
        return self.SessionLocal()
    
    # Event operations
    def create_event(self, title, start_time, description="", end_time=None, 
                    category="General", recurrence=None):
        """Create a new event."""
        session = self.get_session()
        try:
            event = Event(
                title=title,
                description=description,
                start_time=start_time,
                end_time=end_time,
                category=category,
                recurrence=recurrence
            )
            session.add(event)
            session.commit()
            return event
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error creating event: {e}")
            return None
        finally:
            session.close()
    
    def get_events(self, start_date=None, end_date=None):
        """Get events within date range."""
        session = self.get_session()
        try:
            query = session.query(Event)
            if start_date:
                query = query.filter(Event.start_time >= start_date)
            if end_date:
                query = query.filter(Event.start_time <= end_date)
            return query.order_by(Event.start_time).all()
        except SQLAlchemyError as e:
            print(f"Error getting events: {e}")
            return []
        finally:
            session.close()
    
    def update_event(self, event_id, **kwargs):
        """Update an event."""
        session = self.get_session()
        try:
            event = session.query(Event).filter(Event.id == event_id).first()
            if event:
                for key, value in kwargs.items():
                    if hasattr(event, key):
                        setattr(event, key, value)
                event.updated_at = datetime.utcnow()
                session.commit()
                return event
            return None
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error updating event: {e}")
            return None
        finally:
            session.close()
    
    def delete_event(self, event_id):
        """Delete an event."""
        session = self.get_session()
        try:
            event = session.query(Event).filter(Event.id == event_id).first()
            if event:
                session.delete(event)
                session.commit()
                return True
            return False
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error deleting event: {e}")
            return False
        finally:
            session.close()
    
    # Note operations
    def create_or_update_note(self, date, content):
        """Create or update a note for a specific date."""
        session = self.get_session()
        try:
            # Find existing note for the date
            note = session.query(Note).filter(
                Note.date == date
            ).first()
            
            if note:
                note.content = content
                note.updated_at = datetime.utcnow()
            else:
                note = Note(
                    date=date,
                    content=content
                )
                session.add(note)
            
            session.commit()
            return note
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error creating/updating note: {e}")
            return None
        finally:
            session.close()
    
    def create_new_note(self, date, content):
        """Create a new note for a specific date (always creates new, doesn't update existing)."""
        session = self.get_session()
        try:
            note = Note(
                date=date,
                content=content
            )
            session.add(note)
            session.commit()
            return note
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error creating new note: {e}")
            return None
        finally:
            session.close()
    
    def delete_note(self, date):
        """Delete a note for a specific date."""
        session = self.get_session()
        try:
            # Convert date to datetime for comparison
            from datetime import datetime
            if isinstance(date, str):
                date = datetime.strptime(date, '%Y-%m-%d').date()
            
            # Query notes where the date part matches
            from sqlalchemy import func
            note = session.query(Note).filter(
                func.date(Note.date) == date
            ).first()
            
            if note:
                session.delete(note)
                session.commit()
                return True
            return False
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error deleting note: {e}")
            return False
        finally:
            session.close()
    
    def get_note(self, date):
        """Get note for a specific date."""
        session = self.get_session()
        try:
            # Convert date to datetime for comparison
            from datetime import datetime
            if isinstance(date, str):
                date = datetime.strptime(date, '%Y-%m-%d').date()
            
            # Query notes where the date part matches, get the most recent one
            from sqlalchemy import func
            note = session.query(Note).filter(
                func.date(Note.date) == date
            ).order_by(Note.updated_at.desc()).first()
            return note
        except SQLAlchemyError as e:
            print(f"Error getting note: {e}")
            return None
        finally:
            session.close()
    
    def get_notes_for_date(self, date):
        """Get all notes for a specific date."""
        session = self.get_session()
        try:
            # Convert date to datetime for comparison
            from datetime import datetime
            if isinstance(date, str):
                date = datetime.strptime(date, '%Y-%m-%d').date()
            
            # Query all notes where the date part matches
            from sqlalchemy import func
            notes = session.query(Note).filter(
                func.date(Note.date) == date
            ).order_by(Note.created_at.desc()).all()
            return notes
        except SQLAlchemyError as e:
            print(f"Error getting notes for date: {e}")
            return []
        finally:
            session.close()
    
    def update_note_by_id(self, note_id, content):
        """Update a note by its ID."""
        session = self.get_session()
        try:
            note = session.query(Note).filter(Note.id == note_id).first()
            if note:
                note.content = content
                note.updated_at = datetime.utcnow()
                session.commit()
                return note
            return None
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error updating note: {e}")
            return None
        finally:
            session.close()

    def delete_note_by_id(self, note_id):
        """Delete a note by its ID."""
        session = self.get_session()
        try:
            note = session.query(Note).filter(Note.id == note_id).first()
            if note:
                session.delete(note)
                session.commit()
                return True
            return False
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error deleting note by ID: {e}")
            return False
        finally:
            session.close()
    
    # Settings operations
    def get_setting(self, key, default=None):
        """Get a setting value."""
        session = self.get_session()
        try:
            setting = session.query(Setting).filter(Setting.key == key).first()
            return setting.value if setting else default
        except SQLAlchemyError as e:
            print(f"Error getting setting: {e}")
            return default
        finally:
            session.close()
    
    def set_setting(self, key, value):
        """Set a setting value."""
        session = self.get_session()
        try:
            setting = session.query(Setting).filter(Setting.key == key).first()
            if setting:
                setting.value = value
                setting.updated_at = datetime.utcnow()
            else:
                setting = Setting(key=key, value=value)
                session.add(setting)
            session.commit()
            return True
        except SQLAlchemyError as e:
            session.rollback()
            print(f"Error setting setting: {e}")
            return False
        finally:
            session.close()

