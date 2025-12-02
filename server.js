const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8000;
const EXCEL_FILE = 'job-applications.xlsx';

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

// Initialize and start server
initializeExcelFile();

app.listen(PORT, () => {
    console.log(`
   Job Application Tracker Server Running on Port ${PORT}
    `);
});