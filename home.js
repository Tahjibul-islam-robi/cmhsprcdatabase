import { getClient, escapeHtml, dateLabel, richContent, pageNav, pageFooter } from "./site-data.js";

const $ = (selector) => document.querySelector(selector);
const eventCard = (event) => '<article class="site-card site-event-card"><div class="site-meta"><time>' + escapeHtml(dateLabel(event.event_date)) + (event.event_time ? " · " + escapeHtml(event.event_time) : "") + '</time><span class="site-tag">' + escapeHtml(event.event_type) + '</span></div><h3>' + escapeHtml(event.title) + '</h3><p>' + escapeHtml(event.summary || event.location || "Club event") + '</p></article>';
const postCard = (post) => '<article class="site-card"><div class="site-meta"><span>' + escapeHtml(dateLabel(post.created_at)) + '</span><span class="site-tag">' + (post.category === "material" ? "Class material" : "Announcement") + '</span></div><h3>' + escapeHtml(post.title) + '</h3><p>' + escapeHtml(post.batch_name || "Club") + '</p><div class="site-prose-rich">' + richContent(post.body) + '</div></article>';

async function loadHome() {
  const client = getClient();
  const [pages, events, posts, team] = await Promise.all([
    client.rpc("get_public_site_pages"), client.rpc("get_public_site_events", { p_limit: 3 }),
    client.rpc("get_public_site_blog", { p_limit: 3, p_offset: 0 }), client.rpc("get_public_club_team")
  ]);
  const failures = [pages, events, posts, team].filter((result) => result.error);
  if (failures.length) $("#home-status").textContent = "Some website content is unavailable. Apply the latest supabase/schema.sql. " + failures[0].error.message;
  const home = (pages.data || []).find((item) => item.slug === "home");
  const join = (pages.data || []).find((item) => item.slug === "join");
  if (home) {
    $("#home-title").innerHTML = escapeHtml(home.title) + "<br><span>" + escapeHtml(home.subtitle) + "</span>";
    $("#home-subtitle").textContent = home.hero_intro || "";
    $("#about-title").textContent = home.section_title || "About the club";
    $("#about-body").textContent = home.body || "";
  }
  if (join) { $("#home-join-title").textContent = join.title || "Join the club"; $("#home-join-intro").textContent = join.subtitle || join.hero_intro || ""; }
  const eventRows = events.data || [];
  $("#home-events").innerHTML = eventRows.length ? eventRows.map(eventCard).join("") : '<p class="site-empty">No events have been published yet. Check back for club updates.</p>';
  const postRows = posts.data || [];
  $("#home-blog").innerHTML = postRows.length ? postRows.map(postCard).join("") : '<p class="site-empty">No posts have been published yet.</p>';
  const members = team.data || [];
  const featured = members.slice(0, 6);
  $("#home-team").innerHTML = featured.length ? featured.map((member) => '<span class="site-person"><strong>' + escapeHtml(member.full_name) + '</strong><span>' + escapeHtml(member.position_title || member.team_role) + '</span></span>').join("") : '<p class="site-empty">The club team will be listed here.</p>';
}

document.querySelector("#site-nav").innerHTML = pageNav("home");
document.querySelector("#site-footer").innerHTML = pageFooter();
loadHome().catch((error) => { $("#home-status").textContent = error.message || "The website could not load. Please refresh later."; });
