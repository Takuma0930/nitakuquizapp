import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App, { createQuizData } from './App.jsx';

describe('createQuizData', () => {
  it('returns the requested number of quizzes', () => {
    const quizzes = createQuizData('population', 5, 'more');
    expect(quizzes).toHaveLength(5);
  });

  it('always returns a correct answer that matches one of the options', () => {
    const quizzes = createQuizData('rice', 10, 'less');
    quizzes.forEach((quiz) => {
      expect(quiz.question).toBeTypeOf('string');
      expect(quiz.correct_answer).toBeDefined();
      expect(quiz.incorrect_answers).toHaveLength(1);
      expect([quiz.correct_answer, ...quiz.incorrect_answers]).toContain(quiz.correct_answer);
    });
  });

  it('generates different prefectures for each quiz item', () => {
    const quizzes = createQuizData('area', 10, 'more');
    quizzes.forEach((quiz) => {
      expect(quiz.question).toMatch(/「.+」と「.+」、/);
    });
  });
});

describe('App component', () => {
  it('renders the menu screen by default', () => {
    render(<App />);
    expect(screen.getByText('📊 日本の統計雑学クイズ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /クイズを開始する/ })).toBeInTheDocument();
  });
});
