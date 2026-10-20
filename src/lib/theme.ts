function oppositeTheme(theme: string | undefined): "light" | "dark" {
  return theme === "dark" ? "light" : "dark";
}

export { oppositeTheme };
