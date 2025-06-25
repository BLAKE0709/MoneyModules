# StudentOS - AI-Powered Educational Platform

## Overview

StudentOS is a comprehensive AI-powered educational platform that combines student persona management, essay polishing, and B2B school administration tools. The application is built with a full-stack TypeScript architecture featuring a React frontend, Express.js backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API**: RESTful endpoints with comprehensive error handling

### Database Architecture
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive schema supporting users, schools, essays, personas, and scholarships
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Role-based Access**: Support for student, counselor, and admin roles

### Student Persona Management
- **Profile Building**: Comprehensive student information collection
- **Academic Data**: GPA, test scores, class rank tracking
- **Financial Information**: EFC, income range, FAFSA status
- **Career Planning**: Intended majors and career goals tracking

### Essay Management System
- **Essay Creation**: Support for multiple essay types and prompts
- **Version Control**: Complete essay revision history
- **AI Analysis**: OpenAI GPT-4o integration for essay evaluation
- **Scoring System**: Clarity, impact, and originality metrics

### AI Integration
- **Essay Analysis**: Automated scoring and feedback generation
- **Improvement Suggestions**: Targeted recommendations with impact levels
- **Scholarship Matching**: AI-powered scholarship discovery based on student profiles

### B2B School Administration
- **School Management**: Multi-tenant architecture for educational institutions
- **User Roles**: Hierarchical permissions for students, counselors, and administrators
- **Analytics Dashboard**: Comprehensive reporting and insights
- **Activity Tracking**: Complete audit trail of user actions

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect verification with Replit servers
3. Session creation and storage in PostgreSQL
4. User profile creation or retrieval
5. Role-based access control enforcement

### Essay Analysis Flow
1. Student submits essay content and metadata
2. Content validation and storage in database
3. OpenAI API call for comprehensive analysis
4. AI response parsing and scoring calculation
5. Suggestion generation and impact assessment
6. Results storage and presentation to user

### Scholarship Matching Flow
1. Student persona data aggregation
2. AI-powered profile analysis
3. Scholarship database matching algorithms
4. Relevance scoring and ranking
5. Personalized recommendations delivery

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI GPT-4o for essay analysis and recommendations
- **Authentication**: Replit Auth service
- **UI Components**: Radix UI primitives and Shadcn/ui

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast backend bundling for production
- **PostCSS**: CSS processing with Tailwind CSS
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Platform**: Replit with integrated development environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Database**: Shared PostgreSQL instance with development data

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: ESBuild bundling with external package handling
- **Static Assets**: Served from Express with proper caching headers

### Environment Configuration
- **Database**: Neon PostgreSQL with connection pooling
- **Sessions**: Secure session configuration with HTTP-only cookies
- **API Keys**: Environment-based configuration for OpenAI integration

## Recent Changes

```
Recent Updates:
- June 25, 2025: Multi-agent system implementation complete
  * Deployed PersonaLearning, EssayPolish, and ScholarshipScout agents
  * Created AI Agent Dashboard with real-time coordination
  * Built B2B integration layer for school partnerships
  * Established agentic tether for external tool collaboration
  * Added voice-preserving essay analysis with writing style DNA
  * Implemented automated scholarship discovery and tracking

- June 25, 2025: Platform Integration Hub launched
  * Universal connector for educational platforms (Chess.com, Khan Academy, etc.)
  * AI usage portfolio generation for college applications
  * Cross-platform learning insights and skill demonstrations
  * Integration packages for strategic thinking, math, AI collaboration
  * Webhook system for real-time data ingestion from external platforms

- June 25, 2025: Enhanced UX with multi-agent branding applied site-wide
  * Consistent agent status indicators across all pages (Writing Repository, Profile, Admin)
  * Interactive navigation with live agent status and tooltips
  * Agent-powered feature highlighting throughout interface
  * Polished gradient design language emphasizing AI capabilities
  * Enhanced touch and feel matching dashboard multi-agent showcase
  * Comprehensive visual branding showing PersonaLearning, EssayPolish Pro, ScholarshipScout active states

- June 25, 2025: AI Usage Portfolio breakthrough feature launched
  * Revolutionary ChatGPT conversation analysis into professional skills portfolio
  * AI-powered skill categorization (Research, Problem Solving, Technical Assistance, etc.)
  * Professional readiness scoring for college applications and job interviews
  * Downloadable portfolio documents proving AI proficiency to employers
  * API integration for ChatGPT data import and analysis
  * Addresses critical market need: proving students can "use AI to make businesses better"

- June 25, 2025: ScholarshipScout "useful v1" deployed for real-world use
  * Live scholarship database with 8 major scholarships (Coca-Cola, Gates, Dell, etc.)
  * AI-powered eligibility matching based on GPA, demographics, majors, activities
  * Smart ranking with competitiveness analysis and time-to-complete estimates
  * Personalized AI recommendations for each scholarship opportunity
  * Real scholarship amounts totaling $200k+ in available funding
  * Ready for Chloe's immediate use in her college application process

- June 25, 2025: Major UX enhancements implemented
  * Enhanced Essay cards with hover effects and quick actions
  * Real-time search and filtering across all content
  * Bulk operations for essays and writing samples
  * Auto-save functionality with visual indicators
  * Keyboard shortcuts (⌘K search, ⌘N new essay, ⌘U upload)
  * Writing style visualization with radar charts
  * Upload progress bars and improved error handling
  * Enhanced toast notifications with action buttons
  * Skeleton loading states for better perceived performance
  * Mobile-responsive design improvements

- June 24, 2025: Initial StudentOS platform setup
  * Core authentication with Replit Auth
  * Database schema with Drizzle ORM
  * Essay management and AI analysis
  * Writing Repository with drag-and-drop uploads
  * Student persona management
  * B2B school administration features
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
UX Focus: User loves excellent UX and wants suggestions for improvements.
Business Vision: Building StudentOS for daughter Chloe (high school senior), with goal to scale from useful to profitable multi-agent system for students through college and workforce entry.
Monetization Strategy: B2B SaaS for schools, marketplace revenue share, premium bundles, API licensing, white-label SDK.
Multi-Agent Architecture: Core persona learning engine with specialized agents for essay polish, scholarship discovery, and B2B school integration.
Agentic Tether: External API system enabling partner educational tools to leverage StudentOS persona data and AI capabilities.
Platform Integration Hub: Universal connector for educational platforms (Chess.com, Khan Academy, ChatGPT usage) to create comprehensive digital personas and application portfolios.
AI Usage Portfolio: Revolutionary feature that transforms ChatGPT conversation history into demonstrable professional AI skills, creating competitive advantage for college applications and job interviews by proving students can "use AI to make businesses better."
```