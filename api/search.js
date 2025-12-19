import axios from 'axios';

// Helper function to flatten nested objects
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

async function fetchCompaniesPage(startIndex, searchTerm, apiKey) {
    const BASE_CH = 'https://api.company-information.service.gov.uk';
    const PER_PAGE = 100;

    const params = {
        q: searchTerm,
        items_per_page: PER_PAGE,
        start_index: startIndex
    };

    try {
        const response = await axios.get(`${BASE_CH}/search/companies`, {
            params,
            auth: {
                username: apiKey,
                password: ''
            }
        });

        const data = response.data;
        const items = data.items || [];
        const totalResults = data.total_results || 0;

        if (items.length === 0) {
            return { companies: [], totalResults };
        }

        const flattenedItems = items.map(item => flattenObject(item));
        const activeCompanies = flattenedItems.filter(company => company.company_status === 'active');

        return { companies: activeCompanies, totalResults };
    } catch (error) {
        console.error(`Error fetching page ${startIndex}:`, error.message);
        return null;
    }
}

async function getYoungestDirector(companyNumber, apiKey) {
    const BASE_CH = 'https://api.company-information.service.gov.uk';

    try {
        const response = await axios.get(`${BASE_CH}/company/${companyNumber}/officers`, {
            auth: {
                username: apiKey,
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

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { search_term } = req.body;
    const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY;

    if (!search_term) {
        return res.status(400).json({ error: 'Please enter a search term' });
    }

    if (!COMPANIES_HOUSE_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    let allCompanies = [];
    let startIndex = 0;
    let totalResults = null;
    const maxResults = 100;
    const REQUEST_DELAY = 200;

    try {
        // First page
        const firstPage = await fetchCompaniesPage(0, search_term, COMPANIES_HOUSE_API_KEY);
        
        if (!firstPage || firstPage.totalResults === 0) {
            return res.status(404).json({ error: 'No companies found matching your search criteria' });
        }

        totalResults = firstPage.totalResults;

        if (firstPage.companies.length > 0) {
            allCompanies = allCompanies.concat(firstPage.companies);
        }

        // Additional pages
        while (allCompanies.length < Math.min(totalResults, maxResults)) {
            startIndex += 100;
            if (startIndex >= totalResults) {
                break;
            }

            const page = await fetchCompaniesPage(startIndex, search_term, COMPANIES_HOUSE_API_KEY);

            if (page && page.companies.length > 0) {
                allCompanies = allCompanies.concat(page.companies);
            }

            await delay(REQUEST_DELAY);
        }

        if (allCompanies.length === 0) {
            return res.status(404).json({ error: 'No companies found matching your search criteria' });
        }

        // Process companies
        const results = [];
        for (const company of allCompanies) {
            try {
                const companyNumber = company.company_number || '';
                const { directorName, age } = await getYoungestDirector(companyNumber, COMPANIES_HOUSE_API_KEY);

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

        const elderlyResults = results.filter(company => company.is_elderly);

        return res.json({
            results: elderlyResults,
            total_found: totalResults,
            total_returned: elderlyResults.length
        });

    } catch (error) {
        console.error(`Error in search:`, error.message);
        return res.status(500).json({ error: `An error occurred while searching: ${error.message}` });
    }
}
