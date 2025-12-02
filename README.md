# Job Application Tracker

A simple web-based application to track and manage your job applications. All data is stored locally in an Excel file that syncs automatically.

## Features

- **Add Applications**: Track company, position, location, date, status, salary range, contact person, and notes
- **Edit & Delete**: Update or remove applications as your job search progresses
- **Status Tracking**: Monitor applications through different stages (Applied, Interview Scheduled, Interviewed, Offer Received, Rejected, Withdrawn)
- **Excel Storage**: All data saved to `job-applications.xlsx` for easy access and portability
- **Auto-sync**: Changes are immediately saved to the Excel file


![Job application tracker interface showing a form to add a new application with fields for company, position, location, date applied, status, salary range, contact person, job URL, and notes. Below the form is a table listing existing applications with columns for company, position, location, date, status, salary, contact, notes, and actions. The interface is clean, organized, and professional, using a calm color scheme. Visible text includes New Application, Add, Company, Position, Location, Date Applied, Status, Salary Range, Contact Person, Job URL, Notes, Add Application, COMPANY, POSITION, LOCATION, DATE, STATUS, SALARY, CONTACT, NOTES, ACTIONS, Edit, and Delete.](images/Screenshot%202025-12-02%20173713.png)


### AI-Powered Assistant 
- **CV Analysis**: Upload your CV and get match analysis for any job
- **Tailored CV**: AI rewrites your CV to match job requirements
- **Cover Letter Generator**: Professional, personalized cover letters
- **Recruiter Messages**: 3 ready-to-use templates (LinkedIn + Email)
- **PDF Package**: Download everything in one professional PDF
- **Career Chat**: Ask the AI career advisor anything
![Screenshot of the CV analysis and letter of motivation generation interface. The interface displays fields for uploading a CV PDF, entering the company name, position, and job description (either via URL or pasted text). A prominent "Analyze and Generate Package" button is shown at the bottom. The design is clean and modern, with a professional and calm appearance. Visible text includes: "Upload and Analyze," "Upload Your CV PDF," "Company Name," "Position," "Job Description URL (optional)," "Job Description (paste here if no URL)," and "Analyze and Generate Package."](images/Screenshot%202025-12-02%20173634.png)


![Chat interface with AI Career Advisor showing a welcoming message offering help with job search topics such as interviews, salary negotiation, and resume tips. The interface includes a large chat area, a text input field labeled Ask me anything about job applications, and a Send button. The design is clean and minimal, creating a professional and approachable atmosphere. Visible text includes Chat with AI Career Advisor, Hi I am here to help with your job search. Ask me about interviews, salary negotiation, resume tips, or anything else](images/Screenshot%202025-12-02%20173645.png)

### Statistics Dashboard 
- Total applications count
- Pending, interview, and offer tracking
- Rejection count
- Interview success rate
- Visual statistics cards

![Job Applications statistics dashboard showing five summary cards:  total applications,  pending,  interviews,  offers, and  rejection. Below, a card displays  percent interview rate. The interface uses a clean, modern design with colored borders for each card. The environment is professional and organized, with a calm and neutral tone. Visible text includes Job Applications, Statistics Overview, Total Applications, Pending, Interviews, Offers, Rejections, Interview Rate, and Auto-sync enabled.](images/Screenshot%202025-12-02%20173619.png)


## How It Works

The application consists of:
- **Backend (Node.js/Express)**: REST API that reads/writes to an Excel file using the XLSX library
- **Frontend (HTML/JS)**: Clean interface for managing applications
- **Storage**: Data persists in `job-applications.xlsx` in the project root directory

When you add, edit, or delete an application, the changes are sent to the API and immediately written to the Excel file. You can open the Excel file directly anytime to view or analyze your data.

## Installation & Usage

### Option 1: Run with Docker (Recommended)

1. **Pull the Docker image**:
   ```bash
   docker pull aymrick2803/job-tracker:latest
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8000:8000 -v $(pwd)/data:/app aymrick2803/job-tracker:latest
   ```
   
   This creates a `data` folder in your current directory where `job-applications.xlsx` will be stored.

3. **Access the application**:
   Open your browser and go to `http://localhost:8000`

### Option 2: Run Locally

1. **Prerequisites**: Node.js 16+ installed

2. **Clone the repository**:
   ```bash
   git clone https://github.com/Aloys-Aymrick-Nzooh/job-tracker.git
   cd job-tracker
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the server**:
   ```bash
   node server.js
   ```

5. **Access the application**:
   Open your browser and go to `http://localhost:8000`


## Project Structure

```
job-tracker/
├── server.js              # Express server with API endpoints
├── public/
│   └── index.html         # Frontend application
├── package.json           # Node.js dependencies
├── Dockerfile             # Docker configuration
└── job-applications.xlsx  # Generated Excel file (after first run)
```

## Dependencies

- **express**: Web server framework
- **xlsx**: Excel file reading/writing
- **cors**: Cross-origin resource sharing
- **fs/path**: File system operations

## API Endpoints

- `GET /api/applications` - Retrieve all applications
- `POST /api/applications` - Add new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

## Notes

- The Excel file is created automatically on first run
- All fields except Company, Position, Date Applied, and Status are optional
- The Excel file can be opened and edited directly, but changes won't reflect in the web UI until you reload
- Data volume mount (`-v`) ensures your applications persist even if the container is removed

## License

MIT
