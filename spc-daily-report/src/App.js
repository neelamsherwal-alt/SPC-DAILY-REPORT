import { useState } from "react";
import { CONFIG } from "./config";
import "./App.css";

// ── helpers ──────────────────────────────────────────────
const toBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

function generateWhatsAppMessage(f) {
  const rt = CONFIG.regmarTargets[f.regmar_shift] || 100;
  const bt = CONFIG.buffTargets[f.buff_shift] || 130;
  const rMet = parseFloat(f.regmar_achieved || 0) >= rt;
  const bMet = parseFloat(f.buff_achieved || 0) >= bt;
  const pending = Math.max(0, parseInt(f.job_sent || 0) - parseInt(f.job_received || 0));
  return `📋 *SPC DAILY WORK REPORT*
📅 Date: ${f.date}  👤 By: ${f.submittedBy || "—"}

━━━━━━━━━━━━━━━━━
📦 *FLIPKART*
✅ Dispatch: ${f.fk_dispatch || 0} | 🔁 Return: ${f.fk_return || 0} | 🔄 Reattempt: ${f.fk_reattempt || 0}

📦 *AMAZON*
✅ Dispatch: ${f.amz_dispatch || 0} | 🔁 Return: ${f.amz_return || 0} | 🔄 Reattempt: ${f.amz_reattempt || 0}

━━━━━━━━━━━━━━━━━
⚖️ *REGMAR* — ${f.regmar_worker || "—"} (${f.regmar_shift} hrs | Target: ${rt} kg)
Achieved: ${f.regmar_achieved || 0} kg ${rMet ? "✅ Target Met" : `❌ Short by ${(rt - parseFloat(f.regmar_achieved || 0)).toFixed(1)} kg`}

🌶️ *BUFF* — ${f.buff_worker || "—"} (${f.buff_shift} hrs | Target: ${bt} kg)
Achieved: ${f.buff_achieved || 0} kg ${bMet ? "✅ Target Met" : `❌ Short by ${(bt - parseFloat(f.buff_achieved || 0)).toFixed(1)} kg`}
Masala Used: ${f.buff_masala || 0} pcs

━━━━━━━━━━━━━━━━━
🔄 *SPINNING WASTAGE:* ${f.spinning_wastage || 0}%

📸 *REGISTERS*
📦 Stock: ${f.stock_count || 0} | 📋 Dispatch: ${f.dispatch_count || 0} | 👷 Labour: ${f.labour_count || 0}

🔁 *JOB WORK*
📤 Sent: ${f.job_sent || 0} | 📥 Back: ${f.job_received || 0} | ⚠️ Pending: ${pending}

🧹 *CLEANING:* ${f.cleaning || "—"}${f.cleaning_remark ? ` — ${f.cleaning_remark}` : ""}

━━━━━━━━━━━━━━━━━
🗃️ *RAW MATERIAL*
🔩 Kunda: ${f.kunda_stock || 0} (${f.kunda_status}) | 🔵 Lid: ${f.lid_stock || 0} (${f.lid_status}) | ⭕ Circle: ${f.circle_stock || 0} (${f.circle_status})
${f.remarks ? `\n💬 *Remarks:* ${f.remarks}` : ""}
━━━━━━━━━━━━━━━━━
✅ Report Submitted`;
}

// ── UI Components ─────────────────────────────────────────
function SectionCard({ title, titleHi, emoji, color, children }) {
  return (
    <div className="card">
      <div className="card-header" style={{ background: color }}>
        <span className="card-emoji">{emoji}</span>
        <div>
          <div className="card-title">{title}</div>
          <div className="card-title-hi">{titleHi}</div>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({ achieved, target }) {
  if (!achieved) return null;
  const met = parseFloat(achieved) >= target;
  return (
    <span className={`badge ${met ? "badge-green" : "badge-red"}`}>
      {met ? `✅ Target Met` : `❌ Short by ${(target - parseFloat(achieved)).toFixed(1)} kg`}
    </span>
  );
}

function PhotoUpload({ label, labelHi, fieldKey, form, setForm }) {
  const [preview, setPreview] = useState(null);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setPreview(b64);
    setForm(f => ({ ...f, [`${fieldKey}_photo_data`]: b64 }));
  };
  return (
    <div className="photo-upload">
      <div className="photo-labels">
        <span>{label}</span>
        <span className="label-hi">{labelHi}</span>
      </div>
      <label className="photo-btn">
        {preview ? <img src={preview} alt="preview" className="photo-preview" /> : <span>📷 Tap to upload</span>}
        <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
      </label>
      {preview && <span className="photo-check">✅ Photo added</span>}
    </div>
  );
}

// ── Initial Form State ────────────────────────────────────
const emptyForm = () => ({
  date: new Date().toISOString().split("T")[0],
  submittedBy: "",
  fk_dispatch: "", fk_return: "", fk_reattempt: "",
  amz_dispatch: "", amz_return: "", amz_reattempt: "",
  regmar_worker: "", regmar_shift: "8", regmar_achieved: "",
  buff_worker: "", buff_shift: "8", buff_achieved: "", buff_masala: "",
  spinning_wastage: "",
  stock_count: "", stock_photo_data: "",
  dispatch_count: "", dispatch_photo_data: "",
  labour_count: "", labour_photo_data: "",
  job_sent: "", job_received: "",
  cleaning: "", cleaning_remark: "",
  kunda_stock: "", kunda_status: "OK",
  lid_stock: "", lid_status: "OK",
  circle_stock: "", circle_status: "OK",
  remarks: "",
});

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState(emptyForm());
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [submittedForm, setSubmittedForm] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const regmarTarget = CONFIG.regmarTargets[form.regmar_shift] || 100;
  const buffTarget = CONFIG.buffTargets[form.buff_shift] || 130;
  const jobPending = Math.max(0, parseInt(form.job_sent || 0) - parseInt(form.job_received || 0));

  const handleSubmit = async () => {
    if (!form.submittedBy) { alert("Please enter your name! / कृपया नाम भरें!"); return; }
    setStatus("submitting");
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedForm(form);
        setStatus("success");
      } else {
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const handleWhatsApp = () => {
    const msg = generateWhatsAppMessage(submittedForm || form);
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleNewReport = () => {
    setForm(emptyForm());
    setStatus("idle");
    setSubmittedForm(null);
    window.scrollTo(0, 0);
  };

  // SUCCESS SCREEN
  if (status === "success") {
    return (
      <div className="success-screen">
        <div className="success-icon">✅</div>
        <h2 className="success-title">Report Submitted!</h2>
        <p className="success-sub">रिपोर्ट जमा हो गई — data saved in Google Sheets</p>
        <button className="btn-whatsapp" onClick={handleWhatsApp}>
          💬 Send on WhatsApp
        </button>
        <button className="btn-new" onClick={handleNewReport}>
          + Fill New Report / नई रिपोर्ट
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-title">📋 SPC Daily Report</div>
        <div className="header-sub">दैनिक कार्य रिपोर्ट</div>
      </div>

      <div className="content">

        {/* Basic Info */}
        <SectionCard title="Basic Info" titleHi="बुनियादी जानकारी" emoji="👤" color="#37474F">
          <Field label="📅 Date / तारीख">
            <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
          </Field>
          <Field label="👤 Submitted By / नाम *">
            <input type="text" className="input" placeholder="Enter your name..." value={form.submittedBy} onChange={e => set("submittedBy", e.target.value)} />
          </Field>
        </SectionCard>

        {/* Flipkart */}
        <SectionCard title="Flipkart Status" titleHi="फ्लिपकार्ट स्थिति" emoji="📦" color="#F7AE16">
          <div className="grid-3">
            {[["fk_dispatch","✅ Dispatch","डिस्पैच"],["fk_return","🔁 Return","वापसी"],["fk_reattempt","🔄 Reattempt","री-अटेम्प्ट"]].map(([k,l,h])=>(
              <div key={k}>
                <div className="grid-label">{l}<br/><span className="grid-label-hi">{h}</span></div>
                <input type="number" min="0" placeholder="0" className="input center" value={form[k]} onChange={e=>set(k,e.target.value)} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Amazon */}
        <SectionCard title="Amazon Status" titleHi="अमेज़न स्थिति" emoji="📦" color="#FF9900">
          <div className="grid-3">
            {[["amz_dispatch","✅ Dispatch","डिस्पैच"],["amz_return","🔁 Return","वापसी"],["amz_reattempt","🔄 Reattempt","री-अटेम्प्ट"]].map(([k,l,h])=>(
              <div key={k}>
                <div className="grid-label">{l}<br/><span className="grid-label-hi">{h}</span></div>
                <input type="number" min="0" placeholder="0" className="input center" value={form[k]} onChange={e=>set(k,e.target.value)} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Regmar */}
        <SectionCard title="Regmar Status" titleHi="रेगमार स्थिति" emoji="⚖️" color="#5C6BC0">
          <Field label="👷 Worker / कर्मचारी">
            <select className="input" value={form.regmar_worker} onChange={e=>set("regmar_worker",e.target.value)}>
              <option value="">-- Select Worker --</option>
              {CONFIG.regmarWorkers.map(w=><option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="🕐 Shift / शिफ्ट">
            <div className="shift-btns">
              {["8","12"].map(s=>(
                <button key={s} className={`shift-btn ${form.regmar_shift===s?"shift-active-purple":""}`} onClick={()=>set("regmar_shift",s)}>{s} hrs</button>
              ))}
            </div>
          </Field>
          <div className="target-box purple">🎯 Target: {regmarTarget} kg</div>
          <Field label="✅ Achieved / हासिल (kg)">
            <input type="number" min="0" className="input" placeholder="Enter kg..." value={form.regmar_achieved} onChange={e=>set("regmar_achieved",e.target.value)} />
            <StatusBadge achieved={form.regmar_achieved} target={regmarTarget} />
          </Field>
        </SectionCard>

        {/* Buff */}
        <SectionCard title="Buff Status" titleHi="बफ स्थिति" emoji="🌶️" color="#E64A19">
          <Field label="👷 Worker / कर्मचारी">
            <select className="input" value={form.buff_worker} onChange={e=>set("buff_worker",e.target.value)}>
              <option value="">-- Select Worker --</option>
              {CONFIG.buffWorkers.map(w=><option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="🕐 Shift / शिफ्ट">
            <div className="shift-btns">
              {["8","12"].map(s=>(
                <button key={s} className={`shift-btn ${form.buff_shift===s?"shift-active-red":""}`} onClick={()=>set("buff_shift",s)}>{s} hrs</button>
              ))}
            </div>
          </Field>
          <div className="target-box red">🎯 Target: {buffTarget} kg</div>
          <Field label="✅ Achieved / हासिल (kg)">
            <input type="number" min="0" className="input" placeholder="Enter kg..." value={form.buff_achieved} onChange={e=>set("buff_achieved",e.target.value)} />
            <StatusBadge achieved={form.buff_achieved} target={buffTarget} />
          </Field>
          <Field label="🌶️ Masala Used / मसाला उपयोग (pieces / पीस)">
            <input type="number" min="0" className="input" placeholder="Enter pieces..." value={form.buff_masala} onChange={e=>set("buff_masala",e.target.value)} />
          </Field>
        </SectionCard>

        {/* Spinning */}
        <SectionCard title="Spinning Wastage" titleHi="स्पिनिंग बर्बादी" emoji="🔄" color="#00796B">
          <Field label="Wastage % / बर्बादी %">
            <input type="number" min="0" max="100" className="input" placeholder="Enter %" value={form.spinning_wastage} onChange={e=>set("spinning_wastage",e.target.value)} />
          </Field>
        </SectionCard>

        {/* Registers */}
        <SectionCard title="Registers + Photos" titleHi="रजिस्टर + फोटो" emoji="📸" color="#1565C0">
          {[
            ["stock","📦 Stock Register","स्टॉक रजिस्टर"],
            ["dispatch","📋 Dispatch Register","डिस्पैच रजिस्टर"],
            ["labour","👷 Labour Register","लेबर रजिस्टर"],
          ].map(([k,l,h])=>(
            <div key={k} className="register-block">
              <div className="register-title">{l} <span className="label-hi">({h})</span></div>
              <Field label="Count / संख्या">
                <input type="number" min="0" className="input" placeholder="0" value={form[`${k}_count`]} onChange={e=>set(`${k}_count`,e.target.value)} />
              </Field>
              <PhotoUpload label="📷 Upload Photo" labelHi="फोटो अपलोड करें" fieldKey={k} form={form} setForm={setForm} />
            </div>
          ))}
        </SectionCard>

        {/* Job Work */}
        <SectionCard title="Job Work" titleHi="जॉब वर्क" emoji="🔁" color="#6A1B9A">
          <div className="grid-2">
            <Field label="📤 Sent Out / भेजा">
              <input type="number" min="0" className="input" placeholder="0" value={form.job_sent} onChange={e=>set("job_sent",e.target.value)} />
            </Field>
            <Field label="📥 Received Back / वापस">
              <input type="number" min="0" className="input" placeholder="0" value={form.job_received} onChange={e=>set("job_received",e.target.value)} />
            </Field>
          </div>
          {form.job_sent && form.job_received && (
            <div className="pending-box">⚠️ Pending / बकाया: <strong>{jobPending}</strong></div>
          )}
        </SectionCard>

        {/* Cleaning */}
        <SectionCard title="Office Cleaning" titleHi="ऑफिस सफाई" emoji="🧹" color="#558B2F">
          <Field label="Status / स्थिति">
            <div className="shift-btns">
              {["Done ✅","Not Done ❌"].map(s=>(
                <button key={s} className={`shift-btn ${form.cleaning===s?"shift-active-green":""}`} onClick={()=>set("cleaning",s)}>{s}</button>
              ))}
            </div>
          </Field>
          <Field label="Remarks / टिप्पणी">
            <input type="text" className="input" placeholder="Optional..." value={form.cleaning_remark} onChange={e=>set("cleaning_remark",e.target.value)} />
          </Field>
        </SectionCard>

        {/* Raw Material */}
        <SectionCard title="Raw Material Check" titleHi="कच्चा माल जांच" emoji="🗃️" color="#4E342E">
          {CONFIG.rawMaterials.map(({key:k,label:l,labelHi:h})=>(
            <div key={k} className="raw-block">
              <div className="raw-title">{l} <span className="label-hi">({h})</span></div>
              <div className="grid-2">
                <Field label="Stock / स्टॉक">
                  <input type="number" min="0" className="input" placeholder="0" value={form[`${k}_stock`]} onChange={e=>set(`${k}_stock`,e.target.value)} />
                </Field>
                <Field label="Status / स्थिति">
                  <select className="input" value={form[`${k}_status`]} onChange={e=>set(`${k}_status`,e.target.value)}>
                    <option value="OK">✅ OK</option>
                    <option value="Low">⚠️ Low</option>
                    <option value="Out">❌ Out</option>
                  </select>
                </Field>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Remarks */}
        <SectionCard title="Any Other Remark" titleHi="कोई अन्य बात" emoji="💬" color="#37474F">
          <textarea className="input textarea" placeholder="Type here... / यहाँ लिखें..." value={form.remarks} onChange={e=>set("remarks",e.target.value)} />
        </SectionCard>

        {/* Error */}
        {status === "error" && (
          <div className="error-box">❌ Error: {errorMsg}<br/>Check your API URL in config.js</div>
        )}

        {/* Submit */}
        <button className="btn-submit" onClick={handleSubmit} disabled={status==="submitting"}>
          {status === "submitting" ? "⏳ Submitting..." : "✅ Submit Report / रिपोर्ट जमा करें"}
        </button>
        <p className="footer-note">Data saves to Google Sheets · Photos save to Google Drive</p>

      </div>
    </div>
  );
}
