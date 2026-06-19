// ============================================================
// SPC DAILY REPORT - CONFIG FILE
// Modify this file to change workers, targets, or API URL
// ============================================================

export const CONFIG = {
  // --- GOOGLE APPS SCRIPT URL ---
  // Replace this with your deployed Apps Script URL
  API_URL: "https://script.google.com/macros/s/AKfycbzRhse_PF-9pQSpw_Fycg9vgU6Edx4G-8myMR12Ga1RM2LpVXk7bMRgXJo4Zuks7Sk/exec",

  // --- COMPANY NAME ---
  companyName: "SPC",

  // --- REGMAR WORKERS ---
  regmarWorkers: [
    "Kamlesh",
    "Sanoj",
    "Veerbabu",
    "Ranjan"
  ],

  // --- BUFF WORKERS ---
  buffWorkers: [
    "Santvijay",
    "Harvinder Pandey",
    "Pankaj"
  ],

  // --- SHIFT TARGETS ---
  regmarTargets: {
    "8": 100,   // 8 hrs → 100 kg
    "12": 150   // 12 hrs → 150 kg
  },
  buffTargets: {
    "8": 130,   // 8 hrs → 130 kg
    "12": 200   // 12 hrs → 200 kg
  },

  // --- RAW MATERIALS TO CHECK ---
  rawMaterials: [
    { key: "kunda", label: "🔩 Kunda", labelHi: "कुंडा" },
    { key: "lid",   label: "🔵 Lid",   labelHi: "ढक्कन" },
    { key: "circle",label: "⭕ Circle", labelHi: "सर्किल" }
  ]
};
