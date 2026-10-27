import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.CLUB_SUPABASE_CONFIG || {};
let client;
export function getClient() {
  if (client) return client;
  if (!config.url || !config.publishableKey) throw new Error("Website database settings are missing. Check admin/config.js.");
  client = createClient(config.url, config.publishableKey);
  return client;
}
export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export function dateLabel(value) {
  const date = new Date(String(value || "").slice(0, 10) + "T00:00:00");
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
const ARTICLE_TAGS = new Set(["p", "div", "br", "h2", "h3", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "pre", "code", "a"]);
export function richContent(markup) {
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
        if (["http:", "https:", "mailto:"].includes(link.protocol)) { element.setAttribute("href", link.href); element.setAttribute("target", "_blank"); element.setAttribute("rel", "noopener noreferrer"); }
      } catch { /* discard invalid link targets */ }
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
export function pageNav(active) {
  return '<header class="site-header"><a class="brand" href="./" aria-label="Club home"><img src="./logo.png" alt="Club logo"><span>Cumilla Modern High School<br><strong>Programming And Robotics Club</strong></span></a><nav>' +
    [['home', './', 'Home'], ['about', './about.html', 'About Us'], ['events', './events.html', 'Events'], ['blog', './blog.html', 'Blog'], ['team', './team.html', 'Executives'], ['join', './join.html', 'Join Us']]
      .map(([key, href, label]) => '<a href="' + href + '"' + (key === active ? ' aria-current="page"' : '') + '>' + label + '</a>').join("") +
    '</nav></header>';
}
export function pageFooter() {
  return '<footer><span>Cumilla Modern High School Programming And Robotics Club</span><span><a href="./cmhsprc/">Club rules</a> · <a href="./batch-portal.html">Batch resources</a> · <a href="./admin/">Admin</a></span></footer>';
}
