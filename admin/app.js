import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CONFIG = window.CLUB_SUPABASE_CONFIG || {};
const TABLE_FIELDS = [
  ["student_id", "Student ID"], ["full_name", "Full name"], ["class", "Class"], ["section", "Section"],
  ["roll", "Roll"], ["date_of_birth", "Date of birth"], ["gender", "Gender"],
  ["student_contact_number", "Student phone"], ["email_address", "Email address"], ["home_address", "Home address"],
  ["guardians_name", "Guardian name"], ["relationship_to_student", "Relationship to student"],
  ["guardians_contact_number", "Guardian phone"]
];
const CORE_FIELDS = ["full_name", "class", "section", "roll"];
const LEGACY_ATTENDANCE_TITLE = "Imported legacy attendance";
const state = { client: null, userId: "", students: [], sessions: [], attendance: [], page: "overview",
  currentStudent: null, editingId: null, selectedSessionId: "", pendingImport: [], pendingImportAttendance: [], filteredStudents: [] };
const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value == null ? "" : value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
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
  const titles = { overview: "Overview", students: "Students", attendance: "Attendance", reports: "Reports", data: "Data quality", backup: "Import & backup" };
  $("#page-title").textContent = titles[page] || "Overview";
  if (page === "students") renderStudents();
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
    state.client.from("attendance_sessions").select("*").order("session_date", { ascending: false }),
    state.client.from("attendance_records").select("*")
  ]);
  const names = ["students", "attendance sessions", "attendance"];
  for (let i = 0; i < results.length; i += 1) if (results[i].error) throw new Error(names[i] + ": " + results[i].error.message);
  state.students = results[0].data || [];
  state.sessions = results[1].data || [];
  state.attendance = results[2].data || [];
  renderDashboard(); renderStudents(); renderAttendance(); renderReports(); renderQuality();
}
function showApp(user) {
  $("#login-view").hidden = true; $("#admin-app").hidden = false; $("#user-email").textContent = user.email || "Administrator";
  if (state.userId === user.id && state.students.length) return;
  state.userId = user.id;
  loadData().catch((error) => showToast("Could not load private records. " + error.message, "error"));
}
function showLogin() {
  state.userId = ""; state.students = []; state.sessions = []; state.attendance = []; state.filteredStudents = [];
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
function getFilteredStudents() {
  const query = $("#student-search").value.trim().toLocaleLowerCase(), classValue = $("#filter-class").value, sectionValue = $("#filter-section").value;
  const fromText = $("#filter-id-from").value.trim(), toText = $("#filter-id-to").value.trim();
  const from = fromText === "" ? null : Number(fromText), to = toText === "" ? null : Number(toText);
  const base = state.students.filter((student) => {
    if (classValue && String(student.class || "") !== classValue) return false;
    if (sectionValue && String(student.section || "") !== sectionValue) return false;
    if (from !== null || to !== null) {
      const number = idNumber(student.student_id);
      if (number === null || (from !== null && number < from) || (to !== null && number > to)) return false;
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
    const text = [student.student_id].concat(values).filter((value) => value != null).join(" ").toLocaleLowerCase();
    return text.includes(query);
  }));
}
function renderStudents() {
  if (!$("#student-table-body")) return;
  fillSelect($("#filter-class"), state.students.map((student) => student.class), "All classes");
  fillSelect($("#filter-section"), state.students.map((student) => student.section), "All sections");
  const filtered = getFilteredStudents(); state.filteredStudents = filtered;
  $("#student-result-count").textContent = filtered.length + (filtered.length === 1 ? " record" : " records");
  $("#student-empty").hidden = filtered.length > 0;
  $("#student-table-body").innerHTML = filtered.map((student) =>
    "<tr><td><span class=\"id-badge\">" + escapeHtml(student.student_id) + "</span></td><td><strong>" + escapeHtml(displayValue(student.full_name)) +
    "</strong></td><td>" + escapeHtml(displayValue(student.class)) + "</td><td>" + escapeHtml(displayValue(student.section)) + "</td><td>" +
    escapeHtml(displayValue(student.roll)) + '</td><td><div class="row-actions"><button class="table-action" type="button" data-action="view" data-id="' +
    encodeURIComponent(student.student_id) + '">View</button><button class="table-action" type="button" data-action="edit" data-id="' +
    encodeURIComponent(student.student_id) + '">Edit</button></div></td></tr>').join("");
}
$("#student-search").addEventListener("input", renderStudents);
$("#apply-filters").addEventListener("click", renderStudents);
$("#clear-filters").addEventListener("click", () => {
  $("#student-search").value = ""; $("#filter-class").value = ""; $("#filter-section").value = "";
  $("#filter-id-from").value = ""; $("#filter-id-to").value = ""; renderStudents();
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
  $("#stat-classes").textContent = String(distinctSorted(state.students.map((student) => student.class)).length);
  const sections = new Set(state.students.filter((student) => !emptyPlaceholder(student.class) && !emptyPlaceholder(student.section)).map((student) => String(student.class).trim() + " · " + String(student.section).trim()));
  $("#stat-sections").textContent = String(sections.size); $("#stat-meetings").textContent = String(state.sessions.length);
  $("#class-breakdown").innerHTML = state.students.length ? buildBreakdown(state.students, "class") : '<p class="helper-text">No student records yet.</p>';
  const issues = getQualityIssues(), affected = new Set(issues.map((item) => item.student.student_id)).size;
  $("#overview-quality").innerHTML = '<div class="quality-summary-row' + (affected ? " warn" : "") + '"><span>Students needing review</span><strong>' + affected +
    '</strong></div><div class="quality-summary-row"><span>Missing core fields / roll conflicts</span><strong>' +
    issues.filter((item) => item.issue.startsWith("Missing") || item.issue.startsWith("Roll number")).length +
    '</strong></div><div class="quality-summary-row"><span>No student or guardian phone</span><strong>' +
    issues.filter((item) => item.issue.startsWith("No student")).length + "</strong></div>";
  const recent = state.sessions.slice().sort((a, b) => String(b.session_date).localeCompare(String(a.session_date))).slice(0, 4);
  $("#recent-sessions").innerHTML = recent.length ? recent.map((session) => {
    const marked = state.attendance.filter((record) => record.session_id === session.id).length;
    return '<div class="session-item"><div><strong>' + escapeHtml(session.title) + '</strong><small>' + escapeHtml(dateLabel(session.session_date)) + '</small></div><span class="session-count">' + marked + " marked</span></div>";
  }).join("") : '<p class="helper-text">No meeting attendance has been recorded.</p>';
}
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

function renderAttendance() {
  const select = $("#attendance-session-select"), prior = state.selectedSessionId || select.value;
  select.innerHTML = "";
  if (!state.sessions.length) { select.innerHTML = '<option value="">No meetings yet</option>'; state.selectedSessionId = ""; }
  else {
    state.sessions.slice().sort((a, b) => String(b.session_date).localeCompare(String(a.session_date))).forEach((session) => {
      const option = document.createElement("option"); option.value = session.id; option.textContent = dateLabel(session.session_date) + " · " + session.title; select.append(option);
    });
    state.selectedSessionId = state.sessions.some((session) => session.id === prior) ? prior : select.options[0].value; select.value = state.selectedSessionId;
  }
  const session = state.sessions.find((item) => item.id === state.selectedSessionId);
  $("#attendance-session-summary").textContent = session ? session.title + " · " + dateLabel(session.session_date) : "Choose a meeting or create one.";
  $("#attendance-empty").hidden = state.students.length > 0;
  const body = $("#attendance-table-body");
  if (!session || !state.students.length) {
    body.innerHTML = ""; $("#attendance-counts").innerHTML = ""; $("#save-attendance").disabled = true;
    $("#attendance-mark-status").textContent = "Select a meeting and add students."; renderSessionHistory(); return;
  }
  const saved = new Map(state.attendance.filter((record) => record.session_id === session.id).map((record) => [record.student_id, record.status]));
  const counts = { Present: 0, Absent: 0, Late: 0, "Not marked": 0 };
  body.innerHTML = sortByStudentId(state.students).map((student) => {
    const status = saved.get(student.student_id) || ""; counts[status || "Not marked"] += 1;
    return "<tr><td><span class=\"id-badge\">" + escapeHtml(student.student_id) + "</span></td><td><strong>" + escapeHtml(displayValue(student.full_name)) +
      "</strong></td><td>" + escapeHtml(displayValue(student.class)) + " / " + escapeHtml(displayValue(student.section)) +
      '</td><td><select class="status-select" data-student-id="' + encodeURIComponent(student.student_id) + '"><option value="">Choose status</option>' +
      '<option value="Present"' + (status === "Present" ? " selected" : "") + '>Present</option><option value="Absent"' + (status === "Absent" ? " selected" : "") +
      '>Absent</option><option value="Late"' + (status === "Late" ? " selected" : "") + ">Late</option></select></td></tr>";
  }).join("");
  updateAttendanceCountsFromForm();
  const complete = counts["Not marked"] === 0;
  $("#attendance-mark-status").textContent = complete ? "All students have a status." : counts["Not marked"] + " student(s) still need a status.";
  $("#save-attendance").disabled = !complete; renderSessionHistory();
}
function renderSessionHistory() {
  const history = state.sessions.slice().sort((a, b) => String(b.session_date).localeCompare(String(a.session_date)));
  $("#session-history").innerHTML = history.length ? history.map((session) => {
    const marked = state.attendance.filter((record) => record.session_id === session.id).length;
    return '<div class="session-item' + (session.id === state.selectedSessionId ? " selected" : "") + '" tabindex="0" role="button" data-session-id="' +
      escapeHtml(session.id) + '"><div><strong>' + escapeHtml(session.title) + '</strong><small>' + escapeHtml(dateLabel(session.session_date)) +
      '</small></div><span class="session-count">' + marked + "/" + state.students.length + "</span></div>";
  }).join("") : '<p class="helper-text">Your meetings will appear here.</p>';
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
  $("#session-form").reset(); $("#session-form-error").hidden = true;
  const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $("#session-form").elements.namedItem("session_date").value = now.toISOString().slice(0, 10); openDialog("session-dialog");
});
$("#session-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = new FormData(event.currentTarget), title = String(values.get("title") || "").trim(), sessionDate = String(values.get("session_date") || "").trim();
  const button = $("#create-session"); button.disabled = true;
  const { data, error } = await state.client.from("attendance_sessions").insert({ title, session_date: sessionDate }).select().single();
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

function attendanceSummary(studentId) {
  const records = state.attendance.filter((record) => record.student_id === studentId);
  const present = records.filter((record) => record.status === "Present").length, late = records.filter((record) => record.status === "Late").length;
  const absent = records.filter((record) => record.status === "Absent").length, meetings = state.sessions.length;
  return { present, late, absent, meetings, rate: meetings ? Math.round((present + late) / meetings * 100) : 0 };
}
function renderReports() {
  fillSelect($("#report-class-filter"), state.students.map((student) => student.class), "All classes");
  const classFilter = $("#report-class-filter").value, totalMarked = state.attendance.length;
  $("#report-meetings").textContent = String(state.sessions.length); $("#report-marked").textContent = String(totalMarked);
  $("#report-present").textContent = String(state.attendance.filter((row) => row.status === "Present").length);
  $("#report-late").textContent = String(state.attendance.filter((row) => row.status === "Late").length);
  const rows = sortByStudentId(state.students).filter((student) => !classFilter || String(student.class || "") === classFilter);
  $("#report-table-body").innerHTML = rows.map((student) => {
    const summary = attendanceSummary(student.student_id);
    return "<tr><td><span class=\"id-badge\">" + escapeHtml(student.student_id) + "</span></td><td><strong>" + escapeHtml(displayValue(student.full_name)) +
      "</strong></td><td>" + escapeHtml(displayValue(student.class)) + " / " + escapeHtml(displayValue(student.section)) + "</td><td>" +
      summary.present + "</td><td>" + summary.late + "</td><td>" + summary.absent + '</td><td><span class="session-count">' +
      (summary.meetings ? summary.rate + "%" : "—") + "</span></td></tr>";
  }).join("");
  $("#report-empty").hidden = state.sessions.length > 0 || state.students.length === 0;
}
$("#report-class-filter").addEventListener("change", renderReports);

function csvEscape(value) { return '"' + (value == null ? "" : String(value)).replaceAll('"', '""') + '"'; }
function downloadFile(name, content, type) {
  const blob = new Blob([content], { type }), url = URL.createObjectURL(blob), anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#export-csv").addEventListener("click", () => {
  const rows = state.filteredStudents;
  if (!rows.length) { showToast("There are no filtered records to export.", "error"); return; }
  if (!window.confirm("This CSV includes student and guardian contact details. Save it only on a private device. Continue?")) return;
  const csv = [TABLE_FIELDS.map((column) => csvEscape(column[1])).join(",")]
    .concat(rows.map((student) => TABLE_FIELDS.map(([key]) => csvEscape(student[key])).join(","))).join("\r\n");
  downloadFile("club-students-" + new Date().toISOString().slice(0, 10) + ".csv", csv, "text/csv;charset=utf-8");
});
$("#export-attendance-csv").addEventListener("click", () => {
  if (!state.attendance.length) { showToast("No attendance records to export.", "error"); return; }
  if (!window.confirm("This CSV contains student names and attendance. Save it only on a private device. Continue?")) return;
  const headers = ["Meeting date", "Meeting name", "Student ID", "Full name", "Class", "Section", "Status"];
  const sessions = new Map(state.sessions.map((session) => [session.id, session])), students = new Map(state.students.map((student) => [student.student_id, student]));
  const rows = state.attendance.map((record) => { const session = sessions.get(record.session_id) || {}, student = students.get(record.student_id) || {};
    return [session.session_date, session.title, student.student_id, student.full_name, student.class, student.section, record.status]; });
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
  const payload = JSON.stringify({ format: "club-student-database", version: 1, created_at: new Date().toISOString(),
    students: state.students, attendance_sessions: state.sessions, attendance_records: state.attendance });
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveBackupKey(passphrase, salt, "encrypt"), ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(payload));
  const envelope = { format: "club-encrypted-backup", version: 1, kdf: "PBKDF2-SHA-256", iterations: 310000,
    salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(ciphertext) };
  downloadFile("club-database-backup-" + new Date().toISOString().slice(0, 10) + ".clubbackup", JSON.stringify(envelope), "application/json");
  showToast("Encrypted backup downloaded. Store it somewhere private.", "success");
});
$("#backup-file").addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0]; if (!file) return;
  try {
    const envelope = JSON.parse(await file.text());
    if (envelope.format !== "club-encrypted-backup" || envelope.version !== 1) throw new Error("Unsupported backup file.");
    const passphrase = window.prompt("Enter the passphrase for this backup."); if (passphrase === null) return;
    const key = await deriveBackupKey(passphrase, base64ToBytes(envelope.salt), "decrypt");
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(envelope.iv) }, key, base64ToBytes(envelope.ciphertext));
    const backup = JSON.parse(new TextDecoder().decode(plaintext));
    if (backup.format !== "club-student-database" || !Array.isArray(backup.students) || !Array.isArray(backup.attendance_sessions) || !Array.isArray(backup.attendance_records)) throw new Error("Invalid backup.");
    if (!window.confirm("Merge " + backup.students.length + " students and " + backup.attendance_sessions.length + " meetings into this database? Existing records are not deleted.")) return;
    const students = backup.students.map((row) => { const clean = {}; TABLE_FIELDS.forEach(([key]) => { clean[key] = row[key] == null ? null : row[key]; }); return clean; });
    if (students.length) { const result = await state.client.from("students").upsert(students, { onConflict: "student_id" }); if (result.error) throw result.error; }
    if (backup.attendance_sessions.length) { const result = await state.client.from("attendance_sessions").upsert(backup.attendance_sessions, { onConflict: "id" }); if (result.error) throw result.error; }
    if (backup.attendance_records.length) { const result = await state.client.from("attendance_records").upsert(backup.attendance_records, { onConflict: "session_id,student_id" }); if (result.error) throw result.error; }
    await loadData(); showToast("Backup merged successfully.", "success");
  } catch (_error) { showToast("Could not restore backup. Check the file and passphrase.", "error"); }
  finally { event.target.value = ""; }
});
initialize();
