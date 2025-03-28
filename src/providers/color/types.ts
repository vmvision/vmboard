export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  
  border: string;
  input: string;
  ring: string;

  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  "chart-6": string;
  "chart-7": string;
  "chart-8": string;
  "chart-9": string;
  "chart-10": string;

  "sidebar-background": string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
}

export interface ThemeVariables extends ThemeColors {
  radius: string;
  timing: string;
}

export interface Theme {
  name: string;
  light: Partial<ThemeVariables>;
  dark: Partial<ThemeVariables>;
}

export interface DerivedTheme {
  name: string;
  light: string;
  dark: string;
}
