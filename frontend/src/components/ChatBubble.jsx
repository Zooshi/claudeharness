import React from 'react';

export default function ChatBubble({ onClick }) {
  return (
    <button
      className="chat-bubble"
      onClick={onClick}
      aria-label="Open chat"
      title="Ask about the harness"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 10a8 8 0 0 1-1.5 4.6 8.5 8.5 0 0 1-7 3.4 8.2 8.2 0 0 1-3.7-.9L3 19l1.8-4.7A7.8 7.8 0 0 1 3 10a8.5 8.5 0 0 1 8-8 8.5 8.5 0 0 1 8 8z" />
        <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="11" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
