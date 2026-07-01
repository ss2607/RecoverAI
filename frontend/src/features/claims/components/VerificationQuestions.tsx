import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { getVerificationQuestions } from '../services/verificationService';
import type { VerificationQuestion } from '../services/verificationService';
import type { Answer } from '../services/claimService';

interface VerificationQuestionsProps {
  itemId: string;
  onSubmitAnswers: (answers: Answer[]) => Promise<void>;
  isLoading: boolean;
}

export const VerificationQuestions: React.FC<VerificationQuestionsProps> = ({ itemId, onSubmitAnswers, isLoading }) => {
  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const res = await getVerificationQuestions(itemId);
        if (res.success) {
          setQuestions(res.data);
          const initialAnswers: Record<string, string> = {};
          res.data.forEach(q => {
            initialAnswers[q._id] = '';
          });
          setAnswers(initialAnswers);
        } else {
          setError('Failed to load verification questions');
        }
      } catch (err) {
        setError('An error occurred while loading questions');
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [itemId]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const formattedAnswers: Answer[] = questions.map(q => ({
      questionId: q._id,
      answer: answers[q._id] || ''
    }));
    onSubmitAnswers(formattedAnswers);
  };

  if (loadingQuestions) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Verification Questions</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please answer the following questions to verify your ownership of this item.
      </Typography>

      {questions.map((q, index) => (
        <Box key={q._id} mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            {index + 1}. {q.question}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            placeholder="Your answer"
            value={answers[q._id] || ''}
            onChange={(e) => handleChange(q._id, e.target.value)}
          />
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isLoading}
        fullWidth
      >
        {isLoading ? 'Submitting...' : 'Submit Answers'}
      </Button>
    </Box>
  );
};
