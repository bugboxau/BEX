import React from 'react';
import './SummaryDashboard.css';

const SummaryDashboard = ({ earnedBadges = [], studentName = '' }) => {
  // Static data for demo - in real app, this would come from props or state
  const totalCourses = 5;
  const completedCourses = earnedBadges.length || 3; // Use actual earned badges count
  const certificatesEarned = earnedBadges.length || 3; // Same as completed courses

  return (
    <div className="summary-dashboard">
      <h3>Course Completion Summary</h3>
      <div className="dashboard-cards">
        <div className="summary-card">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <div className="card-value">{totalCourses}</div>
            <div className="card-label">Total Courses</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-value">{completedCourses}</div>
            <div className="card-label">Completed</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon">🏆</div>
          <div className="card-content">
            <div className="card-value">{certificatesEarned}</div>
            <div className="card-label">Certificates Earned</div>
          </div>
        </div>
      </div>
      
      {studentName && (
        <div className="student-greeting">
          Great progress, {studentName}! Keep learning!
        </div>
      )}
    </div>
  );
};

export default SummaryDashboard;