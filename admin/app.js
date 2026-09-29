import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFIG = window.CLUB_SUPABASE_CONFIG || {};
const TABLE_FIELDS = [
  ["student_id", "Student ID"], ["full_name", "Full name"], ["class", "Class"], ["section", "Section"],
  ["roll", "Roll"], ["date_of_birth", "Date of birth"], ["gender", "Gender"],
  ["student_contact_number", "Student phone"], ["email_address", "Email address"], ["home_address", "Home address"],
  ["guardians_name", "Guardian name"], ["relationship_to_student", "Relationship to student"],
  ["guardians_contact_number", "Guardian phone"]
];
const BATCH_EXPORT_FIELDS = [["batch_number", "Batch number"], ["batch_name", "Batch name"], ...TABLE_FIELDS];
const CORE_FIELDS = ["full_name", "class", "section", "roll"];
const LEGACY_ATTENDANCE_TITLE = "Imported legacy attendance";
const PUBLIC_RESOURCE_BUCKET = "club-materials";
const MAX_RESOURCE_FILE_SIZE = 25 * 1024 * 1024;
const RESOURCE_MIME_TYPES = {
  pdf: "application/pdf", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain", csv: "text/csv", zip: "application/zip", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp"
};
const RESOURCE_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.jpg,.jpeg,.png,.webp";
const state = { client: null, userId: "", students: [], batches: [], memberships: [], sessions: [], attendance: [], resources: [], resourcesError: null, page: "overview",
  currentStudent: null, editingId: null, selectedSessionId: "", selectedBatchId: "", pendingImport: [], pendingImportAttendance: [], filteredStudents: [] };
const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value == null ? "" : value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
const ARTICLE_TAGS = new Set(["p", "div", "br", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "pre", "code", "a"]);
function sanitizeArticleHtml(markup) {
  const parsed = new DOMParser().parseFromString(String(markup || ""), "text/html");
  const safeDocument = document.implementation.createHTMLDocument("");
  const copyNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return safeDocument.createTextNode(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return safeDocument.createDocumentFragment();
    const tag = node.tagName.toLowerCase();
    if (["script", "style", "iframe", "object", "embed", "svg", "math"].includes(tag)) return safeDocument.createDocumentFragment();
    const children = Array.from(node.childNodes).map(copyNode);
    if (!ARTICLE_TAGS.has(tag)) { const fragment = safeDocument.createDocumentFragment(); children.forEach((child) => fragment.append(child)); return fragment; }
    const element = safeDocument.createElement(tag);
    if (tag === "a") {
      const rawHref = node.getAttribute("href") || "";
      try {
        const link = new URL(rawHref, window.location.href);
        if (["http:", "https:", "mailto:"].includes(link.protocol)) {
          element.setAttribute("href", link.href); element.setAttribute("target", "_blank"); element.setAttribute("rel", "noopener noreferrer");
        }
      } catch { /* discard invalid link targets */ }
    }
    children.forEach((child) => element.append(child));
    return element;
  };
  const container = safeDocument.createElement("div");
  Array.from(parsed.body.childNodes).map(copyNode).forEach((child) => container.append(child));
  return container.innerHTML;
}
function articleBodyForEditor(body) {
  const text = String(body || "");
  if (/<\/?(?:p|div|br|h2|h3|strong|b|em|i|u|ul|ol|li|blockquote|pre|code|a)\b/i.test(text)) return sanitizeArticleHtml(text);
  return text.split(/\n/).map((line) => "<p>" + escapeHtml(line) + "</p>").join("");
}
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = "toast" + (type ? " " + type : "");
  toast.textContent = message;
  $("#toast-region").append(toast);
  window.setTimeout(() => toast.remove(), 4200);
}
function setLoginError(message) { const el = $("#login-error"); el.textContent = message; el.hidden = !message; }
function idNumber(id) { const value = String(id == null ? "" : id).trim(); return /^\d+$/.test(value) ? Number(value) : null; }
function sameStudentId(a, b) {
  const left = String(a == null ? "" : a).trim(), right = String(b == null ? "" : b).trim();
  if (left === right) return true;
  const leftNumber = idNumber(left), rightNumber = idNumber(right);
  return leftNumber !== null && rightNumber !== null && leftNumber === rightNumber;
}
function displayValue(value) { return value === null || value === undefined || String(value).trim() === "" ? "—" : String(value); }
function emptyPlaceholder(value) {
  if (value === null || value === undefined || String(value).trim() === "") return true;
  return /^(\(not given\)|not given|not provided|n\/a|na|null)$/i.test(String(value).trim());
}
function safeTel(value) {
  const normalized = String(value || "").trim().replace(/[^0-9+]/g, "");
  return normalized && /\d/.test(normalized) ? "tel:" + normalized : "";
}
function phoneCell(value) {
  const label = displayValue(value), tel = safeTel(value);
  return tel ? '<a class="table-phone" href="' + escapeHtml(tel) + '">' + escapeHtml(label) + '</a>' : escapeHtml(label);
}
function dateLabel(value) {
  if (!value) return "—";
  const date = new Date(String(value).slice(0, 10) + "T00:00:00");
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}
function setPage(page) {
  state.page = page;
  document.querySelectorAll(".page-section").forEach((section) => { section.hidden = section.dataset.section !== page; });
  document.querySelectorAll(".nav-item[data-page]").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  const titles = { overview: "Overview", students: "Students", batches: "Batches", resources: "Blog & materials", attendance: "Attendance", reports: "Reports", data: "Data quality", backup: "Import & backup" };
  $("#page-title").textContent = titles[page] || "Overview";
  if (page === "students") renderStudents();
  if (page === "batches") renderBatches();
  if (page === "resources") renderResources();
  if (page === "attendance") renderAttendance();
  if (page === "reports") renderReports();
  if (page === "data") renderQuality();
  if (page === "overview") renderDashboard();
}
function closeDialog(id) { const dialog = document.getElementById(id); if (dialog && dialog.open) dialog.close(); }
function openDialog(id) { const dialog = document.getElementById(id); if (dialog && !dialog.open) dialog.showModal(); }
function sortByStudentId(list) {
  return list.slice().sort((a, b) => {
    const an = idNumber(a.student_id), bn = idNumber(b.student_id);
    if (an !== null && bn !== null && an !== bn) return an - bn;
    if (an !== null && bn === null) return -1;
    if (an === null && bn !== null) return 1;
    return String(a.student_id).localeCompare(String(b.student_id), undefined, { numeric: true });
  });
}
async function loadData() {
  const results = await Promise.all([
    state.client.from("students").select("*").order("student_id"),
    state.client.from("batches").select("*").order("batch_number"),
    state.client.from("batch_students").select("*"),
    state.client.from("attendance_sessions").select("*").order("session_date", { ascending: false }),
    state.client.from("attendance_records").select("*"),
    state.client.from("batch_resources").select("*").order("created_at", { ascending: false })
  ]);
  const names = ["students", "batches", "batch memberships", "attendance sessions", "attendance"];
  for (let i = 0; i < names.length; i += 1) if (results[i].error) throw new Error(names[i] + ": " + results[i].error.message);
  state.students = results[0].data || [];
  state.batches = results[1].data || [];
  state.memberships = results[2].data || [];
  state.sessions = results[3].data || [];
  state.attendance = results[4].data || [];
  state.resources = results[5].error ? [] : (results[5].data || []);
  state.resourcesError = results[5].error || null;
  if (!state.batches.some((batch) => batch.id === state.selectedBatchId)) state.selectedBatchId = state.batches[0] ? state.batches[0].id : "";
  renderDashboard(); renderStudents(); renderBatches(); renderResources(); renderAttendance(); renderReports(); renderQuality();
}
function showApp(user) {
  $("#login-view").hidden = true; $("#admin-app").hidden = false; $("#user-email").textContent = user.email || "Administrator";
  if (state.userId === user.id && state.students.length) return;
  state.userId = user.id;
  loadData().catch((error) => showToast("Could not load private records. " + error.message, "error"));
}
function showLogin() {
  state.userId = ""; state.students = []; state.batches = []; state.memberships = []; state.sessions = []; state.attendance = []; state.resources = []; state.resourcesError = null; state.filteredStudents = []; state.selectedBatchId = "";
  $("#admin-app").hidden = true; $("#login-view").hidden = false;
}
function initialize() {
  if (!CONFIG.url || !CONFIG.publishableKey) {
    $("#config-hint").textContent = "Setup needed: add your Supabase project URL and publishable key to admin/config.js.";
    $("#login-button").disabled = true; return;
  }
  try { state.client = createClient(CONFIG.url, CONFIG.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }); }
  catch (_error) { setLoginError("Supabase configuration is invalid. Check admin/config.js."); return; }
  state.client.auth.onAuthStateChange((_event, session) => { if (session && session.user) showApp(session.user); else showLogin(); });
  state.client.auth.getSession().then(({ data, error }) => {
    if (error) { setLoginError(error.message); return; }
    if (data.session && data.session.user) showApp(data.session.user);
  }).catch((error) => setLoginError(error.message));
}
$("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault(); if (!state.client) return;
  const button = $("#login-button"); button.disabled = true; setLoginError("");
  const { error } = await state.client.auth.signInWithPassword({ email: $("#login-email").value.trim(), password: $("#login-password").value });
  button.disabled = false;
  if (error) setLoginError("Sign-in failed. Check your email and password.");
});
$("#signout-button").addEventListener("click", async () => { if (state.client) await state.client.auth.signOut(); showLogin(); });
document.querySelectorAll(".nav-item[data-page]").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.page)));
document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.go)));
document.querySelectorAll("[data-open-add]").forEach((button) => button.addEventListener("click", () => openStudentForm(null)));
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => closeDialog(button.dataset.closeDialog)));

function distinctSorted(values) {
  return Array.from(new Set(values.filter((value) => !emptyPlaceholder(value)).map((value) => String(value).trim())))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
function fillSelect(select, values, allLabel) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">' + escapeHtml(allLabel) + "</option>";
  distinctSorted(values).forEach((value) => { const option = document.createElement("option"); option.value = value; option.textContent = value; select.append(option); });
  if (Array.from(select.options).some((option) => option.value === current)) select.value = current;
}
function sortedBatches() { return state.batches.slice().sort((a, b) => Number(a.batch_number) - Number(b.batch_number)); }
function batchLabelsForStudent(studentId) {
  const ids = new Set(state.memberships.filter((membership) => membership.student_id === studentId).map((membership) => membership.batch_id));
  return sortedBatches().filter((batch) => ids.has(batch.id)).map((batch) => "#" + batch.batch_number + " · " + batch.name).join(", ");
}
function batchNumbersForStudent(studentId) {
  const ids = new Set(state.memberships.filter((membership) => membership.student_id === studentId).map((membership) => membership.batch_id));
  return state.batches.filter((batch) => ids.has(batch.id)).map((batch) => Number(batch.batch_number));
}
function fillBatchNumberSelect(select, allLabel) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">' + escapeHtml(allLabel) + "</option>";
  sortedBatches().forEach((batch) => {
    const option = document.createElement("option"); option.value = String(batch.batch_number);
    option.textContent = "#" + batch.batch_number + " · " + batch.name; select.append(option);
  });
  if (Array.from(select.options).some((option) => option.value === current)) select.value = current;
}
function fillBatchIdSelect(select) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">Choose a batch</option>';
  sortedBatches().forEach((batch) => {
    const option = document.createElement("option"); option.value = batch.id;
    option.textContent = "#" + batch.batch_number + " · " + batch.name; select.append(option);
  });
  if (Array.from(select.options).some((option) => option.value === current)) select.value = current;
  else if (select.options.length > 1) select.value = select.options[1].value;
}
function getFilteredStudents() {
  const query = $("#student-search").value.trim().toLocaleLowerCase(), classValue = $("#filter-class").value, sectionValue = $("#filter-section").value;
  const fromText = $("#filter-id-from").value.trim(), toText = $("#filter-id-to").value.trim();
  const from = fromText === "" ? null : Number(fromText), to = toText === "" ? null : Number(toText);
  const batchFromText = $("#filter-batch-from").value, batchToText = $("#filter-batch-to").value;
  const batchFrom = batchFromText === "" ? null : Number(batchFromText), batchTo = batchToText === "" ? null : Number(batchToText);
  const base = state.students.filter((student) => {
    if (classValue && String(student.class || "") !== classValue) return false;
    if (sectionValue && String(student.section || "") !== sectionValue) return false;
    if (from !== null || to !== null) {
      const number = idNumber(student.student_id);
      if (number === null || (from !== null && number < from) || (to !== null && number > to)) return false;
    }
    if (batchFrom !== null || batchTo !== null) {
      if (batchFrom !== null && batchTo !== null && batchFrom > batchTo) return false;
      if (!batchNumbersForStudent(student.student_id).some((number) => (batchFrom === null || number >= batchFrom) && (batchTo === null || number <= batchTo))) return false;
    }
    return true;
  });
  if (!query) return sortByStudentId(base);
  const queryId = idNumber(query);
  if (queryId !== null) {
    const exactIds = base.filter((student) => idNumber(student.student_id) === queryId);
    if (exactIds.length) return sortByStudentId(exactIds);
  }
  return sortByStudentId(base.filter((student) => {
    const values = TABLE_FIELDS.map((field) => student[field[0]]);
    const text = [student.student_id, batchLabelsForStudent(student.student_id)].concat(values).filter((value) => value != null).join(" ").toLocaleLowerCase();
    return text.includes(query);
  }));
}
function renderStudents() {
  if (!$("#student-table-body")) return;
  fillSelect($("#filter-class"), state.students.map((student) => student.class), "All classes");
  fillSelect($("#filter-section"), state.students.map((student) => student.section), "All sections");
  fillBatchNumberSelect($("#filter-batch-from"), "Any batch"); fillBatchNumberSelect($("#filter-batch-to"), "Any batch");
  const filtered = getFilteredStudents(); state.filteredStudents = filtered;
  $("#student-result-count").textContent = filtered.length + (filtered.length === 1 ? " record" : " records");
  $("#student-empty").hidden = filtered.length > 0;
  $("#student-table-body").innerHTML = filtered.map((student) =>
    "<tr><td><span class=\"id-badge\">" + escapeHtml(student.student_id) + "</span></td><td><strong>" + escapeHtml(displayValue(student.full_name)) +
    "</strong></td><td>" + escapeHtml(displayValue(student.class)) + "</td><td>" + escapeHtml(displayValue(student.section)) + "</td><td>" +
    escapeHtml(displayValue(student.roll)) + "</td><td>" + escapeHtml(batchLabelsForStudent(student.student_id) || "—") + "</td><td>" + phoneCell(student.student_contact_number) + "</td><td>" + phoneCell(student.guardians_contact_number) + '</td><td><div class="row-actions"><button class="table-action" type="button" data-action="view" data-id="' +
    encodeURIComponent(student.student_id) + '">View</button><button class="table-action" type="button" data-action="edit" data-id="' +
    encodeURIComponent(student.student_id) + '">Edit</button></div></td></tr>').join("");
}
$("#student-search").addEventListener("input", renderStudents);
$("#apply-filters").addEventListener("click", renderStudents);
$("#clear-filters").addEventListener("click", () => {
  $("#student-search").value = ""; $("#filter-class").value = ""; $("#filter-section").value = "";
  $("#filter-batch-from").value = ""; $("#filter-batch-to").value = ""; $("#filter-id-from").value = ""; $("#filter-id-to").value = ""; renderStudents();
});
$("#student-table-body").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]"); if (!button) return;
  const id = decodeURIComponent(button.dataset.id), student = state.students.find((record) => record.student_id === id);
  if (!student) return;
  if (button.dataset.action === "view") openStudentProfile(student);
  if (button.dataset.action === "edit") openStudentForm(student);
});
function profileField(label, value, wide, phone) {
  const valueText = displayValue(value), tel = phone ? safeTel(value) : "";
  const inner = tel ? '<a href="' + escapeHtml(tel) + '">' + escapeHtml(valueText) + " · Call</a>" : "<strong>" + escapeHtml(valueText) + "</strong>";
  return '<div class="profile-field' + (wide ? " wide" : "") + '"><span>' + escapeHtml(label) + "</span>" + inner + "</div>";
}
function openStudentProfile(student) {
  state.currentStudent = student; $("#profile-title").textContent = (student.full_name || "Student") + " · " + student.student_id;
  $("#profile-content").innerHTML = profileField("Student ID", student.student_id, false, false) +
    profileField("Full name", student.full_name, false, false) + profileField("Class", student.class, false, false) +
    profileField("Section", student.section, false, false) + profileField("Roll", student.roll, false, false) +
    profileField("Date of birth", student.date_of_birth, false, false) + profileField("Gender", student.gender, false, false) +
    profileField("Student phone", student.student_contact_number, false, true) + profileField("Email", student.email_address, false, false) +
    profileField("Home address", student.home_address, true, false) + profileField("Guardian", student.guardians_name, false, false) +
    profileField("Relationship", student.relationship_to_student, false, false) + profileField("Guardian phone", student.guardians_contact_number, false, true);
  openDialog("profile-dialog");
}
function openStudentForm(student) {
  state.editingId = student ? student.student_id : null; $("#student-dialog-title").textContent = student ? "Edit student" : "Add student";
  $("#student-form-error").hidden = true; $("#student-form").reset();
  const idInput = $("#form-student-id"); idInput.disabled = Boolean(student);
  if (student) TABLE_FIELDS.forEach(([key]) => { const input = $("#student-form").elements.namedItem(key); if (input) input.value = student[key] == null ? "" : String(student[key]); });
  $("#save-student").textContent = student ? "Save changes" : "Save student"; openDialog("student-dialog"); if (!student) idInput.focus();
}
$("#student-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget, errorBox = $("#student-form-error"); errorBox.hidden = true;
  const values = new FormData(form), studentId = state.editingId || String(values.get("student_id") || "").trim(), fullName = String(values.get("full_name") || "").trim();
  if (!studentId || !fullName) { errorBox.textContent = "Student ID and full name are required."; errorBox.hidden = false; return; }
  const aliasExists = state.students.some((record) => record.student_id !== state.editingId && sameStudentId(record.student_id, studentId));
  if (aliasExists) { errorBox.textContent = "That ID matches an existing student number, including its leading-zero form."; errorBox.hidden = false; return; }
  const row = { student_id: studentId, full_name: fullName };
  TABLE_FIELDS.forEach(([key]) => {
    if (key === "student_id" || key === "full_name") return;
    const raw = String(values.get(key) || "").trim();
    row[key] = key === "roll" ? (raw === "" ? null : Number(raw)) : (raw === "" ? null : raw);
  });
  const save = $("#save-student"); save.disabled = true;
  const response = state.editingId ? await state.client.from("students").update(row).eq("student_id", state.editingId) : await state.client.from("students").insert(row);
  save.disabled = false;
  if (response.error) { errorBox.textContent = response.error.code === "23505" ? "That student ID already exists." : response.error.message; errorBox.hidden = false; return; }
  const wasEditing = Boolean(state.editingId); closeDialog("student-dialog"); await loadData(); showToast(wasEditing ? "Student record updated." : "Student record added.", "success");
});
$("#edit-student").addEventListener("click", () => { if (!state.currentStudent) return; closeDialog("profile-dialog"); openStudentForm(state.currentStudent); });
$("#delete-student").addEventListener("click", async () => {
  if (!state.currentStudent) return;
  const student = state.currentStudent, answer = window.prompt("Deleting this student also deletes their attendance history. Type the student ID to confirm:", "");
  if (answer !== student.student_id) { if (answer !== null) showToast("The ID did not match. Nothing was deleted.", "error"); return; }
  const { error } = await state.client.from("students").delete().eq("student_id", student.student_id);
  if (error) { showToast("Delete failed: " + error.message, "error"); return; }
  closeDialog("profile-dialog"); await loadData(); showToast("Student record and attendance history deleted.", "success");
});

function buildBreakdown(items, keyName) {
  const counts = new Map();
  items.forEach((item) => { const key = emptyPlaceholder(item[keyName]) ? "Not set" : String(item[keyName]).trim(); counts.set(key, (counts.get(key) || 0) + 1); });
  const pairs = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })), max = Math.max(1, ...pairs.map((pair) => pair[1]));
  return pairs.map((pair) => '<div class="bar-item"><span class="bar-label" title="' + escapeHtml(pair[0]) + '">' + escapeHtml(pair[0]) +
    '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.max(4, Math.round(pair[1] / max * 100)) +
    '%"></div></div><span class="bar-count">' + pair[1] + "</span></div>").join("");
}
function getQualityIssues() {
  const issues = [], rolls = new Map();
  state.students.forEach((student) => {
    CORE_FIELDS.forEach((field) => {
      if (emptyPlaceholder(student[field])) { const label = TABLE_FIELDS.find((entry) => entry[0] === field)[1]; issues.push({ student, issue: "Missing " + label }); }
    });
    if (!emptyPlaceholder(student.roll) && !emptyPlaceholder(student.class) && !emptyPlaceholder(student.section)) {
      const key = [String(student.class).trim().toLocaleLowerCase(), String(student.section).trim().toLocaleLowerCase(), String(student.roll).trim()].join("|");
      if (rolls.has(key)) issues.push({ student, issue: "Roll number also used by student " + rolls.get(key) + " in this class and section" });
      else rolls.set(key, student.student_id);
    }
    if (emptyPlaceholder(student.student_contact_number) && emptyPlaceholder(student.guardians_contact_number)) issues.push({ student, issue: "No student or guardian phone number" });
  });
  return issues;
}
function renderDashboard() {
  $("#stat-students").textContent = String(state.students.length);
  $("#stat-batches").textContent = String(state.batches.length);
  $("#stat-batch-members").textContent = String(state.memberships.length);
  $("#stat-meetings").textContent = String(state.sessions.length);
  const assigned = new Set(state.memberships.map((membership) => membership.student_id));
  const batchCounts = sortedBatches().map((batch) => ({ label: "#" + batch.batch_number + " · " + batch.name, count: state.memberships.filter((membership) => membership.batch_id === batch.id).length }));
  const unassigned = state.students.filter((student) => !assigned.has(student.student_id)).length;
  if (unassigned) batchCounts.push({ label: "Not assigned", count: unassigned });
  const max = Math.max(1, ...batchCounts.map((item) => item.count));
  $("#batch-breakdown").innerHTML = batchCounts.length ? batchCounts.map((item) => '<div class="bar-item"><span class="bar-label" title="' + escapeHtml(item.label) + '">' + escapeHtml(item.label) +
    '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.max(2, item.count / max * 100) + '%"></div></div><span class="bar-count">' + item.count + '</span></div>').join("") : '<p class="helper-text">Create batches and assign students to see the breakdown.</p>';
  const issues = getQualityIssues(), affected = new Set(issues.map((item) => item.student.student_id)).size;
  $("#overview-quality").innerHTML = '<div class="quality-summary-row' + (affected ? " warn" : "") + '"><span>Students needing review</span><strong>' + affected +
    '</strong></div><div class="quality-summary-row"><span>Missing core fields / roll conflicts</span><strong>' +
    issues.filter((item) => item.issue.startsWith("Missing") || item.issue.startsWith("Roll number")).length +
    '</strong></div><div class="quality-summary-row"><span>No student or guardian phone</span><strong>' +
    issues.filter((item) => item.issue.startsWith("No student")).length + "</strong></div>";
  const recent = state.sessions.slice().sort((a, b) => String(b.session_date).localeCompare(String(a.session_date))).slice(0, 4);
  $("#recent-sessions").innerHTML = recent.length ? recent.map((session) => {
    const marked = state.attendance.filter((record) => record.session_id === session.id).length;
    const batch = state.batches.find((item) => item.id === session.batch_id);
    const label = batch ? "Batch #" + batch.batch_number + " · " + batch.name : "All students";
    return '<div class="session-item"><div><strong>' + escapeHtml(session.title) + '</strong><small>' + escapeHtml(dateLabel(session.session_date) + " · " + label) + '</small></div><span class="session-count">' + marked + " marked</span></div>";
  }).join("") : '<p class="helper-text">No meeting attendance has been recorded.</p>';
}
function renderBatches() {
  const list = $("#batch-list"); if (!list) return;
  const batches = sortedBatches();
  $("#batch-list-count").textContent = batches.length + (batches.length === 1 ? " batch" : " batches");
  $("#batch-list-empty").hidden = batches.length > 0;
  list.innerHTML = batches.map((batch) => {
    const count = state.memberships.filter((membership) => membership.batch_id === batch.id).length;
    return '<button class="batch-option' + (batch.id === state.selectedBatchId ? " selected" : "") + '" type="button" data-batch-id="' + escapeHtml(batch.id) + '"><span><strong>#' +
      escapeHtml(batch.batch_number) + " · " + escapeHtml(batch.name) + '</strong><small>' + count + (count === 1 ? " student" : " students") + '</small></span><span class="batch-option-arrow">›</span></button>';
  }).join("");
  if (!batches.length) {
    state.selectedBatchId = ""; $("#batch-detail-panel").hidden = true; $("#batch-empty-detail").hidden = false; return;
  }
  if (!batches.some((batch) => batch.id === state.selectedBatchId)) state.selectedBatchId = batches[0].id;
  const batch = batches.find((item) => item.id === state.selectedBatchId), members = state.memberships.filter((membership) => membership.batch_id === batch.id);
  const students = sortByStudentId(members.map((membership) => state.students.find((student) => student.student_id === membership.student_id)).filter(Boolean));
  $("#batch-detail-panel").hidden = false; $("#batch-empty-detail").hidden = true;
  $("#batch-detail-number").textContent = "BATCH #" + batch.batch_number;
  $("#batch-detail-title").textContent = batch.name;
  $("#batch-detail-description").textContent = batch.description || "";
  $("#batch-name").value = batch.name; $("#batch-description").value = batch.description || "";
  $("#batch-member-count").textContent = students.length + (students.length === 1 ? " student" : " students");
  $("#batch-members-empty").hidden = students.length > 0;
  $("#batch-members-list").innerHTML = students.map((student) => '<div class="batch-member-row"><div><strong>' + escapeHtml(student.full_name) + '</strong><small>ID ' + escapeHtml(student.student_id) +
    " · Class " + escapeHtml(displayValue(student.class)) + " · Section " + escapeHtml(displayValue(student.section)) + '</small></div><button class="table-action remove-member" type="button" data-remove-member-id="' +
    encodeURIComponent(student.student_id) + '">Remove</button></div>').join("");
}
function publicResourceUrl(objectPath) {
  if (!objectPath || !state.client) return "";
  return state.client.storage.from(PUBLIC_RESOURCE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}
function renderResources() {
  const body = $("#resource-table-body"); if (!body) return;
  fillBatchIdSelect($("#resource-batch-id"));
  const error = $("#resource-schema-error");
  error.hidden = !state.resourcesError;
  if (state.resourcesError) {
    error.textContent = "The materials database is not ready. Run the latest supabase/schema.sql in Supabase SQL Editor, then refresh the admin app. Details: " + state.resourcesError.message;
  }
  const resources = state.resources.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  $("#resource-list-count").textContent = state.resourcesError ? "Unavailable until setup is complete" : resources.length + (resources.length === 1 ? " published item" : " published items");
  $("#resource-empty").hidden = resources.length > 0 || Boolean(state.resourcesError);
  body.innerHTML = resources.map((resource) => {
    const batch = state.batches.find((item) => item.id === resource.batch_id);
    const fileUrl = resource.object_path ? publicResourceUrl(resource.object_path) : "";
    const attachment = fileUrl ? '<a class="resource-file-link" href="' + escapeHtml(fileUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(resource.file_name || "Open file") + "</a>" : "—";
    const category = resource.category === "announcement" ? "Blog / notice" : "Class material article";
    return "<tr><td>" + category + "</td><td>" + escapeHtml(batch ? "#" + batch.batch_number + " · " + batch.name : "Batch") + "</td><td>" + escapeHtml(resource.title) +
      "</td><td>" + attachment + "</td><td>" + escapeHtml(dateLabel(resource.created_at)) + '</td><td><div class="resource-row-actions"><button class="table-action" type="button" data-edit-resource="' + escapeHtml(resource.id) + '">Edit</button><button class="table-action delete-resource" type="button" data-delete-resource="' + escapeHtml(resource.id) + '">Delete</button></div></td></tr>';
  }).join("");
}
function updateResourceFormMode() {
  const announcement = $("#resource-category").value === "announcement";
  $("#resource-body-label").textContent = announcement ? "Post text (or attach a PDF notice)" : "Class material article";
  $("#resource-body-editor").dataset.placeholder = announcement ? "Write the announcement or update for this batch. Add headings, lists, links, or code examples." : "Write the lesson directly here. Add headings, explanations, lists, links, quotes, and code examples.";
  $("#resource-file").accept = announcement ? ".pdf,application/pdf" : RESOURCE_ACCEPT;
  $("#resource-file-help").textContent = announcement ? "Optional PDF notice. Your post and attachment are public." : "Optional supporting file: PDF, document, slide deck, spreadsheet, image, text, or ZIP. Attachments are public.";
}
function resetResourceForm() {
  $("#resource-form").reset();
  $("#resource-id").value = "";
  $("#resource-body-editor").innerHTML = "";
  $("#resource-body").value = "";
  $("#resource-category").disabled = false;
  $("#resource-form-heading").textContent = "Publish to a batch";
  $("#save-resource").textContent = "Publish";
  $("#cancel-resource-edit").hidden = true;
  $("#resource-existing-file").hidden = true;
  $("#resource-form-error").hidden = true;
  updateResourceFormMode();
  fillBatchIdSelect($("#resource-batch-id"));
}
function beginResourceEdit(resourceId) {
  const resource = state.resources.find((item) => item.id === resourceId); if (!resource) return;
  $("#resource-id").value = resource.id;
  $("#resource-batch-id").value = resource.batch_id;
  $("#resource-category").value = resource.category;
  $("#resource-category").disabled = true;
  $("#resource-title").value = resource.title;
  $("#resource-body-editor").innerHTML = articleBodyForEditor(resource.body);
  $("#resource-body").value = sanitizeArticleHtml($("#resource-body-editor").innerHTML);
  $("#resource-file").value = "";
  $("#resource-form-heading").textContent = "Edit published item";
  $("#save-resource").textContent = "Save changes";
  $("#cancel-resource-edit").hidden = false;
  const fileInfo = $("#resource-existing-file");
  if (resource.object_path) {
    fileInfo.innerHTML = "Current attachment: <a href=\"" + escapeHtml(publicResourceUrl(resource.object_path)) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + escapeHtml(resource.file_name) + "</a>. Choose a replacement file if needed.";
    fileInfo.hidden = false;
  } else fileInfo.hidden = true;
  $("#resource-form-error").hidden = true;
  updateResourceFormMode();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("#resource-body-editor").addEventListener("input", () => {
  $("#resource-body").value = sanitizeArticleHtml($("#resource-body-editor").innerHTML);
});
$(".article-toolbar").addEventListener("mousedown", (event) => {
  if (event.target.closest("button")) event.preventDefault();
});
$(".article-toolbar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-editor-command]"); if (!button) return;
  $("#resource-body-editor").focus();
  document.execCommand(button.dataset.editorCommand, false, button.dataset.editorValue || undefined);
  $("#resource-body").value = sanitizeArticleHtml($("#resource-body-editor").innerHTML);
});
$("#insert-article-link").addEventListener("click", () => {
  const href = window.prompt("Link URL (https://…)", "https://");
  if (!href) return;
  $("#resource-body-editor").focus();
  document.execCommand("createLink", false, href.trim());
  $("#resource-body").value = sanitizeArticleHtml($("#resource-body-editor").innerHTML);
});
function uploadFilename(name) {
  const cleaned = String(name || "file").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(-100);
  return cleaned || "file";
}
function createObjectToken() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
function validateResourceFile(file, category) {
  if (!file) return null;
  const extension = String(file.name.split(".").pop() || "").toLowerCase(), contentType = RESOURCE_MIME_TYPES[extension];
  if (!contentType) throw new Error("Choose a supported file: PDF, Word, PowerPoint, Excel, TXT, CSV, ZIP, JPG, PNG, or WebP.");
  if (category === "announcement" && extension !== "pdf") throw new Error("Blog and notice attachments must be PDF files.");
  if (file.size <= 0 || file.size > MAX_RESOURCE_FILE_SIZE) throw new Error("Each attachment must be smaller than 25 MB.");
  return { contentType, fileName: file.name, fileSize: file.size };
}
$("#resource-category").addEventListener("change", updateResourceFormMode);
$("#cancel-resource-edit").addEventListener("click", resetResourceForm);
$("#resource-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = $("#resource-form-error"); errorEl.hidden = true;
  const batchId = $("#resource-batch-id").value, category = $("#resource-category").value;
  const title = $("#resource-title").value.trim(), postBody = sanitizeArticleHtml($("#resource-body-editor").innerHTML);
  const bodyHasText = $("#resource-body-editor").innerText.trim().length > 0;
  const file = $("#resource-file").files && $("#resource-file").files[0];
  const editingId = $("#resource-id").value, existing = editingId ? state.resources.find((item) => item.id === editingId) : null;
  if (!batchId) { errorEl.textContent = "Create a batch before publishing a post or material."; errorEl.hidden = false; return; }
  if (!title) { errorEl.textContent = "Enter a title."; errorEl.hidden = false; return; }
  if (category === "announcement" && !bodyHasText && !file && !(existing && existing.object_path)) { errorEl.textContent = "Write the post or attach a PDF notice."; errorEl.hidden = false; return; }
  if (category === "material" && !bodyHasText && !file && !(existing && existing.object_path)) { errorEl.textContent = "Write the class material or attach a file."; errorEl.hidden = false; return; }
  let fileInfo;
  try { fileInfo = validateResourceFile(file, category); }
  catch (error) { errorEl.textContent = error.message; errorEl.hidden = false; return; }

  const button = $("#save-resource"); button.disabled = true;
  const oldPath = existing && existing.object_path;
  let newPath = null;
  let saved = false;
  try {
    if (file) {
      newPath = batchId + "/" + category + "/" + createObjectToken() + "-" + uploadFilename(file.name);
      const uploaded = await state.client.storage.from(PUBLIC_RESOURCE_BUCKET).upload(newPath, file, { contentType: fileInfo.contentType, cacheControl: "3600", upsert: false });
      if (uploaded.error) throw new Error("File upload failed: " + uploaded.error.message);
    }
    const payload = {
      batch_id: batchId, category, title, body: postBody,
      file_name: fileInfo ? fileInfo.fileName : (existing ? existing.file_name : null),
      object_path: newPath || (existing ? existing.object_path : null),
      content_type: fileInfo ? fileInfo.contentType : (existing ? existing.content_type : null),
      file_size: fileInfo ? fileInfo.fileSize : (existing ? existing.file_size : null)
    };
    const result = existing
      ? await state.client.from("batch_resources").update(payload).eq("id", existing.id)
      : await state.client.from("batch_resources").insert(payload);
    if (result.error) throw new Error("Could not save the post: " + result.error.message);
    saved = true;
    if (newPath && oldPath) {
      const removed = await state.client.storage.from(PUBLIC_RESOURCE_BUCKET).remove([oldPath]);
      if (removed.error) showToast("Saved the update, but the old attachment could not be removed: " + removed.error.message, "error");
    }
    resetResourceForm();
    try { await loadData(); }
    catch (refreshError) { showToast("Published successfully, but the admin list could not refresh: " + refreshError.message, "error"); return; }
    showToast(existing ? "Published item updated." : "Published to the selected batch.", "success");
  } catch (error) {
    if (newPath && !saved) await state.client.storage.from(PUBLIC_RESOURCE_BUCKET).remove([newPath]);
    if (saved) showToast("The item was saved, but cleanup reported an error: " + (error.message || "unknown error"), "error");
    else { errorEl.textContent = error.message || "The item could not be saved."; errorEl.hidden = false; }
  } finally { button.disabled = false; }
});
$("#resource-table-body").addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-resource]");
  if (editButton) { beginResourceEdit(editButton.dataset.editResource); return; }
  const deleteButton = event.target.closest("[data-delete-resource]"); if (!deleteButton) return;
  const resource = state.resources.find((item) => item.id === deleteButton.dataset.deleteResource); if (!resource) return;
  if (!window.confirm("Delete “" + resource.title + "” and its attachment from the public site?")) return;
  deleteButton.disabled = true;
  try {
    if (resource.object_path) {
      const removed = await state.client.storage.from(PUBLIC_RESOURCE_BUCKET).remove([resource.object_path]);
      if (removed.error) throw new Error("File delete failed: " + removed.error.message);
    }
    const result = await state.client.from("batch_resources").delete().eq("id", resource.id);
    if (result.error) throw new Error("Could not delete the post record: " + result.error.message);
    if (resource.id === $("#resource-id").value) resetResourceForm();
    await loadData(); showToast("Published item deleted.", "success");
  } catch (error) { showToast(error.message || "Could not delete the published item.", "error"); deleteButton.disabled = false; }
});
$("#new-batch-button").addEventListener("click", () => {
  $("#batch-form").reset(); $("#batch-form-error").hidden = true; openDialog("batch-dialog");
});
$("#batch-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const values = new FormData(event.currentTarget);
  const name = String(values.get("name") || "").trim(), description = String(values.get("description") || "").trim();
  if (!name) { $("#batch-form-error").textContent = "Enter a batch name."; $("#batch-form-error").hidden = false; return; }
  const button = $("#create-batch"); button.disabled = true;
  const result = await state.client.from("batches").insert({ name, description: description || null }).select().single(); button.disabled = false;
  if (result.error) { $("#batch-form-error").textContent = result.error.code === "23505" ? "That batch name already exists." : result.error.message; $("#batch-form-error").hidden = false; return; }
  closeDialog("batch-dialog"); await loadData(); state.selectedBatchId = result.data.id; renderBatches(); showToast("Batch created. Add students by their IDs.", "success");
});
$("#batch-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-batch-id]"); if (!button) return;
  state.selectedBatchId = button.dataset.batchId; renderBatches();
});
$("#batch-edit-form").addEventListener("submit", async (event) => {
  event.preventDefault(); const batch = state.batches.find((item) => item.id === state.selectedBatchId); if (!batch) return;
  const name = $("#batch-name").value.trim(), description = $("#batch-description").value.trim();
  if (!name) { showToast("Enter a batch name.", "error"); return; }
  const button = $("#save-batch"); button.disabled = true;
  const result = await state.client.from("batches").update({ name, description: description || null }).eq("id", batch.id); button.disabled = false;
  if (result.error) { showToast(result.error.code === "23505" ? "That batch name already exists." : "Could not save batch: " + result.error.message, "error"); return; }
  await loadData(); state.selectedBatchId = batch.id; renderBatches(); showToast("Batch details saved.", "success");
});
$("#delete-batch").addEventListener("click", async () => {
  const batch = state.batches.find((item) => item.id === state.selectedBatchId); if (!batch) return;
  const answer = window.prompt("This removes the batch and its membership links. Attendance history is preserved. Type the batch name to confirm:", "");
  if (answer !== batch.name) { if (answer !== null) showToast("The batch name did not match. Nothing was deleted.", "error"); return; }
  const { error } = await state.client.from("batches").delete().eq("id", batch.id);
  if (error) { showToast("This batch could not be deleted. It may have attendance history that must be kept.", "error"); return; }
  state.selectedBatchId = ""; await loadData(); showToast("Batch deleted. Student records are unchanged.", "success");
});
$("#batch-member-form").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#batch-members-error").hidden = true;
  const batch = state.batches.find((item) => item.id === state.selectedBatchId); if (!batch) return;
  const ids = Array.from(new Set($("#batch-member-ids").value.split(/[\s,;]+/).map((id) => id.trim()).filter(Boolean)));
  if (!ids.length) { $("#batch-members-error").textContent = "Enter at least one student ID."; $("#batch-members-error").hidden = false; return; }
  const found = ids.filter((id) => state.students.some((student) => student.student_id === id));
  const existing = new Set(state.memberships.filter((membership) => membership.batch_id === batch.id).map((membership) => membership.student_id));
  const additions = found.filter((id) => !existing.has(id)).map((student_id) => ({ batch_id: batch.id, student_id }));
  if (!additions.length) {
    $("#batch-members-error").textContent = found.length ? "Those students are already in this batch." : "No matching student IDs were found. Use the exact IDs from the directory.";
    $("#batch-members-error").hidden = false; return;
  }
  const button = $("#add-batch-members"); button.disabled = true;
  const { error } = await state.client.from("batch_students").upsert(additions, { onConflict: "batch_id,student_id", ignoreDuplicates: true }); button.disabled = false;
  if (error) { $("#batch-members-error").textContent = "Could not add students: " + error.message; $("#batch-members-error").hidden = false; return; }
  $("#batch-member-ids").value = ""; await loadData(); state.selectedBatchId = batch.id; renderBatches();
  const missing = ids.length - found.length; showToast(additions.length + " student(s) added to the batch" + (missing ? "; " + missing + " ID(s) not found." : "."), missing ? "error" : "success");
});
$("#batch-members-list").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-remove-member-id]"); if (!button) return;
  const batchId = state.selectedBatchId, studentId = decodeURIComponent(button.dataset.removeMemberId);
  if (!window.confirm("Remove this student from the batch? Their student record and saved attendance remain.")) return;
  const { error } = await state.client.from("batch_students").delete().eq("batch_id", batchId).eq("student_id", studentId);
  if (error) { showToast("Could not remove student: " + error.message, "error"); return; }
  await loadData(); state.selectedBatchId = batchId; renderBatches(); showToast("Student removed from the batch.", "success");
});

function renderQuality() {
  if (!$("#quality-table-body")) return;
  const issues = getQualityIssues(), core = issues.filter((item) => item.issue.startsWith("Missing") || item.issue.startsWith("Roll number")).length;
  const noPhone = issues.filter((item) => item.issue.startsWith("No student")).length, affected = new Set(issues.map((item) => item.student.student_id)).size;
  $("#quality-cards").innerHTML = '<article class="quality-card' + (affected ? " warn" : "") + '"><span>Students with an item to review</span><strong>' + affected +
    '</strong></article><article class="quality-card' + (core ? " warn" : "") + '"><span>Missing core fields or roll conflicts</span><strong>' + core +
    '</strong></article><article class="quality-card' + (noPhone ? " warn" : "") + '"><span>Students without a contact phone</span><strong>' + noPhone + "</strong></article>";
  $("#quality-table-body").innerHTML = issues.map((item) => "<tr><td><span class=\"id-badge\">" + escapeHtml(item.student.student_id) +
    "</span></td><td><strong>" + escapeHtml(displayValue(item.student.full_name)) + '</strong></td><td class="issue-text">' + escapeHtml(item.issue) +
    '</td><td><button class="table-action" type="button" data-quality-id="' + encodeURIComponent(item.student.student_id) + '">Review</button></td></tr>').join("");
  $("#quality-empty").hidden = issues.length > 0;
}
$("#quality-table-body").addEventListener("click", (event) => {
  const button = event.target.closest("[data-quality-id]"); if (!button) return;
  const id = decodeURIComponent(button.dataset.qualityId), student = state.students.find((item) => item.student_id === id);
  if (student) openStudentForm(student);
});
$("#refresh-data-check").addEventListener("click", () => renderQuality());

function studentsForSession(session) {
  if (!session || !session.batch_id) return sortByStudentId(state.students);
  const ids = new Set(state.memberships.filter((membership) => membership.batch_id === session.batch_id).map((membership) => membership.student_id));
  return sortByStudentId(state.students.filter((student) => ids.has(student.student_id)));
}
function sessionBatchLabel(session) {
  if (!session || !session.batch_id) return "All students";
  const batch = state.batches.find((item) => item.id === session.batch_id);
  return batch ? "Batch #" + batch.batch_number + " · " + batch.name : "Batch unavailable";
}
function renderAttendance() {
  const select = $("#attendance-session-select"), prior = state.selectedSessionId || select.value;
  select.innerHTML = "";
  if (!state.sessions.length) { select.innerHTML = '<option value="">No meetings yet</option>'; state.selectedSessionId = ""; }
  else {
    state.sessions.slice().sort((a, b) => String(b.session_date).localeCompare(String(a.session_date))).forEach((session) => {
      const option = document.createElement("option"); option.value = session.id;
      option.textContent = dateLabel(session.session_date) + " · " + session.title + " · " + sessionBatchLabel(session); select.append(option);
    });
    state.selectedSessionId = state.sessions.some((session) => session.id === prior) ? prior : select.options[0].value; select.value = state.selectedSessionId;
  }
  const session = state.sessions.find((item) => item.id === state.selectedSessionId), roster = studentsForSession(session);
  $("#attendance-session-summary").textContent = session ? session.title + " · " + dateLabel(session.session_date) + " · " + sessionBatchLabel(session) : "Choose a meeting or create one for a batch.";
  $("#attendance-empty").hidden = true;
  const body = $("#attendance-table-body");
  if (!session) {
    body.innerHTML = ""; $("#attendance-counts").innerHTML = ""; $("#save-attendance").disabled = true;
    $("#attendance-mark-status").textContent = state.students.length ? "Create a batch meeting to begin." : "Add students and create a batch first.";
    renderSessionHistory(); return;
  }
  if (!roster.length) {
    body.innerHTML = ""; $("#attendance-counts").innerHTML = ""; $("#save-attendance").disabled = true;
    $("#attendance-empty").hidden = false;
    $("#attendance-empty").innerHTML = session.batch_id ? '<strong>This batch has no students</strong><p>Add students from the Batches page before taking attendance.</p>' : '<strong>No student records yet</strong><p>Add or import students before taking attendance.</p>';
    $("#attendance-mark-status").textContent = "There are no students to mark for this meeting."; renderSessionHistory(); return;
  }
  const saved = new Map(state.attendance.filter((record) => record.session_id === session.id).map((record) => [record.student_id, record.status]));
  const counts = { Present: 0, Absent: 0, Late: 0, "Not marked": 0 };
  body.innerHTML = roster.map((student) => {
    const status = saved.get(student.student_id) || ""; counts[status || "Not marked"] += 1;
    return "<tr><td><span class=\"id-badge\">" + escapeHtml(student.student_id) + "</span></td><td><strong>" + escapeHtml(displayValue(student.full_name)) +
      "</strong></td><td>" + escapeHtml(displayValue(student.class)) + " / " + escapeHtml(displayValue(student.section)) +
      '</td><td><select class="status-select" data-student-id="' + encodeURIComponent(student.student_id) + '"><option value="">Choose status</option>' +
      '<option value="Present"' + (status === "Present" ? " selected" : "") + '>Present</option><option value="Absent"' + (status === "Absent" ? " selected" : "") +
      '>Absent</option><option value="Late"' + (status === "Late" ? " selected" : "") + ">Late</option></select></td></tr>";
  }).join("");
  updateAttendanceCountsFromForm();
  const complete = counts["Not marked"] === 0;
  $("#attendance-mark-status").textContent = complete ? "All students in this batch have a status." : counts["Not marked"] + " student(s) still need a status.";
  $("#save-attendance").disabled = !complete; renderSessionHistory();
}
function renderSessionHistory() {
  const history = state.sessions.slice().sort((a, b) => String(b.session_date).localeCompare(String(a.session_date)));
  $("#session-history").innerHTML = history.length ? history.map((session) => {
    const marked = state.attendance.filter((record) => record.session_id === session.id).length, rosterCount = studentsForSession(session).length;
    return '<div class="session-item' + (session.id === state.selectedSessionId ? " selected" : "") + '" tabindex="0" role="button" data-session-id="' +
      escapeHtml(session.id) + '"><div><strong>' + escapeHtml(session.title) + '</strong><small>' + escapeHtml(dateLabel(session.session_date) + " · " + sessionBatchLabel(session)) +
      '</small></div><span class="session-count">' + marked + "/" + rosterCount + "</span></div>";
  }).join("") : '<p class="helper-text">Your batch meetings will appear here.</p>';
}
$("#attendance-session-select").addEventListener("change", (event) => { state.selectedSessionId = event.target.value; renderAttendance(); });
$("#session-history").addEventListener("click", (event) => { const item = event.target.closest("[data-session-id]"); if (item) { state.selectedSessionId = item.dataset.sessionId; renderAttendance(); } });
$("#session-history").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const item = event.target.closest("[data-session-id]"); if (item) { event.preventDefault(); state.selectedSessionId = item.dataset.sessionId; renderAttendance(); }
});
$("#attendance-table-body").addEventListener("change", () => {
  const statuses = Array.from(document.querySelectorAll("#attendance-table-body select")), missing = statuses.filter((select) => !select.value).length;
  $("#attendance-mark-status").textContent = missing ? missing + " student(s) still need a status." : "All students have a status.";
  $("#save-attendance").disabled = missing > 0 || statuses.length === 0; updateAttendanceCountsFromForm();
});
function updateAttendanceCountsFromForm() {
  const counts = { Present: 0, Absent: 0, Late: 0, "Not marked": 0 };
  document.querySelectorAll("#attendance-table-body select").forEach((select) => { counts[select.value || "Not marked"] += 1; });
  $("#attendance-counts").innerHTML =
    '<span class="attendance-chip present">Present ' + counts.Present + "</span>" +
    '<span class="attendance-chip absent">Absent ' + counts.Absent + "</span>" +
    '<span class="attendance-chip late">Late ' + counts.Late + "</span>" +
    '<span class="attendance-chip unmarked">Not marked ' + counts["Not marked"] + "</span>";
}
$("#new-session-button").addEventListener("click", () => {
  if (!state.batches.length) { setPage("batches"); showToast("Create a batch before starting batch attendance.", "error"); return; }
  $("#session-form").reset(); $("#session-form-error").hidden = true; fillBatchIdSelect($("#session-batch-id"));
  const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $("#session-form").elements.namedItem("session_date").value = now.toISOString().slice(0, 10); openDialog("session-dialog");
});
$("#session-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = new FormData(event.currentTarget), title = String(values.get("title") || "").trim(), sessionDate = String(values.get("session_date") || "").trim(), batchId = String(values.get("batch_id") || "").trim();
  const button = $("#create-session"); button.disabled = true;
  const { data, error } = await state.client.from("attendance_sessions").insert({ title, session_date: sessionDate, batch_id: batchId || null }).select().single();
  button.disabled = false;
  if (error) { $("#session-form-error").textContent = error.message; $("#session-form-error").hidden = false; return; }
  closeDialog("session-dialog"); await loadData(); state.selectedSessionId = data.id; renderAttendance(); showToast("Meeting created. Mark each student’s attendance.", "success");
});
$("#save-attendance").addEventListener("click", async () => {
  const entries = Array.from(document.querySelectorAll("#attendance-table-body select"));
  if (!entries.length || entries.some((select) => !select.value)) { showToast("Choose a status for every student before saving.", "error"); return; }
  const rows = entries.map((select) => ({ session_id: state.selectedSessionId, student_id: decodeURIComponent(select.dataset.studentId), status: select.value }));
  const button = $("#save-attendance"); button.disabled = true;
  const { error } = await state.client.from("attendance_records").upsert(rows, { onConflict: "session_id,student_id" });
  button.disabled = false;
  if (error) { showToast("Attendance could not be saved: " + error.message, "error"); return; }
  await loadData(); showToast("Attendance saved.", "success");
});

function attendanceSummary(studentId, batchFilter) {
  const sessions = state.sessions.filter((session) => {
    if (batchFilter) return session.batch_id === batchFilter;
    if (!session.batch_id) return true;
    return state.memberships.some((membership) => membership.batch_id === session.batch_id && membership.student_id === studentId);
  });
  const sessionIds = new Set(sessions.map((session) => session.id));
  const records = state.attendance.filter((record) => record.student_id === studentId && sessionIds.has(record.session_id));
  const present = records.filter((record) => record.status === "Present").length, late = records.filter((record) => record.status === "Late").length;
  const absent = records.filter((record) => record.status === "Absent").length, meetings = sessions.length;
  return { present, late, absent, meetings, rate: meetings ? Math.round((present + late) / meetings * 100) : 0 };
}
function renderReports() {
  fillSelect($("#report-class-filter"), state.students.map((student) => student.class), "All classes");
  fillBatchIdSelect($("#report-batch-filter"));
  const classFilter = $("#report-class-filter").value, batchFilter = $("#report-batch-filter").value, totalMarked = state.attendance.length;
  $("#report-meetings").textContent = String(state.sessions.length); $("#report-marked").textContent = String(totalMarked);
  $("#report-present").textContent = String(state.attendance.filter((row) => row.status === "Present").length);
  $("#report-late").textContent = String(state.attendance.filter((row) => row.status === "Late").length);
  const rows = sortByStudentId(state.students).filter((student) => {
    if (classFilter && String(student.class || "") !== classFilter) return false;
    return !batchFilter || state.memberships.some((membership) => membership.batch_id === batchFilter && membership.student_id === student.student_id);
  });
  $("#report-table-body").innerHTML = rows.map((student) => {
    const summary = attendanceSummary(student.student_id, batchFilter);
    return "<tr><td><span class=\"id-badge\">" + escapeHtml(student.student_id) + "</span></td><td><strong>" + escapeHtml(displayValue(student.full_name)) +
      "</strong></td><td>" + escapeHtml(displayValue(student.class)) + " / " + escapeHtml(displayValue(student.section)) + "</td><td>" +
      summary.present + "</td><td>" + summary.late + "</td><td>" + summary.absent + '</td><td><span class="session-count">' +
      (summary.meetings ? summary.rate + "%" : "—") + "</span></td></tr>";
  }).join("");
  $("#report-empty").hidden = state.sessions.length > 0 || state.students.length === 0;
}
$("#report-class-filter").addEventListener("change", renderReports);
$("#report-batch-filter").addEventListener("change", renderReports);

function csvEscape(value) { return '"' + (value == null ? "" : String(value)).replaceAll('"', '""') + '"'; }
function downloadFile(name, content, type) {
  const blob = new Blob([content], { type }), url = URL.createObjectURL(blob), anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function batchExportSnapshot() {
  const batch = state.batches.find((item) => item.id === state.selectedBatchId);
  if (!batch) { showToast("Select a batch before exporting its roster.", "error"); return null; }
  const memberIds = new Set(state.memberships.filter((membership) => membership.batch_id === batch.id).map((membership) => membership.student_id));
  const students = sortByStudentId(state.students.filter((student) => memberIds.has(student.student_id)));
  if (!students.length) { showToast("This batch has no students to export.", "error"); return null; }
  if (!window.confirm("Export " + students.length + " student records for " + batch.name + "? The file includes private contact and address details. Save it only on a private device.")) return null;
  const rows = students.map((student) => ({
    batch_number: String(batch.batch_number), batch_name: batch.name,
    ...Object.fromEntries(TABLE_FIELDS.map(([key]) => [key, student[key] == null ? "" : String(student[key])]))
  }));
  return { batch, rows };
}
function batchExportFilename(batch, extension) {
  const slug = String(batch.name || "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "batch";
  return "batch-" + batch.batch_number + "-" + slug + "-" + new Date().toISOString().slice(0, 10) + "." + extension;
}
function batchCsvEscape(value) {
  let text = value == null ? "" : String(value);
  if (/^[\t\r=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
function xmlEscape(value) {
  return String(value == null ? "" : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
function spreadsheetColumn(index) {
  let name = "";
  for (let number = index + 1; number; number = Math.floor((number - 1) / 26)) name = String.fromCharCode(65 + ((number - 1) % 26)) + name;
  return name;
}
function spreadsheetXml(rows) {
  const values = [BATCH_EXPORT_FIELDS.map(([, label]) => label), ...rows.map((row) => BATCH_EXPORT_FIELDS.map(([key]) => row[key]))];
  const sheetRows = values.map((row, rowIndex) => "<row r=\"" + (rowIndex + 1) + "\">" + row.map((value, columnIndex) =>
    "<c r=\"" + spreadsheetColumn(columnIndex) + (rowIndex + 1) + "\" t=\"inlineStr\"><is><t xml:space=\"preserve\">" + xmlEscape(value) + "</t></is></c>").join("") + "</row>").join("");
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + sheetRows + "</sheetData></worksheet>";
}
function zipCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function concatenateBytes(chunks) {
  const result = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  chunks.forEach((chunk) => { result.set(chunk, offset); offset += chunk.length; });
  return result;
}
function makeXlsxBlob(rows) {
  const encoder = new TextEncoder(), files = [
    ["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
    ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ["xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Batch roster" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ["xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
    ["xl/worksheets/sheet1.xml", spreadsheetXml(rows)]
  ];
  const localParts = [], centralParts = [];
  let localOffset = 0;
  const now = new Date(), dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  files.forEach(([filename, contents]) => {
    const name = encoder.encode(filename), data = encoder.encode(contents), crc = zipCrc32(data);
    const local = new Uint8Array(30 + name.length + data.length), localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true); localView.setUint16(4, 20, true); localView.setUint16(6, 0, true); localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true); localView.setUint16(12, dosDate, true); localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true); localView.setUint32(22, data.length, true); localView.setUint16(26, name.length, true); localView.setUint16(28, 0, true);
    local.set(name, 30); local.set(data, 30 + name.length); localParts.push(local);
    const central = new Uint8Array(46 + name.length), centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true); centralView.setUint16(4, 20, true); centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true); centralView.setUint16(10, 0, true); centralView.setUint16(12, dosTime, true); centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true); centralView.setUint32(20, data.length, true); centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true); centralView.setUint16(30, 0, true); centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true); centralView.setUint16(36, 0, true); centralView.setUint32(38, 0, true); centralView.setUint32(42, localOffset, true);
    central.set(name, 46); centralParts.push(central); localOffset += local.length;
  });
  const centralDirectory = concatenateBytes(centralParts), end = new Uint8Array(22), endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true); endView.setUint16(4, 0, true); endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true); endView.setUint16(10, files.length, true); endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, localOffset, true); endView.setUint16(20, 0, true);
  return new Blob([concatenateBytes([...localParts, centralDirectory, end])], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
function exportBatchRoster(format) {
  const snapshot = batchExportSnapshot(); if (!snapshot) return;
  const filename = batchExportFilename(snapshot.batch, format === "excel" ? "xlsx" : format);
  if (format === "csv") {
    const lines = [BATCH_EXPORT_FIELDS.map(([, label]) => batchCsvEscape(label)).join(",")]
      .concat(snapshot.rows.map((row) => BATCH_EXPORT_FIELDS.map(([key]) => batchCsvEscape(row[key])).join(",")));
    downloadFile(filename, "\uFEFF" + lines.join("\r\n"), "text/csv;charset=utf-8");
  } else if (format === "json") {
    const data = { format: "club-batch-roster", version: 1, exported_at: new Date().toISOString(), batch: { batch_number: snapshot.batch.batch_number, name: snapshot.batch.name, description: snapshot.batch.description || "" }, students: snapshot.rows };
    downloadFile(filename, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  } else {
    downloadFile(filename, makeXlsxBlob(snapshot.rows), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }
}
$("#export-batch-excel").addEventListener("click", () => exportBatchRoster("excel"));
$("#export-batch-csv").addEventListener("click", () => exportBatchRoster("csv"));
$("#export-batch-json").addEventListener("click", () => exportBatchRoster("json"));
$("#export-csv").addEventListener("click", () => {
  const rows = state.filteredStudents;
  if (!rows.length) { showToast("There are no filtered records to export.", "error"); return; }
  if (!window.confirm("This CSV includes student and guardian contact details. Save it only on a private device. Continue?")) return;
  const csv = [TABLE_FIELDS.map((column) => csvEscape(column[1])).concat([csvEscape("Batches")]).join(",")]
    .concat(rows.map((student) => TABLE_FIELDS.map(([key]) => csvEscape(student[key])).concat([csvEscape(batchLabelsForStudent(student.student_id))]).join(","))).join("\r\n");
  downloadFile("club-students-" + new Date().toISOString().slice(0, 10) + ".csv", csv, "text/csv;charset=utf-8");
});
$("#export-attendance-csv").addEventListener("click", () => {
  if (!state.attendance.length) { showToast("No attendance records to export.", "error"); return; }
  if (!window.confirm("This CSV contains student names and attendance. Save it only on a private device. Continue?")) return;
  const headers = ["Meeting date", "Meeting name", "Batch", "Student ID", "Full name", "Class", "Section", "Status"];
  const sessions = new Map(state.sessions.map((session) => [session.id, session])), students = new Map(state.students.map((student) => [student.student_id, student]));
  const rows = state.attendance.map((record) => { const session = sessions.get(record.session_id) || {}, student = students.get(record.student_id) || {};
    return [session.session_date, session.title, sessionBatchLabel(session), student.student_id, student.full_name, student.class, student.section, record.status]; });
  const csv = [headers.map(csvEscape).join(",")].concat(rows.map((row) => row.map(csvEscape).join(","))).join("\r\n");
  downloadFile("club-attendance-" + new Date().toISOString().slice(0, 10) + ".csv", csv, "text/csv;charset=utf-8");
});

function normalizeDate(value) {
  if (emptyPlaceholder(value)) return null;
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
  const result = String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
  const parsed = new Date(result + "T00:00:00");
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() !== year || parsed.getMonth() + 1 !== month || parsed.getDate() !== day) return null;
  return result;
}
function cleanImportValue(value) { return emptyPlaceholder(value) ? null : String(value).trim(); }
function normalizeImportedStudent(id, raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const studentId = String(id == null ? "" : id).trim(); if (!studentId) return null;
  const rawRoll = raw.roll, rollText = emptyPlaceholder(rawRoll) ? "" : String(rawRoll).trim();
  return {
    student_id: studentId, full_name: cleanImportValue(raw.full_name), class: cleanImportValue(raw.class), section: cleanImportValue(raw.section),
    roll: rollText && /^\d+$/.test(rollText) ? Number(rollText) : null, date_of_birth: normalizeDate(raw.date_of_birth),
    gender: cleanImportValue(raw.gender), student_contact_number: cleanImportValue(raw.student_contact_number),
    email_address: cleanImportValue(raw.email_address), home_address: cleanImportValue(raw.home_address),
    guardians_name: cleanImportValue(raw.guardians_name), relationship_to_student: cleanImportValue(raw.relationship_to_student),
    guardians_contact_number: cleanImportValue(raw.guardians_contact_number)
  };
}
function parseStudentJson(parsed) {
  const source = parsed && parsed.students ? parsed.students : parsed, entries = [];
  if (Array.isArray(source)) source.forEach((row) => entries.push([row && (row.student_id || row.id), row]));
  else if (source && typeof source === "object") Object.entries(source).forEach(([id, row]) => entries.push([id, row]));
  else throw new Error("Expected a JSON object keyed by student ID, or an array of student records.");
  const unique = new Map(), attendance = new Map(); let skipped = 0, skippedAttendance = 0;
  entries.forEach(([id, row]) => {
    const normalized = normalizeImportedStudent(id, row);
    if (!normalized || emptyPlaceholder(normalized.full_name)) { skipped += 1; return; }
    const alias = Array.from(unique.values()).find((existing) => sameStudentId(existing.student_id, normalized.student_id) && existing.student_id !== normalized.student_id);
    if (alias) throw new Error("The JSON contains IDs that differ only by leading zeroes. Resolve those IDs before importing.");
    unique.set(normalized.student_id, normalized);
    const oldAttendance = row && row.attendance;
    if (oldAttendance == null) return;
    if (typeof oldAttendance !== "object" || Array.isArray(oldAttendance)) { skippedAttendance += 1; return; }
    Object.entries(oldAttendance).forEach(([date, rawStatus]) => {
      const sessionDate = normalizeDate(date), statusText = String(rawStatus == null ? "" : rawStatus).trim().toLowerCase();
      const status = { present: "Present", absent: "Absent", late: "Late" }[statusText];
      if (!sessionDate || !status) { skippedAttendance += 1; return; }
      const key = normalized.student_id + "\u0000" + sessionDate, existing = attendance.get(key);
      if (existing && existing.status !== status) throw new Error("The JSON contains conflicting attendance statuses for one student and date.");
      attendance.set(key, { student_id: normalized.student_id, session_date: sessionDate, status });
    });
  });
  return { rows: Array.from(unique.values()), attendanceRows: Array.from(attendance.values()), skipped, skippedAttendance };
}
async function saveLegacyAttendance(records) {
  const sessionsByDate = new Map();
  for (const sessionDate of new Set(records.map((record) => record.session_date))) {
    let session = state.sessions.find((item) => item.title === LEGACY_ATTENDANCE_TITLE && item.session_date === sessionDate);
    if (!session) {
      const result = await state.client.from("attendance_sessions").insert({ title: LEGACY_ATTENDANCE_TITLE, session_date: sessionDate }).select().single();
      if (result.error) throw result.error;
      session = result.data; state.sessions.push(session);
    }
    sessionsByDate.set(sessionDate, session.id);
  }
  const rows = records.map((record) => ({ session_id: sessionsByDate.get(record.session_date), student_id: record.student_id, status: record.status }));
  const { error } = await state.client.from("attendance_records").upsert(rows, { onConflict: "session_id,student_id" });
  if (error) throw error;
}
$("#json-file").addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0]; state.pendingImport = []; state.pendingImportAttendance = []; $("#apply-import").disabled = true; $("#import-preview").hidden = true;
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text()), result = parseStudentJson(parsed);
    const aliasConflicts = result.rows.filter((incoming) => state.students.some((current) => current.student_id !== incoming.student_id && sameStudentId(current.student_id, incoming.student_id)));
    if (aliasConflicts.length) {
      $("#import-preview").textContent = "Import stopped: some IDs match existing records after ignoring leading zeroes. Edit the JSON IDs to match the database exactly.";
      $("#import-preview").hidden = false; return;
    }
    state.pendingImport = result.rows; state.pendingImportAttendance = result.attendanceRows;
    const existingIds = new Set(state.students.map((student) => student.student_id)), newCount = result.rows.filter((student) => !existingIds.has(student.student_id)).length;
    const duplicateCount = result.rows.length - newCount;
    $("#import-preview").innerHTML = "<strong>" + result.rows.length + " usable records</strong><br>" + newCount + " new IDs · " +
      duplicateCount + " existing IDs will only have blank fields filled · " + result.skipped + " skipped (missing ID or name).<br>" +
      result.attendanceRows.length + " historical attendance marks recognized · " + result.skippedAttendance + " unsupported attendance marks skipped.";
    $("#import-preview").hidden = false; $("#apply-import").disabled = result.rows.length === 0 && result.attendanceRows.length === 0;
  } catch (error) { $("#import-preview").textContent = "Could not read this JSON file: " + error.message; $("#import-preview").hidden = false; }
});
$("#apply-import").addEventListener("click", async () => {
  if (!state.pendingImport.length && !state.pendingImportAttendance.length) return;
  const markCount = state.pendingImportAttendance.length;
  if (!window.confirm("Import " + state.pendingImport.length + " student records and " + markCount + " historical attendance marks? Existing non-empty student values will be preserved.")) return;
  const existing = new Map(state.students.map((student) => [student.student_id, student])), changes = [];
  state.pendingImport.forEach((incoming) => {
    const current = existing.get(incoming.student_id);
    if (!current) { changes.push(incoming); return; }
    const merged = { student_id: incoming.student_id };
    TABLE_FIELDS.forEach(([key]) => { if (key !== "student_id") merged[key] = emptyPlaceholder(current[key]) ? incoming[key] : current[key]; });
    if (TABLE_FIELDS.some(([key]) => key !== "student_id" && String(merged[key] == null ? "" : merged[key]) !== String(current[key] == null ? "" : current[key]))) changes.push(merged);
  });
  if (!changes.length && !markCount) { showToast("No new records or blank fields to fill.", "success"); return; }
  const button = $("#apply-import"); button.disabled = true;
  try {
    if (changes.length) {
      const result = await state.client.from("students").upsert(changes, { onConflict: "student_id" });
      if (result.error) throw result.error;
    }
    if (markCount) await saveLegacyAttendance(state.pendingImportAttendance);
  } catch (error) {
    button.disabled = false; showToast("Import did not finish: " + (error.message || "check the Supabase setup."), "error"); return;
  }
  state.pendingImport = []; state.pendingImportAttendance = []; $("#json-file").value = ""; $("#import-preview").hidden = true;
  await loadData(); showToast(changes.length + " student records updated and " + markCount + " legacy attendance marks imported.", "success");
});

function bytesToBase64(buffer) { const bytes = new Uint8Array(buffer); let binary = ""; for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]); return btoa(binary); }
function base64ToBytes(value) { const binary = atob(value), bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i); return bytes; }
async function deriveBackupKey(passphrase, salt, usage) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" }, material,
    { name: "AES-GCM", length: 256 }, false, [usage]);
}
$("#download-backup").addEventListener("click", async () => {
  if (!window.crypto || !crypto.subtle) { showToast("Encrypted backup needs a secure HTTPS connection.", "error"); return; }
  const passphrase = window.prompt("Create a backup passphrase with at least 12 characters. Keep it safe; it cannot be recovered:");
  if (passphrase === null) return;
  if (passphrase.length < 12) { showToast("Use a passphrase of at least 12 characters.", "error"); return; }
  const confirmPassphrase = window.prompt("Type the backup passphrase again:");
  if (passphrase !== confirmPassphrase) { showToast("The passphrases did not match. No backup was created.", "error"); return; }
  const payload = JSON.stringify({ format: "club-student-database", version: 2, created_at: new Date().toISOString(),
    students: state.students, batches: state.batches, batch_students: state.memberships,
    attendance_sessions: state.sessions, attendance_records: state.attendance });
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveBackupKey(passphrase, salt, "encrypt"), ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(payload));
  const envelope = { format: "club-encrypted-backup", version: 2, kdf: "PBKDF2-SHA-256", iterations: 310000,
    salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(ciphertext) };
  downloadFile("club-database-backup-" + new Date().toISOString().slice(0, 10) + ".clubbackup", JSON.stringify(envelope), "application/json");
  showToast("Encrypted backup downloaded. Store it somewhere private.", "success");
});
$("#backup-file").addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0]; if (!file) return;
  try {
    const envelope = JSON.parse(await file.text());
    if (envelope.format !== "club-encrypted-backup" || ![1, 2].includes(envelope.version)) throw new Error("Unsupported backup file.");
    const passphrase = window.prompt("Enter the passphrase for this backup."); if (passphrase === null) return;
    const key = await deriveBackupKey(passphrase, base64ToBytes(envelope.salt), "decrypt");
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(envelope.iv) }, key, base64ToBytes(envelope.ciphertext));
    const backup = JSON.parse(new TextDecoder().decode(plaintext));
    if (backup.format !== "club-student-database" || ![1, 2].includes(backup.version) || !Array.isArray(backup.students) || !Array.isArray(backup.attendance_sessions) || !Array.isArray(backup.attendance_records)) throw new Error("Invalid backup.");
    const batches = Array.isArray(backup.batches) ? backup.batches : [], memberships = Array.isArray(backup.batch_students) ? backup.batch_students : [];
    if (!window.confirm("Merge " + backup.students.length + " students, " + batches.length + " batches, and " + backup.attendance_sessions.length + " meetings into this database? Existing records are not deleted.")) return;
    const cleanBatches = batches.map((batch) => ({ id: batch.id, name: batch.name, description: batch.description || null, created_at: batch.created_at }));
    const students = backup.students.map((row) => { const clean = {}; TABLE_FIELDS.forEach(([key]) => { clean[key] = row[key] == null ? null : row[key]; }); return clean; });
    if (cleanBatches.length) { const result = await state.client.from("batches").upsert(cleanBatches, { onConflict: "id" }); if (result.error) throw result.error; }
    if (students.length) { const result = await state.client.from("students").upsert(students, { onConflict: "student_id" }); if (result.error) throw result.error; }
    if (memberships.length) { const result = await state.client.from("batch_students").upsert(memberships.map((row) => ({ batch_id: row.batch_id, student_id: row.student_id, added_at: row.added_at })), { onConflict: "batch_id,student_id" }); if (result.error) throw result.error; }
    if (backup.attendance_sessions.length) { const result = await state.client.from("attendance_sessions").upsert(backup.attendance_sessions, { onConflict: "id" }); if (result.error) throw result.error; }
    if (backup.attendance_records.length) { const result = await state.client.from("attendance_records").upsert(backup.attendance_records, { onConflict: "session_id,student_id" }); if (result.error) throw result.error; }
    await loadData(); showToast("Backup merged successfully, including batches and memberships.", "success");
  } catch (_error) { showToast("Could not restore backup. Check the file, passphrase, and Supabase schema update.", "error"); }
  finally { event.target.value = ""; }
});
initialize();
