const DIMENSIONS = ["continuity", "differentiation", "contextual_fit", "accountability", "reflexivity"];
let cachedProfile = null;
let lastResult = null;

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
  setupExportDialog();
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

  if (!text || text.trim().length < 10) {
    setStatus("Error: Please provide more detail (at least 10 characters).");
    return;
  }

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
    lastResult = parsed;
    setExportAvailability(true);
    setStatus("Evaluation complete.");
  } catch (err) {
    setStatus("Error: " + err);
    lastResult = null;
    setExportAvailability(false);
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

Coherence profile:
${profileText}

Specific Guidance for Dimensions:
- Continuity: Look for coherence over time. Do NOT interpret continuity as rigidity; it is about stable identity, not resisting change.
- Differentiation: Look for role clarity and boundaries. Treat it as healthy separation, not isolation.
- Contextual Fit: Focus on appropriateness to the specific situation described, not general moral judgment.
- Accountability: Focus on clarity of cause-and-effect and transparency. Do NOT moralize or assign blame.
- Reflexivity: Look for safe adjustability and feedback loops. Do NOT interpret it as chaotic change.

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

  const radar = document.getElementById("radarChart");
  if (radar) radar.innerHTML = "";

  lastResult = null;
  setExportAvailability(false);
}

function renderRadarChart(scores) {
  const container = document.getElementById("radarChart");
  if (!container) return;

  const width = 280;
  const height = 260;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 90;

  const dimCount = DIMENSIONS.length;
  const angleSlice = (Math.PI * 2) / dimCount;

  // Create SVG
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Draw background pentagons (grid)
  for (let level = 5; level > 0; level--) {
    const levelRadius = (radius / 5) * level;
    let points = "";
    for (let i = 0; i < dimCount; i++) {
      const angle = i * angleSlice - Math.PI / 2; // Start from top
      const x = centerX + levelRadius * Math.cos(angle);
      const y = centerY + levelRadius * Math.sin(angle);
      points += `${x},${y} `;
    }
    // Check theme for stroke color
    const isLight = document.body.classList.contains("light-mode");
    const gridColor = isLight ? "#e0e0e0" : "#404040";
    svg += `<polygon points="${points}" fill="none" stroke="${gridColor}" stroke-width="1" />`;
  }

  // Draw axes
  for (let i = 0; i < dimCount; i++) {
    const angle = i * angleSlice - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const isLight = document.body.classList.contains("light-mode");
    const axisColor = isLight ? "#e0e0e0" : "#404040";

    svg += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="${axisColor}" stroke-width="1" />`;

    // Labels
    const labelRadius = radius + 20;
    const labelX = centerX + labelRadius * Math.cos(angle);
    const labelY = centerY + labelRadius * Math.sin(angle);
    const label = capitalize(DIMENSIONS[i].replace(/_/g, " "));

    // Adjust text anchor based on position
    let anchor = "middle";
    if (Math.abs(labelX - centerX) > 10) {
      anchor = labelX > centerX ? "start" : "end";
    }

    // Simple adjustment for Y to avoid overlapping
    let dy = "0.3em";
    if (labelY < centerY) dy = "0";
    if (labelY > centerY) dy = "0.8em";

    const textColor = isLight ? "#555555" : "#b0b0b0";
    svg += `<text x="${labelX}" y="${labelY}" text-anchor="${anchor}" fill="${textColor}" font-size="10" dy="${dy}">${label}</text>`;
  }

  // Draw data polygon
  let dataPoints = "";
  let circles = "";

  for (let i = 0; i < dimCount; i++) {
    const dim = DIMENSIONS[i];
    const score = clampScore(scores[dim]);
    const r = score * radius;
    const angle = i * angleSlice - Math.PI / 2;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    dataPoints += `${x},${y} `;

    circles += `<circle cx="${x}" cy="${y}" r="4" fill="#2ab7ca" />`;
  }

  svg += `<polygon points="${dataPoints}" fill="rgba(42, 183, 202, 0.3)" stroke="#2ab7ca" stroke-width="2" />`;
  svg += circles;
  svg += `</svg>`;

  container.innerHTML = svg;
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

      const labelText = document.createElement("span");
      labelText.textContent = dim.replace(/_/g, " ");
      label.appendChild(labelText);

      // Add info icon
      const infoIcon = document.createElement("span");
      infoIcon.className = "info-icon";
      infoIcon.textContent = "ℹ";
      infoIcon.title = cachedProfile?.dimensions?.[dim]?.description || "Dimension info";
      infoIcon.style.cursor = "help";
      infoIcon.style.marginLeft = "6px";
      infoIcon.style.fontSize = "0.8em";
      infoIcon.style.color = "var(--accent-primary)";
      label.appendChild(infoIcon);

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

  renderRadarChart(scores);

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

function setupExportDialog() {
  const exportBtn = document.getElementById("exportBtn");
  const confirmBtn = document.getElementById("confirmExport");
  const cancelBtn = document.getElementById("cancelExport");
  const closeBtn = document.getElementById("closeExport");
  const modal = document.getElementById("exportModal");
  const backdrop = document.getElementById("modalBackdrop");

  if (!exportBtn || !modal || !backdrop) return;

  setExportAvailability(Boolean(lastResult));

  exportBtn.addEventListener("click", () => {
    if (!lastResult) {
      setStatus("Run an evaluation before exporting.");
      return;
    }
    openExportModal();
  });

  confirmBtn?.addEventListener("click", () => {
    const format = getSelectedExportFormat();
    exportEvaluation(format);
  });

  [cancelBtn, closeBtn].forEach((btn) => btn?.addEventListener("click", closeExportModal));
  backdrop.addEventListener("click", closeExportModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExportModal();
  });
}

function setExportAvailability(isEnabled) {
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.disabled = !isEnabled;
}

function openExportModal() {
  const modal = document.getElementById("exportModal");
  const backdrop = document.getElementById("modalBackdrop");
  modal?.classList.add("open");
  backdrop?.classList.add("visible");
}

function closeExportModal() {
  const modal = document.getElementById("exportModal");
  const backdrop = document.getElementById("modalBackdrop");
  modal?.classList.remove("open");
  backdrop?.classList.remove("visible");
}

function getSelectedExportFormat() {
  const selected = document.querySelector('input[name="exportFormat"]:checked');
  return selected?.value || "txt";
}

function exportEvaluation(format) {
  if (!lastResult) {
    setStatus("Run an evaluation before exporting.");
    closeExportModal();
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = `coherence-evaluation-${timestamp}`;

  let blob;
  if (format === "md") {
    blob = new Blob([buildMarkdown(lastResult)], { type: "text/markdown" });
  } else if (format === "pdf") {
    const pdfText = createPdfDocument(buildCommonLines(lastResult));
    blob = new Blob([pdfText], { type: "application/pdf" });
  } else {
    blob = new Blob([buildPlainText(lastResult)], { type: "text/plain" });
  }

  downloadBlob(blob, `${baseName}.${format}`);
  setStatus(`Exported as .${format}`);
  closeExportModal();
}

function buildCommonLines(result) {
  const scores = result.scores || {};
  const explanations = result.explanations || {};
  const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];
  const questions = Array.isArray(result.clarifying_questions) ? result.clarifying_questions : [];
  const timestamp = new Date().toLocaleString();

  const lines = [
    "Relational Coherence Evaluation",
    `Generated: ${timestamp}`,
    "",
    "Scores:",
  ];

  DIMENSIONS.forEach((dim) => {
    const raw = scores[dim];
    const scoreText = Number.isFinite(raw) ? raw.toFixed(2) : "--";
    lines.push(`- ${capitalize(dim.replace(/_/g, " "))}: ${scoreText} (${scoreBand(raw)})`);
  });

  lines.push("", "Summary:", result.summary || "No summary provided.");

  lines.push("", "Dimension Notes:");
  DIMENSIONS.forEach((dim) => {
    const label = capitalize(dim.replace(/_/g, " "));
    lines.push(`* ${label}: ${explanations[dim] || "No explanation provided."}`);
  });

  lines.push("", "Recommendations:");
  if (recommendations.length === 0) {
    lines.push("- No recommendations provided.");
  } else {
    recommendations.forEach((rec) => lines.push(`- ${rec}`));
  }

  lines.push("", "Clarifying Questions:");
  if (questions.length === 0) {
    lines.push("- None.");
  } else {
    questions.forEach((q) => lines.push(`- ${q}`));
  }

  return lines;
}

function buildPlainText(result) {
  return buildCommonLines(result).join("\n");
}

function buildMarkdown(result) {
  const scores = result.scores || {};
  const explanations = result.explanations || {};
  const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];
  const questions = Array.isArray(result.clarifying_questions) ? result.clarifying_questions : [];
  const timestamp = new Date().toLocaleString();

  const lines = [
    "# Relational Coherence Evaluation",
    `Generated: ${timestamp}`,
    "",
    "## Scores",
  ];

  DIMENSIONS.forEach((dim) => {
    const raw = scores[dim];
    const scoreText = Number.isFinite(raw) ? raw.toFixed(2) : "--";
    lines.push(`- **${capitalize(dim.replace(/_/g, " "))}:** ${scoreText} (${scoreBand(raw)})`);
  });

  lines.push("", "## Summary", result.summary || "No summary provided.");

  lines.push("", "## Dimension Notes");
  DIMENSIONS.forEach((dim) => {
    const label = capitalize(dim.replace(/_/g, " "));
    lines.push(`- **${label}:** ${explanations[dim] || "No explanation provided."}`);
  });

  lines.push("", "## Recommendations");
  if (recommendations.length === 0) {
    lines.push("- No recommendations provided.");
  } else {
    recommendations.forEach((rec) => lines.push(`- ${rec}`));
  }

  lines.push("", "## Clarifying Questions");
  if (questions.length === 0) {
    lines.push("- None.");
  } else {
    questions.forEach((q) => lines.push(`- ${q}`));
  }

  return lines.join("\n");
}

function createPdfDocument(lines) {
  const sanitized = lines.map((line) => line.replace(/([()\\])/g, "\\$1"));
  const contentParts = ["BT", "/F1 12 Tf", "72 760 Td"];

  sanitized.forEach((line, index) => {
    if (index > 0) contentParts.push("0 -16 Td");
    contentParts.push(`(${line}) Tj`);
  });

  contentParts.push("ET");
  const contentStream = contentParts.join("\n");
  const contentLength = contentStream.length;

  return `%PDF-1.4\n` +
    `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n` +
    `2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n` +
    `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n` +
    `4 0 obj<</Length ${contentLength}>>stream\n${contentStream}\nendstream\nendobj\n` +
    `5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n` +
    `trailer<</Root 1 0 R/Size 5>>\n%%EOF`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
