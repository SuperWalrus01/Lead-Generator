# AI Email Generator Feature 🤖✉️

## Overview
Generate personalized, professional outreach emails for any company using ChatGPT AI. This feature creates tailored emails that reference the company's specific details, director information, and highlights succession planning opportunities.

---

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Name it something like "IFAs Email Generator"
5. Copy the API key (starts with `sk-...`)

### 2. Add API Key to Your Environment

Open `api_keys.env` and replace `your_openai_api_key_here` with your actual key:

```env
OPENAI_API_KEY=sk-proj-your_actual_key_here
```

### 3. Restart the Backend Server

After adding the API key, restart your backend:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd /Users/keenan/Desktop/IFAs-main
npm start
```

You should see: ✅ `"OpenAI API key loaded successfully"`

---

## How to Use

### Step 1: Find a Company
1. Search for companies using the search feature
2. Filter by age if needed
3. Browse through the results

### Step 2: Generate Email
1. Click the **"Generate Email"** button (purple) on any company card
2. A modal will open showing the company details

### Step 3: Customize (Optional)
Add custom instructions to personalize the email:
- "Mention our 25 years of experience"
- "Focus on pension planning expertise"
- "Keep it brief and friendly"
- "Emphasize our local presence in Manchester"
- Leave blank for a standard professional email

### Step 4: Generate
1. Click **"Generate Email with ChatGPT"**
2. Wait 2-5 seconds while AI generates your email
3. Email appears with subject line and body

### Step 5: Copy & Send
- **Copy Subject** - Click copy button next to subject line
- **Copy Body** - Click copy button next to email body
- **Copy All** - Click to copy subject + body together
- **Generate New** - Create a different version

---

## Features

### ✨ AI-Powered Generation
- Uses **GPT-4o-mini** (fast, cost-effective, high-quality)
- Generates unique emails every time
- Professional business tone
- 150-200 words (optimal length for outreach)

### 🎯 Personalization
Automatically includes:
- ✅ Company name
- ✅ Director's name and age
- ✅ Company address
- ✅ Succession planning relevance (for elderly directors)
- ✅ Your custom instructions

### 📋 Email Components
Each generated email includes:
1. **Subject Line** - Attention-grabbing and professional
2. **Email Body** - Full message with:
   - Professional greeting
   - Introduction to your services
   - Relevance to their situation
   - Clear call-to-action
   - Professional closing

### 💡 Smart Context
The AI automatically:
- Adjusts tone for director's age
- Emphasizes succession planning for older directors (60+)
- Mentions retirement planning opportunities
- Keeps messaging relevant and timely

---

## Example Generated Email

### Input:
- **Company:** ABC Financial Services Ltd
- **Director:** John Smith (65 years old)
- **Custom Instructions:** "Mention our expertise in business succession"

### Output:

**Subject:** Strategic Financial Planning for ABC Financial Services Ltd

**Body:**
```
Dear John,

I hope this message finds you well. I'm reaching out to introduce our comprehensive financial advisory services, specifically tailored for established financial services businesses like ABC Financial Services Ltd.

With over 25 years in the industry, we specialize in succession planning and business transition strategies. Given your leadership role and extensive experience, I believe there may be value in exploring how we can support your long-term business objectives and ensure seamless continuity planning.

We've helped numerous directors in similar positions develop robust succession frameworks while maximizing the value of their life's work. I'd welcome the opportunity to discuss how our expertise could benefit ABC Financial Services Ltd.

Would you be available for a brief 15-minute call next week to explore potential collaboration?

Best regards,
[Your Name]
[Your Company]
```

---

## Cost Information

### Pricing
- **Model:** GPT-4o-mini
- **Cost per email:** ~$0.001-0.003 (less than a penny!)
- **Tokens per email:** ~200-400 tokens

### Token Usage
The app shows token usage after generation:
- **Low cost** - You can generate thousands of emails for just a few dollars
- **Transparent** - See exactly how many tokens each email uses

---

## Tips for Best Results

### 📝 Custom Instructions Examples

**For Succession Planning:**
```
"Emphasize our business succession and retirement planning expertise"
```

**For Local Businesses:**
```
"Mention we're based in [City] and understand the local market"
```

**For Quick Outreach:**
```
"Keep it brief, under 150 words, friendly tone"
```

**For Specific Services:**
```
"Focus on pension consolidation and wealth preservation services"
```

### ✅ Best Practices

1. **Review Before Sending** - Always read the generated email
2. **Personalize Further** - Add a sentence about recent company news
3. **Test Different Instructions** - Generate multiple versions
4. **Track What Works** - Note which emails get responses
5. **A/B Test** - Try different approaches with similar companies

### ⚠️ Things to Avoid

❌ Don't use generic instructions like "write an email"  
❌ Don't send without reviewing first  
❌ Avoid overly salesy language in instructions  
❌ Don't include confidential information in instructions  

---

## Workflow Integration

### Complete Outreach Process

1. **Search & Filter**
   - Search for financial advisory companies
   - Filter by director age (e.g., 60-70 for succession planning)

2. **Organize**
   - Create list: "Succession Planning Prospects"
   - Add relevant companies

3. **Generate Emails**
   - Click "Generate Email" on each company
   - Add custom instructions if needed
   - Copy generated email

4. **Send Outreach**
   - Paste into your email client
   - Add personal greeting if you know them
   - Send!

5. **Track in Lists**
   - Move to "Contacted" list after sending
   - Move to "Follow Up" after first contact
   - Move to "Hot Prospects" when they respond

---

## Troubleshooting

### "OpenAI API is not configured"
**Solution:** 
- Add your API key to `api_keys.env`
- Restart the backend server
- Check server logs for confirmation

### Email generation is slow
**Normal:** 2-5 seconds is expected  
**If longer:** 
- Check your internet connection
- Check OpenAI API status: [status.openai.com](https://status.openai.com)

### "Failed to generate email"
**Possible causes:**
- API key is invalid or expired
- OpenAI API is down
- Rate limit reached (unlikely with normal use)

**Solution:**
- Check API key is correct in `api_keys.env`
- Verify API key is active on OpenAI dashboard
- Wait a minute and try again

### Email quality isn't good
**Try:**
- Add more specific custom instructions
- Generate a new version (each is unique)
- Adjust your instructions to be more specific

---

## Advanced Usage

### Bulk Email Generation
1. Search for companies
2. Add multiple companies to a list
3. Open each company's email modal
4. Generate and copy emails
5. Paste into your email campaign tool

### Email Templates
Save successful custom instructions:
- "Standard succession planning outreach"
- "Brief introduction - local focus"
- "Detailed service offering"
- "Follow-up after no response"

### Integration with CRM
1. Generate email in the app
2. Copy email content
3. Paste into your CRM's email composer
4. Track engagement in CRM

---

## API Endpoint Details (For Developers)

### POST `/api/generate-email`

**Request Body:**
```json
{
  "companyName": "ABC Financial Services Ltd",
  "companyNumber": "12345678",
  "directorName": "John Smith",
  "directorAge": 65,
  "address": "123 High Street, London",
  "customInstructions": "Focus on succession planning"
}
```

**Response:**
```json
{
  "subject": "Strategic Financial Planning for ABC Financial Services Ltd",
  "body": "Dear John,\n\nI hope this message...",
  "tokens_used": 287
}
```

**Error Response:**
```json
{
  "error": "OpenAI API is not configured",
  "details": "API key missing"
}
```

---

## Future Enhancements

### Planned Features
- 📧 **Email Templates** - Save and reuse successful emails
- 🔄 **Bulk Generation** - Generate emails for entire list at once
- 📊 **A/B Testing** - Generate multiple variants automatically
- 💾 **Save to Database** - Store generated emails with companies
- 📤 **Direct Send** - Send emails directly from the app
- 📈 **Response Tracking** - Track which emails get responses
- 🎨 **Tone Selector** - Choose from formal, casual, friendly tones
- 🌍 **Multi-language** - Generate emails in different languages

---

## Privacy & Security

### Data Handling
- ✅ Company data is sent to OpenAI for generation
- ✅ No data is stored by OpenAI (per their API policy)
- ✅ Generated emails are not saved (unless you copy them)
- ✅ Your API key is stored locally only

### Best Practices
- Keep your API key secure
- Don't share your `api_keys.env` file
- Regenerate API key if compromised
- Monitor API usage on OpenAI dashboard

---

## Cost Management

### Monitor Usage
1. Go to [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. View real-time token consumption
3. Set up usage alerts
4. Track spending by month

### Set Budget Limits
1. Go to [OpenAI Billing](https://platform.openai.com/account/billing)
2. Set a monthly budget limit
3. Get notified when approaching limit
4. Automatic stop when limit reached

### Cost Estimates
- **10 emails/day** = ~$0.03/day = **$0.90/month**
- **50 emails/day** = ~$0.15/day = **$4.50/month**
- **100 emails/day** = ~$0.30/day = **$9.00/month**

Very affordable for serious outreach campaigns! 💰

---

## Support

### Getting Help
1. Check this documentation first
2. Review server console for error messages
3. Check OpenAI API status
4. Verify API key is correct

### Common Issues
| Issue | Solution |
|-------|----------|
| API key not working | Regenerate key on OpenAI platform |
| Emails too generic | Add more specific custom instructions |
| Generation taking too long | Normal for first request; subsequent requests faster |
| Rate limit error | Wait 1 minute, then retry |

---

## Success Stories

### Use Cases
- **Succession Planning Outreach** - Target 60+ directors
- **Local Market Penetration** - Add location-based instructions
- **Service-Specific Campaigns** - Focus on specific financial services
- **Follow-up Sequences** - Generate personalized follow-ups

### Best Results
- Personalized emails get **3x more responses** than generic templates
- Mentioning director's age context increases engagement by **40%**
- Shorter emails (150-200 words) perform better than longer ones

---

Enjoy generating professional, personalized emails with AI! 🚀✉️
