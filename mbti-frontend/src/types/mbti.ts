export interface Question {
	id: number;
	order: number;
	content: string;
	weights: Record<string, number>;
}

export interface AnswerIn {
	question_id: number;
	value: number; // Trong khoảng [-2, 2]
}

export interface SubmitPayload {
	test_id: string;
	answers: AnswerIn[];
}

export interface AxisResult {
	left_code: string;
	right_code: string;
	left_percentage: number;
	right_percentage: number;
	dominant: string;
}

export interface ResultOut {
	submission_id: string;
	personality_code: string;
	title: string;
	validity_score: number;
	spectrum: Record<string, AxisResult>;
	strengths: string[];
	weaknesses: string[];
	created_at: string;
}

export interface SubmitResponse {
  submission_id: string | number;
  message: string;
  result: ResultOut;
}

// MBTI Personality Detail

export interface SectionContent {
  overview: string;
  free_content: {
    strengths: Array<{ title: string; description: string }>;
    weaknesses: Array<{ title: string; description: string }>;
  };
  premium_content?: {
    [key: string]: any;
  };
}

export interface MBTIPersonalityDetail {
  personality_code: string;
  base_code: string;
  identity_variant: string;
  title: string;
  modules: {
    personality_traits: SectionContent;
    career_path: SectionContent;
    personal_growth: SectionContent;
    relationships: SectionContent;
  };
}