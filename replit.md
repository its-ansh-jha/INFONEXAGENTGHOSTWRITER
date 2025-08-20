# Overview

This repository contains two distinct applications: a modern web-based UI for Claude Code CLI and Cursor CLI (located in `claudecodeui/`), and a full-stack REST API application built with Express.js backend and React frontend (main project). Both applications serve different purposes and use different architectural approaches.

The GPT-5 Code UI is a comprehensive web interface that allows users to interact with OpenAI's GPT-5 model for code development and analysis. It provides features like interactive chat with GPT-5, project management, code generation, and development assistance through an intuitive web browser interface.

This application was transformed from a Claude Code UI template to integrate with GPT-5, offering advanced AI-powered coding assistance with state-of-the-art language model capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.
Authentication: Removed authentication system as requested by user on 2025-08-20.

# System Architecture

## Frontend Architecture

### React + TypeScript
Both applications use React with TypeScript for type safety and improved developer experience. The main project uses Vite as the build tool for fast development and optimized production builds.

### UI Components
- **shadcn/ui**: Provides a comprehensive set of reusable UI components built on Radix UI primitives
- **Tailwind CSS**: Used for styling with custom VS Code-inspired color themes
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts

### State Management
- **TanStack Query**: For server state management, caching, and API synchronization
- **React Context**: For global state like authentication and theme management
- **Local State**: Component-level state using React hooks

### Routing
- **Wouter**: Lightweight routing library for client-side navigation

## Backend Architecture

### Express.js Server
The main project uses Express.js with TypeScript for the backend API server, providing:
- RESTful API endpoints with `/api` prefix
- Middleware for request logging, error handling, and CORS
- Development-focused setup with Vite integration

### Authentication System
- **Removed**: Authentication system was removed as requested by user
- **Open Access**: Application now runs without login requirements
- **Direct API Access**: All API endpoints are accessible without authentication

## Data Storage Solutions

### PostgreSQL with Drizzle ORM
The main project is configured for PostgreSQL database using:
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Neon Database**: Serverless PostgreSQL provider integration
- **Schema Management**: Centralized schema definitions in `shared/schema.ts`
- **Migration System**: Database migrations stored in `migrations/` directory

### SQLite for Authentication (Claude UI)
The Claude Code UI uses SQLite for local authentication:
- **better-sqlite3**: Fast, synchronous SQLite operations
- **Local Storage**: Database file stored locally for desktop app usage

### In-Memory Storage Fallback
The main project includes a memory storage implementation for development/testing scenarios.

## External Dependencies

### GPT-5 Integration
- **OpenAI API Integration**: Direct integration with OpenAI's GPT-5 model via REST API
- **Advanced Code Generation**: State-of-the-art code generation with reasoning capabilities
- **Interactive Chat**: Real-time chat interface with GPT-5 for coding assistance
- **Project Context Awareness**: GPT-5 understands project context for better assistance

### Cursor CLI Integration  
- **MD5 Project Hashing**: Project identification using MD5 hashes of project paths
- **SQLite Session Storage**: Reading Cursor session data from `~/.cursor/chats/`
- **Process Management**: Spawning and managing Cursor CLI processes

### Git Integration
- **Native Git Commands**: Direct execution of git commands for repository operations
- **Status Tracking**: Real-time git status and change detection
- **Branch Management**: Switching and managing git branches

### PWA Capabilities (Claude UI)
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Native app-like installation on mobile devices
- **Touch Optimizations**: Mobile-specific UI adaptations

### Development Tools
- **Replit Integration**: Special configurations for Replit development environment
- **Hot Module Replacement**: Fast development with Vite HMR
- **TypeScript**: Full type checking across frontend and backend
- **ESLint/Prettier**: Code quality and formatting (implied by structure)

### Audio/Media Processing (Claude UI)
- **WebRTC MediaRecorder**: Browser-based audio recording
- **Whisper Integration**: Speech-to-text transcription capabilities
- **File Upload**: Drag-and-drop file handling with Multer

### Terminal Integration (Claude UI)
- **node-pty**: Pseudo-terminal support for shell integration
- **xterm.js**: Terminal emulator in the browser
- **WebSocket Terminals**: Real-time terminal communication

### External APIs
- **GitHub API**: Version checking for updates (Claude UI)
- **File System Watchers**: Real-time file change detection using chokidar
- **MIME Type Detection**: File type recognition for proper handling