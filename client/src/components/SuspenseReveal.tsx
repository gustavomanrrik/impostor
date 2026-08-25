import React from 'react';

export function SuspenseReveal() {
  return (
    <div className="suspense-screen" role="alert" aria-label="Contabilizando votos">
      <div className="suspense-text">OS VOTOS FORAM CONTADOS...</div>
      <div className="suspense-dots">
        <div className="suspense-dot" />
        <div className="suspense-dot" />
        <div className="suspense-dot" />
      </div>
    </div>
  );
}
