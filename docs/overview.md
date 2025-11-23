# **Relational Coherence Navigator — Project Overview**

The Relational Coherence Navigator is a lightweight, browser-based tool designed to help individuals evaluate complex life situations through a structured relational lens. It uses a simplified set of coherence principles derived from deeper relational theory, without exposing or depending on the underlying ontology. The purpose is to provide rapid, meaningful feedback for personal decision-making and complexity navigation, using minimal technology and an intuitive interface.

The system evaluates user-provided scenarios across five core relational dimensions:

1. **Continuity** – Stability of identity, commitments, and long-term coherence.
2. **Differentiation** – Clarity of roles, boundaries, and responsibilities.
3. **Contextual Fit** – Appropriateness of actions and expectations within the situation’s context.
4. **Accountability** – Transparency, traceability, and clarity of causal consequences.
5. **Reflexivity** – Flexibility, adaptability, and the ability to revise patterns safely.

The Navigator interprets user input with an LLM backend to generate structured assessments, coherence scores, pattern explanations, and practical guidance. The system does not offer predictive claims or normative judgments. Its sole purpose is to help users understand the relational structure of a situation and identify coherent next steps.

---

## **Design Goals**

* **Simplicity:** The project is implemented using plain JavaScript and HTML for maximum clarity and minimal overhead. No frameworks, no complex build pipeline, and no heavyweight reactive systems.
* **Speed:** The tool delivers immediate feedback, preserving rapid iteration and sustaining engagement.
* **Transparency:** Each coherence dimension is explicitly defined in a human-friendly form and used consistently across evaluations.
* **Safety:** The abstraction avoids exposing kernel-level theory. The system only uses compositional relational design principles.
* **Agent-friendly:** The repository structure supports multi-agent collaboration via a simple and explicit instruction layer.

---

## **High-Level Architecture**

The system consists of:

### **1. A Single-Page HTML Interface**

* Input box for user scenarios.
* “Evaluate” button.
* Output section displaying coherence scores, explanations, and recommendations.
* Optional history/log panel for journaling.

### **2. A Lightweight JS Coherence Engine**

The engine:

* ingests raw user input,
* formats it into a structured prompt for the model,
* sends it to the LLM (local or API),
* receives structured JSON output,
* interprets and displays results.

This engine implements the five relational principles as a classification and scoring schema.

### **3. A Configurable Coherence Profile**

A small JSON file (`coherence_profile.json`) defining:

* dimension names,
* dimension descriptions,
* example markers of coherence and incoherence,
* scoring rubrics,
* output format conventions.

This allows the system to evolve without refactoring core code.

### **4. A Repository-Level Agent Instruction Layer**

Root-level `AGENT_INSTRUCTIONS_START_HERE.md` file that:

* directs agents to the `/agents` folder,
* constrains naming conventions,
* defines reasoning constraints,
* outlines relational evaluation rules,
* prohibits exposure of underlying theory.

The `/agents` folder contains:

* coding instructions,
* architecture guidelines,
* test-writing guidelines,
* debugging patterns.

Agent tasking becomes clean and reliable.

---

## **Evaluation Process**

### **Input**

The user provides a situation, question, dilemma, or scenario.

### **Processing**

The JS engine constructs a structured prompt, embedding:

* the five relational principles,
* the scoring schema,
* the required JSON structure,
* the instruction to remain non-prescriptive and coherence-oriented.

The LLM produces:

* numeric scores (0–1 or 0–100),
* dimension-specific commentary,
* a relational summary,
* recommended adjustments,
* optional context questions.

### **Output**

The interface displays:

* a bar or radial chart of the five dimensions,
* textual explanations,
* relational patterns detected,
* coherence risks,
* actionable reflections.

The system never instructs users what to do; it only reveals structure.

---

## **Core Files and Their Purpose**

```
root/
  AGENT_INSTRUCTIONS_START_HERE.md     ← Primary agent entrypoint
  README.md                            ← Public overview
  coherence_profile.json               ← Defines relational dimensions and schema
  index.html                           ← User interface
  script.js                            ← Coherence engine + LLM calls
  styles.css                           ← Minimal styling

  /agents/
    coding_agent.md
    architecture_agent.md
    task_agent.md
    refactor_agent.md
```

---

## **Intended Use Cases**

* Clarifying personal decisions
* Navigating relational conflict
* Understanding boundaries
* Evaluating job choices
* Assessing commitments
* Reducing cognitive overload
* Improving coherence across life domains
* Journaling with structure
* Support for ADHD/autistic reasoning styles
* General reflective practice

The system is not diagnostic, predictive, or therapeutic. It is a structural reflection aid.

---

## **Non-Goals**

* No worldview claims
* No metaphysical statements
* No exposure of the underlying relational ontology
* No attempt at “life coaching”
* No optimization of outcomes
* No persuasive or directive behavior
* No high-level reasoning expansions beyond coherence structure

The Navigator is a **mirror**, not an advisor.

---

## **Long-Term Extensibility**

The system is intentionally simple so it can grow into:

* a journaling companion
* a pattern-recognition dashboard
* a “relational reasoning layer” for local LLMs
* integration with the Emergence Engine
* a modular relational coherence engine
* domain-specific extensions (work, relationships, projects)
* optional backend services if needed later

These expansions are not necessary for the initial prototype.

---

## **Current Objective**

Create the minimal, functional prototype:

* HTML interface
* JS coherence engine
* LLM integration
* coherence_profile.json abstraction
* clear agent scaffolding

This foundation supports fast iteration, multi-agent collaboration, and real user feedback.

---

**End of Document**
