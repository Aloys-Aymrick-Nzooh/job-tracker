# Quick Start Guide

## Get Running in 5 Minutes

### Step 1: Install Ollama
```bash
# Windows
winget install Ollama.Ollama

# Mac
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Start Ollama & Download Model
```bash
# Terminal 1 (keep running)
ollama serve

# Terminal 2
ollama pull llama2
```

### Step 3: Run the App
```bash
# Clone repo
git clone https://github.com/Aloys-Aymrick-Nzooh/job-tracker.git
cd job-tracker

# Install & run
npm install
node server.js
```

### Step 4: Open Browser
Go to: `http://localhost:8000`

---

## How to Use

### Track Applications
1. Fill out the form at top
2. Click "Add Application"
3. View in table below
4. Edit/Delete as needed

### AI Assistant Workflow
1. **Upload** your CV (PDF)
2. **Paste** job description or URL
3. **Enter** company & position
4. **Click** "Analyze & Generate Package"
5. **Wait** 30-60 seconds
6. **Review** results in tabs:
   - Analysis (match score)
   - Tailored CV (copy it)
   - Cover Letter (copy it)
   - Recruiter Messages (3 templates)
7. **Download** PDF package
8. **Search** LinkedIn manually for recruiters
9. **Use** AI templates to reach out

### Chat Assistant
Ask anything:
- "How do I negotiate salary?"
- "What should I ask in an interview?"
- "Review my cover letter"

---

##  Troubleshooting

### AI shows "Offline"
```bash
ollama serve
```

### Slow processing
```bash
# Use faster model
ollama pull mistral
```
Then edit `server.js`: `const MODEL = 'mistral';`

### PDF won't parse
- Use text-based PDF (not scanned)
- Keep under 5MB
- Remove password protection

---

##  What You Get

Track all job applications  
Statistics dashboard  
AI-powered CV optimization  
Auto-generated cover letters  
Recruiter message templates  
PDF download package  
Career advice chat  
100% local & private  

---

##  Docker Quick Start

```bash
# With Ollama on host
ollama serve  # Keep running

docker run -d -p 8000:8000 \
  -e OLLAMA_API=http://host.docker.internal:11434/api/generate \
  -v job-tracker-data:/app \
  aymrick2808/job-tracker:latest
```

Open: `http://localhost:8000`

---

## Full Documentation

See `README.md` for complete details.

---

## Some Tips

1. **Keep Ollama running** while using the app
2. **Use Mistral** for speed, Llama2 for quality
3. **Review AI output** - always personalize before sending
4. **Save analyses** - download PDFs for your records
5. **Ask the chat** anything about job hunting

---

