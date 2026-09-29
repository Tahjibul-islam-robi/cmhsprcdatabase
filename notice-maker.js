const fields = {
  number: document.querySelector("#notice-number"),
  date: document.querySelector("#notice-date"),
  title: document.querySelector("#notice-title"),
  body: document.querySelector("#notice-body"),
  president: document.querySelector("#president-name")
};
let grid = [];
const gridEditor = document.querySelector("#grid-editor-cells");
const previewGrid = document.querySelector("#preview-grid");
function displayDate(value) {
  if (!value) return "__________________";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}
function updatePreview() {
  document.querySelector("#preview-number").textContent = "Notice No: " + (fields.number.value.trim() || "__________________");
  document.querySelector("#preview-date").textContent = "Date: " + displayDate(fields.date.value);
  document.querySelector("#preview-title").textContent = fields.title.value.trim() || "Notice title";
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
document.querySelector("#clear-notice").addEventListener("click", () => {
  fields.number.value = "";
  fields.date.value = "";
  fields.title.value = "";
  fields.body.value = "";
  fields.president.value = "";
  grid = []; document.querySelector("#grid-paste").value = ""; renderGridEditor();
  updatePreview();
});
renderGridEditor();
updatePreview();
