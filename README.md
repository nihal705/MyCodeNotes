# 📝 MyCodeNotes

> Your Personal Coding Knowledge Base - Learn, Practice, and Master DSA

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://your-vercel-url.vercel.app)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat&logo=render)](https://your-render-url.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 About The Project

**MyCodeNotes** is a personal coding knowledge base that helps you track your LeetCode journey, practice coding problems, and maintain DSA concepts - all in one place. It's designed to be your personal learning journal with a beautiful, modern interface.

### ✨ Features

- 📚 **LeetCode Problems** - Track solved problems with detailed notes
- 💻 **Practice Problems** - Practice with hints and hidden solutions
- 📖 **DSA Concepts** - Quick reference for important concepts
- 📊 **Progress Tracking** - Visualize your coding journey
- 🔍 **Advanced Search** - Search problems by name, ID, or concept
- 🎯 **Admin Panel** - Manage your content easily

### 🎨 Tech Stack

**Frontend:**
- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS
- 🎭 Framer Motion
- 🔄 React Router DOM
- 📦 Axios

**Backend:**
- 🚀 FastAPI
- 🐘 PostgreSQL (Neon)
- 🔐 JWT Authentication
- 📝 SQLAlchemy ORM

**Deployment:**
- 🌐 Vercel (Frontend)
- 🚀 Render/Railway (Backend)
- 🗄️ Neon (Database)

## 📁 Project Structure

```bash
MyCodeNotes/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── admin.py
│   │       ├── concepts.py
│   │       ├── leetcode.py
│   │       ├── practice.py
│   │       ├── problems.py
│   │       └── profile.py
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js
│   │   │   ├── concepts.js
│   │   │   ├── leetcode.js
│   │   │   ├── practice.js
│   │   │   ├── problems.js
│   │   │   └── profile.js
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AddConceptForm.jsx
│   │   │   │   ├── AddPracticeForm.jsx
│   │   │   │   ├── AddProblemForm.jsx
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   └── AdminPanel.jsx
│   │   │   ├── common/
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Logo.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── SearchBar.jsx
│   │   │   ├── concepts/
│   │   │   │   ├── ConceptCard.jsx
│   │   │   │   ├── ConceptDetail.jsx
│   │   │   │   └── ConceptList.jsx
│   │   │   ├── practice/
│   │   │   │   ├── CodeArea.jsx
│   │   │   │   ├── HintsReveal.jsx
│   │   │   │   ├── PracticeCard.jsx
│   │   │   │   ├── PracticeDetail.jsx
│   │   │   │   ├── PracticeList.jsx
│   │   │   │   └── SolutionReveal.jsx
│   │   │   ├── problems/
│   │   │   │   ├── ProblemCard.jsx
│   │   │   │   ├── ProblemDetail.jsx
│   │   │   │   ├── ProblemFilters.jsx
│   │   │   │   └── ProblemList.jsx
│   │   │   ├── stats/
│   │   │   │   ├── LeetCodeStats.jsx
│   │   │   │   └── StatsCard.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       └── Card.jsx
│   │   ├── data/
│   │   │   └── profile.js
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx
│   │   │   ├── ConceptDetailPage.jsx
│   │   │   ├── ConceptsPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── PracticeDetailPage.jsx
│   │   │   ├── PracticePage.jsx
│   │   │   ├── ProblemDetailPage.jsx
│   │   │   └── ProblemsPage.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── render.yaml
└── vercel.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **PostgreSQL** (or Neon account)
- **Git**

### 🛠️ Setup & Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/nihal705/MyCodeNotes.git
cd MyCodeNotes
```

2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend/ directory:

env
DATABASE_URL=postgresql://user:password@localhost:5432/mycodenotes
ADMIN_PASSWORD=your-secret-password
ADMIN_EMAIL=your-email@gmail.com
API_SECRET_KEY=your-secret-key
```

3. Frontend Setup
```bash
cd frontend
npm install
Create a .env file in the frontend/ directory:

env
VITE_API_URL=http://localhost:8000
```

4. Run Locally
Backend:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm run dev
Open http://localhost:5173
```

## Database Setup

Option A: Local PostgreSQL:
```sql
CREATE DATABASE mycodenotes;
Option B: Neon (Recommended)
Go to Neon.tech

Create a free account

Create a new project

Copy the connection string

Add it to .env
```

## 🔧 Environment Variables

Backend (backend/.env)
Variable	Description
DATABASE_URL	PostgreSQL connection string
ADMIN_PASSWORD	Admin panel password
ADMIN_EMAIL	Admin email
API_SECRET_KEY	JWT secret key
Frontend (frontend/.env)
Variable	Description
VITE_API_URL	Backend API URL

## Features

### Homepage
- Personal profile with avatar
- Quick stats (problems solved, streak, active days)
- LeetCode progress visualization
- Recent accepted solutions
- Quick navigation cards

### LeetCode Problems
- Browse all solved problems
- Detailed problem view with:
- Problem statement
- Detailed description
- Concept and pattern
- Step-by-step algorithm
- Notebook concept
- Java and Python solutions
- Copy to clipboard

### Practice Problems
- Practice coding problems
- Interactive code editor
- Hints system
- Hidden solutions
- Language-specific (Java/Python)

### DSA Concepts
- Quick reference for concepts
- Definitions with examples
- Search by name or definition

### Admin Panel
- Add/Edit problems
- Add/Edit practice problems
- Add/Edit concepts
- Update profile settings
- Secure login

## 🚀 Deployment

#### Deploy Backend to Render
- Push code to GitHub
- Connect GitHub repository to Render
- Add environment variables
- Deploy

#### Deploy Frontend to Vercel
- Connect GitHub repository to Vercel
- Set environment variables
- Deploy

### 📝 License
- This project is licensed under the MIT License - see the LICENSE file for details.

### 🙏 Acknowledgments
- LeetCode for problem statements
- FastAPI for the awesome backend framework
- React for the frontend library

### 📬 Contact
Gmail : nihalmohammad705@gmail.com

Built with ❤️ by Nihal