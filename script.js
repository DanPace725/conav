const DIMENSIONS = ["continuity", "differentiation", "contextual_fit", "accountability", "reflexivity"];
let cachedProfile = null;

window.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("evaluateBtn");
  if (btn) {
    btn.onclick = function () {
      evaluateCoherence();
    };
  }
  setupSidebarToggles();
  setupSidebarCollapse();
  setupThemeToggle();
  setupQuickForm();
});

async function loadEnv() {
  try {
    const res = await fetch(".env");
    if (!res.ok) throw new Error("Could not load .env");

    const text = await res.text();

    const env = {};

    text.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const [key, ...rest] = trimmed.split("=");
      const value = rest.join("=").trim();
      if (key) env[key.trim()] = value;
    });

    return env;
  } catch (err) {
    console.error("Failed to load .env", err);
    return {};
  }
}

async function loadProfile() {
  if (cachedProfile) return cachedProfile;
  try {
    const res = await fetch("coherence_profile.json");
    if (!res.ok) throw new Error("Could not load coherence_profile.json");
    cachedProfile = await res.json();
    return cachedProfile;
  } catch (err) {
    console.error("Failed to load profile", err);
    return null;
  }
}

async function evaluateCoherence() {
  const text = document.getElementById("inputText").value;
  setStatus("Evaluating...");
  clearResults();

  const profile = await loadProfile();
  if (!profile) {
    setStatus("Error: Could not load coherence profile");
    return;
  }

  const prompt = buildPrompt(text, profile);

  try {
    // Try Vercel serverless function first (production), fall back to direct API (local dev)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    let response, data;

    if (isProduction) {
      // Use Vercel serverless function
      response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setStatus(`Error: ${errorData.error || 'API request failed'}`);
        return;
      }

      data = await response.json();
    } else {
      // Local development: use .env file and direct API call
      const env = await loadEnv();
      const apiKey = env.OPENAI_API_KEY || env.API_KEY;

      if (!apiKey) {
        setStatus("Error: Missing OPENAI_API_KEY in .env file");
        return;
      }

      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        setStatus("Error: API request failed");
        return;
      }

      data = await response.json();
    }

    const textOutput = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = tryParseJson(textOutput);

    if (!parsed) {
      setStatus("Error: Could not parse model response as JSON");
      return;
    }

    renderResults(parsed);
    setStatus("Evaluation complete.");
  } catch (err) {
    setStatus("Error: " + err);
  }
}

function buildPrompt(userInput, profile) {
  const profileText = DIMENSIONS.map((dim) => {
    const info = profile.dimensions?.[dim] || {};
    const positives = (info.markers_positive || []).join("; ");
    const negatives = (info.markers_negative || []).join("; ");
    return `${capitalize(dim)} — ${info.description || ""}\nPositive markers: ${positives}\nNegative markers: ${negatives}`;
  }).join("\n\n");

  return `
You are a relational coherence evaluator speaking directly to the user (use "you/your" language).
Use only these five dimensions: Continuity, Differentiation, Contextual Fit, Accountability, Reflexivity.
Use the provided profile for definitions and markers.

Coherence profile:
${profileText}

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
  "recommendations": ["...", "..."],
  "clarifying_questions": ["...", "...", "..."]
}

IMPORTANT: For clarifying_questions:
- If critical context is missing that prevents accurate scoring, include 1-3 brief clarifying questions in "you/your" form.
- Only ask about concrete, missing facts: who is involved, timing/deadlines, specific constraints, what you're trying to achieve, what responsibilities exist.
- If the user provided enough detail to score all dimensions reasonably, return an empty array [].
- Never ask generic questions like "How do you feel?" or speculative questions.
- Only ask when a specific missing fact makes a dimension unclear or hard to score.
- Keep questions brief and direct.

User input:
${userInput}
`;
}

function tryParseJson(text) {
  try {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/, "").replace(/```$/, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse error", err);
    return null;
  }
}

function setStatus(message) {
  const statusEl = document.getElementById("status");
  if (statusEl) statusEl.textContent = message;
}

function clearResults() {
  const bars = document.getElementById("scoreBars");
  if (bars) bars.innerHTML = "";
  const summary = document.getElementById("summaryText");
  if (summary) summary.textContent = "No results yet.";
  const expContainer = document.getElementById("explanationsList");
  if (expContainer) expContainer.innerHTML = "";
  const recList = document.getElementById("recommendationsList");
  if (recList) recList.innerHTML = "";
  const questionsBlock = document.getElementById("questionsBlock");
  if (questionsBlock) questionsBlock.style.display = "none";
}

function renderResults(result) {
  const scores = result.scores || {};
  const bars = document.getElementById("scoreBars");
  if (bars) {
    bars.innerHTML = "";
    DIMENSIONS.forEach((dim) => {
      const row = document.createElement("div");
      row.className = "score-row";

      const label = document.createElement("div");
      label.className = "score-label";
      label.textContent = dim.replace(/_/g, " ");

      const track = document.createElement("div");
      track.className = "score-track";

      const fill = document.createElement("div");
      fill.className = "score-fill";

      const rawVal = scores[dim];
      const val = clampScore(rawVal);
      fill.style.width = `${val * 100}%`;

      const valueText = document.createElement("div");
      valueText.className = "score-value";
      valueText.textContent = Number.isFinite(rawVal) ? rawVal.toFixed(2) : val.toFixed(2);

      track.appendChild(fill);
      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(valueText);
      bars.appendChild(row);
    });
  }

  // Calculate and render composite score
  renderCompositeScore(scores);

  const summary = document.getElementById("summaryText");
  if (summary) summary.textContent = result.summary || "No summary provided.";

  const explanations = result.explanations || {};
  const expContainer = document.getElementById("explanationsList");
  if (expContainer) {
    expContainer.innerHTML = "";
    DIMENSIONS.forEach((dim) => {
      const card = document.createElement("div");
      card.className = "explanation-card";

      const title = document.createElement("h4");
      const band = scoreBand(scores[dim]);
      title.textContent = `${capitalize(dim.replace(/_/g, " "))} (${band})`;

      const text = document.createElement("p");
      text.textContent = explanations[dim] || "No explanation provided.";

      card.appendChild(title);
      card.appendChild(text);
      expContainer.appendChild(card);
    });
  }

  const recList = document.getElementById("recommendationsList");
  if (recList) {
    recList.innerHTML = "";
    const recs = Array.isArray(result.recommendations) ? result.recommendations : [];
    if (recs.length === 0) {
      const placeholder = document.createElement("li");
      placeholder.textContent = "No recommendations provided.";
      recList.appendChild(placeholder);
    } else {
      recs.forEach((rec) => {
        const li = document.createElement("li");
        li.textContent = rec;
        recList.appendChild(li);
      });
    }
  }

  // Render clarifying questions if present
  const questions = Array.isArray(result.clarifying_questions) ? result.clarifying_questions : [];
  const questionsBlock = document.getElementById("questionsBlock");
  const questionsList = document.getElementById("questionsList");
  
  if (questionsBlock && questionsList) {
    if (questions.length > 0) {
      questionsBlock.style.display = "block";
      questionsList.innerHTML = "";
      questions.forEach((question) => {
        const li = document.createElement("li");
        li.textContent = question;
        questionsList.appendChild(li);
      });
    } else {
      questionsBlock.style.display = "none";
    }
  }
}

function clampScore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  if (num < 0) return 0;
  if (num > 1) return 1;
  return num;
}

function scoreBand(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "Low";
  if (num >= 0.7) return "High";
  if (num >= 0.4) return "Medium";
  return "Low";
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setupSidebarToggles() {
  const buttons = Array.from(document.querySelectorAll(".toggle-btn"));
  if (buttons.length === 0) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      if (!targetId) return;

      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      const panels = Array.from(document.querySelectorAll(".panel"));
      panels.forEach((panel) => {
        panel.classList.toggle("open", panel.id === targetId);
      });
    });
  });

  // Set initial active button based on default open panel
  const openPanel = document.querySelector(".panel.open");
  const defaultBtn = openPanel
    ? buttons.find((b) => b.getAttribute("data-target") === openPanel.id)
    : buttons[0];
  if (defaultBtn) defaultBtn.classList.add("active");
}

function setupSidebarCollapse() {
  const toggleBtn = document.getElementById("sidebarToggle");
  const layout = document.getElementById("layout");
  
  if (!toggleBtn || !layout) return;
  
  // Load saved state from localStorage
  const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
  if (isCollapsed) {
    layout.classList.add("sidebar-collapsed");
  }
  
  toggleBtn.addEventListener("click", () => {
    const collapsed = layout.classList.toggle("sidebar-collapsed");
    localStorage.setItem("sidebarCollapsed", collapsed.toString());
  });
}

function setupThemeToggle() {
  const toggleBtn = document.getElementById("themeToggle");
  const themeIcon = toggleBtn?.querySelector(".theme-icon");
  
  if (!toggleBtn || !themeIcon) return;
  
  // Default to dark mode, but load saved preference
  const savedTheme = localStorage.getItem("theme");
  const isLightMode = savedTheme === "light";
  
  if (isLightMode) {
    document.body.classList.add("light-mode");
    themeIcon.textContent = "🌙";
  } else {
    // Dark mode is default (no class needed)
    themeIcon.textContent = "☀️";
  }
  
  toggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    themeIcon.textContent = isLight ? "🌙" : "☀️";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}


function renderCompositeScore(scores) {
  const compositeBox = document.getElementById("compositeScore");
  if (!compositeBox) return;

  // Calculate average of all dimension scores
  const validScores = DIMENSIONS.map(dim => clampScore(scores[dim])).filter(v => Number.isFinite(v));
  
  if (validScores.length === 0) return;

  const composite = validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
  
  // Determine band and interpretation
  const band = getCompositeBand(composite);
  const interpretation = getCompositeInterpretation(band);
  
  // Update display
  const numberEl = compositeBox.querySelector(".composite-number");
  const labelEl = compositeBox.querySelector(".composite-label");
  const descEl = compositeBox.querySelector(".composite-description");
  
  if (numberEl) numberEl.textContent = composite.toFixed(2);
  if (labelEl) labelEl.textContent = band;
  if (descEl) descEl.textContent = interpretation;
  
  // Add band class for styling
  compositeBox.className = "composite-score";
  compositeBox.classList.add(`composite-${band.toLowerCase()}`);
}

function getCompositeBand(score) {
  if (score <= 0.25) return "Fragmented";
  if (score <= 0.45) return "Strained";
  if (score <= 0.60) return "Mixed";
  if (score <= 0.80) return "Stable";
  return "Coherent";
}

function getCompositeInterpretation(band) {
  const interpretations = {
    "Fragmented": "The structure of the situation is unstable and difficult to navigate as-is.",
    "Strained": "There are meaningful strains that may need attention before you can move forward confidently.",
    "Mixed": "Parts of the situation make sense, and parts are conflicted or unclear.",
    "Stable": "The situation is generally coherent with some manageable complexities.",
    "Coherent": "The structure of the situation is solid, aligned, and supportive of forward movement."
  };
  return interpretations[band] || "";
}

function setupQuickForm() {
  const toggleBtn = document.getElementById("toggleQuickForm");
  const quickFormSection = document.getElementById("quickFormSection");
  const composeBtn = document.getElementById("guidedCompose");
  const toggleText = toggleBtn?.querySelector(".toggle-text");
  const toggleArrow = toggleBtn?.querySelector(".toggle-arrow");
  
  if (!toggleBtn || !quickFormSection) return;

  // Toggle quick form visibility
  toggleBtn.addEventListener("click", () => {
    const isCollapsed = quickFormSection.classList.toggle("collapsed");
    
    if (toggleText) {
      toggleText.textContent = isCollapsed ? "Use Quick Form" : "Use Freeform Input";
    }
    if (toggleArrow) {
      toggleArrow.textContent = isCollapsed ? "▼" : "▲";
    }
  });

  // Compose description from form fields
  if (composeBtn) {
    composeBtn.addEventListener("click", () => {
      const what = document.getElementById("gf-what")?.value.trim() || "";
      const who = document.getElementById("gf-who")?.value.trim() || "";
      const why = document.getElementById("gf-why")?.value.trim() || "";

      const parts = [];
      if (what) parts.push(what);
      if (who) parts.push(who);
      if (why) parts.push(why);

      const composed = parts.join(" ");
      
      const mainTextarea = document.getElementById("inputText");
      if (mainTextarea && composed) {
        mainTextarea.value = composed;
        mainTextarea.focus();
        
        // Collapse the form after composing
        quickFormSection.classList.add("collapsed");
        if (toggleText) toggleText.textContent = "Use Quick Form";
        if (toggleArrow) toggleArrow.textContent = "▼";
      }
    });
  }
}
