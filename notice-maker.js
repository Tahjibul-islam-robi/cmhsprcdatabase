const fields = {
  number: document.querySelector("#notice-number"),
  date: document.querySelector("#notice-date"),
  title: document.querySelector("#notice-title"),
  body: document.querySelector("#notice-body"),
  president: document.querySelector("#president-name")
};
let grid = [];
let banglaNotice = false;
let databaseClient;
const gridEditor = document.querySelector("#grid-editor-cells");
const previewGrid = document.querySelector("#preview-grid");
function displayDate(value) {
  if (!value) return "__________________";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(banglaNotice ? "bn-BD" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}
function updatePreview() {
  document.querySelector("#preview-number").textContent = (banglaNotice ? "স্মারক নং: " : "Notice No: ") + (fields.number.value.trim() || "__________________");
  document.querySelector("#preview-date").textContent = (banglaNotice ? "তারিখ: " : "Date: ") + displayDate(fields.date.value);
  document.querySelector("#preview-title").textContent = fields.title.value.trim() || "Notice title";
  document.querySelector("#preview-notice-label").textContent = banglaNotice ? "বিজ্ঞপ্তি" : "NOTICE";
  document.querySelector("#preview-body").textContent = fields.body.value.trim() || "Your notice text will appear here.";
  document.querySelector("#preview-president").textContent = fields.president.value.trim() || "President";
  renderGridPreview();
}
function renderGridEditor() {
  gridEditor.replaceChildren();
  if (!grid.length) {
    const empty = document.createElement("p"); empty.className = "grid-empty"; empty.textContent = "No grid added."; gridEditor.append(empty); return;
  }
  const table = document.createElement("table"); table.className = "grid-edit-table";
  const body = document.createElement("tbody");
  grid.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    row.forEach((value, columnIndex) => {
      const td = document.createElement("td"), input = document.createElement("input");
      input.type = "text"; input.value = value; input.setAttribute("aria-label", "Grid row " + (rowIndex + 1) + ", column " + (columnIndex + 1));
      input.addEventListener("input", () => { grid[rowIndex][columnIndex] = input.value; renderGridPreview(); });
      td.append(input); tr.append(td);
    });
    body.append(tr);
  });
  table.append(body); gridEditor.append(table);
}
function renderGridPreview() {
  previewGrid.replaceChildren();
  if (!grid.length) { previewGrid.hidden = true; return; }
  const table = document.createElement("table"), useHeader = document.querySelector("#grid-first-row-header").checked;
  const start = useHeader ? 1 : 0;
  if (useHeader) {
    const thead = document.createElement("thead"), row = document.createElement("tr");
    grid[0].forEach((value) => { const cell = document.createElement("th"); cell.textContent = value; row.append(cell); });
    thead.append(row); table.append(thead);
  }
  const tbody = document.createElement("tbody");
  grid.slice(start).forEach((data) => {
    const row = document.createElement("tr");
    data.forEach((value) => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); });
    tbody.append(row);
  });
  if (useHeader && grid.length === 1) {
    const row = document.createElement("tr"), cell = document.createElement("td"); cell.colSpan = grid[0].length; cell.textContent = ""; row.append(cell); tbody.append(row);
  }
  table.append(tbody); previewGrid.append(table); previewGrid.hidden = false;
}
Object.values(fields).forEach((field) => field.addEventListener("input", updatePreview));
document.querySelector("#load-bangla-routine").addEventListener("click", () => {
  banglaNotice = true;
  fields.title.value = "ক্লাসের সময়সূচি ও শিক্ষার্থীদের তথ্য";
  fields.body.value = `সকল শিক্ষার্থীর অবগতির জন্য জানানো যাচ্ছে যে, আসন্ন টেস্ট পরীক্ষা (সম্ভাব্য তারিখ: ২০ অক্টোবর) পর্যন্ত ক্লাবের ক্লাস প্রতি সোমবার ও বুধবার ৬ষ্ঠ ও ৭ম পিরিয়ডে অনুষ্ঠিত হবে।

পরীক্ষা শেষ হলে পরবর্তী ক্লাসের সময়সূচি নতুন করে জানিয়ে দেওয়া হবে। সবাইকে নির্ধারিত দিনে ও সময়ে উপস্থিত থাকার অনুরোধ করা হলো।

শিক্ষার্থীদের তথ্য নিচে দেওয়া হলো।`;
  fields.number.value = "";
  grid = [["শিক্ষার্থীর নাম", "আইডি কোড", "শাখা", "শ্রেণি", "রোল", "মোবাইল নম্বর"], ...Array.from({ length: 5 }, () => Array(6).fill(""))];
  document.querySelector("#grid-first-row-header").checked = true;
  renderGridEditor(); updatePreview();
});
async function loadStudentRecords() {
  const button = document.querySelector("#load-students"), status = document.querySelector("#student-load-status");
  button.disabled = true; status.textContent = "Loading student records…";
  try {
    const config = window.CLUB_SUPABASE_CONFIG || {};
    if (!config.url || !config.publishableKey) throw new Error("Supabase is not configured in admin/config.js.");
    if (!databaseClient) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      databaseClient = createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    }
    const { data: sessionData, error: sessionError } = await databaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) throw new Error("Sign in to the Admin panel first, then return here and try again.");
    const { data, error } = await databaseClient.from("students")
      .select("student_id,full_name,section,class,roll,student_contact_number")
      .order("student_id", { ascending: true });
    if (error) throw error;
    const students = (data || []).slice().sort((a, b) => String(a.student_id || "").localeCompare(String(b.student_id || ""), undefined, { numeric: true, sensitivity: "base" }));
    grid = [["শিক্ষার্থীর নাম", "আইডি কোড", "শাখা", "শ্রেণি", "রোল", "মোবাইল নম্বর"], ...students.map((student) => [String(student.full_name || ""), String(student.student_id || ""), String(student.section || ""), String(student.class || ""), student.roll == null ? "" : String(student.roll), String(student.student_contact_number || "")])];
    document.querySelector("#grid-first-row-header").checked = true;
    renderGridEditor(); updatePreview();
    status.textContent = students.length + "টি শিক্ষার্থীর তথ্য যোগ হয়েছে। সম্পূর্ণ নোটিশ প্রকাশ করলে ফোন নম্বরগুলোও সবার জন্য দৃশ্যমান হবে।";
  } catch (error) {
    status.textContent = error.message || "Student records could not be loaded.";
  } finally { button.disabled = false; }
}
document.querySelector("#load-students").addEventListener("click", loadStudentRecords);
document.querySelector("#insert-grid").addEventListener("click", () => {
  const pasted = document.querySelector("#grid-paste").value.trim();
  if (!pasted) return;
  const rows = pasted.replace(/\r/g, "").split("\n");
  while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
  grid = rows.map((row) => row.split("\t"));
  const width = Math.max(...grid.map((row) => row.length));
  grid = grid.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
  renderGridEditor(); renderGridPreview();
});
document.querySelector("#add-grid-row").addEventListener("click", () => {
  const width = grid.length ? grid[0].length : 1;
  grid.push(Array(width).fill("")); renderGridEditor(); renderGridPreview();
});
document.querySelector("#add-grid-column").addEventListener("click", () => {
  if (!grid.length) grid.push([""]);
  else grid.forEach((row) => row.push(""));
  renderGridEditor(); renderGridPreview();
});
document.querySelector("#clear-grid").addEventListener("click", () => {
  grid = []; document.querySelector("#grid-paste").value = ""; renderGridEditor(); renderGridPreview();
});
document.querySelector("#grid-first-row-header").addEventListener("change", renderGridPreview);
const today = new Date();
document.querySelector("#notice-date").value = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
document.querySelector("#print-notice").addEventListener("click", async () => {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  window.print();
});
document.querySelector("#download-docx").addEventListener("click", async (event) => {
  const button = event.currentTarget, status = document.querySelector("#export-status");
  button.disabled = true; status.textContent = "Preparing your editable document…";
  try {
    const { AlignmentType, BorderStyle, Document, ImageRun, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun } = await import("https://esm.sh/docx@9");
    const logoResponse = await fetch("./logo.png");
    if (!logoResponse.ok) throw new Error("Could not load the club logo.");
    const logoData = await logoResponse.arrayBuffer();
    const font = "Noto Sans Bengali";
    const centered = (text, size, bold = false) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text, font, size, bold })] });
    const children = [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new ImageRun({ type: "png", data: logoData, transformation: { width: 78, height: 78 } })] }),
      centered("CUMILLA MODERN HIGH SCHOOL", 26, true),
      centered("PROGRAMMING AND ROBOTICS CLUB", 30, true),
      centered("LEARN · CREATE · INNOVATE", 18),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 180, after: 180 }, children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", font, size: 18 })] }),
      new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: (banglaNotice ? "স্মারক নং: " : "Notice No: ") + (fields.number.value.trim() || "__________________"), font, size: 20 })] }),
      new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: (banglaNotice ? "তারিখ: " : "Date: ") + displayDate(fields.date.value), font, size: 20 })] }),
      centered(banglaNotice ? "বিজ্ঞপ্তি" : "NOTICE", 28, true),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 260 }, children: [new TextRun({ text: fields.title.value.trim() || "Notice title", font, size: 28, bold: true })] })
    ];
    const bodyText = fields.body.value.trim();
    if (bodyText) bodyText.split(/\n+/).forEach((line) => children.push(new Paragraph({ spacing: { after: 180, line: 360 }, children: [new TextRun({ text: line, font, size: 24 })] })));
    if (grid.length) {
      const useHeader = document.querySelector("#grid-first-row-header").checked;
      const tableRows = grid.map((row, rowIndex) => new TableRow({
        tableHeader: useHeader && rowIndex === 0,
        children: row.map((value) => new TableCell({
          ...(useHeader && rowIndex === 0 ? { shading: { type: ShadingType.CLEAR, fill: "EAF2F2" } } : {}),
          borders: Object.fromEntries(["top", "bottom", "left", "right"].map((side) => [side, { style: BorderStyle.SINGLE, size: 4, color: "52636A" }])),
          children: [new Paragraph({ children: [new TextRun({ text: value || " ", font, size: 20, bold: useHeader && rowIndex === 0 })] })]
        }))
      }));
      children.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: [new TextRun({ text: " ", font, size: 8 })] }));
      children.push(new Table({ rows: tableRows }));
    }
    children.push(
      new Paragraph({ spacing: { before: 900, after: 250 }, children: [new TextRun({ text: "", font, size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "____________________________", font, size: 20 })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 40 }, children: [new TextRun({ text: fields.president.value.trim() || "President", font, size: 22, bold: true })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Programming And Robotics Club", font, size: 18 })] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Cumilla Modern High School", font, size: 18 })] })
    );
    const doc = new Document({ creator: "Cumilla Modern High School Programming And Robotics Club", title: fields.title.value.trim() || "Club Notice", sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    const fileBase = (fields.title.value.trim() || "club-notice").normalize("NFKD").replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "club-notice";
    link.href = url; link.download = fileBase + ".docx"; link.click(); URL.revokeObjectURL(url);
    status.textContent = "Editable DOCX downloaded. Open it in Pages or import it into Canva.";
  } catch (error) {
    status.textContent = "DOCX export failed: " + (error.message || "Please check your internet connection and try again.");
  } finally { button.disabled = false; }
});
document.querySelector("#clear-notice").addEventListener("click", () => {
  fields.number.value = "";
  fields.date.value = "";
  fields.title.value = "";
  fields.body.value = "";
  fields.president.value = "";
  grid = []; document.querySelector("#grid-paste").value = ""; renderGridEditor();
  updatePreview();
});
document.querySelector("#load-bangla-routine").click();
loadStudentRecords();
