# 篠島漁業DX - バックオフィス業務効率化システム

## Overview

This is a digital transformation application specifically designed for fishermen in Shinojima, Japan. The system leverages AI and modern web technologies to streamline back-office operations in the fishing industry, with a particular focus on serving elderly fishermen who may have limited technical experience. The application provides photo-based fish species recognition, voice input for easy data entry, automated bookkeeping through receipt scanning, inventory management, and AI-powered business consulting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a **React-based Single Page Application (SPA)** architecture with TypeScript for type safety. The choice of React provides component reusability and a robust ecosystem for the complex UI requirements of the fishery management system.

**Design System**: Implements shadcn/ui components with Radix UI primitives, ensuring accessibility and consistent user experience. The design follows Material Design principles specifically optimized for elderly users with larger touch targets, high contrast colors, and simple navigation patterns.

**Navigation**: Bottom tab navigation pattern for mobile-first design, providing easy thumb access to five core functions: photo recording, voice recording, bookkeeping, inventory management, and settings.

**State Management**: Uses TanStack Query for server state management and caching, providing offline capabilities and optimistic updates crucial for field work where internet connectivity may be intermittent.

**Styling**: Tailwind CSS with custom design tokens for consistent theming and responsive design. Supports both light and dark modes with a preference for light mode due to outdoor usage requirements.

### Backend Architecture
**Framework**: Express.js server with TypeScript, chosen for rapid development and extensive ecosystem support for AI integrations.

**API Design**: RESTful API architecture with specific endpoints for AI-powered image analysis (/api/analyze-fish, /api/analyze-receipt) and business consulting (/api/business-advice).

**File Handling**: Multer middleware for handling image uploads with memory storage and 10MB file size limits, optimized for mobile photo capture.

**Data Storage**: Dual storage approach with in-memory storage for development and Drizzle ORM prepared for PostgreSQL production deployment. This provides flexibility for rapid prototyping while maintaining production scalability.

### AI Integration
**Computer Vision**: Google Gemini 2.5 Pro for fish species recognition and receipt OCR processing. The system prompts are specifically tuned for fishery terminology and Japanese business documents.

**Conversational AI**: Integrated AI assistant for business consultation, capable of analyzing business data and providing fishing industry-specific advice in Japanese.

**Voice Processing**: Web Speech API integration for voice input functionality, supporting Japanese language recognition for hands-free data entry.

### Database Schema
**User-Centric Design**: All data models are associated with user accounts for multi-tenant support within fishing cooperatives.

**Core Entities**:
- **Users**: Basic fisherman profiles with contact information
- **Shipments**: Fish catch records with species, quantity, destination, and pricing
- **Expenses**: Cost tracking with automated categorization and receipt image storage
- **Inventory**: Equipment and supply management with low-stock alerts
- **Documents**: Digital storage for licenses, permits, and insurance documents

**Data Types**: Uses PostgreSQL decimal types for financial precision and timestamp fields for proper temporal data tracking.

### Security & Authentication
**Session Management**: PostgreSQL-backed session storage using connect-pg-simple for persistent login states across devices.

**File Security**: Controlled file upload handling with type restrictions and size limits to prevent malicious uploads.

### Mobile Optimization
**PWA-Ready**: Vite configuration supports Progressive Web App features for offline functionality and native app-like experience.

**Touch-First UI**: All interactive elements sized for elderly users with minimum 44px touch targets and clear visual feedback.

**Camera Integration**: Direct camera access for photo capture without requiring file system navigation, streamlining the workflow for field use.

## External Dependencies

### AI Services
- **Google Gemini API**: Primary AI service for image recognition (fish species identification and receipt OCR) and conversational business consulting
- **Web Speech API**: Browser-native voice recognition for Japanese language input

### Database & Storage
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Drizzle ORM**: Type-safe database toolkit with migration support

### UI Framework
- **React**: Core frontend framework with TypeScript
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with consistent design
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Development Tools
- **Vite**: Build tool and development server with HMR
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **Google Fonts (Noto Sans JP)**: Typography optimized for Japanese text

### Infrastructure
- **Express.js**: Backend server framework
- **Multer**: File upload handling middleware
- **Connect-PG-Simple**: PostgreSQL session store

The architecture prioritizes simplicity, accessibility, and offline capability to serve the specific needs of elderly fishermen while providing powerful AI-enhanced functionality for business management.