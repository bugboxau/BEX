// QuizComponent.jsx
import React, { useState } from 'react';

const QuizComponent = ({ questions, onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [quizEnd, setQuizEnd] = useState(false);

  // Simple function to decode HTML entities if your API provides them
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    checkAnswer();
    handleNextQuestion();
  };

  const checkAnswer = () => {
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption("");
    } else {
      setQuizEnd(true);
      // Calculate if passed (e.g., 70% correct) and notify parent component
      const passed = score >= questions.length * 0.7;
      onQuizComplete(passed);
    }
  };

  if (quizEnd) {
    return (
      <div className="quiz-results">
        <h3>Quiz Complete! 🎉</h3>
        <p>Your score: {score} out of {questions.length}</p>
        {score >= questions.length * 0.7 ? (
          <div className="success-message">
            <p>Congratulations! You passed! 🏆</p>
          </div>
        ) : (
          <div className="retry-message">
            <p>Don't worry! You can try again.</p>
            <button onClick={() => {
              setCurrentQuestion(0);
              setSelectedOption("");
              setScore(0);
              setQuizEnd(false);
            }}>
              Try Again 🔄
            </button>
          </div>
        )}
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="quiz-section">
      <h3>Test Your Knowledge</h3>
      <div className="question-card">
        <p className="question-text">{decodeHtml(question.question)}</p>
        <form onSubmit={handleFormSubmit}>
          <div className='options'>
            {question.options.map((option, index) => (
              <div key={index} className="form-check">
                <input
                  type="radio"
                  name="option"
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleOptionChange}
                  className="form-check-input"
                />
                <label className="form-check-label">{decodeHtml(option)}</label>
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-primary mt-2">
            {currentQuestion + 1 === questions.length ? "Finish Quiz" : "Next Question"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizComponent;