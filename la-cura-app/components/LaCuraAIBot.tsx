"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import {
  faComments,
  faHeartPulse,
  faPaperPlane,
  faRobot,
  faShieldHalved,
  faSpinner,
  faTrashCan,
  faTriangleExclamation,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import AppIcon from "@/components/ui/AppIcon";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatApiResponse = {
  reply?: string;
  error?: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "la-cura-welcome",
    role: "assistant",
    content:
      "Hello. I’m La-Cura AI. I can provide general health education and information about La-Cura’s services. Please do not enter names, medical-record numbers, dates of birth, or other private health information.",
  },
];

const STARTER_QUESTIONS = [
  "What services does La-Cura provide?",
  "How can I improve my heart health?",
  "What are common signs of dehydration?",
];

function createMessageId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function LaCuraAIBot() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] =
    useState<ChatMessage[]>(
      INITIAL_MESSAGES
    );
  const [input, setInput] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");

  const messageContainerRef =
    useRef<HTMLDivElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const visibleOnCurrentPage =
    pathname === "/" ||
    pathname.startsWith("/health-tips/");

  useEffect(() => {
    if (!open) {
      return;
    }

    const container =
      messageContainerRef.current;

    if (container) {
      container.scrollTop =
        container.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: globalThis.KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      textareaRef.current?.focus();
    }
  }, [open]);

  async function sendMessage(
    messageText: string
  ) {
    const content = messageText
      .trim()
      .slice(0, 1_200);

    if (!content || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content,
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/la-cura-ai",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages.map(
              ({ role, content }) => ({
                role,
                content,
              })
            ),
          }),
        }
      );

      const data =
        (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        throw new Error(
          data.error ||
            "La-Cura AI could not answer."
        );
      }

      if (!data.reply) {
        throw new Error(
          "La-Cura AI returned an empty response."
        );
      }

      const assistantMessage: ChatMessage =
        {
          id: createMessageId(),
          role: "assistant",
          content: data.reply,
        };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (caughtError) {
      console.error(
        "La-Cura AI request failed:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "La-Cura AI is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    await sendMessage(input);
  }

  function handleTextareaKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!loading && input.trim()) {
        void sendMessage(input);
      }
    }
  }

  function resetConversation() {
    if (loading) {
      return;
    }

    setMessages(INITIAL_MESSAGES);
    setInput("");
    setError("");
  }

  if (!visibleOnCurrentPage) {
    return null;
  }

  return (
    <>
      {open && (
        <section
          aria-label="La-Cura AI assistant"
          className="fixed bottom-24 right-3 z-[99999] flex h-[min(680px,calc(100vh-7rem))] w-[calc(100vw-1.5rem)] max-w-[430px] flex-col overflow-hidden rounded-[4px] border border-[#AEBAB4] bg-white shadow-lg sm:bottom-28 sm:right-6"
        >
          <header className="relative overflow-hidden bg-[#073B2F] px-5 py-5 text-white">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-white/15">
                  <AppIcon
                    icon={faRobot}
                    className="text-2xl"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black">
                    La-Cura AI
                  </h2>

                  <div className="mt-1 flex items-center gap-2 text-sm text-green-100">
                    <span className="h-2 w-2 rounded-full bg-green-300" />

                    Health education assistant
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={resetConversation}
                  disabled={loading}
                  aria-label="Clear conversation"
                  title="Clear conversation"
                  className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-white/15 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <AppIcon
                    icon={faTrashCan}
                    className="text-sm"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close La-Cura AI"
                  className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-white/15 transition hover:bg-white/25"
                >
                  <AppIcon
                    icon={faXmark}
                    className="text-lg"
                  />
                </button>
              </div>
            </div>
          </header>

          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <AppIcon
                icon={faShieldHalved}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="text-xs leading-5 text-amber-800">
                General information only. Do
                not enter names, dates of
                birth, record numbers, or
                other private health details.
              </p>
            </div>
          </div>

          <div
            ref={messageContainerRef}
            className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-4 py-5"
            aria-live="polite"
          >
            {messages.map((message) => {
              const fromUser =
                message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    fromUser
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] ${
                      fromUser
                        ? "bg-slate-200 text-slate-700"
                        : "bg-green-100 text-[#073B2F]"
                    }`}
                  >
                    <AppIcon
                      icon={
                        fromUser
                          ? faUser
                          : faHeartPulse
                      }
                      className="text-sm"
                    />
                  </div>

                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-[4px] px-4 py-3 text-sm leading-6 shadow-sm ${
                      fromUser
                        ? "rounded-tr-sm bg-[#073B2F] text-white"
                        : "rounded-tl-sm border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {messages.length === 1 &&
              !loading && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Suggested questions
                  </p>

                  {STARTER_QUESTIONS.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          void sendMessage(
                            question
                          )
                        }
                        className="block w-full rounded-[3px] border border-green-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#0D4A3A] transition hover:border-green-400 hover:bg-green-50"
                      >
                        {question}
                      </button>
                    )
                  )}
                </div>
              )}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-green-100 text-[#073B2F]">
                  <AppIcon
                    icon={faRobot}
                    className="text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-[4px] rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <AppIcon
                    icon={faSpinner}
                    spin
                  />

                  La-Cura AI is thinking…
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AppIcon
                  icon={
                    faTriangleExclamation
                  }
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-4"
          >
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="la-cura-ai-input"
                  className="sr-only"
                >
                  Ask La-Cura AI
                </label>

                <textarea
                  ref={textareaRef}
                  id="la-cura-ai-input"
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value.slice(
                        0,
                        1_200
                      )
                    )
                  }
                  onKeyDown={
                    handleTextareaKeyDown
                  }
                  rows={2}
                  maxLength={1_200}
                  disabled={loading}
                  placeholder="Ask a health or La-Cura question…"
                  className="max-h-32 min-h-[54px] w-full resize-none rounded-[4px] border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#667E72] focus:ring-4 focus:ring-[#073B2F]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <div className="mt-1 text-right text-[11px] text-slate-400">
                  {input.length}/1200
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading || !input.trim()
                }
                aria-label="Send question"
                className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-[#073B2F] text-white transition hover:bg-[#0D4A3A] focus:outline-none focus:ring-4 focus:ring-[#073B2F]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <AppIcon
                  icon={
                    loading
                      ? faSpinner
                      : faPaperPlane
                  }
                  spin={loading}
                />
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] leading-4 text-slate-400">
              La-Cura AI may make mistakes.
              For emergencies, contact local
              emergency services immediately.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-label={
          open
            ? "Close La-Cura AI"
            : "Open La-Cura AI"
        }
        className="fixed bottom-5 right-4 z-[99999] flex items-center gap-2 rounded-[4px] border border-[#063428] bg-[#073B2F] px-3 py-2.5 text-[11px] font-bold text-white shadow-lg transition hover:bg-[#0D4A3A] focus:outline-none focus:ring-4 focus:ring-[#073B2F]/15 sm:bottom-7 sm:right-7"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <AppIcon
            icon={
              open ? faXmark : faComments
            }
            className="text-xl"
          />

          {!open && (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-green-700 bg-green-300" />
          )}
        </span>

        <span className="hidden sm:inline">
          {open
            ? "Close"
            : "Ask La-Cura AI"}
        </span>
      </button>
    </>
  );
}