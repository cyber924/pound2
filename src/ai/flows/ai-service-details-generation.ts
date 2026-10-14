'use server';

/**
 * @fileOverview AI-powered service details generation flow.
 *
 * This file defines a Genkit flow that automatically generates service details (name, description, thumbnail suggestions, tech stack) based on a service concept.
 *
 * @module src/ai/flows/ai-service-details-generation
 *
 * @exports {AIServiceDetails} - The main function to trigger service details generation.
 * @exports {AIServiceDetailsInput} - The input type for the AIServiceDetails function.
 * @exports {AIServiceDetailsOutput} - The output type for the AIServiceDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the service details generation.
const AIServiceDetailsInputSchema = z.object({
  serviceConcept: z
    .string()
    .describe(
      'A brief description of the service concept for which details need to be generated.'
    ),
});
export type AIServiceDetailsInput = z.infer<typeof AIServiceDetailsInputSchema>;

// Define the output schema for the generated service details.
const AIServiceDetailsOutputSchema = z.object({
  serviceName: z.string().describe('The generated name of the service.'),
  serviceDescription: z.string().describe('The generated description of the service.'),
  thumbnailSuggestions: z
    .array(z.string())
    .describe('An array of suggested thumbnail image descriptions.'),
  techStackSuggestions: z
    .array(z.string())
    .describe('An array of suggested technologies for the service.'),
});
export type AIServiceDetailsOutput = z.infer<typeof AIServiceDetailsOutputSchema>;


/**
 * Generates service details using AI based on the provided service concept.
 * @param {AIServiceDetailsInput} input - The input containing the service concept.
 * @returns {Promise<AIServiceDetailsOutput>} - A promise resolving to the generated service details.
 */
export async function AIServiceDetails(input: AIServiceDetailsInput): Promise<AIServiceDetailsOutput> {
  return aiServiceDetailsFlow(input);
}

const aiServiceDetailsPrompt = ai.definePrompt({
  name: 'aiServiceDetailsPrompt',
  input: {schema: AIServiceDetailsInputSchema},
  output: {schema: AIServiceDetailsOutputSchema},
  prompt: `당신은 새로운 서비스에 대한 세부 정보를 한국어로 생성하는 전문 비즈니스 컨설턴트입니다.

  제공된 서비스 컨셉을 바탕으로, 이 서비스에 가장 적합한 이름, 마케팅에 적합한 간결한 설명, 시각적으로 매력적인 썸네일 이미지 제안(최대 3개), 그리고 구현에 필요한 현대적인 기술 스택 제안을 생성해주세요. 
  모든 텍스트 결과물은 반드시 한국어로 작성되어야 하며, 기술 스택은 공식 명칭(영어)을 사용해도 좋습니다.

  서비스 컨셉: {{{serviceConcept}}}
  `,
});

// Define the Genkit flow for generating service details.
const aiServiceDetailsFlow = ai.defineFlow(
  {
    name: 'aiServiceDetailsFlow',
    inputSchema: AIServiceDetailsInputSchema,
    outputSchema: AIServiceDetailsOutputSchema,
  },
  async input => {
    const {output} = await aiServiceDetailsPrompt(input);
    if (!output) {
      throw new Error('AI output generation failed.');
    }
    return output;
  }
);
