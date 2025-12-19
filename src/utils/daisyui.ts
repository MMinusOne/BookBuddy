const FALLBACK_COLOR = "oklch(0.7 0.15 250)";

export default function getDaisyUiColor(colorName: string): string {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    const primary = getComputedStyle(root).getPropertyValue(colorName).trim();
    if (primary) {
      return primary;
    }
  }

  return FALLBACK_COLOR;
}
