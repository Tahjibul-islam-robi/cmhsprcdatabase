import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.CLUB_SUPABASE_CONFIG || {};
const statusEl = document.querySelector("#portal-status");
const batchList = document.querySelector("#batch-list");
const announceList = document.querySelector("#announcement-list");
const materialList = document.querySelector("#material-list");
const rosterBody = document.querySelector("#roster-body");
const announcementArchiveLink = document.querySelector("#announcement-archive-link");
const materialArchiveLink = document.querySelector("#material-archive-link");
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const ARTICLE_TAGS = new Set(["p", "div", "br", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "pre", "code", "a"]);
let client;
let batches = [];
let roster = [];
let announcements = [];
let materials = [];
let announcementTotal = 0;
let materialTotal = 0;
let loadedBatch = "";
let batchLoadToken = 0;
let selectedBatch = "";

function setError(message) { statusEl.textContent = message; }
function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
function richContent(markup) {
  const text = String(markup || "");
  const parsed = new DOMParser().parseFromString(text, "text/html");
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
      try {
        const link = new URL(node.getAttribute("href") || "", window.location.href);
        if (["http:", "https:", "mailto:"].includes(link.protocol)) {
          element.setAttribute("href", link.href); element.setAttribute("target", "_blank"); element.setAttribute("rel", "noopener noreferrer");
        }
      } catch { /* discard invalid link targets */ }
    }
    children.forEach((child) => element.append(child));
    return element;
  };
  const container = safeDocument.createElement("div");
  const hasMarkup = /<\/?(?:p|div|br|h2|h3|strong|b|em|i|u|ul|ol|li|blockquote|pre|code|a)\b/i.test(text);
  if (!hasMarkup) {
    const p = safeDocument.createElement("p"); p.textContent = text; container.append(p);
  } else Array.from(parsed.body.childNodes).map(copyNode).forEach((child) => container.append(child));
  return container.innerHTML;
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
  batchList.innerHTML = batches.map((batch) => '<button class="batch-choice" type="button" data-batch="' + esc(batch.id) + '" aria-current="' + (batch.id === selectedBatch) + '"><span><strong>Batch ' + esc(batch.batch_number) + '</strong><small>' + esc(batch.name) + ' · ' + batch.student_count + (batch.student_count === 1 ? ' member' : ' members') + '</small></span><span class="batch-arrow">›</span></button>').join("");
  renderSelectedBatch();
}
function renderSelectedBatch() {
  const batch = batches.find((item) => item.id === selectedBatch);
  if (!batch) {
    announcementArchiveLink.hidden = true; materialArchiveLink.hidden = true;
    announceList.innerHTML = '<p class="empty">Choose a batch to see its updates.</p>';
    materialList.innerHTML = '<p class="empty">Materials shared by the club will appear here.</p>';
    rosterBody.innerHTML = '<tr><td colspan="2" class="empty">Choose a batch to view its roster.</td></tr>';
    document.querySelector("#roster-count").textContent = "";
    return;
  }
  if (loadedBatch !== batch.id) {
    announcementArchiveLink.hidden = true; materialArchiveLink.hidden = true;
    announceList.innerHTML = '<p class="loading">Loading recent announcements…</p>';
    materialList.innerHTML = '<p class="loading">Loading recent materials…</p>';
    rosterBody.innerHTML = '<tr><td colspan="2" class="loading">Loading roster…</td></tr>';
    return;
  }
  announcementArchiveLink.hidden = announcementTotal <= 2;
  announcementArchiveLink.href = "./archive.html?batch=" + encodeURIComponent(batch.id) + "&category=announcement";
  announcementArchiveLink.textContent = "Older announcements (" + Math.max(0, announcementTotal - 2) + ") →";
  materialArchiveLink.hidden = materialTotal <= 2;
  materialArchiveLink.href = "./archive.html?batch=" + encodeURIComponent(batch.id) + "&category=material";
  materialArchiveLink.textContent = "Older materials (" + Math.max(0, materialTotal - 2) + ") →";
  announceList.innerHTML = announcements.length ? announcements.map((item) => '<article class="post-card"><div class="post-meta"><span>' + esc(dateLabel(item.created_at)) + '</span><span>·</span><span>' + (item.object_path ? "PDF notice" : "Club update") + '</span></div><h3>' + esc(item.title) + '</h3>' + (item.body ? '<div class="rich-content post-body">' + richContent(item.body) + '</div>' : "") + fileLink(item, item.file_name || "Read PDF notice") + '</article>').join("") : '<p class="empty">No announcements for this batch yet.</p>';
  materialList.innerHTML = materials.length ? materials.map((item) => {
    const downloadUrl = item.object_path ? client.storage.from("club-materials").getPublicUrl(item.object_path).data.publicUrl : "";
    const content = item.body ? '<div class="rich-content">' + richContent(item.body) + '</div>' : (item.file_name ? '<p>' + esc(item.file_name) + '</p>' : "");
    const attachment = downloadUrl ? '<a class="download" href="' + esc(downloadUrl) + '" target="_blank" rel="noopener noreferrer" download>Open material ↗</a>' : "";
    return '<article class="material-card"><div class="material-copy"><h3>' + esc(item.title) + '</h3><div class="post-meta">' + esc(dateLabel(item.created_at)) + '</div>' + content + '</div>' + attachment + '</article>';
  }).join("") : '<p class="empty">No materials for this batch yet.</p>';
  const students = roster.slice().sort((a, b) => a.student_id.localeCompare(b.student_id, undefined, { numeric: true, sensitivity: "base" }));
  document.querySelector("#roster-count").textContent = students.length + (students.length === 1 ? " student" : " students");
  rosterBody.innerHTML = students.length ? students.map((student) => '<tr><td>' + esc(student.student_id) + '</td><td>' + esc(student.full_name) + '</td></tr>').join("") : '<tr><td colspan="2" class="empty">No students have been added to this batch yet.</td></tr>';
}
async function loadSelectedBatch() {
  const batchId = selectedBatch, token = ++batchLoadToken;
  statusEl.textContent = ""; loadedBatch = ""; roster = []; announcements = []; materials = []; announcementTotal = 0; materialTotal = 0;
  renderSelectedBatch();
  if (!batchId) return;
  const [rosterResult, announcementResult, materialResult] = await Promise.all([
    client.rpc("get_public_batch_roster", { p_batch_id: batchId }),
    client.rpc("get_public_batch_resources_page", { p_batch_id: batchId, p_category: "announcement", p_limit: 2, p_offset: 0 }),
    client.rpc("get_public_batch_resources_page", { p_batch_id: batchId, p_category: "material", p_limit: 2, p_offset: 0 })
  ]);
  if (token !== batchLoadToken || selectedBatch !== batchId) return;
  const failed = [rosterResult, announcementResult, materialResult].find((result) => result.error);
  if (failed) {
    setError("Could not load this batch. Apply the latest supabase/schema.sql. " + failed.error.message);
    announceList.innerHTML = '<p class="empty">Batch updates are temporarily unavailable.</p>';
    materialList.innerHTML = '<p class="empty">Batch materials are temporarily unavailable.</p>';
    rosterBody.innerHTML = '<tr><td colspan="2" class="empty">Batch roster is temporarily unavailable.</td></tr>';
    document.querySelector("#roster-count").textContent = "";
    return;
  }
  roster = rosterResult.data || [];
  announcements = announcementResult.data || [];
  materials = materialResult.data || [];
  announcementTotal = Number(announcements[0]?.total_count || 0);
  materialTotal = Number(materials[0]?.total_count || 0);
  loadedBatch = batchId;
  renderSelectedBatch();
}
batchList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-batch]");
  if (!button) return;
  selectedBatch = button.dataset.batch;
  renderBatchButtons();
  loadSelectedBatch().catch((error) => setError(error.message || "This batch could not load."));
});

async function start() {
  if (!config.url || !config.publishableKey) {
    throw new Error("Supabase portal settings are missing. Check admin/config.js.");
  }
  client = createClient(config.url, config.publishableKey);
  const batchResult = await client.rpc("get_public_batches");
  if (batchResult.error) throw new Error("Could not load public batches. Apply the latest supabase/schema.sql. " + batchResult.error.message);
  batches = [];
  (batchResult.data || []).forEach((row) => batches.push({ id: row.batch_id, batch_number: row.batch_number, name: row.batch_name, student_count: row.student_count }));
  batches.sort((a, b) => a.batch_number - b.batch_number);
  selectedBatch = batches[0]?.id || "";
  renderBatchButtons();
  await loadSelectedBatch();
}
start().catch((error) => {
  setError(error.message || "The club portal could not load. Please refresh later.");
  batchList.innerHTML = '<p class="empty">The public blog is temporarily unavailable.</p>';
  announceList.innerHTML = '<p class="empty">Please try again later.</p>';
  materialList.innerHTML = '<p class="empty">Please try again later.</p>';
});
