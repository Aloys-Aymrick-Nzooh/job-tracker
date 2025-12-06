const excel = require('../services/excel.service');

exports.getAll = (req, res) => {
    res.json(excel.readApplications());
};

exports.create = (req, res) => {
    const applications = excel.readApplications();

    const newApp = {
        ID: Date.now(),
        Company: req.body.company,
        Position: req.body.position,
        Location: req.body.location || '',
        "Date Applied": req.body.dateApplied,
        Status: req.body.status,
        "Salary Range": req.body.salary || '',
        "Contact Person": req.body.contact || '',
        "Job URL": req.body.jobUrl || '',
        Notes: req.body.notes || '',
    };

    applications.push(newApp);
    excel.writeApplications(applications);

    res.json({ success: true, application: newApp });
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const applications = excel.readApplications();

    const index = applications.findIndex(app => app.ID === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });

    // ✅ CORRECTION : Normaliser les données comme dans create()
    applications[index] = {
        ID: id,
        Company: req.body.company,
        Position: req.body.position,
        Location: req.body.location || '',
        "Date Applied": req.body.dateApplied,
        Status: req.body.status,
        "Salary Range": req.body.salary || '',
        "Contact Person": req.body.contact || '',
        "Job URL": req.body.jobUrl || '',
        Notes: req.body.notes || '',
    };
    
    excel.writeApplications(applications);

    res.json({ success: true, application: applications[index] });
};

exports.remove = (req, res) => {
    const id = parseInt(req.params.id);
    const applications = excel.readApplications();

    const filtered = applications.filter(app => app.ID !== id);
    excel.writeApplications(filtered);

    res.json({ success: true });
};

exports.remove = (req, res) => {
    const id = parseInt(req.params.id);
    const applications = excel.readApplications();

    const filtered = applications.filter(app => app.ID !== id);
    excel.writeApplications(filtered);

    res.json({ success: true });
};
