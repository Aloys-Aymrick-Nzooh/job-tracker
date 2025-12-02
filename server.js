const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8000;
const EXCEL_FILE = 'job-applications.xlsx';

const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');
const cheerio = require('cheerio');


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
})

// ollama apo config
const OLLAMA_API = 'http://host.docker.internal:11434/api/generate';
const MODEL = "llama3.2:latest";


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Excel file if it doesn't exist
function initializeExcelFile() {
    if (!fs.existsSync(EXCEL_FILE)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, ws, 'Applications');
        XLSX.writeFile(wb, EXCEL_FILE);
        console.log('Created new Excel file:', EXCEL_FILE);
    }
}

// Read applications from Excel
function readApplications() {
    try {
        if (!fs.existsSync(EXCEL_FILE)) {
            return [];
        }
        const workbook = XLSX.readFile(EXCEL_FILE);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        return data;
    } catch (error) {
        console.error('Error reading Excel file:', error);
        return [];
    }
}

// Write applications to Excel
function writeApplications(applications) {
    try {
        const ws = XLSX.utils.json_to_sheet(applications);
        
        // Set column widths
        ws['!cols'] = [
            {wch: 15}, // ID
            {wch: 20}, // Company
            {wch: 25}, // Position
            {wch: 15}, // Location
            {wch: 12}, // Date Applied
            {wch: 18}, // Status
            {wch: 15}, // Salary Range
            {wch: 20}, // Contact Person
            {wch: 40}, // Job URL
            {wch: 50}  // Notes
        ];
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Applications');
        XLSX.writeFile(wb, EXCEL_FILE);
        console.log('Excel file updated successfully');
        return true;
    } catch (error) {
        console.error('Error writing to Excel file:', error);
        return false;
    }
}



// API Routes

// Get all applications
app.get('/api/applications', (req, res) => {
    const applications = readApplications();
    res.json(applications);
});

// Add new application
app.post('/api/applications', (req, res) => {
    const applications = readApplications();
    const newApplication = {
        ID: req.body.id || Date.now(),
        Company: req.body.company,
        Position: req.body.position,
        Location: req.body.location || '',
        'Date Applied': req.body.dateApplied,
        Status: req.body.status,
        'Salary Range': req.body.salary || '',
        'Contact Person': req.body.contact || '',
        'Job URL': req.body.jobUrl || '',
        Notes: req.body.notes || ''
    };
    
    applications.push(newApplication);
    
    if (writeApplications(applications)) {
        res.json({ success: true, application: newApplication });
    } else {
        res.status(500).json({ success: false, error: 'Failed to write to Excel' });
    }
});

// Update application
app.put('/api/applications/:id', (req, res) => {
    const applications = readApplications();
    const id = parseInt(req.params.id);
    const index = applications.findIndex(app => app.ID === id);
    
    if (index === -1) {
        return res.status(404).json({ success: false, error: 'Application not found' });
    }
    
    applications[index] = {
        ID: id,
        Company: req.body.company,
        Position: req.body.position,
        Location: req.body.location || '',
        'Date Applied': req.body.dateApplied,
        Status: req.body.status,
        'Salary Range': req.body.salary || '',
        'Contact Person': req.body.contact || '',
        'Job URL': req.body.jobUrl || '',
        Notes: req.body.notes || ''
    };
    
    if (writeApplications(applications)) {
        res.json({ success: true, application: applications[index] });
    } else {
        res.status(500).json({ success: false, error: 'Failed to write to Excel' });
    }
});

// Delete application
app.delete('/api/applications/:id', (req, res) => {
    const applications = readApplications();
    const id = parseInt(req.params.id);
    const filtered = applications.filter(app => app.ID !== id);
    
    if (filtered.length === applications.length) {
        return res.status(404).json({ success: false, error: 'Application not found' });
    }
    
    if (writeApplications(filtered)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Failed to write to Excel' });
    }
});


// AI integration routes

// Helper: Call Ollama API
async function callOllama(prompt) {
    try {
        const response = await axios.post(OLLAMA_API, {
            model: MODEL,
            prompt: prompt,
            stream: false
        });
        return response.data.response;
    } catch (error) {
        console.error('Ollama API error:', error.message);
        throw new Error('Failed to communicate with Ollama. Make sure Ollama is running.');
    }
}

// Helper: Extract text from PDF
async function extractPDFText(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF');
    }
}

// Helper: Scrape job description from URL
async function scrapeJobDescription(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Remove script and style tags
        $('script, style, nav, header, footer').remove();
        
        // Get main content text
        const text = $('body').text()
            .replace(/\s+/g, ' ')
            .trim();
        
        return text.substring(0, 5000); // Limit to 5000 chars
    } catch (error) {
        console.error('Job scraping error:', error.message);
        throw new Error('Failed to scrape job description. Please paste it manually.');
    }
}

// Helper: Generate PDF from text content
function generatePDF(cvContent, coverLetter, companyName, position) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];
            
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            
            // CV Section
            doc.fontSize(20).font('Helvetica-Bold').text('Curriculum Vitae', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).font('Helvetica').text(`Tailored for: ${position} at ${companyName}`, { align: 'center' });
            doc.moveDown(2);
            
            doc.fontSize(11).font('Helvetica').text(cvContent, {
                align: 'justify',
                lineGap: 3
            });
            
            // Add new page for cover letter
            doc.addPage();
            doc.fontSize(20).font('Helvetica-Bold').text('Cover Letter', { align: 'center' });
            doc.moveDown(2);
            
            doc.fontSize(11).font('Helvetica').text(coverLetter, {
                align: 'justify',
                lineGap: 3
            });
            
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

// API Route: Analyze CV and Job Description
app.post('/api/ai/analyze', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'CV file is required' });
        }
        
        const { jobUrl, jobDescription, companyName, position } = req.body;
        
        // Step 1: Extract CV text
        const cvText = await extractPDFText(req.file.buffer);
        
        // Step 2: Get job description (from URL or manual input)
        let jobDesc = jobDescription;
        if (jobUrl && !jobDescription) {
            jobDesc = await scrapeJobDescription(jobUrl);
        }
        
        if (!jobDesc) {
            return res.status(400).json({ 
                error: 'Please provide either a job URL or paste the job description' 
            });
        }
        
        // Step 3: Analyze with Ollama
        const analysisPrompt = `
You are a professional career advisor. Analyze the following CV against the job description and provide:

1. Overall Match Score (0-100%)
2. Key Matching Skills (list 5-7 skills)
3. Missing Requirements (list 3-5 gaps)
4. Recommended Improvements (3-5 actionable suggestions)

Keep your response structured and concise.

CV:
${cvText.substring(0, 3000)}

Job Description:
${jobDesc.substring(0, 2000)}

Provide a clear, structured analysis.
`;
        
        const analysis = await callOllama(analysisPrompt);
        
        // Step 4: Generate tailored CV
        const cvPrompt = `
Rewrite this CV to better match the job requirements. Keep all real experience and qualifications, but:
- Emphasize relevant skills and achievements
- Use keywords from the job description
- Reorganize to highlight matching experience first
- Keep it professional and ATS-friendly
- Maintain a clear, readable format

Original CV:
${cvText}

Job Requirements:
${jobDesc}

Provide ONLY the rewritten CV content, ready to use.
`;
        
        const tailoredCV = await callOllama(cvPrompt);
        
        // Step 5: Generate cover letter
        const coverLetterPrompt = `
Write a professional cover letter for this job application.

Requirements:
- 250-300 words maximum
- Professional but enthusiastic tone
- Highlight 2-3 most relevant qualifications
- Show genuine interest in the role
- Include proper business letter format (without addresses)

Position: ${position}
Company: ${companyName}

Candidate's Background:
${cvText.substring(0, 2000)}

Job Description:
${jobDesc.substring(0, 2000)}

Write ONLY the cover letter content.
`;
        
        const coverLetter = await callOllama(coverLetterPrompt);
        
        // Step 6: Generate recruiter outreach messages
        const messagePrompt = `
Create 3 different professional messages for reaching out to recruiters about this role.

Message 1: LinkedIn connection request (150 characters max)
Message 2: LinkedIn direct message (200 words max)
Message 3: Email subject + body (250 words max)

Position: ${position}
Company: ${companyName}

Candidate Background:
${cvText.substring(0, 1500)}

Format each message clearly with labels. Be professional, concise, and personable.
`;
        
        const recruiterMessages = await callOllama(messagePrompt);
        
        // Return all results
        res.json({
            success: true,
            analysis,
            tailoredCV,
            coverLetter,
            recruiterMessages
        });
        
    } catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API Route: Generate PDF Package
app.post('/api/ai/generate-pdf', async (req, res) => {
    try {
        const { tailoredCV, coverLetter, companyName, position } = req.body;
        
        if (!tailoredCV || !coverLetter) {
            return res.status(400).json({ 
                error: 'CV and cover letter content required' 
            });
        }
        
        const pdfBuffer = await generatePDF(
            tailoredCV, 
            coverLetter, 
            companyName || 'Company', 
            position || 'Position'
        );
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Application_${companyName}_${position}.pdf"`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate PDF' 
        });
    }
});

// API Route: Chat with AI Assistant
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const systemPrompt = `You are a helpful career advisor assistant. Provide practical, actionable advice about job searching, interviews, resumes, and career development. Keep responses concise and friendly.`;
        
        const prompt = context 
            ? `${systemPrompt}\n\nContext: ${context}\n\nUser: ${message}\n\nAssistant:`
            : `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;
        
        const response = await callOllama(prompt);
        
        res.json({ success: true, response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API Route: Check Ollama status
app.get('/api/ai/status', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:11434/api/tags');
        res.json({ 
            success: true, 
            available: true,
            models: response.data.models 
        });
    } catch (error) {
        res.json({ 
            success: false, 
            available: false,
            message: 'Ollama is not running. Start it with: ollama serve' 
        });
    }
});

// Initialize and start server
initializeExcelFile();

app.listen(PORT, () => {
    console.log(`
   Job Application Tracker Server Running on Port ${PORT}
    `);
});