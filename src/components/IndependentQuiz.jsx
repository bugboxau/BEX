import React, { useState } from 'react';
import QuizComponent from './QuizComponent';
import quizData from './quizData';

const IndependentQuiz = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleQuizComplete = (passed) => {
    setQuizCompleted(passed);
    setShowQuiz(false);
  };

  if (!showQuiz) {
    return (
      <button
        onClick={() => setShowQuiz(true)}
        className="take-quiz-btn"
        style={{
          backgroundColor: "#1f1f1f",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          margin: "0 10px"
        }}
      >
        Take Quiz 🧠
      </button>
    );
  }

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal-content">
        <button
          className="quiz-close-btn"
          onClick={() => setShowQuiz(false)}
        >
          ✕
        </button>

        <QuizComponent
          questions={quizData.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.answer
          }))}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    </div>
  );
};

export default IndependentQuiz;
