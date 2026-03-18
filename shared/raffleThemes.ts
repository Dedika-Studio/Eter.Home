export type RaffleCategory = "dinero" | "electronica" | "herramientas" | "kpop" | "moda" | "otro";

export interface RaffleTheme {
  primary: string;
  secondary: string;
  gradient: string;
  icon: string;
  accent: string;
  textColor: string;
  buttonBg: string;
  buttonHover: string;
}

export const raffleThemes: Record<RaffleCategory, RaffleTheme> = {
  dinero: {
    primary: "#10b981",
    secondary: "#fbbf24",
    gradient: "from-green-600 to-yellow-500",
    icon: "💰",
    accent: "text-green-600",
    textColor: "text-white",
    buttonBg: "bg-green-600",
    buttonHover: "hover:bg-green-700",
  },
  electronica: {
    primary: "#1f2937",
    secondary: "#3b82f6",
    gradient: "from-gray-800 to-blue-600",
    icon: "📱",
    accent: "text-blue-600",
    textColor: "text-white",
    buttonBg: "bg-blue-600",
    buttonHover: "hover:bg-blue-700",
  },
  herramientas: {
    primary: "#ea580c",
    secondary: "#1f2937",
    gradient: "from-orange-600 to-gray-900",
    icon: "🔧",
    accent: "text-orange-600",
    textColor: "text-white",
    buttonBg: "bg-orange-600",
    buttonHover: "hover:bg-orange-700",
  },
  kpop: {
    primary: "#a855f7",
    secondary: "#ec4899",
    gradient: "from-purple-600 to-pink-500",
    icon: "🎤",
    accent: "text-purple-600",
    textColor: "text-white",
    buttonBg: "bg-purple-600",
    buttonHover: "hover:bg-purple-700",
  },
  moda: {
    primary: "#db2777",
    secondary: "#f97316",
    gradient: "from-pink-600 to-orange-500",
    icon: "👗",
    accent: "text-pink-600",
    textColor: "text-white",
    buttonBg: "bg-pink-600",
    buttonHover: "hover:bg-pink-700",
  },
  otro: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    gradient: "from-indigo-600 to-purple-600",
    icon: "🎁",
    accent: "text-indigo-600",
    textColor: "text-white",
    buttonBg: "bg-indigo-600",
    buttonHover: "hover:bg-indigo-700",
  },
};

export function getTheme(category: RaffleCategory): RaffleTheme {
  return raffleThemes[category] || raffleThemes.otro;
}
