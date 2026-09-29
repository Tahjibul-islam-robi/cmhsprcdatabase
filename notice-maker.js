const fields = {
  number: document.querySelector("#notice-number"),
  date: document.querySelector("#notice-date"),
  title: document.querySelector("#notice-title"),
  body: document.querySelector("#notice-body"),
  president: document.querySelector("#president-name")
};
function displayDate(value) {
  if (!value) return "__________________";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}
function updatePreview() {
  document.querySelector("#preview-number").textContent = "Notice No: " + (fields.number.value.trim() || "__________________");
  document.querySelector("#preview-date").textContent = "Date: " + displayDate(fields.date.value);
  document.querySelector("#preview-title").textContent = fields.title.value.trim() || "Notice title";
  document.querySelector("#preview-body").textContent = fields.body.value.trim() || "Your notice text will appear here.";
  document.querySelector("#preview-president").textContent = fields.president.value.trim() || "President";
}
Object.values(fields).forEach((field) => field.addEventListener("input", updatePreview));
const today = new Date();
document.querySelector("#notice-date").value = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
document.querySelector("#print-notice").addEventListener("click", () => window.print());
document.querySelector("#clear-notice").addEventListener("click", () => {
  fields.number.value = "";
  fields.date.value = "";
  fields.title.value = "";
  fields.body.value = "";
  fields.president.value = "";
  updatePreview();
});
updatePreview();
