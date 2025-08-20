import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, needsSetup, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin && !needsSetup) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const title = needsSetup ? 'Setup Claude Code UI' : (isLogin ? 'Welcome Back' : 'Create Account');
  const subtitle = needsSetup 
    ? 'Create your first administrator account'
    : (isLogin ? 'Sign in to your Claude Code UI account' : 'Sign up for a new account');

  return (
    <div className="min-h-screen bg-vscode-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-vscode-surface border-vscode-border">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-vscode-primary rounded-xl flex items-center justify-center mx-auto">
            <Code className="text-white text-2xl" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-vscode-text">{title}</CardTitle>
            <CardDescription className="text-vscode-text-muted mt-2">
              {subtitle}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-vscode-error/10 border border-vscode-error/20 rounded-lg">
                <p className="text-sm text-vscode-error">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-vscode-text mb-2">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="bg-vscode-bg border-vscode-border text-vscode-text placeholder:text-vscode-text-muted focus:border-vscode-primary"
                data-testid="input-username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-vscode-text mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-vscode-bg border-vscode-border text-vscode-text placeholder:text-vscode-text-muted focus:border-vscode-primary pr-10"
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-vscode-text-muted hover:text-vscode-text"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-vscode-primary text-white hover:bg-vscode-primary/90"
              disabled={isLoading || !username || !password}
              data-testid="button-submit"
            >
              {isLoading ? 'Please wait...' : (needsSetup ? 'Setup Account' : (isLogin ? 'Sign In' : 'Sign Up'))}
            </Button>
          </form>
          
          {!needsSetup && (
            <div className="mt-6 text-center">
              <p className="text-sm text-vscode-text-muted">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                className="text-vscode-primary hover:text-vscode-primary/80 p-0 h-auto font-normal"
                onClick={() => setIsLogin(!isLogin)}
                data-testid="button-switch-mode"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
