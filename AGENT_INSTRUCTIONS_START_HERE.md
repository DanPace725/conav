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
