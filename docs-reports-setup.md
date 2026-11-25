# TALLA Reports System Setup

This guide explains how to set up and run the complete TALLA Reports system with ChatGPT integration.

## System Overview

The Reports system consists of two components:

1. **Frontend**: React app with reports interface (runs on port 5173)
2. **Backend**: Express API server for ChatGPT integration (runs on port 3001)

## Setup Instructions

### 1. Install Backend Dependencies

Navigate to the server directory and install dependencies:

```powershell
cd server
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:

```powershell
copy .env.example .env
```

2. Edit the `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
PORT=3001
NODE_ENV=development
```

### 3. Start the Backend Server

From the `server` directory:

```powershell
npm run dev
# Or for production: npm start
```

The API server will be available at `http://localhost:3001`

### 4. Start the Frontend Application

From the main project directory:

```powershell
npm run dev
```

The React app will be available at `http://localhost:5173`

## Usage

1. **Select a Student**: Choose a student from the dashboard
2. **Complete Assessment**: Fill out the TALLA assessment form
3. **Generate Report**: Navigate to the Reports page and click "Generate Professional Report"
4. **Download/Print**: Use the action buttons to save or print the report

## Features

- **AI-Powered Reports**: Professional depth reports generated using ChatGPT
- **Hebrew RTL Support**: Complete right-to-left interface
- **Data Persistence**: Student data and reports saved in localStorage
- **Print-Friendly**: Optimized layouts for printing and PDF generation
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### POST /api/generate-report

Generates a professional report using ChatGPT.

**Request Body:**

```json
{
  "analysisData": {
    "studentName": "שם התלמיד",
    "age": "גיל",
    "grade": "כיתה",
    "domains": { ... },
    "summary": "סיכום ההערכה"
  }
}
```

**Response:**

```json
{
  "success": true,
  "report": "תוכן הדוח המקצועי..."
}
```

### GET /health

Health check endpoint for monitoring.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend server is running on port 3001
2. **API Key Issues**: Verify your OpenAI API key is correctly set in `.env`
3. **Missing Dependencies**: Run `npm install` in both root and server directories

### Error Messages

- **"מפתח API של OpenAI לא מוגדר"**: Add your API key to the `.env` file
- **"חריגה מהמכסה של OpenAI API"**: Check your OpenAI account usage and billing
- **"שגיאת חיבור לשרת"**: Ensure the backend server is running

## Development

### File Structure

```
tallaApp/
├── src/pages/ReportsPage/          # Reports UI components
├── src/domain/reportAnalyzer.ts    # Data analysis engine
├── server/                         # Express API server
│   ├── index.js                   # Main server file
│   ├── package.json               # Server dependencies
│   └── .env                       # Environment variables
└── README-Reports.md              # This file
```

### Adding Features

To extend the reports system:

1. **Modify Analysis**: Edit `src/domain/reportAnalyzer.ts`
2. **Update UI**: Modify `src/pages/ReportsPage/ReportsPage.tsx`
3. **Enhance API**: Update `server/index.js`

## Security Notes

- Keep your OpenAI API key secure and never commit it to version control
- The `.env` file is included in `.gitignore` for security
- Consider rate limiting and authentication for production deployment

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team.
