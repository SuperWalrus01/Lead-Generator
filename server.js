import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { supabase } from './supabaseClient.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: 'api_keys.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!COMPANIES_HOUSE_API_KEY) {
    console.error("ERROR: COMPANIES_HOUSE_API_KEY not found in environment variables");
    console.error("Please check that api_keys.env exists and contains the API key");
} else {
    console.log("Companies House API key loaded successfully");
    console.log(`API key length: ${COMPANIES_HOUSE_API_KEY.length} characters`);
}

if (!OPENAI_API_KEY) {
    console.warn("WARNING: OPENAI_API_KEY not found in environment variables");
    console.warn("Email generation feature will not be available");
} else {
    console.log("OpenAI API key loaded successfully");
}

// Initialize OpenAI client
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const BASE_CH = 'https://api.company-information.service.gov.uk';
const PER_PAGE = 100;
const REQUEST_DELAY = 200; // 0.2 seconds in milliseconds

// Define search terms
const SEARCH_TERMS = [
    'Financial Advi',
    'Financial Planning',
    'Wealth Management',
    'Investment Advice',
    'Pension Advice',
    'Financial Consultant',
    'Financial Adviser',
    'Financial Advisor',
    'IFA',
    'Independent Financial',
    'Wealth Adviser',
    'Wealth Advisor',
    'Pension Consultant',
    'Investment Consultant',
    'Financial Services',
    'Wealth Planning',
    'Retirement Planning',
    'Financial Guidance',
    'Financial Solutions',
    'Financial Expertise'
];

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to flatten nested objects (replaces pandas json_normalize)
function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const prefixedKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(acc, flattenObject(obj[key], prefixedKey));
        } else {
            acc[prefixedKey] = obj[key];
        }
        return acc;
    }, {});
}

// Helper function to get nested property value
function getNestedProperty(obj, path, defaultValue = '') {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
}

// Delay helper function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a single page of companies
 * Returns: { companies: Array, totalResults: Number } or null
 */
async function fetchCompaniesPage(startIndex, searchTerm) {
    if (!COMPANIES_HOUSE_API_KEY) {
        console.error("ERROR: No API key available");
        return null;
    }

    const params = {
        q: searchTerm,
        items_per_page: PER_PAGE,
        start_index: startIndex
    };

    try {
        console.log(`Making API request to ${BASE_CH}/search/companies with params:`, params);
        
        const response = await axios.get(`${BASE_CH}/search/companies`, {
            params,
            auth: {
                username: COMPANIES_HOUSE_API_KEY,
                password: ''
            }
        });

        console.log(`Response status code: ${response.status}`);

        const data = response.data;
        const items = data.items || [];
        const totalResults = data.total_results || 0;
        console.log(`Found ${items.length} items, total results: ${totalResults}`);

        if (items.length === 0) {
            console.log(`No items found for search term '${searchTerm}' at index ${startIndex}`);
            return { companies: [], totalResults };
        }

        // Flatten nested objects
        const flattenedItems = items.map(item => flattenObject(item));
        console.log(`Created array with ${flattenedItems.length} items`);
        
        // Filter for active companies
        const activeCompanies = flattenedItems.filter(company => company.company_status === 'active');
        console.log(`After filtering for active companies: ${activeCompanies.length} items`);

        if (activeCompanies.length === 0) {
            console.log(`No active companies found for search term '${searchTerm}' at index ${startIndex}`);
            return { companies: [], totalResults };
        }

        return { companies: activeCompanies, totalResults };

    } catch (error) {
        console.error(`Error fetching page ${startIndex}:`, error.message);
        if (error.response) {
            console.error(`Response status: ${error.response.status}`);
            console.error(`Response data:`, error.response.data);
        }
        return null;
    }
}

/**
 * Get the youngest director for a company
 * Returns: { directorName: String|null, age: Number|null }
 */
async function getYoungestDirector(companyNumber) {
    try {
        const response = await axios.get(`${BASE_CH}/company/${companyNumber}/officers`, {
            auth: {
                username: COMPANIES_HOUSE_API_KEY,
                password: ''
            }
        });

        if (response.status !== 200) {
            return { directorName: null, age: null };
        }

        const data = response.data;
        const officers = data.items || [];

        let youngestAge = Infinity;
        let youngestDirector = null;

        for (const officer of officers) {
            if (officer.officer_role === 'director') {
                const dob = officer.date_of_birth;
                if (dob && dob.year) {
                    const currentYear = new Date().getFullYear();
                    const age = currentYear - dob.year;
                    if (age < youngestAge) {
                        youngestAge = age;
                        youngestDirector = officer.name;
                    }
                }
            }
        }

        return {
            directorName: youngestDirector,
            age: youngestAge !== Infinity ? youngestAge : null
        };

    } catch (error) {
        console.error(`Error fetching directors for ${companyNumber}:`, error.message);
        return { directorName: null, age: null };
    }
}

// Middleware: Require Supabase authentication for protected routes
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Get search terms
app.get('/api/search-terms', (req, res) => {
    res.json({ searchTerms: SEARCH_TERMS });
});

// Search companies
app.post('/api/search', requireAuth, async (req, res) => {
    const searchTerm = req.body.search_term;
    console.log(`Received search request for term: ${searchTerm}`);

    if (!searchTerm) {
        console.log("No search term provided");
        return res.status(400).json({ error: 'Please enter a search term' });
    }

    let allCompanies = [];
    let startIndex = 0;
    let totalResults = null;
    const maxResults = 100;

    try {
        // First, get the total number of results
        const firstPage = await fetchCompaniesPage(0, searchTerm);
        
        if (!firstPage || firstPage.totalResults === 0) {
            return res.status(404).json({ error: 'No companies found matching your search criteria' });
        }

        totalResults = firstPage.totalResults;
        console.log(`Total results found: ${totalResults}`);

        if (firstPage.companies.length > 0) {
            allCompanies = allCompanies.concat(firstPage.companies);
        }

        // Process additional pages up to maxResults
        while (allCompanies.length < Math.min(totalResults, maxResults)) {
            startIndex += PER_PAGE;
            if (startIndex >= totalResults) {
                break;
            }

            console.log(`Fetching page starting at index ${startIndex}`);
            const page = await fetchCompaniesPage(startIndex, searchTerm);

            if (page && page.companies.length > 0) {
                console.log(`Adding ${page.companies.length} companies to results`);
                allCompanies = allCompanies.concat(page.companies);
            }

            await delay(REQUEST_DELAY);
        }

        if (allCompanies.length === 0) {
            console.log("No companies found after all pages processed");
            return res.status(404).json({ error: 'No companies found matching your search criteria' });
        }

        console.log(`Processing ${allCompanies.length} companies for response`);

        // Process each company and get director info
        const results = [];
        for (const company of allCompanies) {
            try {
                const companyNumber = company.company_number || '';
                const { directorName, age } = await getYoungestDirector(companyNumber);

                // Skip companies with no director information
                if (age === null) {
                    continue;
                }

                const companyData = {
                    name: company.title || '',
                    number: company.company_number || '',
                    status: company.company_status || '',
                    address: getNestedProperty(company, 'address.address_line_1', ''),
                    postcode: getNestedProperty(company, 'address.postal_code', ''),
                    link: `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}`,
                    director_name: directorName,
                    age: age,
                    is_elderly: age >= 60
                };

                results.push(companyData);
            } catch (error) {
                console.error(`Error processing company:`, error.message);
                continue;
            }
        }

        // Filter results to only include companies with elderly directors
        const elderlyResults = results.filter(company => company.is_elderly);

        console.log(`Returning ${elderlyResults.length} companies in response`);
        return res.json({
            results: elderlyResults,
            total_found: totalResults,
            total_returned: elderlyResults.length
        });

    } catch (error) {
        console.error(`Error in search route:`, error.message);
        return res.status(500).json({ error: `An error occurred while searching: ${error.message}` });
    }
});

// Generate email using ChatGPT
app.post('/api/generate-email', requireAuth, async (req, res) => {
    const { companyName, companyNumber, directorName, directorAge, address, customInstructions } = req.body;

    if (!companyName) {
        return res.status(400).json({ error: 'Company name is required' });
    }

    if (!openai) {
        return res.status(503).json({ error: 'Email generation service is not configured. Please contact support.' });
    }

    try {
        const prompt = `You are a professional business development representative for a financial advisory firm. Write a personalized, professional email to persuade the director to join your client's company.

Company Name: ${companyName}
Company Number: ${companyNumber || 'N/A'}
Director Name: ${directorName || 'Not specified'}
Director Age: ${directorAge || 'N/A'}
Address: ${address || 'N/A'}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

The email should:
1. Be professional, persuasive, and courteous
2. Introduce your client's financial advisory firm
3. Highlight the benefits of joining the company (career growth, resources, team support, succession planning opportunities)
4. Emphasize how the director's experience would be valuable to the firm
5. Make a compelling case for why they should consider this opportunity
6. Address succession planning benefits (especially relevant given the director's age)
7. Be concise (150-250 words)
8. Include a clear call-to-action to schedule a meeting or conversation
9. Have an engaging subject line

Format the response as JSON with two fields:
- "subject": The email subject line
- "body": The email body

Do not include any other text outside the JSON.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional email writer specializing in recruitment and business development for financial advisory firms. Your goal is to persuade experienced financial advisors to join your client\'s firm. Always respond with valid JSON containing "subject" and "body" fields.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 600,
            response_format: { type: "json_object" }
        });

        const emailContent = JSON.parse(completion.choices[0].message.content);

        return res.json({
            subject: emailContent.subject,
            body: emailContent.body,
            tokens_used: completion.usage.total_tokens
        });

    } catch (error) {
        console.error('Error generating email:', error);
        return res.status(500).json({ 
            error: 'Failed to generate email',
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('All authentication now handled by Supabase');
});
