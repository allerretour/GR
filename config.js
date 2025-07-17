// config.js

let GLOBAL_PASSWORD = localStorage.getItem("globalPassword") || "";


const DEFAULT_EMOJI = () => EMOJI_CHOICES?.[0] || "🔗";


const colorNames = [
  "black",
  "white",
  "gray",
  "lightgray",
  "red",
  "orange",
  "yellow",
  "gold",
  "green",
  "limegreen",
  "teal",
  "cyan",
  "blue",
  "skyblue",
  "navy",
  "indigo",
  "purple",
  "violet",
  "pink",
  "brown"
];

const EMOJI_CHOICES = [
  "🔗", // premier de la liste emoji par defaut
  "⭐", // Star / Favorite
  "💡", // Idea / Lightbulb
  "⚙️", // Gear / Settings
  "🛠️", 
  "🔒", // Lock / Security
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
  "🎞️", 
  "🖌️", 
  "⏰", // Alarm Clock / Time
  "🧑‍💻", // Technologist / Coding
  "💻", // Computer / Tech
  "👨‍⚕️", // Doctor / Healthcare
  "🔬", // Microscope / Science
  "🚑"  // Ambulance / Emergency
];
