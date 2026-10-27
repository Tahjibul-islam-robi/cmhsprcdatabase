import { getClient, escapeHtml, pageNav, pageFooter } from "./site-data.js";

document.querySelector("#site-nav").innerHTML = pageNav("about");
document.querySelector("#site-footer").innerHTML = pageFooter();

async function loadAboutPage() {
  const { data, error } = await getClient().rpc("get_public_site_pages");
  if (error) throw new Error("Could not load About Us. Apply the latest supabase/schema.sql. " + error.message);
  const page = (data || []).find((item) => item.slug === "about");
  if (!page) throw new Error("About Us content is not set up yet. Apply the latest supabase/schema.sql.");
  document.querySelector("#about-title").textContent = page.title || "About Us";
  document.querySelector("#about-subtitle").textContent = page.subtitle || "";
  document.querySelector("#about-intro").textContent = page.hero_intro || "";
  document.querySelector("#about-story-title").textContent = page.section_title || "Our story and activities";
  document.querySelector("#about-body").textContent = page.body || "";
  const facts = [1, 2, 3].map((number) => ({
    title: page["highlight_" + ["one", "two", "three"][number - 1] + "_title"],
    body: page["highlight_" + ["one", "two", "three"][number - 1] + "_body"]
  })).filter((fact) => fact.title || fact.body);
  document.querySelector("#about-facts").innerHTML = facts.map((fact) => '<article class="site-card"><span>' + escapeHtml(fact.title) + '</span><strong>' + escapeHtml(fact.body) + '</strong></article>').join("");
}

loadAboutPage().catch((error) => { document.querySelector("#about-status").textContent = error.message || "About Us could not load."; });
