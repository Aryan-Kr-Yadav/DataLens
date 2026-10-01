# DataLens AI

**Conversational Data Analysis Assistant — Natural-language Q&A over CSV datasets**

DataLens AI is a privacy-first analytics application that lets users explore CSV datasets using natural-language questions instead of writing Pandas or SQL manually.

> **The LLM understands the question and generates the Pandas analysis logic, while Pandas executes the analysis locally on the actual dataset.**

---

## Overview

DataLens AI allows users to:

- Upload CSV datasets
- Load CSV files from a local backend folder
- Ask natural-language questions about the dataset
- Generate Pandas expressions using an LLM
- Validate generated expressions before execution
- Execute analysis locally with Pandas
- View answers as text, tables, and charts
- Inspect data quality
- Explore the dataset schema
- Build reports
- Review privacy information and execution details

Example questions:

```text
What is the average salary?
Which region generated the highest sales?
Show the top 5 products by profit.
Which columns contain missing values?
What percentage of orders were returned?
Is NetSales_INR correlated with Profit_INR?
```

---

## HCL Project Information

| Field | Details |
|---|---|
| Project ID | P_123 |
| Project Title | Conversational Data Analysis Assistant |
| Problem Statement | Natural-language Q&A over CSV datasets |
| Main Data Engine | Pandas |
| LLM Provider | Groq |
| Model | `openai/gpt-oss-120b` |
| Frontend | React + JavaScript + Vite |
| Backend | FastAPI + Python |

---

## Core Architecture

```text
User
  |
  v
Upload CSV / Load Local CSV
  |
  v
FastAPI Backend
  |
  v
Pandas DataFrame
  |
  v
Schema Extraction
  |
  v
Question + Approved Schema
  |
  v
Groq LLM
  |
  v
Generated Pandas Expression
  |
  v
Security Validator
  |
  v
Local Pandas Execution
  |
  v
Verified Result
  |
  +--> Answer
  +--> Table
  +--> Chart
```

---

## Privacy-First Design

### Remains Local

- Raw CSV
- Complete DataFrame
- Full dataset rows
- Pandas execution
- Data-quality calculations
- Chart aggregations
- Final raw calculation results

### May Be Shared with the LLM

- Column names
- Detected data types
- Optional column descriptions
- User question
- Minimal conversational context

> **Your raw dataset remains local. DataLens sends only the schema information you approve and your question to the configured AI service.**

---

## Tech Stack

### Frontend

- React
- JavaScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide React

### Backend

- Python
- FastAPI
- Pandas
- NumPy
- Pydantic

### AI

- Groq API
- `openai/gpt-oss-120b`

---

## Main Features

### Dataset Loading

DataLens supports:

- Browser CSV upload
- Loading CSV files from `backend/local_data/`

### Conversational Analysis

Ask questions like:

```text
What is the average Salary?
Who has the highest Salary?
Which Region has the highest total Sales?
Show the top 10 products by NetSales_INR.
What is the correlation between Sales and Profit?
```

### Smart Intent Routing

DataLens can handle:

- Dataset analysis
- Dataset information
- Data concepts
- App help
- General chat

### Dashboard

The Dashboard can show:

- Rows
- Columns
- Missing values
- Duplicate rows
- Numeric fields
- Categorical fields
- Dataset health
- Quick Ask
- Suggested questions
- Verified insights
- Recent analyses

### Ask Data

The Ask Data workspace supports:

- Natural-language analysis
- Follow-up questions
- Scalar answers
- Result tables
- Charts
- Show Calculation
- Pinning
- Exporting
- Analysis history

### Visualize

Supported chart types:

- Bar
- Line
- Pie
- Scatter
- Histogram

### Data Quality

Checks include:

- Missing values
- Duplicates
- Data types
- Outliers
- Cardinality
- Numeric statistics
- Potential identifiers

### Schema / Data Dictionary

The Schema page can show:

| Column | Type | Missing | Unique | Description | Share with AI |
|---|---|---:|---:|---|---|
| Salary | Number | 0 | 10 | Monthly salary | Yes |
| Department | String | 0 | 5 | Employee department | Yes |

### Reports

Reports can include:

- Executive summary
- Dataset overview
- Schema
- Data quality
- Verified insights
- Analysis history
- Charts
- Privacy methodology

---

## Query Generation

Example:

```text
What is the average salary?
```

Generated Pandas:

```python
df["Salary"].mean()
```

Example:

```text
Who has the highest salary?
```

Generated Pandas:

```python
df.loc[df["Salary"].idxmax(), ["Name", "Salary"]]
```

Example:

```text
Which region generated the most profit?
```

Generated Pandas:

```python
df.groupby("Region")["Profit"].sum().sort_values(ascending=False).head(1)
```

---

## Query Security

Generated code must not be executed blindly.

Unsafe operations should be rejected, including:

```text
import
open
eval
exec
os
sys
subprocess
requests
pathlib
read_csv
read_excel
to_csv
to_excel
pickle
system
dunder access
```

Typical approved Pandas operations include:

```text
mean
sum
median
min
max
count
nunique
nlargest
nsmallest
groupby
sort_values
head
tail
idxmax
idxmin
value_counts
corr
isna
notna
dropna
astype
round
reset_index
between
isin
loc
iloc
shape
```

---

## Automatic Query Repair

If the generated Pandas expression fails validation:

```text
Generated Query
      |
      v
   Validator
      |
   Rejected
      |
      v
Regenerate once
      |
      v
Validate again
```

If it is still unsafe, DataLens returns an error instead of executing it.

---

## Show Calculation

For real dataset analysis, the user can inspect:

- Original question
- Generated Pandas expression
- Explanation
- Columns used
- Filters
- Grouping
- Aggregation
- Rows analyzed
- LLM planning time
- Validation time
- Pandas execution time
- Execution location
- Privacy status

---

## Suggested Project Structure

```text
datalens-ai/
|
|-- frontend/
|   |-- src/
|   |   |-- main.jsx
|   |   |-- App.jsx
|   |   |-- pages/
|   |   |   |-- Home.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- AskData.jsx
|   |   |   |-- Visualize.jsx
|   |   |   |-- DataQuality.jsx
|   |   |   |-- Reports.jsx
|   |   |   |-- Schema.jsx
|   |   |   |-- Privacy.jsx
|   |   |   `-- Settings.jsx
|   |   |-- components/
|   |   |-- context/
|   |   |   `-- DatasetContext.jsx
|   |   |-- services/
|   |   |   `-- api.js
|   |   `-- utils/
|   |-- package.json
|   |-- vite.config.js
|   `-- .env.example
|
|-- backend/
|   |-- main.py
|   |-- api/
|   |-- services/
|   |-- schemas/
|   |-- local_data/
|   |-- storage/
|   |-- tests/
|   |-- requirements.txt
|   `-- .env.example
|
|-- sample-data/
|-- README.md
`-- .gitignore
```

---

## Environment Variables

### Backend

Create:

```text
backend/.env
```

Example:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=openai/gpt-oss-120b
LOCAL_DATA_DIR=./local_data
```

> Never commit `.env` to GitHub.

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/Aryan-Kr-Yadav/DataLens.git
cd DataLens
```

### Backend Setup

```bash
cd backend
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create `.env`:

```powershell
copy .env.example .env
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Sample Dataset

```csv
Name,Age,Salary
Aarav,22,35000
Ishita,24,42000
Rohan,27,50000
Neha,25,46000
Vikram,30,62000
Priya,28,55000
Arjun,26,48000
Sneha,23,39000
Karan,31,68000
Meera,29,58000
```

Expected results:

| Question | Expected Result |
|---|---|
| Average Salary | 49,500 |
| Highest Salary | Karan — 68,000 |
| Average Age | 26.5 |
| People older than 25 | 6 |
| Top 3 Salaries | Karan, Vikram, Meera |

---

## API Endpoints

```text
GET    /health
POST   /api/datasets/upload
GET    /api/local-files
POST   /api/local-files/load
GET    /api/datasets/{dataset_id}/summary
GET    /api/datasets/{dataset_id}/schema
PUT    /api/datasets/{dataset_id}/schema
GET    /api/datasets/{dataset_id}/preview
POST   /api/datasets/{dataset_id}/ask
POST   /api/datasets/{dataset_id}/visualize
GET    /api/datasets/{dataset_id}/quality
GET    /api/datasets/{dataset_id}/insights
GET    /api/datasets/{dataset_id}/suggestions
GET    /api/datasets/{dataset_id}/history
POST   /api/datasets/{dataset_id}/reports
DELETE /api/datasets/{dataset_id}
```

---

## Testing

Important areas to verify:

### Dataset

- CSV upload
- Local CSV loading
- Encoding handling
- Invalid CSV handling
- Path traversal prevention
- Dataset session creation

### Analysis

- Mean
- Sum
- Count
- Filtering
- Top N
- GroupBy
- Percentage
- Correlation

### Security

- Imports blocked
- File access blocked
- Network access blocked
- `eval` blocked
- `exec` blocked
- Invalid expressions rejected

### Privacy

Default AI payload should contain schema information such as:

```text
Name
Age
Salary
```

but not raw values such as:

```text
Aarav
Karan
35000
68000
```

unless sample-value sharing is explicitly enabled.

---

## Performance

Useful timings to record:

- CSV loading time
- LLM planning time
- Query validation time
- Pandas execution time
- Total response time

Use actual measured values rather than fabricated benchmarks.

---

## Why No Login / Signup?

Authentication is intentionally not part of the current core implementation.

The current scope is a local single-user analytics system:

```text
Open DataLens
   |
   v
Load CSV
   |
   v
Ask Questions
   |
   v
Analyze Locally
```

Authentication becomes useful later for:

- Multiple users
- Cloud datasets
- Persistent accounts
- Team collaboration
- Shared dashboards
- Role-based access

---

## Why No RAG?

RAG is not required for structured CSV analysis.

Pandas is more appropriate for:

- Filtering
- Aggregation
- Grouping
- Statistics
- Correlation
- Sorting
- Time-series analysis

RAG may be useful later if DataLens supports unstructured files such as PDFs or DOCX documents.

---

## Future Scope

- Multi-CSV analysis
- Automatic relationship detection
- Assisted joins
- Excel/XLSX support
- SQL database connectors
- Persistent workspaces
- User authentication
- Cloud synchronization
- Saved dashboards
- Scheduled reports
- Local/self-hosted LLM support
- Large dataset optimization
- DuckDB or Polars integration
- Collaboration features

---

## One-Line Explanation

> **DataLens AI converts natural-language questions into validated Pandas analysis, executes the analysis locally on CSV data, and returns verified results without sending the complete dataset to the LLM.**

---

## Author

**Aryan Kumar Yadav**

- GitHub: https://github.com/Aryan-Kr-Yadav
- LinkedIn: https://linkedin.com/in/aryan-kumar-yadav/
- Portfolio: https://aryann-yadav-portfolio.netlify.app/

---

## Repository

https://github.com/Aryan-Kr-Yadav/DataLens

## Live project 

https://datalensss.netlify.app/

---

## License

This project is currently developed for educational and academic purposes as part of the HCL industry project program.
