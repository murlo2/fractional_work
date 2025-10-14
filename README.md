# Baseball Stats App

A full-stack application for viewing and managing baseball player statistics with LLM-generated player descriptions.

## Features in Detail

### Player List
- Responsive grid layout that adapts to screen size
- Sort by multiple criteria with visual indicators
- Loading states and error handling
- One-click data loading from external API

### Player Details
- Modal overlay with comprehensive player information
- LLM-generated descriptions using Google Gemini (free!)
- Statistics displayed in an organized grid
- Smooth animations and transitions

### Player Editing
- Form validation and error handling
- Real-time updates to the player list
- Automatic description regeneration after edits
- Responsive form layout

## 🚀 Quick Start

### First Time Setup (Safe to Run Multiple Times)
```bash
./setup.sh
```
**Setup complete!** Your project is now ready to run.

### After System Restart/Logout or before Demos
```bash
# Restart everything (PostgreSQL + app)
./clean_restart.sh
```

### Manual Clean Start (Alternative)
```bash
# Stop all running processes
pkill -f "python run.py" && pkill -f "react-scripts start"
lsof -ti:3000 | xargs kill -9 && lsof -ti:5000 | xargs kill -9

# Start backend and frontend
cd backend && source venv/bin/activate && python run.py &
cd frontend && npm start &

# Open: http://localhost:3000
```

### Demo Features to Show
1. **Player Grid**: 172 players with stats, sorting available by several fields
2. **Player Details**: Click any player card
3. **Edit Player**: Click "Edit Player" button
4. **Reload Data**: Click "⚠️ Reset to Original Data" button

## 🧪 Features You Can Test

### **Browse & Sort Players**
- **View 172 players** in a responsive grid layout
- **Sort by multiple criteria**:
  - **Hits** (default) - See the top hitters
  - **Home Runs** - Find the power hitters
  - **Batting Average** - Discover the most consistent hitters
  - **Name** - Alphabetical order
- **Toggle sort direction** - Click the same button to switch between ascending/descending

### **Player Details & AI Descriptions**
- **Click any player card** to see detailed information
- **Comprehensive stats display** - All 18 baseball statistics in an organized grid
- **AI-generated descriptions** - Powered by Google Gemini (free!)
- **Sticky descriptions** - Once generated, descriptions stay until you manually regenerate
- **🔄 Regenerate button** - Get fresh AI descriptions when you want them

### **Edit Player Data**
- **Click "Edit Player"** in the detail view
- **Comprehensive form** - Edit all 18 player statistics
- **Real-time validation** - Form prevents invalid data entry
- **Save changes** - Updates are immediately saved to PostgreSQL database
- **Success feedback** - Green confirmation message when saved
- **Auto-refresh** - Player list updates automatically after edits

### **Data Management**
- **⚠️ Reset to Original Data** - Restore all players to original API values
- **Confirmation dialog** - Prevents accidental data loss
- **Load from external API** - Fresh data from https://api.hirefraction.com/api/test/baseball
- **Persistent storage** - All edits are saved to PostgreSQL database

### **Responsive Design**
- **Mobile-friendly** - Works perfectly on phones and tablets
- **Desktop optimized** - Beautiful layout on larger screens
- **Smooth animations** - Professional transitions and hover effects
- **Modern UI** - Clean, intuitive interface

## Tech Stack
- **Frontend**: React with modern CSS
- **Backend**: Python (Flask) with SQLAlchemy
- **Database**: PostgreSQL
- **External API**: https://api.hirefraction.com/api/test/baseball
- **LLM**: Google Gemini for player descriptions (free!)


## Complete Setup Guide

### Prerequisites
Before starting, ensure you have the following installed:
- **Python 3.8+** (with pip)
- **Node.js 16+** (with npm)
- **PostgreSQL 12+**
- **Homebrew** (for macOS) or appropriate package manager

### Step 1: Install Dependencies

The setup script will automatically install all dependencies, but if you prefer manual installation:

#### Manual Installation (Optional)
```bash
# Install PostgreSQL
brew install postgresql@15
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
brew services start postgresql@15
createdb baseball_db

# Install Node.js
brew install node

# Verify installations
node --version
npm --version
psql --version
```

### Step 2: Project Setup

#### Option A: Automated Setup (Recommended)
```bash
# Clone or download the project
cd fractional_work

# Run the automated setup script (ONLY ONCE)
./setup.sh
```

**⚠️ Important**: `./setup.sh` is **idempotent** - it can be run multiple times safely. It:
- Installs Homebrew (if not already installed)
- Installs PostgreSQL, Node.js, and Python (if not already installed)
- Creates virtual environment (only if it doesn't exist)
- Installs Python dependencies  
- Installs Node.js dependencies
- Creates database and .env file (only if they don't exist)
- Sets up the complete project structure

**Note**: Setup script does NOT start services. Use `./clean_restart.sh` or manual commands to start the app.

#### Option B: Manual Setup

**Backend Setup:**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://localhost:5432/baseball_db
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
EOF

# Set up database tables
python database_setup.py

# Seed database with baseball data
python database_setup.py
```

**Frontend Setup:**
```bash
cd frontend

# Install Node.js dependencies
npm install
```

### Step 3: Running the System (Daily Use)

#### Start Backend Server
```bash
cd backend
source venv/bin/activate
python run.py
```
The backend will start on **http://localhost:5000**

#### Start Frontend Server (in a new terminal)
```bash
cd frontend
npm start
```
The frontend will start on **http://localhost:3000**

#### Access the Application
Open your browser and navigate to: **http://localhost:3000**

### Step 4: Verify Everything is Working

1. **Check Backend Health:**
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status": "healthy"}
   ```

2. **Check Players Data:**
   ```bash
   curl http://localhost:5000/api/players | head -20
   # Should return JSON with player data
   ```

3. **Open Browser:**
   - Go to http://localhost:3000
   - You should see 172 baseball players in a grid layout
   - Try sorting by hits, home runs, etc.
   - Click on any player to see details

## Clean Run (Demo Mode)

### Stop Everything and Start Fresh
For demo purposes, use these commands to ensure a clean start:

```bash
# 1. Stop all running processes
pkill -f "python run.py"           # Stop backend
pkill -f "react-scripts start"     # Stop frontend
lsof -ti:3000 | xargs kill -9      # Kill anything on port 3000
lsof -ti:5000 | xargs kill -9      # Kill anything on port 5000

# 2. Start PostgreSQL (if not running)
brew services start postgresql@15

# 3. Clean start - Backend (Terminal 1)
cd backend
source venv/bin/activate
python run.py

# 4. Clean start - Frontend (Terminal 2)
cd frontend
npm start

# 5. Open browser: http://localhost:3000
```

### Quick Clean Restart Script
Create this script for easy demo restarts:

```bash
# Create clean_restart.sh
cat > clean_restart.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping all processes..."
pkill -f "python run.py" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
sleep 2

echo "🚀 Starting fresh..."
cd backend && source venv/bin/activate && python run.py &
sleep 3
cd frontend && npm start &
echo "✅ App starting at http://localhost:3000"
EOF

chmod +x clean_restart.sh
./clean_restart.sh
```

## Daily Usage

### Starting the Application
Once everything is set up, you only need to run these commands to start the app:

```bash
# Terminal 1: Start Backend
cd backend
source venv/bin/activate
python run.py

# Terminal 2: Start Frontend  
cd frontend
npm start
```

### Stopping the Application
- Press `Ctrl+C` in both terminals to stop the servers
- Or close the terminal windows

### Quick Commands Reference
```bash
# Check if servers are running
curl http://localhost:5000/api/health  # Backend health check
curl http://localhost:3000 > /dev/null && echo "Frontend running"  # Frontend check

# Restart with fresh data
cd backend && source venv/bin/activate && python database_setup.py

# View logs
# Backend logs appear in the terminal where you ran python run.py
# Frontend logs appear in the terminal where you ran npm start
```

## Configuration

### Environment Variables (.env)
The `.env` file in the backend directory contains:
```env
DATABASE_URL=postgresql://localhost:5432/baseball_db
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### Optional: Gemini API Key Setup
To enable AI-generated player descriptions:
1. Get a free API key from https://makersuite.google.com/app/apikey
2. Edit `backend/.env` and replace `your_gemini_api_key_here` with your actual key
3. Restart the backend server

### Database Management
```bash
# Reset database (clear all data)
cd backend && source venv/bin/activate
python -c "from app import app, db, Player; app.app_context().push(); Player.query.delete(); db.session.commit(); print('Database cleared')"

# Reload data from API
python database_setup.py

# Check database status
psql -d baseball_db -c "SELECT COUNT(*) FROM players;"
```

## API Endpoints

### Players
- `GET /api/players?sort_by=hits&order=desc` - Get all players with sorting
- `GET /api/players/<id>` - Get specific player
- `PUT /api/players/<id>` - Update player data
- `POST /api/players/<id>/description` - Generate LLM description for player

### Utility
- `POST /api/seed` - Seed database with data from external API
- `GET /api/health` - Health check

## Usage

### Daily Use
1. **Start the app**: `./clean_restart.sh`
2. **Open browser**: http://localhost:3000
3. **Load data**: Click "⚠️ Reset to Original Data" if needed
4. **Browse players**: Sort by hits, home runs, batting average, or name
5. **View details**: Click any player card
6. **Edit players**: Click "Edit Player" in the detail view
7. **Generate descriptions**: AI descriptions are created automatically

### Demo Features to Show
1. **Reset Data**: Click "⚠️ Reset to Original Data" to restore all players to original API values
2. **Sort Players**: Use the sort buttons to organize by different statistics
3. **Player Details**: Click any player to see comprehensive information
4. **AI Descriptions**: View LLM-generated player descriptions
5. **Edit Players**: Modify player statistics and see real-time updates

## Project Structure

```
fractional_work/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── config.py           # Configuration
│   ├── requirements.txt    # Python dependencies
│   ├── run.py             # Application runner
│   └── database_setup.py  # Complete database setup script
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── App.js         # Main app component
│   ├── public/
│   └── package.json       # Node.js dependencies
├── setup.sh              # Automated setup script
└── README.md
```

## Development & Troubleshooting

### After System Restart
**PostgreSQL service stops after system restart/logout and needs to be restarted:**

```bash
# Quick service restart
./clean_restart.sh

# Or manual restart
brew services start postgresql@15
```

### Development Mode
Both servers run in development mode with:
- **Hot reloading**: Changes to code automatically restart the servers
- **Debug mode**: Detailed error messages and stack traces
- **CORS enabled**: Frontend can communicate with backend

### Common Issues & Solutions

#### Port Already in Use
```bash
# If port 5000 is in use (macOS AirPlay)
# Disable AirPlay Receiver: System Preferences > General > AirDrop & Handoff

# If port 3000 is in use
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different ports
cd backend && python run.py --port 5001
cd frontend && PORT=3001 npm start
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@15

# Test database connection
psql -d baseball_db -c "SELECT 1;"
```

#### Frontend Build Errors
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check for syntax errors in React components
npm run build
```

#### Backend Import Errors
```bash
# Ensure virtual environment is activated
cd backend
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check Python path
which python
```

### Logs and Debugging
- **Backend logs**: Check the terminal where you ran `python run.py`
- **Frontend logs**: Check the terminal where you ran `npm start`
- **Browser console**: Press F12 in your browser for frontend errors
- **Network tab**: Check API calls in browser developer tools

## License

This project is for educational purposes.
