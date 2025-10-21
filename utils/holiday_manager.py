"""
Holiday management utilities for the Calendar App.
"""

import holidays
from datetime import datetime, date
from typing import List, Dict, Optional


class HolidayManager:
    """Manages holiday data for multiple countries."""
    
    def __init__(self):
        """Initialize holiday manager."""
        # We'll create holiday objects dynamically with years to ensure they work properly
        self.supported_countries = {
            'US': holidays.US,
            'DE': holidays.Germany,  # Use full name for better compatibility
            'CN': holidays.CN,
            'GB': holidays.GB,
            'CA': holidays.CA,
            'FR': holidays.FR,
            'JP': holidays.JP,
            'AU': holidays.AU,
            'IN': holidays.IN,
        }
    
    def get_supported_countries(self) -> List[str]:
        """Get list of supported countries."""
        return list(self.supported_countries.keys())
    
    def get_country_name(self, country_code: str) -> str:
        """Get full country name from code."""
        country_names = {
            'US': 'United States',
            'DE': 'Germany',
            'CN': 'China',
            'GB': 'United Kingdom',
            'CA': 'Canada',
            'FR': 'France',
            'JP': 'Japan',
            'AU': 'Australia',
            'IN': 'India',
        }
        return country_names.get(country_code, country_code)
    
    def get_holidays_for_year(self, year: int, countries: List[str]) -> Dict[date, List[str]]:
        """Get holidays for a specific year and countries."""
        all_holidays = {}
        
        for country_code in countries:
            if country_code in self.supported_countries:
                # Create holiday object with the specific year
                if country_code == 'DE':
                    # For Germany, use a default state (BW - Baden-Württemberg) for now
                    country_holidays = self.supported_countries[country_code](state='BW', years=year)
                else:
                    country_holidays = self.supported_countries[country_code](years=year)
                
                # Iterate through all holidays in the year
                for holiday_date, holiday_name in country_holidays.items():
                    if holiday_date.year == year:
                        if holiday_date not in all_holidays:
                            all_holidays[holiday_date] = []
                        all_holidays[holiday_date].append(f"{self.get_country_name(country_code)}: {holiday_name}")
        
        return all_holidays
    
    def get_holidays_for_month(self, year: int, month: int, countries: List[str]) -> Dict[date, List[str]]:
        """Get holidays for a specific month and countries."""
        year_holidays = self.get_holidays_for_year(year, countries)
        month_holidays = {}
        
        for holiday_date, holiday_names in year_holidays.items():
            if holiday_date.month == month:
                month_holidays[holiday_date] = holiday_names
        
        return month_holidays
    
    def is_holiday(self, check_date: date, countries: List[str]) -> bool:
        """Check if a date is a holiday in any of the specified countries."""
        for country_code in countries:
            if country_code in self.supported_countries:
                # Create holiday object with the specific year
                if country_code == 'DE':
                    country_holidays = self.supported_countries[country_code](state='BW', years=check_date.year)
                else:
                    country_holidays = self.supported_countries[country_code](years=check_date.year)
                
                if check_date in country_holidays:
                    return True
        return False
    
    def get_holiday_name(self, check_date: date, country_code: str) -> Optional[str]:
        """Get holiday name for a specific date and country."""
        if country_code in self.supported_countries:
            # Create holiday object with the specific year
            if country_code == 'DE':
                country_holidays = self.supported_countries[country_code](state='BW', years=check_date.year)
            else:
                country_holidays = self.supported_countries[country_code](years=check_date.year)
            
            return country_holidays.get(check_date)
        return None

