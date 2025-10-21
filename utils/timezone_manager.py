"""
Timezone management utilities for the Calendar App.
"""

import pytz
from datetime import datetime
from typing import List


class TimezoneManager:
    """Manages timezone operations for the calendar app."""
    
    def __init__(self):
        """Initialize timezone manager."""
        self.common_timezones = [
            'UTC',
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Berlin',
            'Europe/Paris',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Asia/Kolkata',
            'Australia/Sydney',
        ]
    
    def get_available_timezones(self) -> List[str]:
        """Get list of available timezones."""
        return self.common_timezones
    
    def get_current_time(self, timezone_name: str) -> str:
        """Get current time in specified timezone."""
        try:
            tz = pytz.timezone(timezone_name)
            current_time = datetime.now(tz)
            return current_time.strftime("%Y-%m-%d %H:%M:%S %Z")
        except Exception as e:
            print(f"Error getting time for timezone {timezone_name}: {e}")
            return "Error"
    
    def convert_time(self, dt: datetime, from_tz: str, to_tz: str) -> datetime:
        """Convert datetime from one timezone to another."""
        try:
            from_timezone = pytz.timezone(from_tz)
            to_timezone = pytz.timezone(to_tz)
            
            # Localize the datetime to the source timezone
            localized_dt = from_timezone.localize(dt)
            
            # Convert to target timezone
            converted_dt = localized_dt.astimezone(to_timezone)
            
            return converted_dt
        except Exception as e:
            print(f"Error converting time: {e}")
            return dt
    
    def get_timezone_info(self, timezone_name: str) -> dict:
        """Get information about a timezone."""
        try:
            tz = pytz.timezone(timezone_name)
            now = datetime.now(tz)
            
            return {
                'name': timezone_name,
                'utc_offset': now.strftime('%z'),
                'dst_active': now.dst().total_seconds() != 0,
                'current_time': now.strftime('%Y-%m-%d %H:%M:%S %Z')
            }
        except Exception as e:
            print(f"Error getting timezone info: {e}")
            return {}

