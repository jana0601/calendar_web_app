"""
Database models for the Calendar App.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Event(Base):
    """Event model for calendar events."""
    __tablename__ = 'events'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    category = Column(String(50), default='General')
    recurrence = Column(String(50))  # 'daily', 'weekly', 'monthly', 'yearly', None
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # For future cloud sync
    sync_status = Column(String(20), default='local')
    last_modified = Column(DateTime, default=datetime.utcnow)


class Note(Base):
    """Daily notes model."""
    __tablename__ = 'notes'
    
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, nullable=False)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # For future cloud sync
    sync_status = Column(String(20), default='local')
    last_modified = Column(DateTime, default=datetime.utcnow)


class Setting(Base):
    """Application settings model."""
    __tablename__ = 'settings'
    
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

