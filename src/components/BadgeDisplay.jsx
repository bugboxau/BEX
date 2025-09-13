import React from 'react';

const badges = [
  {
    id: 1,
    title: 'Web Application Security Basics',
    description: 'Completed introductory course on web application security principles.',
    imageUrl: 'https://via.placeholder.com/100?text=Security+Badge',
    earned: true,
  },
  {
    id: 2,
    title: 'Introduction to Bug Bounty Hunting',
    description: 'Learned the fundamentals of bug bounty hunting.',
    imageUrl: 'https://via.placeholder.com/100?text=Bug+Bounty+Badge',
    earned: true,
  },
  {
    id: 3,
    title: 'Advanced Penetration Testing',
    description: 'Mastered advanced pen testing techniques.',
    imageUrl: 'https://via.placeholder.com/100?text=Pen+Testing+Badge',
    earned: true,
  },
  {
    id: 4,
    title: 'IoT Security Expert',
    description: 'Simulated secure IoT device telemetry and authentication.',
    imageUrl: 'https://via.placeholder.com/100?text=IoT+Badge',
    earned: true,
  },
  {
    id: 5,
    title: 'React Frontend Developer',
    description: 'Built interactive UI components with React and Tailwind.',
    imageUrl: 'https://via.placeholder.com/100?text=React+Badge',
    earned: true,
  },
];

export default function BadgeDisplay({ studentName, studentAge, studentLesson, onClose, onBadgeClick }) {
  const earnedBadges = badges.filter(badge => badge.earned);

  return (
    <div className="badge-display-container">
      <div className="badge-header">
        <h3>🎖️ Student Achievements</h3>
        <button onClick={onClose} className="close-badge-btn">✕</button>
      </div>
      
      <div className="student-info">
        <p><strong>Student:</strong> {studentName || 'Not specified'}</p>
        <p><strong>Age:</strong> {studentAge || 'Not specified'}</p>
        <p><strong>Focus:</strong> {studentLesson || 'Not specified'}</p>
      </div>
      
      <div className="badges-grid">
        {earnedBadges.map((badge) => (
          <div
            key={badge.id}
            className="badge-card clickable-badge"
            onClick={() => onBadgeClick(badge.title)}
          >
            <img 
              src={badge.imageUrl} 
              alt={badge.title} 
              className="badge-image"
            />
            <div className="badge-info">
              <h4>{badge.title}</h4>
              <p>{badge.description}</p>
            </div>
            <div className="badge-click-hint">👆 Click to view certificate</div>
          </div>
        ))}
      </div>
      
      {earnedBadges.length === 0 && (
        <div className="no-badges">
          <p>No badges earned yet. Complete courses to earn badges!</p>
        </div>
      )}
    </div>
  );
}
