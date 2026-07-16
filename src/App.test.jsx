import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App, { createQuizData, PREFECTURE_DATA, TIME_LIMIT_SECONDS } from './App.jsx';

describe('PREFECTURE_DATA', () => {
  it('contains all 47 prefectures', () => {
    expect(PREFECTURE_DATA).toHaveLength(47);
  });
});

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

  it('supports close difficulty quiz generation', () => {
    const quizzes = createQuizData('population', 3, 'more', 'close');
    expect(quizzes).toHaveLength(3);
    quizzes.forEach((quiz) => {
      expect(quiz.question).toContain('どっち？');
      expect(quiz.incorrect_answers).toHaveLength(1);
    });
  });
});

describe('App component', () => {
  it('renders the menu screen by default', () => {
    render(<App />);
    expect(screen.getByText('📊 日本の統計雑学クイズ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /クイズを開始する/ })).toBeInTheDocument();
  });

  describe('time attack mode', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      cleanup();
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('resets the timer after a timeout and on the next question', () => {
      render(<App />);

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /⏱️ タイムアタック/ }));
        fireEvent.click(screen.getByRole('button', { name: /クイズを開始する/ }));
      });

      expect(screen.getByText(`残り ${TIME_LIMIT_SECONDS}秒`)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime((TIME_LIMIT_SECONDS + 1) * 1000);
      });

      expect(screen.getByText(/時間切れ！/)).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /次の問題へ ⏭️/ }));
      });

      expect(screen.getByText(`残り ${TIME_LIMIT_SECONDS}秒`)).toBeInTheDocument();
    });
  });
});
