import { getClient, escapeHtml, dateLabel, richContent, pageNav, pageFooter } from "./site-data.js";

document.querySelector("#site-nav").innerHTML = pageNav("blog");
document.querySelector("#site-footer").innerHTML = pageFooter();
let client;
const postsEl = document.querySelector("#blog-posts"), moreButton = document.querySelector("#blog-more");
const pageSize = 12;
let offset = 0, totalCount = 0, token = 0;
function renderPost(post) {
  const label = post.category === "material" ? "Class material" : "Announcement";
  const fileUrl = post.object_path ? client.storage.from("club-materials").getPublicUrl(post.object_path).data.publicUrl : "";
  const file = fileUrl ? '<a class="site-post-file" href="' + escapeHtml(fileUrl) + '" target="_blank" rel="noopener noreferrer">Open attachment ↗</a>' : "";
  return '<article class="site-post"><div class="site-meta"><time>' + escapeHtml(dateLabel(post.created_at)) + '</time><span class="site-tag">' + label + '</span><span>' + escapeHtml(post.batch_name || "Club") + '</span></div><h2>' + escapeHtml(post.title) + '</h2><div class="site-prose-rich">' + richContent(post.body) + '</div>' + file + '</article>';
}
async function loadPosts(reset) {
  const current = ++token, status = document.querySelector("#blog-status");
  client = getClient();
  moreButton.disabled = true; status.textContent = "";
  if (reset) { offset = 0; totalCount = 0; postsEl.innerHTML = '<p class="site-empty">Loading posts…</p>'; }
  moreButton.hidden = true;
  const { data, error } = await client.rpc("get_public_site_blog", { p_limit: pageSize, p_offset: offset });
  if (current !== token) return;
  moreButton.disabled = false;
  if (error) throw new Error("Could not load the blog. Run the latest supabase/schema.sql. " + error.message);
  const rows = data || [];
  if (reset) totalCount = Number(rows[0]?.total_count || 0);
  document.querySelector("#blog-count").textContent = totalCount + (totalCount === 1 ? " post" : " posts");
  if (reset && !rows.length) postsEl.innerHTML = '<p class="site-empty">No posts have been published yet.</p>';
  else postsEl.insertAdjacentHTML("beforeend", rows.map(renderPost).join(""));
  offset += rows.length;
  moreButton.hidden = offset >= totalCount || rows.length < pageSize;
}
moreButton.addEventListener("click", () => loadPosts(false).catch((error) => { moreButton.disabled = false; document.querySelector("#blog-status").textContent = error.message; }));
loadPosts(true).catch((error) => { document.querySelector("#blog-status").textContent = error.message || "The blog could not load."; postsEl.innerHTML = '<p class="site-empty">Blog posts are temporarily unavailable.</p>'; });
