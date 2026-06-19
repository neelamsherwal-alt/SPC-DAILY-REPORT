# SPC Daily Report App — Deployment Guide
## Complete Step-by-Step Instructions

---

## STEP 1 — Set Up Google Apps Script (Backend)

1. Go to: https://script.google.com
2. Click **"New Project"**
3. Delete all existing code
4. Open the file **Code.gs** (provided)
5. Copy ALL the code and paste it
6. Click 💾 Save (Ctrl+S)
7. Click **"Deploy" → "New Deployment"**
8. Click ⚙️ gear icon → Select **"Web App"**
9. Fill in:
   - Description: SPC Daily Report
   - Execute as: **Me**
   - Who has access: **Anyone**
10. Click **"Deploy"**
11. Click **"Authorize access"** → Allow
12. **COPY the Web App URL** — you'll need it in Step 2

---

## STEP 2 — Add API URL to App

1. Open the file: **src/config.js**
2. Find this line:
   ```
   API_URL: "PASTE_YOUR_APPS_SCRIPT_URL_HERE",
   ```
3. Replace with your URL from Step 1:
   ```
   API_URL: "https://script.google.com/macros/s/YOUR_ID/exec",
   ```
4. Save the file

---

## STEP 3 — Deploy App on Vercel (Free Hosting)

1. Go to: https://github.com → Create free account
2. Create a **New Repository** → Name it "spc-daily-report"
3. Upload ALL files from the **spc-daily-report** folder
4. Go to: https://vercel.com → Sign up with GitHub
5. Click **"New Project"** → Select your repository
6. Click **"Deploy"**
7. Wait 2 minutes → Your app is LIVE! 🎉
8. Vercel gives you a URL like: **https://spc-daily-report.vercel.app**
9. Share this URL with your worker!

---

## STEP 4 — Install as App on Phone

**Android:**
1. Open URL in Chrome
2. Tap 3 dots (⋮) → "Add to Home Screen"
3. Tap "Add" ✅

**iPhone:**
1. Open URL in Safari
2. Tap Share button → "Add to Home Screen"
3. Tap "Add" ✅

---

## HOW TO MODIFY LATER

To add/remove workers → Edit **src/config.js**
To change targets → Edit **src/config.js**
To add new fields → Edit **src/App.js** + **Code.gs**
After any change → Push to GitHub → Vercel auto-updates!

---

## YOUR DETAILS

- Google Sheet: https://docs.google.com/spreadsheets/d/1-FDZUKXFAb6PtUpv40DtzjQIA2HVFV1-CrJ4OnQA7vw
- Google Drive Folder (SPC): https://drive.google.com/drive/folders/18Wd_LonoUC62DRpYXPZ3pjqCmrXcdq6I

---

## DATA FLOW

Worker fills form → Submits → 
Data saved in YOUR Google Sheet (forever) + 
Photos saved in YOUR Google Drive (SPC folder) + 
WhatsApp message sent to you

Only YOU can access Google Sheet and Drive.
Workers can only submit — cannot view or edit.
