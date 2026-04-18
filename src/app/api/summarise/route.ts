import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { annotations, vitals, medications, allergies } = await req.json();

    if (!annotations && !vitals && !medications) {
      return NextResponse.json({ summary: "No health data recorded yet. Start by adding body annotations, vitals, or medical history." });
    }

    const prompt = `You are a helpful health assistant summarising a patient's health data for their family member who is tracking their health. Based on the following data, provide a brief, caring summary (3-5 bullet points) of:
1. Key areas to monitor or watch out for
2. Any patterns you notice
3. Gentle reminders or suggestions

Be warm but factual. Don't diagnose. Use plain language. Keep each bullet to 1-2 sentences.

BODY ANNOTATIONS (notes and markers on body parts):
${annotations || "None recorded"}

RECENT VITALS:
${vitals || "None recorded"}

CURRENT MEDICATIONS:
${medications || "None recorded"}

ALLERGIES:
${allergies || "None recorded"}

Respond with just the bullet points, no intro or outro.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json(
      { summary: "Unable to generate summary. Please check your API key configuration." },
      { status: 500 }
    );
  }
}
