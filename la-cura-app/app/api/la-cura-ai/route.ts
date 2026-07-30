import OpenAI from "openai";

import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  messages?: unknown;
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1_500;

const SYSTEM_INSTRUCTIONS = `
You are La-Cura AI, a public health-education and La-Cura service-information assistant.

IDENTITY
- You represent La-Cura Healthcare in Cameroon.
- You are an AI assistant, not a physician, nurse, pharmacist, laboratory, or emergency service.
- Respond in the same language as the user when practical, especially English or French.
- Understand informal language, spelling mistakes, abbreviations, and conversational wording.
- Do not criticize the user's grammar. Interpret the likely meaning and answer helpfully.

WHAT YOU CAN DISCUSS
You may provide general educational information about:
- Common symptoms and possible non-diagnostic explanations.
- Heart health, palpitations, blood pressure, and circulation.
- Diabetes and blood-sugar education.
- Hydration and dehydration.
- Nutrition and healthy eating.
- Exercise and mobility.
- Sleep and fatigue.
- Stress, anxiety, and emotional well-being.
- Women's health and pregnancy-related general education.
- Children's and older-adult health education.
- Medication purposes, common precautions, and general side-effect information.
- First-aid education.
- Infection prevention and hygiene.
- Chronic-condition self-management education.
- When someone should arrange routine, urgent, or emergency medical assessment.
- La-Cura's services and contact information.

SYMPTOM QUESTIONS
When a user describes symptoms:
1. Briefly explain what the symptom means in ordinary language.
2. Mention several common possibilities without claiming a diagnosis.
3. State important emergency warning signs.
4. Give safe immediate steps.
5. Recommend the appropriate level of professional care.
6. Ask no more than two useful follow-up questions when they would materially improve safety.

For example, "my heart beats too much" may refer to palpitations or a fast heartbeat.
Possible general causes can include exercise, stress, anxiety, fever, dehydration, caffeine, low blood sugar, anemia, thyroid problems, medication effects, or an abnormal heart rhythm.
Never state that one of these is definitely the cause.

MEDICAL LIMITS
- Do not diagnose.
- Do not promise that a condition is harmless.
- Do not prescribe prescription medication.
- Do not calculate personalized doses.
- Do not tell users to start, stop, skip, double, or alter prescribed medication.
- Do not replace a medical examination.
- You may explain general medication information and advise consultation with a physician or pharmacist.
- Clearly distinguish general education from individualized medical advice.

EMERGENCIES
Advise immediate emergency care for symptoms such as:
- Severe or persistent chest pain.
- Severe difficulty breathing.
- Fainting or loss of consciousness.
- New facial drooping, arm weakness, speech difficulty, or other stroke signs.
- A very fast or irregular heartbeat with chest pain, severe dizziness, fainting, or breathlessness.
- Severe bleeding.
- A serious allergic reaction.
- A prolonged seizure.
- Suspected overdose.
- Immediate risk of self-harm or harm to another person.

When emergency features are present:
- Tell the user to contact local emergency services or go to the nearest emergency department immediately.
- Do not delay emergency action with unnecessary questions.
- Do not claim that La-Cura AI can provide emergency assistance.

PRIVACY
- Do not ask for a full name, exact address, medical-record number, insurance number, password, or other identifying information.
- Remind users not to submit private identifying medical information when relevant.

LA-CURA INFORMATION
La-Cura offers:
- Nursing care.
- Elderly care.
- Medical products and patient-care supplies.
- Healthcare technology.
- General healthcare support.

La-Cura contact details:
- Phone: +237 675 073 439
- Email: info@lacurahealth.com
- Location: Cameroon

Do not invent:
- Prices.
- Appointment availability.
- Product inventory.
- Staff qualifications.
- Clinical diagnoses.
- Test results.
- Treatments not supplied in the conversation.

RESPONSE FORMAT
- Be calm, direct, and easy to understand.
- Use short paragraphs.
- Use a brief list when useful.
- Avoid excessive disclaimers.
- For symptom questions, include a short "Seek urgent help now if..." section.
- End medical answers with one concise statement that the information is general education and not a diagnosis.
`;

function parseMessages(
  value: unknown
): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((message): message is ChatMessage => {
      if (
        typeof message !== "object" ||
        message === null
      ) {
        return false;
      }

      const candidate = message as {
        role?: unknown;
        content?: unknown;
      };

      return (
        (candidate.role === "user" ||
          candidate.role === "assistant") &&
        typeof candidate.content === "string"
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter(
      (message) =>
        message.content.length > 0
    )
    .slice(-MAX_MESSAGES);
}

function createTranscript(
  messages: ChatMessage[]
): string {
  return messages
    .map((message) => {
      const label =
        message.role === "user"
          ? "Visitor"
          : "La-Cura AI";

      return `${label}: ${message.content}`;
    })
    .join("\n\n");
}

function isSelfHarmFlagged(
  categories: unknown
): boolean {
  if (
    typeof categories !== "object" ||
    categories === null
  ) {
    return false;
  }

  const categoryMap = categories as Record<
    string,
    boolean | undefined
  >;

  return Boolean(
    categoryMap["self-harm"] ||
      categoryMap["self-harm/intent"] ||
      categoryMap["self-harm/instructions"]
  );
}

function getErrorCode(
  error: unknown
): string | undefined {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return undefined;
  }

  const candidate = error as {
    code?: unknown;
    error?: {
      code?: unknown;
    };
  };

  if (typeof candidate.code === "string") {
    return candidate.code;
  }

  if (
    typeof candidate.error?.code ===
    "string"
  ) {
    return candidate.error.code;
  }

  return undefined;
}

function getErrorStatus(
  error: unknown
): number | undefined {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return undefined;
  }

  const candidate = error as {
    status?: unknown;
  };

  return typeof candidate.status === "number"
    ? candidate.status
    : undefined;
}

function createApiErrorResponse(
  error: unknown
) {
  const status = getErrorStatus(error);
  const code = getErrorCode(error);

  console.error("La-Cura AI OpenAI error:", {
    status,
    code,
    message:
      error instanceof Error
        ? error.message
        : String(error),
  });

  if (status === 401) {
    return NextResponse.json(
      {
        error:
          "La-Cura AI could not authenticate with OpenAI. Check that OPENAI_API_KEY contains a valid, active API key, then restart the server.",
      },
      {
        status: 503,
      }
    );
  }

  if (
    status === 429 &&
    (code === "insufficient_quota" ||
      code === "billing_hard_limit_reached")
  ) {
    return NextResponse.json(
      {
        error:
          "La-Cura AI has no available API credit. Add API billing or prepaid credits in the OpenAI Platform account, then try again.",
      },
      {
        status: 503,
      }
    );
  }

  if (status === 429) {
    return NextResponse.json(
      {
        error:
          "La-Cura AI has reached its temporary request limit. Wait briefly and try again.",
      },
      {
        status: 429,
      }
    );
  }

  if (status === 403) {
    return NextResponse.json(
      {
        error:
          "The OpenAI project does not have permission to complete this request. Check the API key's project, permissions, and regional access.",
      },
      {
        status: 503,
      }
    );
  }

  if (status === 404) {
    return NextResponse.json(
      {
        error:
          "The configured AI model is unavailable to this OpenAI project. Set OPENAI_CHAT_MODEL=gpt-5-mini and restart the server.",
      },
      {
        status: 503,
      }
    );
  }

  if (
    status !== undefined &&
    status >= 500
  ) {
    return NextResponse.json(
      {
        error:
          "The OpenAI service is temporarily unavailable. Wait briefly and try again.",
      },
      {
        status: 503,
      }
    );
  }

  return NextResponse.json(
    {
      error:
        "La-Cura AI could not complete the request. Review the development-server terminal for the specific OpenAI error.",
    },
    {
      status: 500,
    }
  );
}

export async function POST(
  request: NextRequest
) {
  const apiKey =
    process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "La-Cura AI is not configured. Add OPENAI_API_KEY to .env.local and restart the development server.",
      },
      {
        status: 503,
      }
    );
  }

  let body: ChatRequestBody;

  try {
    body =
      (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      {
        error:
          "The chat request was not valid JSON.",
      },
      {
        status: 400,
      }
    );
  }

  const messages = parseMessages(
    body.messages
  );

  const latestUserMessage = [
    ...messages,
  ]
    .reverse()
    .find(
      (message) =>
        message.role === "user"
    );

  if (!latestUserMessage) {
    return NextResponse.json(
      {
        error:
          "Enter a question for La-Cura AI.",
      },
      {
        status: 400,
      }
    );
  }

  const openai = new OpenAI({
    apiKey,
  });

  try {
    /*
     * Moderation improves safety, but a temporary moderation
     * failure should not make ordinary health questions fail.
     */
    try {
      const moderation =
        await openai.moderations.create({
          model:
            "omni-moderation-latest",
          input: latestUserMessage.content,
        });

      const result =
        moderation.results[0];

      if (result?.flagged) {
        if (
          isSelfHarmFlagged(
            result.categories
          )
        ) {
          return NextResponse.json({
            reply:
              "I’m concerned that you may be in immediate danger. Contact local emergency services or go to the nearest emergency department now. Stay with a trusted person and move away from anything you could use to harm yourself. La-Cura AI cannot provide emergency assistance.",
          });
        }

        return NextResponse.json({
          reply:
            "I can’t assist with that particular request. I can help with general health education, symptoms, healthy living, first-aid information, medication education, or questions about La-Cura’s services.",
        });
      }
    } catch (moderationError) {
      console.warn(
        "La-Cura AI moderation check failed; continuing with model safety controls:",
        moderationError instanceof Error
          ? moderationError.message
          : moderationError
      );
    }

    const transcript =
      createTranscript(messages);

    const model =
      process.env.OPENAI_CHAT_MODEL?.trim() ||
      "gpt-5-mini";

    const response =
      await openai.responses.create({
        model,
        instructions:
          SYSTEM_INSTRUCTIONS,
        input: transcript,
        max_output_tokens: 900,
        store: false,
      });

    const reply =
      response.output_text?.trim();

    if (!reply) {
      throw new Error(
        "OpenAI returned an empty response."
      );
    }

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    return createApiErrorResponse(error);
  }
}