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

## Status

Early prototype scaffolding.
