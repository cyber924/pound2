"use server";

import {
  AIServiceDetails,
  AIServiceDetailsOutput,
} from "@/ai/flows/ai-service-details-generation";
import { z } from "zod";

const formSchema = z.object({
  serviceConcept: z
    .string()
    .min(10, { message: "더 자세한 컨셉을 입력해주세요 (최소 10자)." }),
});

type FormState = {
  message: string;
  data: AIServiceDetailsOutput | null;
  errors: { serviceConcept?: string[] } | null;
};

export async function generateServiceDetailsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    serviceConcept: formData.get("serviceConcept"),
  });

  if (!validatedFields.success) {
    return {
      message: "잘못된 양식 데이터입니다.",
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await AIServiceDetails({
      serviceConcept: validatedFields.data.serviceConcept,
    });
    return {
      message: "success",
      errors: null,
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "세부 정보 생성에 실패했습니다. 다시 시도해 주세요.",
      errors: null,
      data: null,
    };
  }
}
