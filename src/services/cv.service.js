const pdfParse = require('pdf-parse');

exports.extractPDF = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (err) {
        throw new Error("Failed to read PDF file");
    }
};
