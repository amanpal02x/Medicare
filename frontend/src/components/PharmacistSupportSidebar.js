import React from 'react';

const topics = [
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact Admin' },
  { id: 'report', label: 'Report Issue' },
  { id: 'chat', label: 'Live Chat' },
];

const PharmacistSupportSidebar = ({ selected, onSelect }) => {
  return (
    <div style={{ width: 220, background: '#f8faff', borderRight: '1.5px solid #e0e7ef', minHeight: 400, padding: '24px 0' }}>
      <h3 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 24 }}>Support</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {topics.map(topic => (
          <li key={topic.id}>
            <button
              onClick={() => onSelect(topic.id)}
              style={{
                width: '100%',
                background: selected === topic.id ? '#e3f2fd' : 'transparent',
                color: selected === topic.id ? '#1976d2' : '#222',
                border: 'none',
                borderLeft: selected === topic.id ? '4px solid #1976d2' : '4px solid transparent',
                padding: '12px 20px',
                textAlign: 'left',
                fontWeight: selected === topic.id ? 700 : 500,
                fontSize: 16,
                cursor: 'pointer',
                outline: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {topic.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PharmacistSupportSidebar; 