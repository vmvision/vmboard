import type { DerivedTheme, Theme } from "./types";

const testTheme: Theme = {
  name: "test",
  light: {
    primary: "red",
  },
  dark: {
    primary: "blue",
  },
};
const getTheme = async (): Promise<DerivedTheme> => {
  const theme = testTheme;
  const lightCssVars = Object.entries(theme.light)
    .map(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--${cssVar}: ${value};`;
    })
    .join("\n");
  const darkCssVars = Object.entries(theme.dark)
    .map(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--${cssVar}: ${value};`;
    })
    .join("\n");
  return {
    name: theme.name,
    light: lightCssVars,
    dark: darkCssVars,
  };
};

export async function ThemeScript() {
  const theme = await getTheme();
  const styleContent = `
    :root {
      ${theme.light}
    }
    .dark {
      ${theme.dark}
    }
  `;
  return (
    <style
      id="theme-vars"
      dangerouslySetInnerHTML={{ __html: styleContent }}
    />
  );
}
