import { Question, SubmitPayload, SubmitResponse } from '@/types/mbti';
import { api } from '@/lib/api';

export const mbtiApi = {
  // Lấy danh sách câu hỏi
  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get('/mbti/questions');
    return response.data;
  },

  // Nộp bài làm
  submitAnswers: async (payload: SubmitPayload): Promise<SubmitResponse> => {
    const response = await api.post('/mbti/submit', payload);
    return response.data;
  },

  // Lấy test_id từ localStorage (hoặc nơi khác)
  getTestId: async (): Promise<string> => {
    // Giả sử test_id được lưu trong localStorage
    const testId = localStorage.getItem('test_id');
    if (!testId) {
      throw new Error('Test ID not found in localStorage.');
    }
    return testId;
  },

  // Lấy kết quả bài làm dựa trên submission_id
  getSubmissionResult: async (submissionId: string): Promise<SubmitResponse> => {
    const response = await api.get(`/mbti/result/${submissionId}`);
    return response.data;
  },
};