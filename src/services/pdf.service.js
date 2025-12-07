const PDFDocument = require('pdfkit');

//  Générer PDF pour le CV uniquement
exports.generateCV = (cvContent, companyName, position) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('Curriculum Vitae', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica').text(`Poste: ${position}`, { align: 'center' });
            doc.text(`Entreprise: ${companyName}`, { align: 'center' });
            doc.moveDown(2);

            // Content
            doc.fontSize(11).font('Helvetica').text(cvContent, {
                align: 'justify',
                lineGap: 3
            });

            // Footer
            doc.moveDown(2);
            doc.fontSize(8).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
                align: 'center'
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

//  Générer PDF pour la lettre de motivation uniquement
exports.generateCoverLetter = (coverLetterContent, companyName, position) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('Lettre de Motivation', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica').text(`Candidature: ${position}`, { align: 'center' });
            doc.text(`Entreprise: ${companyName}`, { align: 'center' });
            doc.moveDown(2);

            // Content
            doc.fontSize(11).font('Helvetica').text(coverLetterContent, {
                align: 'justify',
                lineGap: 3
            });

            // Footer
            doc.moveDown(2);
            doc.fontSize(8).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
                align: 'center'
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

//  OPTIONNEL : Package complet (ancienne méthode)
exports.generate = (cvContent, coverLetterContent, companyName, position) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Page 1: CV
            doc.fontSize(20).font('Helvetica-Bold').text('Curriculum Vitae', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).font('Helvetica').text(`Poste: ${position}`, { align: 'center' });
            doc.text(`Entreprise: ${companyName}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(11).text(cvContent, { align: 'justify', lineGap: 3 });

            // Page 2: Lettre de motivation
            doc.addPage();
            doc.fontSize(20).font('Helvetica-Bold').text('Lettre de Motivation', { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(11).font('Helvetica').text(coverLetterContent, { align: 'justify', lineGap: 3 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};