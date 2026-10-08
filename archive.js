import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.CLUB_SUPABASE_CONFIG || {};
const batchSelect = document.querySelector("#archive-batch");
const categorySelect = document.querySelector("#archive-category");
const postsEl = document.querySelector("#archive-posts");
const statusEl = document.querySelector("#archive-status");
const moreButton = document.querySelector("#archive-more");
const countEl = document.querySelector("#archive-count");
const pageSize = 10;
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const ARTICLE_TAGS = new Set(["p", "div", "br", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "pre", "code", "a"]);
let client;
let offset = 2;
let totalCount = 0;
let requestToken = 0;

function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
function richContent(markup) {
  const text = String(markup || ""), parsed = new DOMParser().parseFromString(text, "text/html");
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
      } catch { /* discard invalid links */ }
    }
    children.forEach((child) => element.append(child));
    return element;
  };
  const container = safeDocument.createElement("div");
  const hasMarkup = /<\/?(?:p|div|br|h2|h3|strong|b|em|i|u|ul|ol|li|blockquote|pre|code|a)\b/i.test(text);
  if (!hasMarkup) { const p = safeDocument.createElement("p"); p.textContent = text; container.append(p); }
  else Array.from(parsed.body.childNodes).map(copyNode).forEach((child) => container.append(child));
  return container.innerHTML;
}
function renderPost(item) {
  const isAnnouncement = item.category === "announcement";
  if (isAnnouncement) {
    const fileUrl = item.object_path ? client.storage.from("club-materials").getPublicUrl(item.object_path).data.publicUrl : "";
    const file = fileUrl ? '<a class="post-file" href="' + esc(fileUrl) + '" target="_blank" rel="noopener noreferrer" download>' + esc(item.file_name || "Read PDF notice") + " ↗</a>" : "";
    return '<article class="post-card"><div class="post-meta"><span>' + esc(dateLabel(item.created_at)) + '</span><span>·</span><span>' + (item.object_path ? "PDF notice" : "Club update") + '</span></div><h3>' + esc(item.title) + '</h3>' + (item.body ? '<div class="rich-content post-body">' + richContent(item.body) + '</div>' : "") + file + "</article>";
  }
  const fileUrl = item.object_path ? client.storage.from("club-materials").getPublicUrl(item.object_path).data.publicUrl : "";
  const content = item.body ? '<div class="rich-content">' + richContent(item.body) + '</div>' : (item.file_name ? '<p>' + esc(item.file_name) + '</p>' : "");
  const attachment = fileUrl ? '<a class="download" href="' + esc(fileUrl) + '" target="_blank" rel="noopener noreferrer" download>Open material ↗</a>' : "";
  return '<article class="material-card"><div class="material-copy"><h3>' + esc(item.title) + '</h3><div class="post-meta">' + esc(dateLabel(item.created_at)) + '</div>' + content + '</div>' + attachment + '</article>';
}
function updateUrl() {
  const url = new URL(window.location.href);
  if (batchSelect.value) url.searchParams.set("batch", batchSelect.value); else url.searchParams.delete("batch");
  url.searchParams.set("category", categorySelect.value);
  window.history.replaceState({}, "", url);
}
async function loadPosts(reset) {
  const batchId = batchSelect.value, category = categorySelect.value, token = ++requestToken;
  statusEl.textContent = ""; moreButton.disabled = true;
  if (reset) { offset = 2; totalCount = 0; postsEl.innerHTML = '<p class="loading">Loading older posts…</p>'; }
  moreButton.hidden = true;
  updateUrl();
  if (!batchId) { postsEl.innerHTML = '<p class="empty">Choose a batch to view its archive.</p>'; countEl.textContent = ""; return; }
  const result = await client.rpc("get_public_batch_resources_page", {
    p_batch_id: batchId, p_category: category, p_limit: pageSize, p_offset: offset
  });
  if (token !== requestToken) return;
  moreButton.disabled = false;
  if (result.error) throw new Error("Could not load archived posts. Apply the latest supabase/schema.sql. " + result.error.message);
  const rows = result.data || [];
  if (reset) totalCount = Number(rows[0]?.total_count || 0);
  countEl.textContent = totalCount > 2 ? (totalCount - 2) + " older posts" : "";
  if (reset && !rows.length) postsEl.innerHTML = '<p class="empty">No older posts in this category for this batch yet.</p>';
  else postsEl.insertAdjacentHTML("beforeend", rows.map(renderPost).join(""));
  offset += rows.length;
  moreButton.hidden = offset >= totalCount || rows.length < pageSize;
}

async function start() {
  if (!config.url || !config.publishableKey) throw new Error("Supabase settings are missing. Check admin/config.js.");
  client = createClient(config.url, config.publishableKey);
  const result = await client.rpc("get_public_batches");
  if (result.error) throw new Error("Could not load batches. Apply the latest supabase/schema.sql. " + result.error.message);
  const batches = result.data || [], params = new URLSearchParams(window.location.search);
  batchSelect.innerHTML = batches.length ? batches.map((batch) => '<option value="' + esc(batch.batch_id) + '">Batch ' + esc(batch.batch_number) + " · " + esc(batch.batch_name) + "</option>").join("") : '<option value="">No batches yet</option>';
  const requestedBatch = params.get("batch");
  if (requestedBatch && batches.some((batch) => batch.batch_id === requestedBatch)) batchSelect.value = requestedBatch;
  const requestedCategory = params.get("category");
  if (["announcement", "material"].includes(requestedCategory)) categorySelect.value = requestedCategory;
  document.querySelector("#archive-title").textContent = categorySelect.value === "material" ? "Batch materials" : "Blog & announcements";
  if (!batches.length) { postsEl.innerHTML = '<p class="empty">No batches have been created yet.</p>'; countEl.textContent = ""; return; }
  await loadPosts(true);
}

batchSelect.addEventListener("change", () => loadPosts(true).catch((error) => { statusEl.textContent = error.message; }));
categorySelect.addEventListener("change", () => {
  document.querySelector("#archive-title").textContent = categorySelect.value === "material" ? "Batch materials" : "Blog & announcements";
  loadPosts(true).catch((error) => { statusEl.textContent = error.message; });
});
moreButton.addEventListener("click", () => loadPosts(false).catch((error) => { moreButton.disabled = false; statusEl.textContent = error.message; }));
start().catch((error) => { statusEl.textContent = error.message || "The archive could not load. Please refresh later."; postsEl.innerHTML = '<p class="empty">Archived posts are temporarily unavailable.</p>'; });
