# Companies House Search Web Application

A Flask-based web application for searching and analyzing Companies House data, with a focus on financial advisory firms.

## Features

- Secure login system
- Search for companies using predefined terms or custom queries
- View company details including:
  - Company name and number
  - Status and address
  - Youngest director's age
  - Highlighting of companies with elderly directors (60+ years)
- Direct links to Companies House records
- Clean, responsive interface using Tailwind CSS

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create an `api_keys.env` file in the root directory with your Companies House API key:
   ```
   COMPANIES_HOUSE_API_KEY=your_api_key_here
   ```

5. Run the application:
   ```bash
   python app.py
   ```

6. Access the application at `http://127.0.0.1:5000`

## Login Credentials

- Username: `ian`
- Password: `shipley`

## Project Structure

```
.
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── api_keys.env           # API keys (not in version control)
├── templates/             # HTML templates
│   ├── index.html        # Main search page
│   └── login.html        # Login page
└── tests/                # Test scripts
    ├── test_companies_house.py
    ├── test_fca_register.py
    ├── get_youngest_directors.py
    └── fetch_all_companies.py
```

## API Integration

The application uses the Companies House API to:
- Search for companies
- Retrieve company details
- Fetch director information

## Security

- Session-based authentication
- API keys stored in environment variables
- Protected routes requiring login
- Secure password handling

## Dependencies

- Flask
- pandas
- requests
- python-dotenv
- Tailwind CSS (CDN)

## Development

To modify the application:
1. Make changes to the relevant files
2. The application will automatically reload in debug mode
3. Test your changes locally
4. Commit and push changes

## License

This project is licensed under the MIT License - see the LICENSE file for details. # Vercel deployment
# Vercel deployment

