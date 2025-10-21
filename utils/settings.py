"""
Settings management for the Calendar App.
"""

from typing import Any, Dict, Optional
from database.db_manager import DatabaseManager


class SettingsManager:
    """Manages application settings."""
    
    def __init__(self, db_manager: DatabaseManager):
        """Initialize settings manager."""
        self.db_manager = db_manager
        
        # Default settings
        self.defaults = {
            'timezone': 'UTC',
            'holiday_countries': 'US,DE,CN',
            'theme': 'light',
            'calendar_view': 'month',
            'week_start': 'monday',
            'date_format': 'YYYY-MM-DD',
            'time_format': '24h',
            'auto_save_notes': True,
            'show_weekends': True,
            'show_holidays': True,
        }
    
    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting value."""
        value = self.db_manager.get_setting(key)
        if value is None:
            return self.defaults.get(key, default)
        return value
    
    def set_setting(self, key: str, value: Any) -> bool:
        """Set a setting value."""
        return self.db_manager.set_setting(key, str(value))
    
    def get_all_settings(self) -> Dict[str, Any]:
        """Get all settings as a dictionary."""
        settings = {}
        for key in self.defaults.keys():
            settings[key] = self.get_setting(key)
        return settings
    
    def reset_to_defaults(self) -> bool:
        """Reset all settings to default values."""
        try:
            for key, value in self.defaults.items():
                self.set_setting(key, value)
            return True
        except Exception as e:
            print(f"Error resetting settings: {e}")
            return False
    
    def get_holiday_countries(self) -> list:
        """Get list of holiday countries."""
        countries_str = self.get_setting('holiday_countries', 'US,DE,CN')
        return [country.strip() for country in countries_str.split(',') if country.strip()]
    
    def set_holiday_countries(self, countries: list) -> bool:
        """Set holiday countries."""
        countries_str = ','.join(countries)
        return self.set_setting('holiday_countries', countries_str)

