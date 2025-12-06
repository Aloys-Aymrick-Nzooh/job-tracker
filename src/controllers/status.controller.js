const checkStatus = (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Job Tracker API is running',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    checkStatus 
};