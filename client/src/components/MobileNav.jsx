import React from 'react';
import { Button } from '@/components/ui/button';

const MobileNav = ({ onToggleSidebar }) => {
  return (
    <div className="md:hidden bg-vscode-surface border-b border-vscode-border p-4">
      <Button
        variant="ghost"
        onClick={onToggleSidebar}
        className="text-vscode-text"
      >
        ☰ Menu
      </Button>
    </div>
  );
};

export default MobileNav;