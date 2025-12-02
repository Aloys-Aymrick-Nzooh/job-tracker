# Job Application Tracker

A simple web-based application to track and manage your job applications. All data is stored locally in an Excel file that syncs automatically.

## Features

- **Add Applications**: Track company, position, location, date, status, salary range, contact person, and notes
- **Edit & Delete**: Update or remove applications as your job search progresses
- **Status Tracking**: Monitor applications through different stages (Applied, Interview Scheduled, Interviewed, Offer Received, Rejected, Withdrawn)
- **Excel Storage**: All data saved to `job-applications.xlsx` for easy access and portability
- **Auto-sync**: Changes are immediately saved to the Excel file

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
   docker pull Aloys-Aymrick-Nzooh/job-tracker:latest
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8000:8000 -v $(pwd)/data:/app Aloys-Aymrick-Nzooh/job-tracker:latest
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

## Building Your Own Docker Image

If you want to build the Docker image yourself:

```bash
# Build the image
docker build -t job-tracker .

# Run the container
docker run -d -p 8000:8000 -v $(pwd)/data:/app job-tracker
```

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