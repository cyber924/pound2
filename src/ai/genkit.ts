import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiKey: "AIzaSyDAjwKcnCcbNmb93k1G-6NNsShO4B88Jj4"})],
  model: 'googleai/gemini-2.0-flash',
});
