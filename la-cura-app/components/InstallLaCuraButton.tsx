"use client";

import useAppUi from "@/components/i18n/useAppUi";

import {
  useEffect,
  useState,
} from "react";

import {
  faArrowUpFromBracket,
  faCircleCheck,
  faDownload,
  faMobileScreenButton,
  faPlusSquare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent
  extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export default function InstallLaCuraButton() {
  const { ui } =
    useAppUi();

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(
      null
    );

  const [showInstructions, setShowInstructions] =
    useState(false);

  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] =
    useState(false);

  useEffect(() => {
    const navigatorWithStandalone =
      navigator as NavigatorWithStandalone;

    const iosDevice =
      /iphone|ipad|ipod/i.test(
        navigator.userAgent
      ) ||
      (navigator.platform === "MacIntel" &&
        navigator.maxTouchPoints > 1);

    const runningStandalone =
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      navigatorWithStandalone.standalone === true;

    setIsIOS(iosDevice);
    setIsInstalled(runningStandalone);

    function handleBeforeInstallPrompt(
      event: Event
    ) {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  async function handleInstall() {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    await installPrompt.prompt();

    const choice =
      await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
  }

  if (isInstalled) {
    return (
      <div className="inline-flex items-center justify-center gap-3 rounded-2xl bg-green-100 px-7 py-4 font-bold text-green-800">
        <AppIcon icon={faCircleCheck} />

        {ui("App Installed")}</div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gray-900 px-7 py-4 font-bold text-white transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-300 sm:px-8"
      >
        <AppIcon icon={faDownload} />

        {ui("Install App")}</button>

      {showInstructions && (
        <div
          className="fixed inset-0 z-[999999] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={() =>
            setShowInstructions(false)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={ui("Install La-Cura")}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-md overflow-hidden rounded-[30px] bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 bg-gradient-to-r from-green-800 to-green-600 px-6 py-6 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <AppIcon
                    icon={faMobileScreenButton}
                    className="text-2xl"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-black">
                    {ui("Install La-Cura")}</h2>

                  <p className="mt-1 text-sm text-green-100">
                    {ui("Add La-Cura to your phone")}</p>
                </div>
              </div>

              <button
                type="button"
                aria-label={ui("Close instructions")}
                onClick={() =>
                  setShowInstructions(false)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25"
              >
                <AppIcon icon={faXmark} />
              </button>
            </header>

            <div className="space-y-6 p-6">
              {isIOS ? (
                <>
                  <p className="leading-7 text-gray-600">
                    {ui("Open La-Cura in Safari, then follow these steps:")}</p>

                  <Instruction
                    number="1"
                    icon={faArrowUpFromBracket}
                    title={ui("Tap Share")}
                    description={ui("Tap the square icon with the upward arrow in Safari.")}
                  />

                  <Instruction
                    number="2"
                    icon={faPlusSquare}
                    title={ui("Add to Home Screen")}
                    description={ui("Scroll through the Share menu and select Add to Home Screen.")}
                  />

                  <Instruction
                    number="3"
                    icon={faCircleCheck}
                    title={ui("Open as Web App")}
                    description={ui("Turn on Open as Web App, then tap Add.")}
                  />
                </>
              ) : (
                <>
                  <p className="leading-7 text-gray-600">
                    {ui("Open your browser menu and choose one of these options:")}</p>

                  <Instruction
                    number="1"
                    icon={faDownload}
                    title={ui("Install App")}
                    description={ui("Select Install App or Install La-Cura from the browser menu.")}
                  />

                  <Instruction
                    number="2"
                    icon={faPlusSquare}
                    title={ui("Add to Home Screen")}
                    description={ui("Some browsers label the option Add to Home Screen.")}
                  />
                </>
              )}

              <button
                type="button"
                onClick={() =>
                  setShowInstructions(false)
                }
                className="w-full rounded-2xl bg-green-700 px-6 py-4 font-bold text-white transition hover:bg-green-800"
              >
                {ui("Done")}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

type InstructionProps = {
  number: string;
  icon: Parameters<typeof AppIcon>[0]["icon"];
  title: string;
  description: string;
};

function Instruction({
  number,
  icon,
  title,
  description,
}: InstructionProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 font-black text-green-700">
        {number}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <AppIcon
            icon={icon}
            className="text-green-700"
          />

          <h3 className="font-bold text-gray-900">
            {title}
          </h3>
        </div>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}