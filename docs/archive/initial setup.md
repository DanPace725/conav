# **📁 Proposed GitHub Repository Structure**

```
relational-coherence-navigator/
│
├── README.md
├── AGENT_INSTRUCTIONS_START_HERE.md
├── coherence_profile.json
│
├── index.html
├── script.js
├── styles.css
│
└── agents/
    ├── coding_agent.md
    ├── architecture_agent.md
    ├── task_agent.md
    └── refactor_agent.md
```

Below are the contents for each file.

---

# **📄 README.md**

```md
# Relational Coherence Navigator

The Relational Coherence Navigator is a lightweight browser-based tool that helps users understand the structural coherence of complex life situations. It evaluates user input across five relational dimensions:

1. **Continuity**
2. **Differentiation**
3. **Contextual Fit**
4. **Accountability**
5. **Reflexivity**

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
Open `index.html` in a browser or host the folder on a static server.  
Configure your model API key inside `script.js`.

## Status
Early prototype scaffolding.
```

---

# **📄 AGENT_INSTRUCTIONS_START_HERE.md**

```md
# Agent Instructions — Start Here

All contributing agents MUST read and follow these instructions before modifying the repository.

---

## 1. Project Purpose

This project implements a **Relational Coherence Navigator**:  
A system that evaluates user-provided scenarios using five relational design dimensions:

- Continuity
- Differentiation
- Contextual Fit
- Accountability
- Reflexivity

Agents MUST use these five dimensions for all reasoning and implementation decisions.  
Do NOT reference any other underlying theory.

---

## 2. File Overview

- `index.html` — Main user interface
- `styles.css` — Basic styling
- `script.js` — Core logic + LLM call + evaluation pipeline
- `coherence_profile.json` — Definitions of the five dimensions
- `/agents/*.md` — Specialized instructions for agent roles

---

## 3. Coding Requirements

- Use **plain JavaScript**, **HTML**, and **CSS**.
- Avoid introducing frameworks (React, Next.js, Vue, Svelte, etc.).
- Avoid bundlers (Webpack, Vite).
- Prefer small, modular functions.
- Do not introduce backend code unless specifically instructed.

---

## 4. Coherence Evaluation Rules

Agents must implement and preserve logic consistent with:

- **Continuity:** Stability across time.
- **Differentiation:** Boundaries and role clarity.
- **Contextual Fit:** Appropriateness to the situation.
- **Accountability:** Transparency and traceability.
- **Reflexivity:** Ability to adjust safely.

These principles define all evaluation behavior.

---

## 5. LLM Usage

The LLM is used as a **semantic interpretation engine**, not as a chatbot.

The required output format is a structured JSON object:
- scores per dimension
- explanations
- summary
- recommendations

See `script.js` for schema details.

---

## 6. Prohibited Actions

Agents must NOT:
- Add conversational agents or chat UI.
- Reference deeper layers of theory.
- Introduce moral, prescriptive, or normative logic.
- Add external dependencies without approval.

---

## 7. Modification Process

Before modifying a file:
1. Read its contents.
2. Understand its purpose.
3. Ensure changes maintain relational coherence.
4. Make small, atomic changes.
5. Describe the reasoning in the PR/task output.

---

## 8. Agents Folder

Each agent type has a specific role:
- `coding_agent.md` — implements requested code
- `architecture_agent.md` — handles structure and organization
- `task_agent.md` — interprets tasks and assigns subtasks
- `refactor_agent.md` — improves clarity without changing behavior

Agents MUST refer to these documents when executing tasks.

---

End of file.
```

---

# **📄 coherence_profile.json**

```json
{
  "dimensions": {
    "continuity": {
      "description": "Stability of identity, commitments, and long-term coherence.",
      "markers_positive": [
        "consistent with long-term goals",
        "supports stability",
        "avoids fragmentation"
      ],
      "markers_negative": [
        "contradicts prior commitments",
        "creates instability",
        "sacrifices long-term integrity"
      ]
    },
    "differentiation": {
      "description": "Clarity of roles, boundaries, and responsibilities.",
      "markers_positive": [
        "clear boundaries",
        "defined responsibilities",
        "roles do not blur"
      ],
      "markers_negative": [
        "boundary confusion",
        "role conflicts",
        "unclear responsibilities"
      ]
    },
    "contextual_fit": {
      "description": "Alignment of actions with the situation's real context.",
      "markers_positive": [
        "matches situational demands",
        "appropriate timing",
        "context-aware"
      ],
      "markers_negative": [
        "misaligned with context",
        "incorrect assumptions",
        "poor timing"
      ]
    },
    "accountability": {
      "description": "Transparency, traceability, and clarity of consequences.",
      "markers_positive": [
        "visible causal pathways",
        "transparent decisions",
        "responsibility is clear"
      ],
      "markers_negative": [
        "opaque motives",
        "untraceable consequences",
        "hidden information"
      ]
    },
    "reflexivity": {
      "description": "Capacity for flexible adjustment and safe revision.",
      "markers_positive": [
        "allows adjustment",
        "supports feedback",
        "stable under change"
      ],
      "markers_negative": [
        "rigid patterns",
        "no feedback loops",
        "unsafe to revise"
      ]
    }
  }
}
```

---

# **📄 index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Relational Coherence Navigator</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="app">
    <h1>Relational Coherence Navigator</h1>

    <textarea id="inputText" placeholder="Describe your situation here..."></textarea>

    <button id="evaluateBtn">Evaluate</button>

    <pre id="output"></pre>
  </div>

  <script src="script.js"></script>
</body>
</html>
```

---

# **📄 script.js**

```javascript
async function evaluateCoherence() {
  const text = document.getElementById("inputText").value;
  const output = document.getElementById("output");
  output.textContent = "Evaluating...";

  const prompt = `
You are a relational coherence evaluator.

Analyze the user's situation using the five relational dimensions:
1. Continuity
2. Differentiation
3. Contextual Fit
4. Accountability
5. Reflexivity

Return ONLY valid JSON in the following structure:

{
  "scores": {
    "continuity": <0-1>,
    "differentiation": <0-1>,
    "contextual_fit": <0-1>,
    "accountability": <0-1>,
    "reflexivity": <0-1>
  },
  "explanations": {
    "continuity": "...",
    "differentiation": "...",
    "contextual_fit": "...",
    "accountability": "...",
    "reflexivity": "..."
  },
  "summary": "...",
  "recommendations": ["...", "..."]
}

User input:
${text}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY_HERE"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      })
    });

    const data = await response.json();
    const textOutput = data.choices?.[0]?.message?.content ?? "{}";

    output.textContent = textOutput;
  } catch (err) {
    output.textContent = "Error: " + err;
  }
}

document.getElementById("evaluateBtn").onclick = evaluateCoherence;
```

---

# **📄 styles.css**

```css
body {
  font-family: sans-serif;
  background: #fafafa;
  padding: 20px;
}

#app {
  max-width: 700px;
  margin: auto;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
}

button {
  padding: 10px 20px;
  margin-top: 10px;
}

pre {
  background: #eee;
  padding: 15px;
  margin-top: 20px;
  white-space: pre-wrap;
}
```

---

# **📁 agents folder**

### **📄 agents/coding_agent.md**

```md
# Coding Agent Instructions

Your role:
- Implement requested features in JS/HTML/CSS.
- Maintain simplicity and modularity.
- Never introduce frameworks or heavy dependencies.
- Use the five relational dimensions where logic applies.
- Preserve the JSON output schema exactly.

Do NOT modify:
- The conceptual meaning of the five dimensions
- Anything in the abstraction profile unless explicitly requested
```

---

### **📄 agents/architecture_agent.md**

```md
# Architecture Agent Instructions

Your role:
- Maintain a clean project structure.
- Ensure files remain simple and minimal.
- Prevent unnecessary complexity or additional tooling.
- Avoid architectural drift toward frameworks.

Principles:
- Flat structure
- Clear separation of UI and logic
- No backend unless explicitly added later
```

---

### **📄 agents/task_agent.md**

```md
# Task Agent Instructions

Interpret user instructions into:
- Small actionable tasks
- Clear steps for coding/refactor agents
- Ensuring alignment with the five relational dimensions

Do NOT introduce new theoretical concepts.  
Do NOT request frameworks or server-side tools.
```

---

### **📄 agents/refactor_agent.md**

```md
# Refactor Agent Instructions

Your role:
- Improve clarity
- Reduce duplication
- Keep behavior exactly the same
- Simplify logic where possible
- Ensure code remains readable for both humans and agents

Always preserve:
- The five dimensions
- The JSON output schema
- File structure
```

---

