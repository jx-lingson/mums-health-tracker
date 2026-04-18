import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const BODY_PARTS = [
  "upper-head", "lower-head", "neck", "left-shoulder", "right-shoulder", "chest", "abdomen",
  "left-upper-arm", "right-upper-arm", "left-forearm", "right-forearm",
  "left-hand", "right-hand", "left-upper-leg", "right-upper-leg",
  "left-lower-leg", "right-lower-leg", "left-foot", "right-foot",
];

const SYSTEM_PROMPT = `You are a medical document analyzer. Given a medical document, consult transcript, or test results, you must separate findings into two categories:

1. BODY FINDINGS - Physical changes, deformities, pain, swelling, lumps, rashes, or organ-specific issues that map to a body part.
   Map each to a body part from: ${BODY_PARTS.join(", ")}
   - "upper-head" for brain, skull, neurological
   - "lower-head" for eyes, ears, dental, jaw, face
   - "chest" for heart, lungs, respiratory
   - "abdomen" for digestive, liver, kidney, intestinal
   - "neck" for thyroid, throat
   - Map limb issues to the appropriate limb

2. BLOOD MARKERS - Lab values like WBC, neutrophils, lymphocytes, ferritin, haemoglobin, platelets, CRP, ESR, blood pressure, cholesterol, glucose, HbA1c, etc. These are systemic and do NOT belong on the body map.
   For each blood marker include: type (short name like "WBC", "Neutrophils", "Ferritin"), value (the number), unit, and status ("normal", "low", or "high").

IMPORTANT:
- Body findings: only include ABNORMAL physical findings
- Blood markers: include ALL markers mentioned (normal or abnormal) so we can track them over time
- Be concise but specific, include actual values

Also provide 3-5 key takeaways from the entire document.

Respond in this exact JSON format:
{
  "date": "YYYY-MM-DD or null if not found",
  "documentTitle": "brief title for this document",
  "findings": [
    { "bodyPart": "body part id", "note": "description of physical finding" }
  ],
  "bloodMarkers": [
    { "type": "WBC", "value": "5.2", "unit": "x10^9/L", "status": "normal" }
  ],
  "takeaways": ["key takeaway 1", "key takeaway 2"]
}

Do not use markdown. Do not include text outside the JSON.`;

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
