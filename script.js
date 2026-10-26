
"use strict";

// ========================================
// DRACAID — TEAM DRAGON
// Front-end hackathon prototype
// All patient and facility data is synthetic.
// ========================================

const $ = id => document.getElementById(id);

const patients = [
  {
    id: "TAG-001",
    name: "Patient 001",
    location: "Zone A",
    heartRate: 128,
    spo2: 89,
    systolic: 100,
    diastolic: 70,
    transported: false,
    history: []
  },
  {
    id: "TAG-002",
    name: "Patient 002",
    location: "Zone B",
    heartRate: 94,
    spo2: 96,
    systolic: 120,
    diastolic: 80,
    transported: false,
    history: []
  },
  {
    id: "TAG-003",
    name: "Patient 003",
    location: "Zone C",
    heartRate: 76,
    spo2: 99,
    systolic: 118,
    diastolic: 78,
    transported: false,
    history: []
  },
  {
    id: "TAG-004",
    name: "Patient 004",
    location: "Zone A",
    heartRate: 112,
    spo2: 93,
    systolic: 105,
    diastolic: 72,
    transported: false,
    history: []
  }
];

const facilities = [
  {
    name: "Central General",
    area: "Central",
    icu: 5,
    trauma: 8,
    capacity: 72
  },
  {
    name: "North Trauma Centre",
    area: "North",
    icu: 2,
    trauma: 3,
    capacity: 88
  },
  {
    name: "East Community Hospital",
    area: "East",
    icu: 7,
    trauma: 4,
    capacity: 55
  }
];

let events = [];
let hazards = [
  {
    title: "Zone A incident",
    description: "Multiple simulated patients registered.",
    level: "HIGH"
  },
  {
    title: "Dispatch coordination",
    description: "Confirm destination capacity before dispatch.",
    level: "INFO"
  }
];

let handoffs = [];
let nextTag = 5;
let activePatientId = patients[0].id;
let hazardIndex = 0;

// ========================================
// NAVIGATION
// ========================================

const pageTitles = {
  dashboard: "Command Dashboard",
  intake: "Rapid Patient Intake",
  monitor: "Patient Vital Monitor",
  facilities: "Facility & Resource Tracker"
};

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.page;

    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    document.querySelectorAll(".page").forEach(page => {
      page.classList.toggle("active", page.id === target);
    });

    $("pageTitle").textContent = pageTitles[target];

    if (target === "monitor") {
      renderMonitor();
    }

    if (target === "facilities") {
      renderFacilities();
    }

    if (target === "dashboard") {
      renderDashboard();
    }
  });
});

// ========================================
// TRIAGE DEMO CATEGORIES
// These thresholds are illustrative only.
// They are not validated medical guidance.
// ========================================

function getTriage(patient) {
  if (
    patient.spo2 < 90 ||
    patient.heartRate > 125 ||
    patient.systolic < 90
  ) {
    return {
      label: "Immediate",
      className: "red"
    };
  }

  if (
    patient.spo2 < 95 ||
    patient.heartRate > 105 ||
    patient.systolic < 100
  ) {
    return {
      label: "Urgent",
      className: "yellow"
    };
  }

  return {
    label: "Stable",
    className: "green"
  };
}

function safeText(value) {
  return String(value);
}

// ========================================
// EVENT LOG
// ========================================

function logEvent(message) {
  events.unshift({
    time: new Date().toLocaleTimeString(),
    message
  });

  events = events.slice(0, 60);
  renderEventLog();
}

function renderEventLog() {
  const container = $("eventLog");
  container.replaceChildren();

  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No events recorded yet.";
    container.appendChild(empty);
    return;
  }

  events.slice(0, 12).forEach(event => {
    const row = document.createElement("div");
    row.className = "log-entry";

    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = event.time;

    const message = document.createElement("span");
    message.textContent = event.message;

    row.append(time, message);
    container.appendChild(row);
  });
}

function renderHandoffs() {
  const container = $("handoffLog");
  container.replaceChildren();

  if (!handoffs.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No handoffs recorded yet.";
    container.appendChild(empty);
    return;
  }

  handoffs.slice(0, 10).forEach(item => {
    const row = document.createElement("div");
    row.className = "log-entry";
    row.textContent =
      `[${item.time}] ${item.patient} → ${item.facility} · ${item.team}`;
    container.appendChild(row);
  });
}

// ========================================
// COMMAND DASHBOARD
// ========================================

function renderDashboard() {
  $("totalCount").textContent = patients.length;

  $("immediateCount").textContent = patients.filter(patient =>
    !patient.transported &&
    getTriage(patient).label === "Immediate"
  ).length;

  $("pendingCount").textContent =
    patients.filter(patient => !patient.transported).length;

  $("transportedCount").textContent =
    patients.filter(patient => patient.transported).length;

  renderHazards();
  renderEventLog();
}

function renderHazards() {
  const container = $("hazardList");
  container.replaceChildren();

  hazards.forEach(hazard => {
    const row = document.createElement("div");
    row.className = "alert-row";

    const symbol = document.createElement("div");
    symbol.className = "alert-symbol";
    symbol.textContent = hazard.level === "HIGH" ? "!" : "i";

    const content = document.createElement("div");
    const title = document.createElement("strong");
    const description = document.createElement("p");

    title.textContent = hazard.title;
    description.textContent = hazard.description;

    content.append(title, description);
    row.append(symbol, content);
    container.appendChild(row);
  });
}

$("refreshBtn").addEventListener("click", () => {
  renderDashboard();
  logEvent("Dashboard overview refreshed.");
});

$("addHazardBtn").addEventListener("click", () => {
  hazardIndex++;

  hazards.unshift({
    title: `Demo alert ${hazardIndex}`,
    description: "Synthetic alert created by the operator.",
    level: "INFO"
  });

  hazards = hazards.slice(0, 6);

  renderHazards();
  logEvent(`Demo hazard alert ${hazardIndex} added.`);
});

$("clearLogBtn").addEventListener("click", () => {
  events = [];
  renderEventLog();
});

// Interactive schematic map markers
document.querySelectorAll(".map-pin").forEach(pin => {
  pin.addEventListener("click", () => {
    const zone = pin.dataset.zone;

    const count = patients.filter(patient =>
      patient.location === zone
    ).length;

    $("mapFeedback").textContent =
      `${zone}: ${count} registered demo patient(s).`;

    logEvent(`Map zone inspected: ${zone}.`);
  });
});

// ========================================
// RAPID PATIENT INTAKE
// ========================================

function setIntakeResult(patient) {
  const triage = getTriage(patient);

  $("intakeResultTitle").textContent = patient.name;
  $("intakeResultText").textContent =
    `${patient.id} registered in ${patient.location}. ` +
    `Demo category: ${triage.label}.`;

  const badge = document.createElement("span");
  badge.className = `tag ${triage.className}`;
  badge.textContent = triage.label;

  $("intakeResultBadge").replaceChildren(badge);
  $("intakeTotal").textContent = patients.length;
}

$("intakeForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("patientName").value.trim();
  const id = $("tagId").value.trim().toUpperCase();

  const heartRate = Number($("heartRate").value);
  const spo2 = Number($("spo2").value);
  const systolic = Number($("systolic").value);
  const diastolic = Number($("diastolic").value);

  if (
    !name || !id ||
    patients.some(patient => patient.id === id)
  ) {
    alert("Enter a patient label and a unique tag ID.");
    return;
  }

  if (
    !Number.isFinite(heartRate) ||
    !Number.isFinite(spo2) ||
    !Number.isFinite(systolic) ||
    !Number.isFinite(diastolic) ||
    heartRate < 1 || heartRate > 300 ||
    spo2 < 1 || spo2 > 100 ||
    systolic < 1 || systolic > 350 ||
    diastolic < 1 || diastolic > 250
  ) {
    alert("Please check the entered vital sign values.");
    return;
  }

  const patient = {
    id,
    name,
    location: $("zone").value,
    heartRate,
    spo2,
    systolic,
    diastolic,
    transported: false,
    history: []
  };

  recordHistory(patient);
  patients.push(patient);
  activePatientId = patient.id;

  setIntakeResult(patient);
  $("intakeForm").reset();

  $("tagId").value = `TAG-${String(nextTag).padStart(3, "0")}`;
  nextTag++;

  renderAll();
  logEvent(`${patient.id} registered from ${patient.location}.`);

  // Update the patient monitor to the newly registered patient.
  renderMonitor();
});

function setSuggestedTag() {
  let candidate;

  do {
    candidate = `TAG-${String(nextTag).padStart(3, "0")}`;
    nextTag++;
  } while (patients.some(patient => patient.id === candidate));

  $("tagId").value = candidate;
}

// ========================================
// PATIENT VITAL MONITOR
// ========================================

function recordHistory(patient) {
  patient.history.push({
    heartRate: patient.heartRate,
    spo2: patient.spo2,
    systolic: patient.systolic,
    diastolic: patient.diastolic,
    time: new Date().toLocaleTimeString()
  });

  patient.history = patient.history.slice(-12);
}

patients.forEach(recordHistory);

function renderMonitorOptions() {
  const select = $("monitorPatient");
  const previous = activePatientId;

  select.replaceChildren();

  patients.forEach(patient => {
    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = `${patient.id} — ${patient.name}`;
    select.appendChild(option);
  });

  if (patients.some(patient => patient.id === previous)) {
    select.value = previous;
  } else if (patients.length) {
    activePatientId = patients[0].id;
    select.value = activePatientId;
  }
}

function renderMonitor() {
  renderMonitorOptions();

  const patient = patients.find(
    item => item.id === $("monitorPatient").value
  );

  if (!patient) {
    $("monitorHR").textContent = "--";
    $("monitorSpO2").textContent = "--";
    $("monitorBP").textContent = "--/--";
    $("vitalChart").textContent = "Register a patient to view demo trends.";
    $("deteriorationAlert").classList.add("hidden");
    return;
  }

  activePatientId = patient.id;

  $("monitorHR").textContent = patient.heartRate;
  $("monitorSpO2").textContent = patient.spo2;
  $("monitorBP").textContent =
    `${patient.systolic}/${patient.diastolic}`;

  const alertBox = $("deteriorationAlert");
  const history = patient.history;

  const last = history[history.length - 1];
  const previous = history[history.length - 2];

  const worsening = previous && (
    patient.spo2 < previous.spo2 - 2 ||
    patient.heartRate > previous.heartRate + 15
  );

  if (worsening) {
    alertBox.textContent =
      "Demo deterioration flag: readings changed significantly since the previous recorded sample. Review with qualified personnel.";
    alertBox.classList.remove("hidden");
  } else {
    alertBox.textContent =
      `Latest sample recorded at ${last.time}. Changes shown are demo comparisons only.`;
    alertBox.classList.remove("hidden");
  }

  renderVitalChart(patient);
}

$("monitorPatient").addEventListener("change", () => {
  activePatientId = $("monitorPatient").value;
  renderMonitor();
});

$("recordVitalsBtn").addEventListener("click", () => {
  const patient = patients.find(
    item => item.id === $("monitorPatient").value
  );

  if (!patient) return;

  const oldHR = patient.heartRate;
  const oldSpO2 = patient.spo2;

  // Generate a synthetic observation, not a real sensor reading.
  patient.heartRate = Math.max(
    45,
    Math.min(180, oldHR + Math.floor(Math.random() * 19) - 9)
  );

  patient.spo2 = Math.max(
    80,
    Math.min(100, oldSpO2 + Math.floor(Math.random() * 5) - 2)
  );

  recordHistory(patient);

  logEvent(`New synthetic vital sample recorded for ${patient.id}.`);
  renderAll();
  renderMonitor();
});

function renderVitalChart(patient) {
  const history = patient.history;

  if (!history.length) {
    $("vitalChart").textContent = "No readings recorded.";
    return;
  }

  const width = 650;
  const height = 205;
  const left = 42;
  const right = 15;
  const top = 18;
  const bottom = 30;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  function x(i) {
    return history.length === 1
      ? left + plotWidth / 2
      : left + i * plotWidth / (history.length - 1);
  }

  function y(value, min, max) {
    return top + plotHeight -
      ((value - min) / (max - min)) * plotHeight;
  }

  const hrPoints = history.map((item, i) =>
    `${x(i)},${y(item.heartRate, 40, 180)}`
  ).join(" ");

  const oxygenPoints = history.map((item, i) =>
    `${x(i)},${y(item.spo2, 80, 100)}`
  ).join(" ");

  const grid = [0, 1, 2, 3].map(i => {
    const gy = top + i * plotHeight / 3;
    return `<line x1="${left}" y1="${gy}" x2="${width-right}" y2="${gy}" stroke="#f0e3e9" stroke-width="1"/>`;
  }).join("");

  $("vitalChart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}"
         role="img" aria-label="Illustrative patient vital trend chart">
      ${grid}
      <polyline points="${hrPoints}" fill="none"
        stroke="#c34c7b" stroke-width="3"
        stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${oxygenPoints}" fill="none"
        stroke="#171419" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        stroke-dasharray="5 4"/>
      ${history.map((item, i) => `
        <circle cx="${x(i)}" cy="${y(item.heartRate,40,180)}"
          r="3.5" fill="#c34c7b"/>
        <circle cx="${x(i)}" cy="${y(item.spo2,80,100)}"
          r="3" fill="#171419"/>
      `).join("")}
      <text x="5" y="20" font-size="10" fill="#817780">HR</text>
      <text x="5" y="36" font-size="10" fill="#817780">SpO₂</text>
      <text x="${left}" y="${height-7}" font-size="10" fill="#817780">Earlier</text>
      <text x="${width-right}" y="${height-7}" text-anchor="end"
        font-size="10" fill="#817780">Latest</text>
    </svg>
  `;
}

// ========================================
// DIGITAL TRANSPORT HANDOFF
// ========================================

$("handoffForm").addEventListener("submit", event => {
  event.preventDefault();

  const patient = patients.find(
    item => item.id === $("monitorPatient").value
  );

  if (!patient) {
    alert("Select a patient first.");
    return;
  }

  const team = $("ambulanceId").value.trim();

  if (!team) return;

  const handoff = {
    patient: patient.id,
    facility: $("handoffFacility").value,
    team,
    time: new Date().toLocaleTimeString()
  };

  handoffs.unshift(handoff);
  patient.transported = true;

  logEvent(
    `Handoff recorded: ${patient.id} to ${handoff.facility}, team ${team}.`
  );

  $("handoffForm").reset();
  renderAll();
  renderMonitor();
  renderHandoffs();
});

// ========================================
// FACILITY & RESOURCE TRACKER
// ========================================

function renderFacilities() {
  $("facilityCount").textContent = facilities.length;

  $("icuTotal").textContent = facilities.reduce(
    (sum, facility) => sum + facility.icu, 0
  );

  $("traumaTotal").textContent = facilities.reduce(
    (sum, facility) => sum + facility.trauma, 0
  );

  const tbody = $("facilityTable");
  tbody.replaceChildren();

  facilities.forEach(facility => {
    const row = document.createElement("tr");

    const name = document.createElement("td");
    const strong = document.createElement("strong");
    strong.textContent = facility.name;
    name.appendChild(strong);

    const area = document.createElement("td");
    area.textContent = facility.area;

    const icu = document.createElement("td");
    icu.textContent = facility.icu;

    const trauma = document.createElement("td");
    trauma.textContent = facility.trauma;

    const capacity = document.createElement("td");
    capacity.className = "capacity";

    const label = document.createElement("span");
    label.className = "capacity-label";
    label.textContent = `${facility.capacity}% utilized`;

    const bar = document.createElement("div");
    bar.className = "capacity-bar";

    const fill = document.createElement("div");
    fill.className = "capacity-fill";
    fill.style.width = `${facility.capacity}%`;

    bar.appendChild(fill);
    capacity.append(label, bar);

    row.append(name, area, icu, trauma, capacity);
    tbody.appendChild(row);
  });
}

$("recheckFacilities").addEventListener("click", () => {
  // Small sample inventory variation for demo purposes.
  facilities.forEach(facility => {
    facility.icu = Math.max(
      0, facility.icu + Math.floor(Math.random() * 3) - 1
    );

    facility.trauma = Math.max(
      0, facility.trauma + Math.floor(Math.random() * 3) - 1
    );
  });

  renderFacilities();
  logEvent("Sample facility inventory refreshed.");
});

$("diversionBtn").addEventListener("click", () => {
  const resource = $("resourceType").value;
  const area = $("destinationArea").value;

  const ranked = facilities
    .filter(facility => facility[resource] > 0)
    .sort((a, b) => {
      // Sample scoring only: capacity and bed count.
      const scoreA = a[resource] * 10 - a.capacity / 10;
      const scoreB = b[resource] * 10 - b.capacity / 10;
      return scoreB - scoreA;
    });

  const output = $("diversionResult");
  output.replaceChildren();

  if (!ranked.length) {
    output.textContent =
      "No facility has sample availability for this resource.";
    return;
  }

  const recommended = ranked[0];

  const title = document.createElement("strong");
  title.textContent = "Demo recommendation: " + recommended.name;

  const detail = document.createElement("p");
  detail.textContent =
    `${recommended.icu} ICU bed(s), ${recommended.trauma} trauma bed(s), ` +
    `${recommended.capacity}% sample utilization. Incident area: ${area}.`;

  const note = document.createElement("p");
  note.textContent =
    "This ranking uses fictional inventory and does not verify travel time, clinical suitability, or actual hospital capacity.";

  output.append(title, detail, note);

  logEvent(
    `Demo diversion recommendation generated for ${area}: ${recommended.name}.`
  );
});

// ========================================
// INITIALIZE ALL PAGES
// ========================================

function renderAll() {
  renderDashboard();
  renderMonitorOptions();
  renderFacilities();
  renderHandoffs();
  $("intakeTotal").textContent = patients.length;
}

function initializeApp() {
  setSuggestedTag();
  renderAll();
  renderMonitor();
  logEvent("DracAid demo system initialized.");
}

initializeApp();
