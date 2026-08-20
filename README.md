<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0A1A,100:FFA116&height=180&section=header&animation=fadeIn"/>
  <br/>
  <img src="https://raw.githubusercontent.com/nihal705/MyCodeNotes/main/frontend/public/logo.png" width="90" style="margin-top: -140px;"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=500&color=FFA116&center=true&vCenter=true&width=600&lines=Learn+DSA%2C+Web+Dev+%26+More;Practice+Java+%26+Python+Problems;Notes+on+React%2C+Node.js+%26+SQL" alt="Typing Animation" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge&logo=vercel" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-15.x-4169e1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind-3.3.6-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
</p>

<p align="center">
  <a href="https://mycodenotes.vercel.app">
    <img src="https://img.shields.io/badge/_Live_Demo-View_Now-00C7B7?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://github.com/nihal705/MyCodeNotes">
    <img src="https://img.shields.io/badge/_GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="mailto:nihalmohammad705@gmail.com">
    <img src="https://img.shields.io/badge/_Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
  </a>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">
</p>

---

## 📖 Overview

**MyCodeNotes** is your personal coding knowledge base that helps you track your LeetCode journey, practice coding problems, and maintain DSA concepts - all in one place. It's designed to be your personal learning journal with a beautiful, modern interface.

### 🎯 Key Capabilities

| Category | Description |
|----------|-------------|
| **LeetCode Problems** | Track solved problems with detailed notes, solutions, and concepts |
| **Practice Problems** | Practice with hints and hidden solutions |
| **DSA Concepts** | Quick reference for important concepts with examples |
| **Progress Tracking** | Visualize your coding journey with stats and analytics |
| **Admin Panel** | Manage your content easily with secure login |
| **Notes System** | Create and organize your personal learning notes |

---

## ✨ Features

### 📚 LeetCode Problems
- Browse all solved problems with search and filters
- Detailed problem view with:
  - Problem statement and description
  - Concept and pattern identification
  - Step-by-step algorithm
  - Notebook concept with visual patterns
  - Java and Python solutions
  - Copy to clipboard functionality
- Difficulty badges (EASY, MEDIUM, HARD)
- Language tags (Java, Python3)

### 💻 Practice Problems
- Practice coding problems with interactive interface
- Hints system to guide you
- Hidden solutions to test yourself
- Language-specific problems (Java/Python)
- Tags for easy categorization
- Difficulty levels (Beginner, Intermediate, Advanced)

### 📖 DSA Concepts
- Quick reference for programming concepts
- Definitions with practical examples
- Search by name or definition
- Clean and organized display

### 📓Notes
- Create and organize personal learning notes
- Rich content with chapters and topics
- Code examples with syntax highlighting
- Table of contents for easy navigation
- Search across all notes
- Coming soon features

### 📊 Homepage Dashboard
- Personal profile with avatar
- Quick stats (problems solved, streak, active days)
- LeetCode progress visualization
- Recent accepted solutions
- Quick navigation cards

### 🔐 Admin Panel
- Secure login with JWT authentication
- Add/Edit LeetCode problems
- Add/Edit Practice problems
- Add/Edit Concepts
- Add/Edit Notes
- Update profile settings
- Content management made easy

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling with dark mode |
| Framer Motion | Smooth animations and transitions |
| React Router v6 | Client-side routing |
| Axios | HTTP client for API calls |
| React Hot Toast | Toast notifications |
| React Icons | Icon library |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM for database operations |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Pydantic | Data validation |

### Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Render/Railway | Backend hosting |
| Neon | PostgreSQL database hosting |

---

## 🏗️ Architecture

```bash
MyCodeNotes
├── Frontend (Port 5173 - Vite/React, deployed)
│   ├── Pages (Home, Problems, Practice, Concepts, Notes, Admin)
│   ├── Components (Common, UI, Problems, Practice, Concepts, Notes, Admin)
│   ├── API (Service layer for backend communication)
│   ├── Hooks (Custom React hooks)
│   └── Utils (Helper functions)
│
├── Backend (Port 8000 - FastAPI)
│   ├── Routes (Problems, Practice, Concepts, Notes, Admin, Profile)
│   ├── Models (SQLAlchemy models)
│   ├── Schemas (Pydantic schemas)
│   ├── Auth (JWT authentication)
│   └── Database (PostgreSQL connection)
│
└── Database (Neon PostgreSQL)
    ├── problems
    ├── practice_problems
    ├── concepts
    ├── notes
    └── profile_settings
```

## Data Flow

```bash
User Action → React Component → API Service → Backend Route → 
Database Query → Response → Component State → UI Update
```

📁 Project Structure

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
│   │       ├── notes.py
│   │       ├── practice.py
│   │       ├── problems.py
│   │       └── profile.py
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   └── profile.png
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiClient.js
│   │   │   ├── concepts.js
│   │   │   ├── leetcode.js
│   │   │   ├── notes.js
│   │   │   ├── practice.js
│   │   │   ├── problems.js
│   │   │   └── profile.js
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AddConceptForm.jsx
│   │   │   │   ├── AddNoteForm.jsx
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
│   │   │   ├── notes/
│   │   │   │   ├── CodeBlock.jsx
│   │   │   │   ├── NoteCard.jsx
│   │   │   │   ├── NoteDetail.jsx
│   │   │   │   ├── NoteList.jsx
│   │   │   │   └── TableOfContents.jsx
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
│   │   │   ├── NoteDetailPage.jsx
│   │   │   ├── NotesPage.jsx
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
## 🚀 Installation & Setup

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18.x or higher |
| Python | 3.9 or higher |
| PostgreSQL | 15.x or higher (or Neon account) |
| Git | Latest |

### Clone Repository

git clone https://github.com/nihal705/MyCodeNotes.git
cd MyCodeNotes

### Backend Setup

cd backend
python -m venv .venv

### On Windows:
.venv\Scripts\activate

### On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env

### Update .env with your database credentials
#### DATABASE_URL=postgresql://user:password@localhost:5432/mycodenotes

### Frontend Setup

cd frontend
npm install
cp .env.example .env

### Update .env with your backend URL
#### VITE_API_URL=http://localhost:8000

### Database Setup

Option A: Local PostgreSQL
CREATE DATABASE mycodenotes;

Option B: Neon (Recommended)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add it to backend/.env as DATABASE_URL

### Run Locally

Backend:
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Frontend:
cd frontend
npm run dev

Open http://localhost:5173 in your browser.

---

## 🔧 Environment Variables

### Backend (backend/.env)
- DATABASE_URL - PostgreSQL connection string - Required ✅
- ADMIN_PASSWORD - Admin panel login password - Required ✅
- ADMIN_EMAIL - Admin email address - Required ✅
- API_SECRET_KEY - JWT secret key - Required ✅

### Frontend (frontend/.env)
- VITE_API_URL - Backend API URL - Required ✅

---

## 📡 API Endpoints

### Problems:
`GET /api/problems` - Get all problems
`GET /api/problems/{id}` - Get problem by ID
`GET /api/problems/leetcode/{leetcode_id}` - Get problem by LeetCode ID
`POST /api/problems` - Create new problem (Admin)
`PUT /api/problems/{id}` - Update problem (Admin)

### Practice Problems:
`GET /api/practice` - Get all practice problems
`GET /api/practice/{id}` - Get practice problem by ID
`POST /api/practice` - Create new practice problem (Admin)
`PUT /api/practice/{id}` - Update practice problem (Admin)

### Concepts:
`GET /api/concepts` - Get all concepts
`GET /api/concepts/{id}` - Get concept by ID
`POST /api/concepts` - Create new concept (Admin)
`PUT /api/concepts/{id}` - Update concept (Admin)

### Notes:
`GET /api/notes` - Get all notes
`GET /api/notes/{slug}` - Get note by slug
`POST /api/notes` - Create new note (Admin)
`PUT /api/notes/{slug}` - Update note (Admin)
`DELETE /api/notes/{slug}` - Delete note (Admin)

### Admin:
`POST /api/admin/login` - Admin login
`GET /api/admin/verify` - Verify admin token

### Profile:
`GET /api/profile` - Get all profile settings
`PUT /api/profile/bulk` - Update profile settings (Admin)

---

## 🚀 Deployment

Deploy Backend to Render:
1. Push code to GitHub
2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Set environment variables
6. Deploy

### Deploy Backend to Railway:
- npm install -g @railway/cli
- railway login
- railway init
- railway variables set DATABASE_URL="your_neon_url"
- railway variables set ADMIN_PASSWORD="your_password"
- railway variables set API_SECRET_KEY="your_secret"
- railway up

Deploy Frontend to Vercel:
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Add New Project"
4. Import your GitHub repository
5. Set environment variables
6. Deploy

---

## 🎨 Color Scheme

- Primary - LeetCode Yellow - #FFA116
- Background (Light) - Cream - #FDFBF7
- Background (Dark) - Dark Navy - #0A0A1A
- Card Background - White / Dark Slate - #FFFFFF / #14142D
- Text (Light) - Dark Gray - #1A1A2E
- Text (Dark) - Light Gray - #A0A0C0
- Border - Beige / Dark Gray - #E8DCC8 / #2A2A4A

---
## 📈 Database Schema

### Problems Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| leetcode_id | INTEGER | LeetCode problem number |
| title | VARCHAR(255) | Problem title |
| difficulty | ENUM | EASY, MEDIUM, HARD |
| statement | TEXT | Problem statement |
| description | TEXT | Detailed description |
| concept | TEXT | Main concept |
| pattern | TEXT | Problem solving pattern |
| algorithm | TEXT | Step-by-step algorithm |
| notebook_concept | TEXT | Personal notes |
| java_solution | TEXT | Java solution code |
| python_solution | TEXT | Python solution code |

### Practice Problems Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| title | VARCHAR(255) | Problem title |
| language | ENUM | JAVA, PYTHON |
| difficulty | ENUM | BEGINNER, INTERMEDIATE, ADVANCED |
| question | TEXT | Problem question |
| hints | JSONB | Array of hints |
| solution | TEXT | Solution code |
| tags | JSONB | Array of tags |

### Concepts Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Concept name |
| definition | TEXT | Concept definition |
| example | TEXT | Code example |

### Notes Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary Key |
| title | VARCHAR(255) | Note title |
| slug | VARCHAR(255) | URL slug |
| description | TEXT | Note description |
| icon | VARCHAR(50) | Emoji icon |
| content | JSONB | Structured content |
| tags | JSONB | Array of tags |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| JWT Authentication | Stateless authentication with expiration |
| Password Hashing | bcrypt with 10 salt rounds |
| SQL Injection Prevention | Parameterized queries |
| CORS Configuration | Restricted to allowed origins |
| Environment Variables | Sensitive data never hardcoded |
| Admin Only Routes | Protected with authentication middleware |

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (git checkout -b feature/amazing-feature)
3. Make your changes
4. Commit your changes (git commit -m 'Add amazing feature')
5. Push to the branch (git push origin feature/amazing-feature)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [LeetCode](https://leetcode.com) for problem statements
- [FastAPI](https://fastapi.tiangolo.com) for the awesome backend framework
- [React](https://reactjs.org) for the frontend library
- [Vercel](https://vercel.com) for hosting
- [Neon](https://neon.tech) for database hosting
- [Tailwind CSS](https://tailwindcss.com) for styling

---

## 📞 Contact

**G Nihal**

[![GitHub](https://img.shields.io/badge/GitHub-nihal705-181717?style=for-the-badge&logo=github)](https://github.com/nihal705)
[![Email](https://img.shields.io/badge/Email-nihalmohammad705@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:nihalmohammad705@gmail.com)

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FFA116,100:0A0A1A&height=160&section=footer&text=Designed%20and%20Developed%20by%20G%20Nihal&fontSize=20&fontColor=FFFFFF&animation=twinkling&fontAlignY=65"/>
</p>