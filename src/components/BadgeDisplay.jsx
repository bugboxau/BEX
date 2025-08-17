import React from 'react';

const badges = [
  {
    id: 1,
    title: 'Web Application Security Basics',
    description: 'Completed introductory course on web application security principles.',
    imageUrl: 'https://via.placeholder.com/100?text=Security+Badge',
  },
  {
    id: 2,
    title: 'Introduction to Bug Bounty Hunting',
    description: 'Learned the fundamentals of bug bounty hunting.',
    imageUrl: 'https://via.placeholder.com/100?text=Bug+Bounty+Badge',
  },
  {
    id: 3,
    title: 'Advanced Penetration Testing',
    description: 'Mastered advanced pen testing techniques.',
    imageUrl: 'https://via.placeholder.com/100?text=Pen+Testing+Badge',
  },
  {
  id: 4,
  title: 'IoT Security Expert',
  description: 'Simulated secure IoT device telemetry and authentication.',
  imageUrl: 'https://via.placeholder.com/100?text=IoT+Badge',
},
{
  id: 5,
  title: 'React Frontend Developer',
  description: 'Built interactive UI components with React and Tailwind.',
  imageUrl: 'https://via.placeholder.com/100?text=React+Badge',clear
},

];

export default function BadgeDisplay() {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', flexWrap: 'wrap' }}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          style={{
            borderRadius: '12px',
            padding: '15px',
            width: '180px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            background: 'linear-gradient(to bottom right, #f0f0f0, #ffffff)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          <img src={badge.imageUrl} alt={badge.title} style={{ width: '100px', height: '100px', marginBottom: '10px' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{badge.title}</h3>
          <p style={{ fontSize: '0.85rem', color: '#555' }}>{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
