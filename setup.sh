#!/bin/bash

echo "🏟️  Baseball Stats App Setup"
echo "=============================="

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        if ! grep -q "eval \"\$(/opt/homebrew/bin/brew shellenv)\"" ~/.zshrc 2>/dev/null; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        fi
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    echo "✅ Homebrew installed"
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "📦 Installing Python 3..."
    brew install python3
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    brew install postgresql@15
    
    # Add PostgreSQL to PATH
    if ! grep -q 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' ~/.zshrc 2>/dev/null; then
        echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
    fi
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
    
    echo "✅ PostgreSQL installed"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
fi

echo "✅ All dependencies are installed"

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment (only if it doesn't exist)
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "✅ Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DATABASE_URL=postgresql://localhost:5432/baseball_db
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
EOF
    echo "✅ .env file created (update GEMINI_API_KEY if needed)"
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
npm install

echo "✅ Frontend dependencies installed"
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. (Optional) Update backend/.env with your Gemini API key for AI descriptions"
echo "2. Start PostgreSQL service: 'brew services start postgresql@15'"
echo "3. Create database: 'createdb baseball_db'"
echo "4. Run 'python backend/setup_database.py' to create tables"
echo "5. Run 'python backend/seed_data.py' to populate with data"
echo "6. Start the backend: 'cd backend && source venv/bin/activate && python run.py'"
echo "7. Start the frontend: 'cd frontend && npm start'"
echo ""
echo "Or use './clean_restart.sh' to start everything at once!"
echo "The app will be available at http://localhost:3000"
