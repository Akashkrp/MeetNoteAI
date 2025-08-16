# AI Meeting Notes Summarizer

A modern, full-stack web application that transforms meeting transcripts into intelligent summaries using AI, with seamless email sharing capabilities.

## 🎯 Overview

This application provides an intuitive 5-step workflow for processing meeting transcripts:
1. **Upload Transcript** - Support for text files (.txt, .doc, .docx) and direct text input
2. **Custom Prompting** - Tailored AI instructions for specific summarization needs
3. **AI Processing** - Intelligent summary generation using Google Gemini (free) or OpenAI GPT-4
4. **Summary Editing** - Real-time editing with live preview
5. **Email Sharing** - Professional email distribution with customizable content

## 🏗️ Architecture & Approach

### **Frontend-First Philosophy**
- **Minimalist Backend**: API focuses solely on data persistence and AI service integration
- **Rich Frontend**: Complete user experience handled client-side with React
- **Real-time Feedback**: Live progress tracking and immediate user feedback

### **Progressive Enhancement Strategy**
- **Demo Mode**: Fully functional without API keys for testing and development
- **Free Tier**: Google Gemini integration provides unlimited free AI summaries
- **Premium Tier**: OpenAI GPT-4 for advanced summarization capabilities

### **Workflow-Driven UX**
- **Step-by-Step Process**: Clear progression through defined workflow stages
- **State Management**: Persistent application state across workflow steps
- **Error Recovery**: Graceful handling of failures with clear user guidance

## 🛠️ Tech Stack

### **Frontend Technologies**
- **React 18** - Modern component architecture with hooks
- **TypeScript** - Type safety and improved developer experience
- **Wouter** - Lightweight client-side routing
- **TanStack Query v5** - Server state management and caching
- **shadcn/ui + Radix UI** - Accessible, customizable component library
- **Tailwind CSS** - Utility-first styling with responsive design
- **Framer Motion** - Smooth animations and transitions

### **Backend Technologies**
- **Express.js** - Web application framework
- **TypeScript** - Full-stack type safety
- **Multer** - File upload handling
- **Nodemailer** - Professional email delivery
- **In-Memory Storage** - Fast development with MemStorage implementation

### **AI & External Services**
- **Google Gemini AI** - Free tier AI summarization
- **OpenAI GPT-4** - Premium AI capabilities
- **Gmail SMTP** - Reliable email delivery service

### **Development & Build Tools**
- **Vite** - Fast development server and building
- **ESBuild** - Ultra-fast JavaScript bundler
- **Drizzle ORM** - Type-safe database operations (extensible)
- **Zod** - Runtime type validation and schema definition

## 📂 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── custom-prompt.tsx
│   │   │   ├── email-sharing.tsx
│   │   │   ├── summary-editor.tsx
│   │   │   ├── transcript-upload.tsx
│   │   │   └── workflow-progress.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Route components
│   │   └── App.tsx        # Root application component
├── server/                # Backend Express application
│   ├── services/          # External service integrations
│   │   ├── email.ts       # Email delivery service
│   │   ├── gemini.ts      # Google AI integration
│   │   └── openai.ts      # OpenAI integration
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data storage interface
├── shared/                # Shared types and schemas
│   └── schema.ts          # Zod schemas and TypeScript types
└── build configuration files
```

## 🔧 Development Process

### **Schema-First Development**
1. **Data Modeling** - Define schemas in `shared/schema.ts` first
2. **Type Generation** - Generate TypeScript types from Drizzle schemas
3. **API Design** - Create type-safe API endpoints using Zod validation
4. **Frontend Integration** - Consume typed APIs with TanStack Query

### **Component Architecture**
- **Atomic Design** - Reusable UI components with single responsibilities
- **Controlled Components** - Form state managed through react-hook-form
- **Progressive Disclosure** - Step-by-step workflow with conditional rendering

### **State Management Strategy**
- **Server State** - TanStack Query for API data and caching
- **Client State** - React hooks for local component state
- **Form State** - react-hook-form with Zod validation
- **Workflow State** - Custom hooks for step management

## 🚀 Key Features

### **Intelligent AI Fallback System**
- **Primary**: Google Gemini (free, generous limits)
- **Secondary**: OpenAI GPT-4 (premium quality)
- **Fallback**: Demo mode (full functionality testing)

### **Professional Email Integration**
- **Gmail Integration** - Secure app password authentication
- **Rich HTML Templates** - Professional email formatting
- **Flexible Recipients** - Multiple recipient support
- **Copy Options** - Send copy to sender functionality

### **Robust File Handling**
- **Multiple Formats** - .txt, .doc, .docx support
- **Size Limits** - 10MB maximum file size
- **Direct Input** - Text area for direct transcript entry
- **Validation** - Client and server-side validation

### **User Experience Excellence**
- **Real-time Feedback** - Live progress indicators
- **Error Handling** - Graceful error recovery
- **Responsive Design** - Mobile-first responsive layout
- **Accessibility** - WCAG compliant components

## 🔐 Security & Configuration

### **Environment Variables**
```bash
# Required for email functionality
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

# AI Services (at least one required)
GEMINI_API_KEY=your-google-gemini-key
OPENAI_API_KEY=your-openai-key

# Production settings
NODE_ENV=production
DATABASE_URL=your-database-connection-string
```

### **Security Best Practices**
- **Environment Variable Storage** - No secrets in codebase
- **Input Validation** - Zod schemas for all user inputs
- **File Type Restrictions** - Limited to safe document formats
- **Gmail App Passwords** - Secure email authentication

## 📈 Scalability Considerations

### **Database Ready**
- **Storage Interface** - Abstract storage layer for easy database integration
- **Drizzle ORM** - Ready for PostgreSQL, MySQL, SQLite
- **Schema Migration** - Built-in migration capabilities

### **API Architecture**
- **RESTful Design** - Standard HTTP methods and status codes
- **Error Handling** - Consistent error response format
- **Caching Strategy** - TanStack Query for client-side caching

### **Performance Optimization**
- **Code Splitting** - Vite-powered bundle optimization
- **Asset Optimization** - Automatic image and asset processing
- **Lazy Loading** - Component-level code splitting ready

## 🚀 Deployment

### **Build Process**
```bash
npm install          # Install dependencies
npm run build       # Build frontend and backend
npm start           # Start production server
```

### **Production Requirements**
- **Node.js 18+** - Runtime environment
- **PostgreSQL** - Database (optional, defaults to in-memory)
- **SMTP Service** - Email delivery (Gmail recommended)
- **AI API Keys** - Google Gemini (free) or OpenAI (paid)

## 🧪 Development Features

### **Hot Module Replacement**
- **Vite HMR** - Instant frontend updates
- **TSX** - TypeScript execution for backend development

### **Type Safety**
- **End-to-End Types** - Shared schemas ensure consistency
- **Runtime Validation** - Zod schemas validate at runtime
- **IDE Support** - Full TypeScript IntelliSense

### **Developer Experience**
- **Single Command Start** - `npm run dev` starts everything
- **Unified Port** - Frontend and backend on same port (5000)
- **Auto-restart** - Backend restarts on file changes

## 📝 Usage Philosophy

This application follows a **progressive enhancement** approach:
1. **Works without configuration** - Demo mode for immediate testing
2. **Enhanced with free services** - Gemini API for unlimited AI
3. **Premium with paid services** - OpenAI for advanced capabilities
4. **Scales to production** - Database and email integration ready

The workflow is designed to be **intuitive and forgiving**, allowing users to move backward and forward through steps while maintaining their progress.