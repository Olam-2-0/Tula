import { initTheme } from '../utils/orbitCore.js';

// Representative parsed sample data
const MOCK_OUTLINE_DATA = [
  {
    topic: "1. Cellular Respiration & Energy Flow",
    subtopics: [
      {
        name: "Glycolysis & Cytoplasm Phase",
        keyPoints: [
          "Splits one glucose (6C) into two pyruvate molecules (3C).",
          "Yields a net gain of 2 ATP and 2 NADH without oxygen.",
          "Occurs universally in the cytoplasm as the first metabolic stage."
        ]
      },
      {
        name: "Krebs / Citric Acid Cycle",
        keyPoints: [
          "Takes place inside the mitochondrial matrix under aerobic conditions.",
          "Generates high-energy electron carriers: 6 NADH, 2 FADH2, and 2 ATP.",
          "Releases CO2 as an organic byproduct."
        ]
      },
      {
        name: "Electron Transport Chain & Chemiosmosis",
        keyPoints: [
          "Proton gradient powers ATP synthase across inner mitochondrial cristae.",
          "Yields the majority of cellular energy (~30–32 ATP).",
          "Oxygen serves as the terminal electron acceptor, forming H2O."
        ]
      }
    ]
  },
  {
    topic: "2. Photosynthesis & Carbon Fixation",
    subtopics: [
      {
        name: "Light-Dependent Reactions (Thylakoids)",
        keyPoints: [
          "Chlorophyll absorbs photon energy to photolyze water molecules.",
          "Produces ATP and NADPH while liberating oxygen gas.",
          "Transfers electrons across Photosystems II and I."
        ]
      },
      {
        name: "Calvin Cycle (Light-Independent in Stroma)",
        keyPoints: [
          "Rubisco enzyme catalyzes CO2 fixation into 3-PGA sugars.",
          "Consumes ATP and NADPH to synthesize G3P precursors.",
          "Requires 6 full cycles to produce one glucose equivalent."
        ]
      }
    ]
  },
  {
    topic: "3. Thermodynamics in Biological Systems",
    subtopics: [
      {
        name: "Gibbs Free Energy & Reaction Coupling",
        keyPoints: [
          "Exergonic reactions (ΔG < 0) spontaneously release free energy.",
          "Endergonic reactions (ΔG > 0) are driven by ATP hydrolysis coupling.",
          "Enzymes accelerate reaction rates by lowering activation energy thresholds."
        ]
      }
    ]
  }
];

function bootstrapPdfScanner() {
  initTheme();
  setupUploadArea();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapPdfScanner);
} else {
  bootstrapPdfScanner();
}

function setupUploadArea() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-files-btn');
  const sampleBtn = document.getElementById('load-sample-btn');

  browseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  dropzone?.addEventListener('click', (e) => {
    if (e.target !== browseBtn && e.target !== sampleBtn) {
      fileInput?.click();
    }
  });

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      simulatePdfProcessing(e.dataTransfer.files[0].name);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      simulatePdfProcessing(e.target.files[0].name);
    }
  });

  sampleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    simulatePdfProcessing("Biology_Ch4_Cellular_Energy.pdf");
  });
}

function simulatePdfProcessing(fileName) {
  const dropzone = document.getElementById('dropzone');
  const processing = document.getElementById('processing-indicator');
  const outlineContainer = document.getElementById('outline-container');
  const docTitle = document.getElementById('uploaded-doc-name');

  dropzone.style.display = 'none';
  processing.style.display = 'block';
  outlineContainer.style.display = 'none';

  setTimeout(() => {
    processing.style.display = 'none';
    outlineContainer.style.display = 'block';
    if (docTitle) docTitle.textContent = fileName;
    renderOutline(MOCK_OUTLINE_DATA);
  }, 1200);
}

function renderOutline(data) {
  const container = document.getElementById('topics-tree');
  if (!container) return;

  container.innerHTML = data.map((t, idx) => `
    <div class="outline-topic-card ${idx === 0 ? 'open' : ''}">
      <div class="topic-header" onclick="this.parentElement.classList.toggle('open')">
        <span>${t.topic}</span>
        <span class="topic-chevron">&darr;</span>
      </div>
      <div class="subtopics-list">
        ${t.subtopics.map(sub => `
          <div class="subtopic-item">
            <div class="subtopic-title">${sub.name}</div>
            <ul class="key-points-list">
              ${sub.keyPoints.map(kp => `<li class="key-point-item">${kp}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Wire Study Plan Generator
  const generatePlanBtn = document.getElementById('generate-study-plan-btn');
  const planBox = document.getElementById('study-plan-output');
  const planList = document.getElementById('study-plan-steps');

  generatePlanBtn?.addEventListener('click', () => {
    planBox.style.display = 'block';
    planList.innerHTML = `
      <div class="study-plan-step">
        <span class="step-num">1.</span>
        <span><strong>Start with ${data[0].topic.split('. ')[1]}</strong> — foundational principles and pathways.</span>
      </div>
      <div class="study-plan-step">
        <span class="step-num">2.</span>
        <span><strong>Move to ${data[1].topic.split('. ')[1]}</strong> — compare reciprocal energy mechanisms.</span>
      </div>
      <div class="study-plan-step">
        <span class="step-num">3.</span>
        <span><strong>Finish with ${data[2].topic.split('. ')[1]}</strong> — synthesize energy laws and enzymatic control.</span>
      </div>
    `;
    planBox.scrollIntoView({ behavior: 'smooth' });
  });
}
