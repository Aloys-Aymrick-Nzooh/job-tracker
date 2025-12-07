const XLSX = require('xlsx');
const fs = require('fs');

const EXCEL_FILE = 'job-applications.xlsx';

exports.initializeExcelFile = () => {
    if (!fs.existsSync(EXCEL_FILE)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(wb, ws, 'Applications');
        XLSX.writeFile(wb, EXCEL_FILE);
        console.log("Created new Excel file");
    }
};

exports.readApplications = () => {
    if (!fs.existsSync(EXCEL_FILE)) return [];
    const wb = XLSX.readFile(EXCEL_FILE);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws);
};

exports.writeApplications = (applications) => {
    const ws = XLSX.utils.json_to_sheet(applications);

    ws["!cols"] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 18 },
        { wch: 15 },
        { wch: 20 },
        { wch: 40 },
        { wch: 50 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, EXCEL_FILE);
};
