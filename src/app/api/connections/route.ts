import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { selectedAnnotation, allAnnotations } = await req.json();

    if (!selectedAnnotation || !allAnnotations || allAnnotations.length < 2) {
      return NextResponse.json({ connections: [] });
    }

    const otherAnnotations = allAnnotations
      .filter((a: { id: string }) => a.id !== selectedAnnotation.id)
      .map((a: { label: string; text: string; date: string }) =>
        `- ${a.label}: "${a.text}" (${a.date})`
      )
      .join("\n");

    const prompt = `You are analyzing a patient's health annotations to find meaningful connections and patterns.

The user is looking at this annotation:
- ${selectedAnnotation.label}: "${selectedAnnotation.text}" (${selectedAnnotation.date})

Here are all other annotations on record:
${otherAnnotations}

Find connections between the selected annotation and the others. A connection could be:
- A potential medical relationship (e.g. thyroid issues causing fatigue)
- A pattern over time (e.g. recurring symptoms getting worse or better)
- Related symptoms across different body parts
- A finding that contradicts or should be checked against another

Rules:
- Only include connections that are genuinely meaningful or medically plausible
- Maximum 4 connections
- Be concise, one sentence per connection
- Don't be alarmist, be factual and helpful
- If there are no meaningful connections, return an empty array
- Do not use markdown formatting

Respond in this exact JSON format:
{
  "connections": [
    {
      "relatedAnnotationId": "id of the related annotation",
      "relatedLabel": "body part name",
      "explanation": "one sentence explaining the connection"
    }
  ]
}

Do not include any text outside the JSON.`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ connections: [] });
    }
  } catch (error) {
    console.error("Connections error:", error);
    return NextResponse.json({ connections: [] }, { status: 500 });
  }
}
