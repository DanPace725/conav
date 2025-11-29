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
- Pure static hosting - no server runtime needed

## Project Structure

See file descriptions in `AGENT_INSTRUCTIONS_START_HERE.md`.

## How to Use

### Prerequisites

- A web server (any static hosting service works)
- An OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))
- (Optional) A Supabase project URL and anon key for persistence

### Local Development Setup

1. **Create the environment file:**

   ```bash
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

2. **Start a local web server:**

   You can use any static server. Here are some options:

   **Python (recommended):**
   ```bash
   python -m http.server 8000
   ```

   **Node.js (if you have it):**
   ```bash
   npx serve . -p 8000
   ```

   **PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser and navigate to:**

   ```text
   http://localhost:8000
   ```

### Supabase (Persistence)

- Add these to `.env` when you want to persist evaluations:

  ```
  SUPABASE_URL=your_supabase_url
  SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

- Apply the schema in `docs/db_schema.md` via the Supabase SQL editor.
- Client writes use the anon key; tighten RLS once Supabase Auth is configured.

### Why a Server is Required

This application cannot be run by simply opening `index.html` in a browser because:

- The JavaScript needs to fetch the `.env` file to access your API key
- Browsers block direct file access for security reasons (CORS policy)
- A web server serves all files including the `.env` file, allowing the JavaScript to access it

### Testing the Setup

1. Open `http://localhost:8000` in your browser
2. Type a situation description in the text area
3. Click "Evaluate"
4. You should see a JSON response with coherence scores across the five dimensions

## Deployment

### Static Hosting Options

Since this is a pure static application, you can deploy it to any static hosting service:

- **GitHub Pages**: Free, easy setup
- **Netlify**: Free tier available, great for static sites
- **Vercel**: Free tier available
- **Firebase Hosting**: Part of Google Firebase
- **AWS S3 + CloudFront**: Scalable cloud hosting

### Environment Variables for Production

For production deployment, you'll need to configure environment variables. Most static hosts don't support `.env` files directly, so you'll need to:

1. **Inline the API key** in your JavaScript (not recommended for security)
2. **Use a proxy service** that adds the API key server-side
3. **Host on a platform that supports serverless functions** (but then you're back to needing Node.js)

**For pure static hosting without any server component**, you currently have these options:
- Hardcode the API key in the JavaScript (insecure)
- Use a CORS proxy service
- Modify the code to accept the API key via user input

### Security Note

⚠️ **Important**: Direct API key exposure in client-side code is a security risk. The current setup assumes you'll only run this locally or on a trusted network. For public deployment, consider using a backend proxy or serverless function to keep your API key secure.

## Status

Early prototype scaffolding.
