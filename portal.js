import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.CLUB_SUPABASE_CONFIG || {};
const statusEl = document.querySelector("#portal-status");
const batchList = document.querySelector("#batch-list");
const announceList = document.querySelector("#announcement-list");
const materialList = document.querySelector("#material-list");
const rosterBody = document.querySelector("#roster-body");
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
let client;
let batches = [];
let posts = [];
let selectedBatch = "";

function setError(message) { statusEl.textContent = message; }
function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
function fileLink(item, label) {
  if (!item.object_path) return "";
  const url = client.storage.from("club-materials").getPublicUrl(item.object_path).data.publicUrl;
  return '<a class="post-file" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" download>' + esc(label || item.file_name || "Open attachment") + " ↗</a>";
}
function renderBatchButtons() {
  document.querySelector("#batch-count").textContent = batches.length + (batches.length === 1 ? " batch" : " batches");
  if (!batches.length) {
    batchList.innerHTML = '<p class="empty">No batches have been published yet.</p>';
    renderSelectedBatch();
    return;
  }
  batchList.innerHTML = batches.map((batch) => '<button class="batch-choice" type="button" data-batch="' + esc(batch.id) + '" aria-current="' + (batch.id === selectedBatch) + '"><span><strong>Batch ' + esc(batch.batch_number) + '</strong><small>' + esc(batch.name) + ' · ' + batch.students.length + (batch.students.length === 1 ? ' member' : ' members') + '</small></span><span class="batch-arrow">›</span></button>').join("");
  renderSelectedBatch();
}
function renderSelectedBatch() {
  const batch = batches.find((item) => item.id === selectedBatch);
  if (!batch) {
    announceList.innerHTML = '<p class="empty">Choose a batch to see its updates.</p>';
    materialList.innerHTML = '<p class="empty">Materials shared by the club will appear here.</p>';
    rosterBody.innerHTML = '<tr><td colspan="2" class="empty">Choose a batch to view its roster.</td></tr>';
    document.querySelector("#roster-count").textContent = "";
    return;
  }
  const selectedPosts = posts.filter((item) => item.batch_id === batch.id);
  const announcements = selectedPosts.filter((item) => item.category === "announcement");
  const materials = selectedPosts.filter((item) => item.category === "material");
  announceList.innerHTML = announcements.length ? announcements.map((item) => '<article class="post-card"><div class="post-meta"><span>' + esc(dateLabel(item.created_at)) + '</span><span>·</span><span>' + (item.object_path ? "PDF notice" : "Club update") + '</span></div><h3>' + esc(item.title) + '</h3>' + (item.body ? '<p class="post-body">' + esc(item.body) + '</p>' : "") + fileLink(item, item.file_name || "Read PDF notice") + '</article>').join("") : '<p class="empty">No announcements for this batch yet.</p>';
  materialList.innerHTML = materials.length ? materials.map((item) => '<article class="material-card"><div><h3>' + esc(item.title) + '</h3>' + (item.body ? '<p>' + esc(item.body) + '</p>' : '<p>' + esc(item.file_name || "Learning resource") + '</p>') + '</div><a class="download" href="' + esc(client.storage.from("club-materials").getPublicUrl(item.object_path).data.publicUrl) + '" target="_blank" rel="noopener noreferrer" download>Open material ↗</a></article>').join("") : '<p class="empty">No materials for this batch yet.</p>';
  const students = batch.students.slice().sort((a, b) => a.student_id.localeCompare(b.student_id, undefined, { numeric: true, sensitivity: "base" }));
  document.querySelector("#roster-count").textContent = students.length + (students.length === 1 ? " student" : " students");
  rosterBody.innerHTML = students.length ? students.map((student) => '<tr><td>' + esc(student.student_id) + '</td><td>' + esc(student.full_name) + '</td></tr>').join("") : '<tr><td colspan="2" class="empty">No students have been added to this batch yet.</td></tr>';
}
batchList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-batch]");
  if (!button) return;
  selectedBatch = button.dataset.batch;
  renderBatchButtons();
});

async function start() {
  if (!config.url || !config.publishableKey) {
    throw new Error("Supabase portal settings are missing. Check admin/config.js.");
  }
  client = createClient(config.url, config.publishableKey);
  const [batchResult, postResult] = await Promise.all([
    client.rpc("get_public_batches"),
    client.rpc("get_public_batch_resources")
  ]);
  if (batchResult.error) throw new Error("Could not load public batches. Apply the latest supabase/schema.sql. " + batchResult.error.message);
  if (postResult.error) throw new Error("Could not load the public blog. Apply the latest supabase/schema.sql. " + postResult.error.message);
  batches = [];
  const byId = new Map();
  (batchResult.data || []).forEach((row) => {
    if (!byId.has(row.batch_id)) {
      const batch = { id: row.batch_id, batch_number: row.batch_number, name: row.batch_name, students: [] };
      byId.set(row.batch_id, batch); batches.push(batch);
    }
    if (row.student_id) byId.get(row.batch_id).students.push({ student_id: row.student_id, full_name: row.full_name });
  });
  posts = postResult.data || [];
  batches.sort((a, b) => a.batch_number - b.batch_number);
  selectedBatch = batches[0]?.id || "";
  renderBatchButtons();
}
start().catch((error) => {
  setError(error.message || "The club portal could not load. Please refresh later.");
  batchList.innerHTML = '<p class="empty">The public blog is temporarily unavailable.</p>';
  announceList.innerHTML = '<p class="empty">Please try again later.</p>';
  materialList.innerHTML = '<p class="empty">Please try again later.</p>';
});
