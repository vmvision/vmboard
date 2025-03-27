"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/derive-ui/color-picker";
import { useTranslations } from "next-intl";
import type { ThemeColors } from "@/providers/color/types";
import { defaultTheme, useTheme } from "@/providers/color";

export default function ThemePage() {
  const t = useTranslations("Private.Setting.Site.Theme");
  const { theme, setTheme } = useTheme();

  const updateColor = (
    mode: "light" | "dark",
    key: keyof ThemeColors,
    value: string,
  ) => {
    if (mode === "light") {
      setTheme({
        name: "custom",
        ...theme,
        light: { ...theme?.light, [key]: value },
        dark: theme?.dark ?? {},
      });
    } else {
      setTheme({
        name: "custom",
        ...theme,
        light: theme?.light ?? {},
        dark: { ...theme?.dark, [key]: value },
      });
    }
  };

  const ColorPickerRow = ({
    colorKey,
    value,
    onChange,
  }: {
    mode: "light" | "dark";
    colorKey: keyof ThemeColors;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{t(`Variables.${colorKey}`)}</span>
        <span className="text-xs text-muted-foreground">{colorKey}</span>
      </div>
      <ColorPicker
        background={value}
        setBackground={onChange}
        className="w-[200px]"
      />
    </div>
  );

  return (
    <Tabs defaultValue="light" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="light">{t("light")}</TabsTrigger>
        <TabsTrigger value="dark">{t("dark")}</TabsTrigger>
      </TabsList>

      <TabsContent value="light" className="space-y-4">
        {Object.entries(defaultTheme.light).map(([key, value]) => (
          <ColorPickerRow
            key={key}
            colorKey={key as keyof ThemeColors}
            mode="light"
            value={theme?.light?.[key as keyof ThemeColors] ?? value}
            onChange={(newValue) =>
              updateColor("light", key as keyof ThemeColors, newValue)
            }
          />
        ))}
      </TabsContent>

      <TabsContent value="dark" className="space-y-4">
        {Object.entries(defaultTheme.dark).map(([key, value]) => (
          <ColorPickerRow
            key={key}
            colorKey={key as keyof ThemeColors}
            mode="dark"
            value={theme?.dark?.[key as keyof ThemeColors] ?? value}
            onChange={(newValue) =>
              updateColor("dark", key as keyof ThemeColors, newValue)
            }
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}
