import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'A valid prompt is required.' }, { status: 400 });
    }

    const payload = {
      prompt,
      output_format: 'png',
    };

    const response = await axios.postForm(
      `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
      axios.toFormData(payload, new FormData()),
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'image/*',
        },
        responseType: 'arraybuffer',
      }
    );

    if (response.status === 200) {
      const format = 'png';
      const base64Image = `data:image/${format};base64,${Buffer.from(response.data).toString('base64')}`;

      return NextResponse.json({ imageUrl: base64Image });
    } else {
      throw new Error(`${response.status}: ${response.data.toString()}`);
    }
  } catch (error) {
    console.error('Error in image generation route:', error);
    return NextResponse.json(
      { error: 'Failed to generate image due to an unexpected error.' },
      { status: 500 }
    );
  }
}