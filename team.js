import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.CLUB_SUPABASE_CONFIG || {};
const categories = [
  { role: "Delegate", list: "delegates-list", count: "delegates-count", empty: "No delegates have been listed yet." },
  { role: "Administrator (ADM)", list: "admins-list", count: "admins-count", empty: "No ADM administrators were found." },
  { role: "Trainer (EM)", list: "trainers-list", count: "trainers-count", empty: "No EM trainers have been assigned yet." },
  { role: "Assistant Trainer (EM)", list: "assistant-trainers-list", count: "assistant-trainers-count", empty: "No EM assistant trainers have been assigned yet." }
];
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

async function loadTeam() {
  if (!config.url || !config.publishableKey) throw new Error("Supabase settings are missing. Check admin/config.js.");
  const client = createClient(config.url, config.publishableKey);
  const { data, error } = await client.rpc("get_public_club_team");
  if (error) throw new Error("Could not load the club team. Run the latest supabase/schema.sql. " + error.message);
  const membersByRole = new Map(categories.map((category) => [category.role, []]));
  (data || []).forEach((member) => {
    if (membersByRole.has(member.team_role)) membersByRole.get(member.team_role).push(member.full_name);
  });
  categories.forEach((category) => {
    const names = membersByRole.get(category.role).filter(Boolean).sort((a, b) => a.localeCompare(b));
    document.querySelector("#" + category.count).textContent = String(names.length);
    document.querySelector("#" + category.list).innerHTML = names.length
      ? names.map((name) => "<li>" + escapeHtml(name) + "</li>").join("")
      : '<li class="team-empty">' + escapeHtml(category.empty) + "</li>";
  });
}

loadTeam().catch((error) => {
  document.querySelector("#team-status").textContent = error.message || "The club team could not load. Please refresh later.";
  categories.forEach((category) => {
    document.querySelector("#" + category.list).innerHTML = '<li class="team-empty">Team list temporarily unavailable.</li>';
    document.querySelector("#" + category.count).textContent = "—";
  });
});
