// "Umumiy kimyo" (General chemistry) screen. Opened with the header button or #kimyo, a topic with #kimyo/<id>.
// While the list is empty the screen shows a "topics coming soon" message.
//
// Topic format (every language has the same shape; uz is used if a language is missing):
// { id: "mole", icon: "⚖️",
//   uz: { title: "Mol va molyar massa", intro: "...",
//         blocks: [ { h: "Sarlavha", p: "Matn", formula: "n = m / M", items: ["...", "..."],
//                     table: { head: ["Ustun", "..."], rows: [["katak", "..."]] } } ] },
//   en: { ... }, ru: { ... } }
// In a block only "h" is required; p, formula, items and table are optional.
window.PT_CHEM = {
  topics: []
};
