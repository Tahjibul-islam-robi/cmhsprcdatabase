import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.CLUB_SUPABASE_CONFIG || {};
const statusEl = document.querySelector("#portal-status");
const batchList = document.querySelector("#batch-list");
const announceList = document.querySelector("#announcement-list");
const materialList = document.querySelector("#material-list");
const rosterBody = document.querySelector("#roster-body");
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const ARTICLE_TAGS = new Set(["p", "div", "br", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "pre", "code", "a"]);
let client;
let batches = [];
let posts = [];
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
  announceList.innerHTML = announcements.length ? announcements.map((item) => '<article class="post-card"><div class="post-meta"><span>' + esc(dateLabel(item.created_at)) + '</span><span>·</span><span>' + (item.object_path ? "PDF notice" : "Club update") + '</span></div><h3>' + esc(item.title) + '</h3>' + (item.body ? '<div class="rich-content post-body">' + richContent(item.body) + '</div>' : "") + fileLink(item, item.file_name || "Read PDF notice") + '</article>').join("") : '<p class="empty">No announcements for this batch yet.</p>';
  materialList.innerHTML = materials.length ? materials.map((item) => {
    const downloadUrl = item.object_path ? client.storage.from("club-materials").getPublicUrl(item.object_path).data.publicUrl : "";
    const content = item.body ? '<div class="rich-content">' + richContent(item.body) + '</div>' : (item.file_name ? '<p>' + esc(item.file_name) + '</p>' : "");
    const attachment = downloadUrl ? '<a class="download" href="' + esc(downloadUrl) + '" target="_blank" rel="noopener noreferrer" download>Open material ↗</a>' : "";
    return '<article class="material-card"><div class="material-copy"><h3>' + esc(item.title) + '</h3><div class="post-meta">' + esc(dateLabel(item.created_at)) + '</div>' + content + '</div>' + attachment + '</article>';
  }).join("") : '<p class="empty">No materials for this batch yet.</p>';
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
