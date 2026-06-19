// ============================================================
// SPC DAILY REPORT - Google Apps Script Backend
// Paste this entire code in Google Apps Script
// ============================================================

const SHEET_ID = "1-FDZUKXFAb6PtUpv40DtzjQIA2HVFV1-CrJ4OnQA7vw";
const DRIVE_FOLDER_ID = "18Wd_LonoUC62DRpYXPZ3pjqCmrXcdq6I";
const SHEET_NAME = "Reports";

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet with headers if missing
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = [
        "Submitted At","Date","Submitted By",
        "FK Dispatch","FK Return","FK Reattempt",
        "AMZ Dispatch","AMZ Return","AMZ Reattempt",
        "Regmar Worker","Regmar Shift","Regmar Target (kg)","Regmar Achieved (kg)","Regmar Status",
        "Buff Worker","Buff Shift","Buff Target (kg)","Buff Achieved (kg)","Buff Masala (pcs)","Buff Status",
        "Spinning Wastage (%)",
        "Stock Count","Stock Photo",
        "Dispatch Count","Dispatch Photo",
        "Labour Count","Labour Photo",
        "Job Sent","Job Received","Job Pending",
        "Cleaning Status","Cleaning Remark",
        "Kunda Stock","Kunda Status",
        "Lid Stock","Lid Status",
        "Circle Stock","Circle Status",
        "Remarks"
      ];
      sheet.getRange(1,1,1,headers.length).setValues([headers])
        .setFontWeight("bold").setBackground("#2D5016").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const dateStr = params.date || new Date().toISOString().split("T")[0];

    // Get or create date subfolder
    let dateFolder;
    const existing = folder.getFoldersByName(dateStr);
    dateFolder = existing.hasNext() ? existing.next() : folder.createFolder(dateStr);

    // Upload photo helper
    function uploadPhoto(base64Data, fileName) {
      if (!base64Data) return "No photo";
      try {
        const base64 = base64Data.split(",")[1] || base64Data;
        const mimeType = base64Data.includes("image/png") ? "image/png" : "image/jpeg";
        const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
        const file = dateFolder.createFile(blob);
        file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
        return file.getUrl();
      } catch(err) { return "Upload failed: " + err.message; }
    }

    const ts = Date.now();
    const stockUrl    = uploadPhoto(params.stock_photo_data,    `stock_${ts}.jpg`);
    const dispatchUrl = uploadPhoto(params.dispatch_photo_data, `dispatch_${ts}.jpg`);
    const labourUrl   = uploadPhoto(params.labour_photo_data,   `labour_${ts}.jpg`);

    // Targets & status
    const regmarTargets = {"8":100,"12":150};
    const buffTargets   = {"8":130,"12":200};
    const rt = regmarTargets[params.regmar_shift] || 100;
    const bt = buffTargets[params.buff_shift] || 130;
    const ra = parseFloat(params.regmar_achieved) || 0;
    const ba = parseFloat(params.buff_achieved) || 0;
    const regmarStatus = ra >= rt ? "✅ Target Met" : `❌ Short by ${(rt-ra).toFixed(1)} kg`;
    const buffStatus   = ba >= bt ? "✅ Target Met" : `❌ Short by ${(bt-ba).toFixed(1)} kg`;
    const pending = Math.max(0, parseInt(params.job_sent||0) - parseInt(params.job_received||0));

    sheet.appendRow([
      new Date().toLocaleString("en-IN"),
      params.date||"", params.submittedBy||"",
      params.fk_dispatch||0, params.fk_return||0, params.fk_reattempt||0,
      params.amz_dispatch||0, params.amz_return||0, params.amz_reattempt||0,
      params.regmar_worker||"", params.regmar_shift||"", rt, ra, regmarStatus,
      params.buff_worker||"", params.buff_shift||"", bt, ba, params.buff_masala||0, buffStatus,
      params.spinning_wastage||0,
      params.stock_count||0, stockUrl,
      params.dispatch_count||0, dispatchUrl,
      params.labour_count||0, labourUrl,
      params.job_sent||0, params.job_received||0, pending,
      params.cleaning||"", params.cleaning_remark||"",
      params.kunda_stock||0, params.kunda_status||"",
      params.lid_stock||0, params.lid_status||"",
      params.circle_stock||0, params.circle_status||"",
      params.remarks||""
    ]);

    sheet.autoResizeColumns(1, 39);

    return ContentService
      .createTextOutput(JSON.stringify({success:true,message:"Report saved!"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({success:false,error:err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status:"SPC Daily Report API ✅"}))
    .setMimeType(ContentService.MimeType.JSON);
}
