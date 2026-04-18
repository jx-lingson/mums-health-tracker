import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const BODY_PARTS = [
  "head", "neck", "left-shoulder", "right-shoulder", "chest", "abdomen",
  "left-upper-arm", "right-upper-arm", "left-forearm", "right-forearm",
  "left-hand", "right-hand", "left-upper-leg", "right-upper-leg",
  "left-lower-leg", "right-lower-leg", "left-foot", "right-foot",
];

const SYSTEM_PROMPT = `You are a medical document analyzer. Given a medical document, consult transcript, or test results, extract ONLY abnormal or noteworthy findings.

For each abnormal finding:
1. Map it to the most relevant body part from this list: ${BODY_PARTS.join(", ")}
   - Use "head" for brain, eyes, ears, dental, thyroid issues
   - Use "chest" for heart, lungs, respiratory issues
   - Use "abdomen" for digestive, liver, kidney, intestinal issues
   - Use "neck" for thyroid, throat issues
   - Map limb-specific issues to the appropriate limb
   - If a finding is systemic (blood counts, general conditions), use "chest" as default
2. Write a concise note summarizing the finding in plain language
3. Try to identify the date of the document/consultation

IMPORTANT:
- Only include ABNORMAL findings. If something is normal/within range, skip it completely.
- Be concise but specific in your notes
- Include the actual values when relevant (e.g., "Blood pressure elevated at 150/95")

Also provide 3-5 key takeaways from the entire document. These should be the most important things a family member tracking this person's health should know. Keep each takeaway to one plain sentence. Include both normal and abnormal highlights here.

Respond in this exact JSON format:
{
  "date": "YYYY-MM-DD or null if not found",
  "documentTitle": "brief title for this document",
  "findings": [
    {
      "bodyPart": "one of the body parts listed above",
      "note": "concise description of the abnormal finding"
    }
  ],
  "takeaways": [
    "key takeaway 1",
    "key takeaway 2"
  ]
}

If there are no abnormal findings, return an empty findings array but still provide takeaways.
Do not use any markdown formatting. Do not include any text outside the JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { content, fileData, fileType, fileName } = await req.json();

    const messages: Anthropic.MessageParam[] = [];

    if (fileData && fileType) {
      if (fileType === "application/pdf") {
        // Send PDF as base64 document
        const base64 = fileData.split(",")[1];
        messages.push({
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            { type: "text", text: `Analyze this medical document (${fileName || "document"}) and extract abnormal findings.` },
          ],
        });
      } else if (fileType.startsWith("image/")) {
        const base64 = fileData.split(",")[1];
        const mediaType = fileType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        messages.push({
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: `Analyze this medical document/image (${fileName || "image"}) and extract abnormal findings.` },
          ],
        });
      } else {
        // Text-based file, try to decode
        try {
          const text = atob(fileData.split(",")[1]);
          messages.push({ role: "user", content: `Analyze this medical document (${fileName || "document"}):\n\n${text}` });
        } catch {
          return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }
      }
    } else if (content) {
      messages.push({ role: "user", content: `Analyze this medical document/transcript and extract abnormal findings:\n\n${content}` });
    } else {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: "Failed to parse extraction results", raw: text }, { status: 500 });
    }
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
