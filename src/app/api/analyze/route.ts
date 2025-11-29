// mneme-web/src/app/api/analyze/route.ts
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
    // Sentiment Analysis using textClassification
    const textClassificationResponse = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english', // A common sentiment analysis model
      inputs: note,
    });

    let sentiment = 'Neutral';
    if (textClassificationResponse && textClassificationResponse.length > 0) {
      // textClassification returns an array of scores for labels (e.g., POSITIVE, NEGATIVE)
      const topResult = textClassificationResponse.sort((a, b) => b.score - a.score)[0];
      sentiment = topResult.label;
    }

    // Keyword Extraction (using summarization as a proxy)
    const summaryResponse = await hf.summarization({
        model: 'facebook/bart-large-cnn', // A common summarization model
        inputs: note,
    });

    let keywords = ['No keywords found'];
    if (summaryResponse && summaryResponse.summary_text) {
        // Simple heuristic: take first few words from summary or split by common delimiters
        keywords = summaryResponse.summary_text.split(/[.,;\s]+/).filter(word => word.length > 3).slice(0, 5);
    }
    
    return NextResponse.json({
      sentiment,
      keywords,
    });
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze note via Hugging Face API.' }, { status: 500 });
  }
}
