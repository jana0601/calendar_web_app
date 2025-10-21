# Calendar Web App

A beautiful, modern web-based calendar application with event tracking, holiday support, daily notes, and a built-in calculator.

## 🚀 Quick Start

### Option 1: Double-click to run
1. **Double-click `start_web_app.bat`** - This will automatically:
   - Install all required dependencies
   - Start the web server
   - Open your browser to the calendar

### Option 2: Manual setup
1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the web app:**
   ```bash
   python run_web_app.py
   ```

3. **Open your browser** and go to: `http://localhost:5000`

## ✨ Features

### 📅 **Interactive Calendar**
- Beautiful, modern design with gradient backgrounds
- Click on any date to select it
- Navigate between months with arrow buttons
- Today's date is highlighted
- Events and holidays are clearly marked

### 📝 **Event Management**
- Add events with title, date, and description
- Events appear as colored indicators on calendar days
- Click on dates to view event details
- Full CRUD operations (Create, Read, Update, Delete)

### 🎉 **Holiday Support**
- Automatic holiday detection for multiple countries
- Holiday dates are highlighted in orange
- Hover over holiday indicators to see holiday names
- Currently supports US holidays (easily expandable)

### 📋 **Daily Notes**
- Add personal notes for any date
- Notes are automatically saved and loaded
- Perfect for daily planning and reminders

### 🧮 **Built-in Calculator**
- Full-featured calculator with all basic operations
- Supports parentheses and complex expressions
- Clean, button-based interface
- Real-time calculation results

## 🎨 **Design Features**

- **Modern UI**: Clean, professional design with gradients and shadows
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Interactive**: Smooth animations and hover effects
- **Color-coded**: Different colors for events, holidays, and today
- **Bootstrap 5**: Uses the latest Bootstrap framework for styling

## 🔧 **Technical Details**

### **Backend**
- **Flask**: Lightweight Python web framework
- **SQLAlchemy**: Database ORM for data persistence
- **RESTful API**: Clean API endpoints for all operations

### **Frontend**
- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with gradients and animations
- **JavaScript**: Interactive calendar functionality
- **Bootstrap 5**: Responsive UI framework
- **Font Awesome**: Beautiful icons throughout the interface

### **Database**
- **SQLite**: Lightweight, file-based database
- **Automatic initialization**: Database is created automatically on first run
- **Persistent storage**: All data is saved between sessions

## 📁 **File Structure**

```
Calendar_app/
├── web_app.py              # Main Flask application
├── run_web_app.py          # Web app launcher
├── start_web_app.bat       # Windows batch launcher
├── requirements.txt        # Python dependencies
├── templates/
│   └── calendar.html       # Main HTML template
├── static/
│   └── calendar.js         # JavaScript functionality
├── database/
│   ├── db_manager.py       # Database operations
│   └── models.py           # Data models
├── utils/
│   ├── holiday_manager.py  # Holiday functionality
│   └── timezone_manager.py # Timezone support
└── calendar_app.db         # SQLite database (auto-created)
```

## 🌐 **Accessing the App**

Once running, you can access your calendar at:
- **Local**: `http://localhost:5000`
- **Network**: `http://[your-ip]:5000` (accessible from other devices on your network)

## 🔄 **Stopping the Server**

- Press `Ctrl+C` in the terminal/command prompt
- Or close the terminal window

## 🛠️ **Customization**

### **Adding More Countries for Holidays**
Edit `utils/holiday_manager.py` and add more country codes to the `supported_countries` dictionary.

### **Changing Colors**
Edit the CSS in `templates/calendar.html` to customize the color scheme.

### **Adding Features**
The modular design makes it easy to add new features:
- Add new routes in `web_app.py`
- Add new JavaScript functions in `static/calendar.js`
- Add new HTML sections in `templates/calendar.html`

## 🐛 **Troubleshooting**

### **Port Already in Use**
If port 5000 is busy, edit `run_web_app.py` and change the port number.

### **Database Issues**
Delete `calendar_app.db` to reset the database (you'll lose all data).

### **Browser Not Opening**
Manually navigate to `http://localhost:5000` in your browser.

## 📱 **Mobile Support**

The calendar is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- Any device with a modern web browser

Enjoy your beautiful, modern calendar web application! 🎉
