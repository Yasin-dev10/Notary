"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("Language");

  const toggleLanguage = () => {
    startTransition(() => {
      const isSomali = document.cookie.includes("NEXT_LOCALE=so");
      const nextLocale = isSomali ? "en" : "so";
      // Ensure the cookie is written to the root path so that the server can see it everywhere
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer w-full text-left disabled:opacity-50"
      title={t("switch")}
    >
      <Languages className="h-5 w-5" />
      <span>{t("current")}</span>
    </button>
  );
}
