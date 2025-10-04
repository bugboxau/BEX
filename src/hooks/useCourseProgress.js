// src/hooks/useCourseProgress.js
import { useState, useEffect } from 'react';

const useCourseProgress = (courseId) => {
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Load progress from localStorage on component mount
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    if (savedProgress[courseId]) {
      setProgress(savedProgress[courseId].progress);
      setCompletedSteps(savedProgress[courseId].completedSteps || []);
    }
  }, [courseId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('courseProgress') || '{}');
    savedProgress[courseId] = { progress, completedSteps };
    localStorage.setItem('courseProgress', JSON.stringify(savedProgress));
  }, [progress, completedSteps, courseId]);

  const markStepCompleted = (stepId, totalSteps) => {
    setCompletedSteps(prev => {
      const newCompleted = [...new Set([...prev, stepId])];
      const newProgress = Math.round((newCompleted.length / totalSteps) * 100);
      setProgress(newProgress);
      return newCompleted;
    });
  };

  const resetProgress = () => {
    setProgress(0);
    setCompletedSteps([]);
  };

  return {
    progress,
    completedSteps,
    markStepCompleted,
    resetProgress
  };
};

export default useCourseProgress;