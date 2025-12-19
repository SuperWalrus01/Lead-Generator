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

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    res.json({ searchTerms: SEARCH_TERMS });
}
