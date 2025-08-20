import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Shield, Palette, Terminal } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  allowFileOperations: boolean;
  allowShellCommands: boolean;
  allowNetworkAccess: boolean;
  theme: 'dark' | 'light' | 'auto';
  fontSize: string;
  cliPath: string;
  defaultModel: string;
}

const defaultSettings: Settings = {
  allowFileOperations: false,
  allowShellCommands: false,
  allowNetworkAccess: false,
  theme: 'dark',
  fontSize: '14',
  cliPath: '/usr/local/bin/claude',
  defaultModel: 'claude-3-5-sonnet-20241022',
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('claude-ui-settings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('claude-ui-settings', JSON.stringify(settings));
    
    // Apply theme change if needed
    if (settings.theme === 'dark' && !isDarkMode) {
      toggleDarkMode();
    } else if (settings.theme === 'light' && isDarkMode) {
      toggleDarkMode();
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-vscode-surface rounded-lg border border-vscode-border w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-vscode-border">
          <h2 className="text-lg font-semibold text-vscode-text">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-vscode-text-muted hover:text-white"
            onClick={onClose}
            data-testid="button-close-settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6 space-y-6">
          
          {/* Security Section */}
          <Card className="bg-vscode-bg border-vscode-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-vscode-text">
                <Shield className="h-4 w-4 text-vscode-warning" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription className="text-xs text-vscode-text-muted">
                All Claude Code tools are disabled by default for security. Enable only the tools you trust.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowFileOperations"
                  checked={settings.allowFileOperations}
                  onChange={(e) => updateSetting('allowFileOperations', e.target.checked)}
                  className="rounded bg-vscode-bg border-vscode-border"
                  data-testid="checkbox-allow-file-operations"
                />
                <div>
                  <label htmlFor="allowFileOperations" className="text-sm text-vscode-text cursor-pointer">
                    File Operations
                  </label>
                  <p className="text-xs text-vscode-text-muted">Allow reading, writing, and modifying files</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowShellCommands"
                  checked={settings.allowShellCommands}
                  onChange={(e) => updateSetting('allowShellCommands', e.target.checked)}
                  className="rounded bg-vscode-bg border-vscode-border"
                  data-testid="checkbox-allow-shell-commands"
                />
                <div>
                  <label htmlFor="allowShellCommands" className="text-sm text-vscode-text cursor-pointer">
                    Shell Commands
                  </label>
                  <p className="text-xs text-vscode-text-muted">Allow executing terminal commands</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowNetworkAccess"
                  checked={settings.allowNetworkAccess}
                  onChange={(e) => updateSetting('allowNetworkAccess', e.target.checked)}
                  className="rounded bg-vscode-bg border-vscode-border"
                  data-testid="checkbox-allow-network-access"
                />
                <div>
                  <label htmlFor="allowNetworkAccess" className="text-sm text-vscode-text cursor-pointer">
                    Network Access
                  </label>
                  <p className="text-xs text-vscode-text-muted">Allow making HTTP requests and API calls</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interface Section */}
          <Card className="bg-vscode-bg border-vscode-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-vscode-text">
                <Palette className="h-4 w-4 text-vscode-primary" />
                <span>Interface</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-vscode-text">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value as 'dark' | 'light' | 'auto')}
                  className="w-full bg-vscode-bg border border-vscode-border rounded px-3 py-2 text-sm text-vscode-text focus:outline-none focus:border-vscode-primary"
                  data-testid="select-theme"
                >
                  <option value="dark">Dark (VS Code)</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-vscode-text">Font Size</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value)}
                  className="w-full bg-vscode-bg border border-vscode-border rounded px-3 py-2 text-sm text-vscode-text focus:outline-none focus:border-vscode-primary"
                  data-testid="select-font-size"
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Claude Code CLI Section */}
          <Card className="bg-vscode-bg border-vscode-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center space-x-2 text-vscode-text">
                <Terminal className="h-4 w-4 text-vscode-success" />
                <span>Claude Code CLI</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-vscode-text">CLI Path</label>
                <Input
                  type="text"
                  placeholder="/usr/local/bin/claude"
                  value={settings.cliPath}
                  onChange={(e) => updateSetting('cliPath', e.target.value)}
                  className="bg-vscode-bg border-vscode-border text-vscode-text focus:border-vscode-primary"
                  data-testid="input-cli-path"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-vscode-text">Default Model</label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => updateSetting('defaultModel', e.target.value)}
                  className="w-full bg-vscode-bg border border-vscode-border rounded px-3 py-2 text-sm text-vscode-text focus:outline-none focus:border-vscode-primary"
                  data-testid="select-default-model"
                >
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="border-t border-vscode-border p-4 flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-vscode-text-muted hover:text-vscode-text"
            data-testid="button-cancel-settings"
          >
            Cancel
          </Button>
          <Button
            onClick={saveSettings}
            className="bg-vscode-primary text-white hover:bg-vscode-primary/90"
            data-testid="button-save-settings"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
