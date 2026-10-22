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
	created_at: Date;
}

export interface SubmitResponse {
  submission_id: string | number;
  message: string;
  result: ResultOut;
}