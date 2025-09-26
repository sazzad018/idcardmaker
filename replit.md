# Overview

This is a Teacher ID Card Generator application that allows users to create and customize ID cards for teachers. The application is built as a full-stack web application with a React frontend and Express.js backend, featuring a Bengali language interface and multiple card templates. Users can input teacher information, upload photos, select from various design templates, and generate downloadable ID cards in PNG or PDF formats.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation using @hookform/resolvers
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Development Setup**: Uses tsx for TypeScript execution in development
- **File Uploads**: Multer middleware for handling image uploads with validation
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **Build Process**: esbuild for production bundling with ESM output format

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless driver (@neondatabase/serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing

## Core Features
- **ID Card Generation**: Canvas-based rendering for creating ID cards with multiple template options
- **File Upload**: Image processing for teacher photos with size and type validation
- **Template System**: Four predefined color themes (classic-blue, nature-green, royal-red, deep-blue)
- **Export Options**: PNG and PDF generation capabilities for downloading ID cards
- **Form Validation**: Comprehensive validation using Zod schemas for teacher data

## External Dependencies

- **Database**: Neon PostgreSQL serverless database for production data storage
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Fonts**: Google Fonts integration (Noto Sans Bengali, Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Icons**: Font Awesome 6.4.0 for UI icons
- **Development Tools**: Replit-specific plugins for development environment integration
- **Date Handling**: date-fns library for date formatting and manipulation
- **Canvas Operations**: HTML5 Canvas API for ID card rendering and image generation