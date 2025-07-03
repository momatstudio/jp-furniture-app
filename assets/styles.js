// Centralized color palette and sizing for consistent UI/UX across the app

export const colors = {
  primary: "#4C0000",
  secondary: "#f6f7fb",
  accent: "#D47F58",
  white: "#FFFFFF",
  black: "#222222",
  gray: "#888888",
  lightGray: "#e0e0e0",
  lighterGray: "#f1f1f1",
  danger: "#E53935",
  success: "#4C9C1D",
  warning: "#EF814A",
  info: "#1976D2",
  blue: "#1976D2",
  purple: "#8e24aa",
  yellow: "#FFEB3B",
  background: "#f7f7fa",
  border: "#e0e0e0",
  card: "#fff",
  muted: "#bdbdbd",
};

export const sizes = {
  xs: 8,
  s: 12,
  sm: 14,
  m: 16,
  ml: 18,
  l: 20,
  xl: 24,
  xxl: 32,
  icon: 22,
  radius: 10,
  border: 1.5,
  padding: 16,
  margin: 16,
};

export const fontWeights = {
  regular: "400",
  medium: "500",
  bold: "700",
};

export const shadows = {
  card: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  modal: {
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
};
