// mneme-web/src/app/api/categorize/route.ts
import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  throw new Error('HF_TOKEN environment variable is not set.');
}

const hf = new HfInference(HF_TOKEN);

export async function POST(request: Request) {
  const { note } = await request.json();

  if (!note) {
    return NextResponse.json({ error: 'Note is required' }, { status: 400 });
  }

  try {
    // Candidate labels for categorization
    const candidateLabels = [
      'Work',
      'Personal',
      'Shopping',
      'Health',
      'Finance',
      'Ideas',
      'Learning',
      'Travel',
      'Social',
      'General'
    ];

    // Using zero-shot classification to categorize the note
    const categorizationResponse = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli', // A common zero-shot classification model
      inputs: note,
      parameters: { candidate_labels: candidateLabels },
    });

    // Ensure categorizationResponse is an array before processing
    if (!Array.isArray(categorizationResponse) || categorizationResponse.length === 0) {
      console.error('Hugging Face API Error: Unexpected response format or empty response for categorization', categorizationResponse);
      return NextResponse.json({ error: 'Failed to categorize note: Unexpected API response or no categories found.' }, { status: 500 });
    }

    // Return only the single top category
    const topCategory = categorizationResponse
      .sort((a, b) => b.score - a.score)
      .slice(0, 1); // Only take the first (highest scoring) item

    return NextResponse.json(topCategory);
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    return NextResponse.json({ error: 'Failed to categorize note via Hugging Face API.' }, { status: 500 });
  }
}
