import OpenAI from 'openai';

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

    const { companyName, companyNumber, directorName, directorAge, address, customInstructions } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!companyName) {
        return res.status(400).json({ error: 'Company name is required' });
    }

    if (!OPENAI_API_KEY) {
        return res.status(503).json({ error: 'Email generation service is not configured. Please contact support.' });
    }

    try {
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
}
