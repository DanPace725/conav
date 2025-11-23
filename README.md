# Relational Coherence Navigator

The Relational Coherence Navigator is a lightweight browser-based tool that helps users understand the structural coherence of complex life situations. It evaluates user input across five relational dimensions:

1. Continuity
2. Differentiation
3. Contextual Fit
4. Accountability
5. Reflexivity

This repository contains the minimal implementation required for an interactive prototype using pure HTML, CSS, and JavaScript.

## Features

- Single-page interface
- LLM-powered relational evaluation
- Structured JSON analysis
- Fast iteration and agent-friendly codebase
- No frameworks or build steps required

## Project Structure

See file descriptions in `AGENT_INSTRUCTIONS_START_HERE.md`.

## How to Use

### Prerequisites

- Python 3.x (for running the local development server)
- An OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))

### Local Development Setup

1. **Create the environment file:**

   ```bash
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

2. **Start the local development server:**

   ```bash
   python -m http.server 8000
   ```

3. **Open your browser and navigate to:**

   ```text
   http://localhost:8000
   ```

### Why a Server is Required

This application cannot be run by simply opening `index.html` in a browser because:

- The JavaScript needs to fetch the `.env` file to access your API key
- Browsers block direct file access for security reasons (CORS policy)
- A local web server serves all files including the `.env` file, allowing the JavaScript to access it

### Testing the Setup

1. Open `http://localhost:8000` in your browser
2. Type a situation description in the text area
3. Click "Evaluate"
4. You should see a JSON response with coherence scores across the five dimensions

## Deployment to Vercel

### Quick Deploy

1. Push your code to a GitHub repository
2. Import the project in [Vercel](https://vercel.com)
3. Add your OpenAI API key as an environment variable:
   - Go to Project Settings → Environment Variables
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
4. Deploy!

### How It Works

- **Local Development**: Uses `.env` file and direct OpenAI API calls
- **Production (Vercel)**: Uses serverless function at `/api/evaluate` that securely accesses environment variables
- The code automatically detects the environment and uses the appropriate method

### Vercel Environment Variables

In your Vercel project settings, add:

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |

Make sure to add it to all environments (Production, Preview, Development) as needed.

## Status

Early prototype scaffolding.
