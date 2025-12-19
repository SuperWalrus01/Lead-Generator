# Companies House Search - Full Stack JavaScript Application

**Migration Complete: Python Flask → Node.js/Express + React** ✅

This application searches the Companies House API for financial advisory firms and identifies companies with directors aged 60+.

---

## 🏗️ Architecture

### **Backend (Node.js/Express)**
- Port: `3001`
- Location: `/server.js`
- API: RESTful endpoints at `/api/*`
- Session-based authentication

### **Frontend (React + Vite)**
- Port: `5173` (default Vite dev server)
- Location: `/frontend/`
- Modern React with Hooks
- Tailwind CSS styling
- React Router for navigation

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- Companies House API key in `api_keys.env`

### 1. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
npm start
# Server running at http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# React app running at http://localhost:5173
```

### 3. Access the Application
Open your browser to: **http://localhost:5173**

**Login Credentials:**
- Username: `ian`
- Password: `shipley`

---

## 📁 Project Structure

```
IFAs-main/
├── server.js              # Express backend
├── package.json           # Backend dependencies
├── api_keys.env           # Environment variables
├── BACKEND_API.md         # Backend documentation
├── FRONTEND_REACT.md      # Frontend documentation
│
├── frontend/              # React application
│   ├── src/
│   │   ├── App.jsx       # Main app with routing
│   │   ├── main.jsx      # React entry point
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── CompanyCard.jsx
│   │   └── ...
│   └── package.json      # Frontend dependencies
│
├── templates/            # Original Flask templates (legacy)
├── app.py               # Original Flask app (legacy)
└── requirements.txt     # Original Python deps (legacy)
```

---

## 🔄 Migration Summary

### **Phase 1: Backend (Complete ✅)**
- ✅ Flask → Express.js
- ✅ Python requests → axios
- ✅ Pandas DataFrames → Native JavaScript arrays
- ✅ Session authentication maintained
- ✅ All API endpoints recreated

### **Phase 2: Frontend (Complete ✅)**
- ✅ Jinja2 templates → React components
- ✅ Server-side rendering → Client-side rendering
- ✅ Vanilla JS → React Hooks (useState, useEffect)
- ✅ DOM manipulation → Declarative rendering
- ✅ Tailwind CSS maintained

---

## 🎯 Features

- **Authentication**: Login/logout with session management
- **Search**: Query Companies House API with predefined or custom terms
- **Filtering**: Automatically filters for active companies only
- **Director Analysis**: Fetches youngest director and age for each company
- **Highlighting**: Visual indicators for companies with elderly directors (60+)
- **Responsive Design**: Mobile-friendly Tailwind CSS layout

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/login` | User authentication |
| POST | `/api/logout` | User logout |
| GET | `/api/auth/status` | Check auth status |
| GET | `/api/search-terms` | Get predefined search terms |
| POST | `/api/search` | Search companies (requires auth) |
| POST | `/api/get_directors` | Get director info (requires auth) |

See `BACKEND_API.md` for detailed API documentation.

---

## 🛠️ Development

### Backend Development Mode (with auto-restart):
```bash
npm run dev
```

### Frontend Development Mode:
```bash
cd frontend
npm run dev
```

### Build Frontend for Production:
```bash
cd frontend
npm run build
```

---

## 🧪 Testing the Full Stack

1. **Start both servers** (backend on 3001, frontend on 5173)
2. **Open** http://localhost:5173 in your browser
3. **Login** with credentials: `ian` / `shipley`
4. **Search** for a term like "financial adviser"
5. **View results** - companies with directors 60+ will be highlighted

---

## 🔑 Environment Variables

Create/update `api_keys.env`:
```env
COMPANIES_HOUSE_API_KEY=your_api_key_here
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## 📦 Dependencies

### Backend
- express
- axios
- express-session
- cors
- dotenv

### Frontend
- react
- react-dom
- react-router-dom
- vite

---

## 📚 Additional Documentation

- **Backend Details**: See `BACKEND_API.md`
- **Frontend Details**: See `FRONTEND_REACT.md`

---

## ✨ What's New in JavaScript Version

1. **Modern Stack**: Node.js + React (industry standard)
2. **Better Performance**: Native JS arrays instead of Pandas
3. **Decoupled Architecture**: Separate frontend/backend
4. **Hot Reload**: Vite dev server for instant updates
5. **Type Safety Ready**: Easy to add TypeScript later
6. **Scalable**: Can deploy frontend/backend independently

---

## 🎉 Migration Complete!

Your Flask application has been fully migrated to a modern JavaScript stack. Both backend and frontend are functional and communicate via REST API.

**Next Steps:**
- Test all functionality
- Deploy to production (Vercel/Netlify for frontend, Heroku/Railway for backend)
- Add more features as needed

Enjoy your new JavaScript stack! 🚀
