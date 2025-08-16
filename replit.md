# Overview

This is an AI-powered meeting notes summarizer web application built with React and Express. The application allows users to upload meeting transcripts, generate AI summaries using custom prompts, edit those summaries, and share them via email. It features a clean, step-by-step workflow interface with progress tracking and uses modern web technologies including shadcn/ui components, TanStack Query for state management, and OpenAI's GPT-4o for summary generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **File Structure**: Component-based architecture with clear separation between UI components, pages, and utilities

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for file upload, summary generation, and email sending
- **File Processing**: Multer middleware for handling file uploads with support for text files (.txt, .doc, .docx)
- **Development Setup**: Custom Vite integration for development with HMR support
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Two main tables - summaries (storing original transcripts, prompts, and generated summaries) and email_logs (tracking email sends)
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Database Connection**: Neon Database serverless PostgreSQL integration

## Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Basic session handling with connect-pg-simple for PostgreSQL session store
- **Security**: No user authentication or authorization layers currently in place

## External Dependencies

### AI Services
- **OpenAI GPT-4o**: Used for generating meeting summaries based on custom user prompts
- **API Integration**: Direct integration with OpenAI's chat completions API

### Email Services
- **Nodemailer**: SMTP-based email sending for sharing summaries
- **Configuration**: Environment variable-based SMTP configuration with Gmail as default provider

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle Kit**: Database migrations and schema management

### Development Tools
- **Replit Integration**: Special development tooling for Replit environment
- **Vite Plugins**: Runtime error overlay and cartographer for enhanced development experience

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **date-fns**: Date manipulation utilities

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and integration with external AI and email services for core functionality.