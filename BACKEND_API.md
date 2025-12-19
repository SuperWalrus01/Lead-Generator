# Backend API Documentation

## Express Server - Phase 1 Complete ✅

### Overview
The Flask application has been successfully translated to Express.js (Node.js). The server runs on **port 3001** by default.

### What Was Translated

#### 1. **Dependencies Mapping**
- `flask` → `express`
- `requests` → `axios`
- `pandas` → Native JavaScript array methods (`.filter()`, `.map()`, `.reduce()`)
- `python-dotenv` → `dotenv`
- Flask sessions → `express-session`

#### 2. **Key Translations**

**Pandas DataFrame Operations → JavaScript Arrays:**
- `pd.json_normalize(items)` → `flattenObject()` custom function
- `df[df['company_status'] == 'active']` → `array.filter(company => company.company_status === 'active')`
- `pd.concat()` → `array.concat()`
- `df.iterrows()` → `for...of` loop

**Authentication:**
- Flask's `@login_required` decorator → Express middleware function `loginRequired()`
- Flask sessions → express-session with same logic

**API Calls:**
- Python `requests.get()` → `axios.get()` with async/await
- Basic auth maintained exactly the same way

#### 3. **Server Running**
The server successfully started and responded to health check:
```bash
✅ Server is running on port 3001
✅ Health check: {"status":"ok","message":"Server is running"}
```

---

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication Required
All routes except `/login`, `/health`, and `/auth/status` require authentication via session cookies.

---

### 1. **Health Check**
**GET** `/api/health`

Check if server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

### 2. **Login**
**POST** `/api/login`

Authenticate user and create session.

**Request Body:**
```json
{
  "username": "ian",
  "password": "shipley"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### 3. **Logout**
**POST** `/api/logout`

Destroy user session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. **Check Auth Status**
**GET** `/api/auth/status`

Check if user is logged in.

**Response:**
```json
{
  "isLoggedIn": true
}
```

---

### 5. **Get Search Terms**
**GET** `/api/search-terms`

Get predefined search terms.

**Response:**
```json
{
  "searchTerms": [
    "financial advi",
    "financial planning",
    "wealth management",
    ...
  ]
}
```

---

### 6. **Search Companies** 🔒
**POST** `/api/search`

Search Companies House API for financial advisory firms with elderly directors (60+).

**Request Body:**
```json
{
  "search_term": "financial adviser"
}
```

**Success Response:**
```json
{
  "results": [
    {
      "name": "ABC Financial Advisers Ltd",
      "number": "12345678",
      "status": "active",
      "address": "123 Main Street",
      "postcode": "SW1A 1AA",
      "link": "https://find-and-update.company-information.service.gov.uk/company/12345678",
      "director_name": "John Smith",
      "age": 65,
      "is_elderly": true
    }
  ],
  "total_found": 500,
  "total_returned": 25
}
```

**Error Responses:**
- `400`: Missing search term
- `404`: No companies found
- `500`: Server error

---

### 7. **Get Directors** 🔒
**POST** `/api/get_directors`

Get youngest director info for a specific company.

**Request Body:**
```json
{
  "company_number": "12345678"
}
```

**Response:**
```json
{
  "director_name": "John Smith",
  "age": 65,
  "is_elderly": true
}
```

---

## Testing the Backend

### Using curl:

```bash
# 1. Check health
curl http://localhost:3001/api/health

# 2. Login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ian","password":"shipley"}' \
  -c cookies.txt

# 3. Search (with session)
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"search_term":"financial adviser"}' \
  -b cookies.txt

# 4. Get directors (with session)
curl -X POST http://localhost:3001/api/get_directors \
  -H "Content-Type: application/json" \
  -d '{"company_number":"12345678"}' \
  -b cookies.txt
```

---

## Running the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

---

## Environment Variables

Create/use `api_keys.env` file:
```env
COMPANIES_HOUSE_API_KEY=your_api_key_here
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## Key Features

✅ **Session-based authentication** (same as Flask)  
✅ **CORS enabled** for React frontend  
✅ **Native JavaScript** - No heavy data libraries  
✅ **Async/await** for all API calls  
✅ **Error handling** with detailed logging  
✅ **Rate limiting** via REQUEST_DELAY  
✅ **Filters for active companies only**  
✅ **Identifies elderly directors (60+)**  

---

## Next Steps: Phase 2 - React Frontend

Ready to convert the HTML templates to React components! 🚀
