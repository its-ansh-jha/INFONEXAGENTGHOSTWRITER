import React from 'react';

const QuickSettingsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-vscode-surface p-6 rounded-lg border border-vscode-border max-w-md w-full">
        <h3 className="text-lg font-semibold text-vscode-text mb-4">Quick Settings</h3>
        <p className="text-vscode-text-muted mb-4">Quick access to common settings.</p>
        <button 
          onClick={onClose}
          className="bg-vscode-primary text-white px-4 py-2 rounded hover:bg-vscode-primary/90"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QuickSettingsPanel;