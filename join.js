import { getClient, pageNav, pageFooter } from "./site-data.js";

document.querySelector("#site-nav").innerHTML = pageNav("join");
document.querySelector("#site-footer").innerHTML = pageFooter();
async function loadJoinPage() {
  const { data, error } = await getClient().rpc("get_public_site_pages");
  if (error) throw new Error("Could not load the Join Us page. Run the latest supabase/schema.sql. " + error.message);
  const page = (data || []).find((item) => item.slug === "join");
  if (!page) return;
  document.querySelector("#join-title").textContent = page.title || "Join the club.";
  document.querySelector("#join-subtitle").textContent = page.subtitle || "";
  document.querySelector("#join-section-title").textContent = page.section_title || "How to join";
  document.querySelector("#join-body").textContent = page.body || "";
}
loadJoinPage().catch((error) => { document.querySelector("#join-status").textContent = error.message || "The Join Us page could not load."; });
