// config.js
let GLOBAL_PASSWORD = localStorage
  .getItem("globalPassword") || "";
const DEFAULT_EMOJI = () =>
  EMOJI_CHOICES?.[0] || "🔗";
const colorNames = ["black", "white",
  "gray", "lightgray", "red",
  "orange", "yellow", "gold", "green",
  "limegreen", "teal", "cyan", "blue",
  "skyblue", "navy", "indigo",
  "purple", "violet", "pink", "brown"
];
const EMOJI_CHOICES = [
  "🔗", // premier de la liste emoji par defaut
  "⭐", // Star / Favorite
  "💡", // Idea / Lightbulb
  "⚙️", // Gear / Settings
  "🛠️", "🔒", // Lock / Security
  "✉️", // Email / Message
  "📆", // Calendar / Date
  "📈", // Chart Increasing / Growth
  "📝", // Memo / Writing
  "📁", // Folder
  "📖", // Open Book / Read
  "📚", // Books / Library
  "💼", // Briefcase / Business
  "📷", // Camera / Photography
  "🖼️", // Picture / Image
  "🎞️", "🖌️",
  "⏰", // Alarm Clock / Time
  "🧑‍💻", // Technologist / Coding
  "💻", // Computer / Tech
  "👨‍⚕️", // Doctor / Healthcare
  "🔬", // Microscope / Science
  "🚑" // Ambulance / Emergency
];
const tagcolors = [
  "#d32f2f", // vivid red
  "#1976d2", // bold blue
  "#388e3c", // rich green
  "#fbc02d", // vibrant yellow (on black text)
  "#7b1fa2", // deep purple
  "#f57c00", // bright orange
  "#00796b", // teal green
  "#c2185b", // raspberry
  "#512da8", // indigo
  "#0288d1", // sky blue
  "#c62828", // crimson
  "#2e7d32", // forest green
  "#ff5722", // neon orange
  "#5d4037", // chocolate
  "#0097a7", // deep cyan
  "#303f9f" // dark indigo
];
const DEFAULT_SHORTCUTS = [
{
  name: "Exemple",
  url: "https://google.com",
  info: "Clic de DROIT pour plus d'infos",
  emoji: DEFAULT_EMOJI(),
  favorite: false,
  tags: ["instruction"],
  tooltip: `<p>vous pouvez ajouter des raccourcis en appuyant sur l'engrenage puis le bouton +<br><br>pour charger une liste existante, utilisez le bouton avec la flèche vers le bas</p>`,
  tooltipPlain: "vous pouvez ajouter des raccourcis en appuyant sur l'engrenage puis le bouton +\n\npour charger une liste existante, utilisez le bouton avec la flèche vers le bas"
},
{
  name: "Site de test",
  url: "https://example.com",
  info: "Second raccourci de démonstration",
  emoji: DEFAULT_EMOJI(),
  favorite: false,
  tags: ["démo"],
  tooltip: `<p>Ceci est un deuxième raccourci pour tester le fonctionnement de l'application.</p>`,
  tooltipPlain: "Ceci est un deuxième raccourci pour tester le fonctionnement de l'application."
}];
const DEFAULT_UI_TOGGLE_STATE = {
  searchBar: true,
  tagFilters: true
};
const DEFAULT_TITLE_COLOR = "#000000";
const DEFAULT_BG_COLOR = "#f9f9f9";