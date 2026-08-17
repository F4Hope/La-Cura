import {
  createClient,
} from "@/lib/supabase/server";

import type {
  AppUiLanguage,
} from "@/lib/i18n/appUi";

export async function getServerLanguage(): Promise<AppUiLanguage> {
  try {
    const supabase =
      await createClient();

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "la_cura_current_language"
      );

    if (
      error ||
      data !== "fr"
    ) {
      return "en";
    }

    return "fr";
  } catch {
    return "en";
  }
}
