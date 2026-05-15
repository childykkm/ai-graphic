# Tasks

## Phase 1: Monorepo Setup & Infrastructure

### Task 1.1: Initialize Monorepo Structure
- [x] Create root `package.json` with npm workspaces configuration
- [x] Set up `apps/` and `packages/` directories
- [x] Configure workspace dependencies and scripts
- [x] Add `.gitignore` for monorepo structure
- [ ] **Verify workspace aliases are configured (@repo/ui, @repo/core, @repo/config, @repo/styles)**

### Task 1.2: Setup Express.js Server
- [x] Create `apps/graphic/server/` directory structure
- [x] Initialize Express.js with TypeScript
- [x] Configure middleware (CORS, body-parser, session)
- [x] Set up environment variable loading (.env)
- [x] Create server entry point (`server/index.ts`)

### Task 1.3: Setup Vite + React Router
- [x] Create `apps/graphic/src/` directory structure
- [x] Initialize Vite configuration for React + TypeScript
- [x] Install and configure React Router v6
- [x] Create file-based routing system (`src/routes/`)
- [x] Set up router configuration (`src/router.tsx`)
- [x] Create main entry point (`src/main.tsx`)
- [ ] **Configure Vite to use base path `/graphic/` for deployment**
- [ ] **Verify apps/graphic serves at `/graphic/` route**

### Task 1.4: Setup Shared Packages
- [x] Create `packages/core/` with TypeScript configuration
- [x] Create `packages/ui/` with React + TypeScript
- [x] Create `packages/config/` for shared configurations
- [x] Create `packages/styles/` for Tailwind CSS
- [x] Configure package exports and dependencies
- [x] **Create `packages/core/src/hooks/` directory**
- [x] **Create `packages/ui/src/` component directories (ImageUploader, ResultsGallery, etc.)**
- [x] **Verify all packages export from index.ts correctly**

### Task 1.5: Configure Build Pipeline
- [x] Set up Vite build configuration
- [x] Configure TypeScript for monorepo (tsconfig.json)
- [x] Add build scripts for all packages
- [x] Set up concurrent development mode
- [x] Configure hot module replacement (HMR)

## Phase 2: Security & API Layer

### Task 2.1: Implement Server-Side API Key Management
- [x] Remove API key from `vite.config.ts` define
- [x] Create `.env.example` with required variables
- [x] Implement environment variable validation on server startup
- [x] Add API key check middleware

### Task 2.2: Create Express API Endpoints
- [x] Implement `/api/generate` POST endpoint
- [x] Implement `/api/auth/verify` POST endpoint
- [x] Implement `/api/auth/check` GET endpoint
- [x] Add request validation middleware
- [x] Add error handling middleware

### Task 2.3: Implement Session-Based Authentication
- [x] Install and configure `express-session`
- [x] Create session middleware (`server/middleware/session.ts`)
- [x] Implement high-volume authentication logic
- [x] Add session persistence (memory store for dev)
- [x] Create authentication guard middleware

### Task 2.4: Implement Rate Limiting & Retry Logic
- [x] Create `GeminiClient` class in `packages/core`
- [x] Implement batch processing with configurable size
- [x] Add exponential backoff retry logic
- [x] Implement 429 error detection and handling
- [x] Add partial success recovery mechanism

### Task 2.5: Add Cancellation Support
- [x] Implement AbortController in `GeminiClient`
- [x] Add cancel method to client
- [x] Handle AbortError in generation flow
- [x] Update UI to show cancel button during generation

## Phase 3: Component Migration & Code Structure

### Task 3.1: Fix Architecture - Move Types to packages/core
- [x] Create `packages/core/src/types/api.ts`
- [x] Define `GeminiGenerateRequest` interface
- [x] Define `GeminiGenerateResponse` interface
- [x] Define `ImageResult` interface
- [x] **CRITICAL: Move `apps/graphic/src/types/image.ts` to `packages/core/src/types/image.ts`**
- [x] **CRITICAL: Update all imports in apps/graphic to use `@ai-graphic/core`**
- [x] **CRITICAL: Delete `apps/graphic/src/types/` directory**
- [x] Remove all `any` types from codebase

### Task 3.2: Fix Architecture - Move Hooks to packages/core
- [x] Extract `useImageGeneration` hook (currently in wrong location)
- [x] Extract `useImageUpload` hook (currently in wrong location)
- [x] Extract `useAuth` hook (currently in wrong location)
- [x] **CRITICAL: Move all hooks from `apps/graphic/src/hooks/` to `packages/core/src/hooks/`**
- [x] **CRITICAL: Update all imports in apps/graphic to use `@ai-graphic/core`**
- [x] **CRITICAL: Delete `apps/graphic/src/hooks/` directory**
- [x] Add proper TypeScript types to all hooks
- [ ] Write unit tests for each hook

### Task 3.3: Fix Architecture - Move UI Components to packages/ui
- [x] Create `ImageUploader` component (currently in wrong location)
- [x] Create `CollapsibleSection` component (currently in wrong location)
- [x] Create `ResultsGallery` component (currently in wrong location)
- [x] Create `PasswordModal` component (currently in wrong location)
- [x] Create `ErrorModal` component (currently in wrong location)
- [x] **CRITICAL: Move `apps/graphic/src/components/ImageUploader.tsx` to `packages/ui/src/ImageUploader/`**
- [x] **CRITICAL: Move `apps/graphic/src/components/CollapsibleSection.tsx` to `packages/ui/src/CollapsibleSection/`**
- [x] **CRITICAL: Move `apps/graphic/src/components/ResultsGallery.tsx` to `packages/ui/src/ResultsGallery/`**
- [x] **CRITICAL: Move `apps/graphic/src/components/PasswordModal.tsx` to `packages/ui/src/PasswordModal/`**
- [x] **CRITICAL: Move `apps/graphic/src/components/ErrorModal.tsx` to `packages/ui/src/ErrorModal/`**
- [x] **CRITICAL: Update all imports in apps/graphic to use `@ai-graphic/ui`**
- [x] **CRITICAL: Delete `apps/graphic/src/components/` directory**
- [x] Add TypeScript interfaces for all props

### Task 3.4: Complete Shared UI Components in packages/ui
- [x] Create `Button` component in `packages/ui`
- [x] Create `Input` component in `packages/ui`
- [x] Create `Modal` component in `packages/ui`
- [x] Create `Spinner` component in `packages/ui`
- [x] Add Tailwind CSS styling
- [x] Export components from package index
- [x] **Update `packages/ui/src/index.ts` to export all moved components**

### Task 3.5: Clean Up apps/graphic Structure
- [x] Create `src/routes/index/page.tsx` (main page)
- [x] Migrate main UI to index page
- [x] Configure React Router with lazy loading
- [x] Test routing navigation
- [x] **CRITICAL: Update `routes/index/page.tsx` to import from `@ai-graphic/ui` and `@ai-graphic/core`**
- [x] **Verify apps/graphic/src/ only contains: routes/, main.tsx, router.tsx, index.css**
- [ ] Add 404 page handling

### Task 3.6: Verify Monorepo Architecture
- [x] Split 2143-line App.tsx into smaller components
- [x] Move business logic to custom hooks
- [x] Move API calls to `packages/core`
- [x] **CRITICAL: Verify all imports use workspace aliases (@ai-graphic/ui, @ai-graphic/core)**
- [x] **CRITICAL: Verify no business logic or components remain in apps/graphic/src/**
- [x] **Test that graphic app builds and runs correctly**
- [x] Remove duplicate code

## Phase 4: Performance Optimization

### Task 4.1: Implement Image Compression
- [ ] Create `ImageOptimizer` class in `packages/core`
- [ ] Implement `compressImage` method
- [ ] Implement `createThumbnail` method
- [ ] Add image size validation
- [ ] Integrate compression into upload flow

### Task 4.2: Add Lazy Loading
- [ ] Install `react-lazy-load-image-component`
- [ ] Implement lazy loading in `ResultsGallery`
- [ ] Add blur effect for loading images
- [ ] Optimize thumbnail generation
- [ ] Test memory usage improvements

### Task 4.3: Implement Real Progress Tracking
- [ ] Remove simulated progress interval
- [ ] Add progress callback to `GeminiClient`
- [ ] Calculate real progress based on completed batches
- [ ] Update UI to show accurate progress
- [ ] Add estimated time remaining

### Task 4.4: Optimize Memory Usage
- [ ] Implement image cleanup on unmount
- [ ] Add memory usage monitoring
- [ ] Optimize Base64 storage
- [ ] Add garbage collection hints
- [ ] Test with large image sets

## Phase 5: Error Handling & User Experience

### Task 5.1: Create Structured Error Types
- [ ] Create `ApiError` base class
- [ ] Create `RateLimitError` class
- [ ] Create `AuthenticationError` class
- [ ] Create `NetworkError` class
- [ ] Export from `packages/core/src/errors`

### Task 5.2: Implement Error Formatter
- [ ] Create `formatErrorMessage` utility
- [ ] Add user-friendly messages for each error type
- [ ] Include solution suggestions in messages
- [ ] Test all error scenarios
- [ ] Update UI to use formatted messages

### Task 5.3: Improve Error Modal
- [ ] Add specific error icons
- [ ] Show error code and timestamp
- [ ] Add "Copy Error Details" button
- [ ] Add "Retry" button for recoverable errors
- [ ] Improve error message styling

### Task 5.4: Add API Key Setup Guide
- [ ] Create setup instructions component
- [ ] Show guide when API key is missing
- [ ] Add step-by-step configuration help
- [ ] Link to documentation
- [ ] Test with new users

## Phase 6: Testing

### Task 6.1: Setup Testing Infrastructure
- [ ] Configure Vitest for monorepo
- [ ] Install React Testing Library
- [ ] Install Supertest for API testing
- [ ] Create test utilities and mocks
- [ ] Configure test coverage reporting

### Task 6.2: Write Unit Tests for Hooks
- [ ] Test `useImageGeneration` hook
- [ ] Test `useImageUpload` hook
- [ ] Test `useAuth` hook
- [ ] Achieve 80%+ coverage for hooks
- [ ] Add edge case tests

### Task 6.3: Write Unit Tests for Components
- [ ] Test `ImageUploader` component
- [ ] Test `OptionsPanel` component
- [ ] Test `ResultsGallery` component
- [ ] Test `ProgressModal` component
- [ ] Achieve 80%+ coverage for components

### Task 6.4: Write Integration Tests for API
- [ ] Test `/api/generate` endpoint
- [ ] Test `/api/auth/verify` endpoint
- [ ] Test `/api/auth/check` endpoint
- [ ] Test error scenarios
- [ ] Test rate limiting behavior

### Task 6.5: Write E2E Tests
- [ ] Test complete image generation flow
- [ ] Test authentication flow
- [ ] Test error recovery
- [ ] Test cancellation
- [ ] Test download functionality

## Phase 7: Documentation

### Task 7.1: Add Code Comments
- [ ] Document all public APIs
- [ ] Add JSDoc comments to functions
- [ ] Document complex algorithms
- [ ] Add inline comments for tricky code
- [ ] Document environment variables

### Task 7.2: Create API Documentation
- [ ] Document `/api/generate` endpoint
- [ ] Document `/api/auth/*` endpoints
- [ ] Add request/response examples
- [ ] Document error codes
- [ ] Create Postman collection

### Task 7.3: Update README
- [ ] Add project overview
- [ ] Add installation instructions
- [ ] Add development guide
- [ ] Add monorepo structure explanation
- [ ] Add troubleshooting section

### Task 7.4: Create Deployment Guide
- [ ] Document environment setup
- [ ] Add build instructions
- [ ] Add deployment steps
- [ ] Document server requirements
- [ ] Add monitoring recommendations

### Task 7.5: Create Contributing Guide
- [ ] Add code style guidelines
- [ ] Document commit conventions
- [ ] Add PR template
- [ ] Document testing requirements
- [ ] Add architecture decision records

## Phase 8: Migration & Cleanup

### Task 8.1: Prepare for Multi-App Deployment
- [ ] **Configure Vite base paths for each app (graphic: `/graphic/`, concept: `/concept/`, floor: `/floor/`)**
- [ ] **Update React Router basename for each app**
- [ ] **Configure Express server to serve multiple apps at different routes**
- [ ] **Test that all apps are accessible at their respective paths**
- [ ] **Update build scripts to build all apps**

### Task 8.2: Migrate Concept Tab to Separate App
- [ ] Create `apps/concept/` directory structure
- [ ] Copy and adapt structure from `apps/graphic/`
- [ ] Move Concept tab logic to new app structure
- [ ] Update API calls to use server endpoints
- [ ] Import shared components from `packages/ui`
- [ ] Import shared hooks from `packages/core`
- [ ] Test all Concept features at `/concept/` route
- [ ] Remove old Concept code

### Task 8.3: Migrate Floor Tab to Separate App
- [ ] Create `apps/floor/` directory structure
- [ ] Copy and adapt structure from `apps/graphic/`
- [ ] Move Floor tab logic to new app structure
- [ ] Update API calls to use server endpoints
- [ ] Import shared components from `packages/ui`
- [ ] Import shared hooks from `packages/core`
- [ ] Test all Floor features at `/floor/` route
- [ ] Remove old Floor code

### Task 8.4: Remove Old Code & Verify Architecture
- [ ] Delete old monolithic `App.tsx` (2143 lines) if still exists
- [ ] Remove unused dependencies
- [ ] Clean up old configuration files
- [ ] Remove deprecated utilities
- [ ] **CRITICAL: Verify apps/ directories only contain routes and pages**
- [ ] **CRITICAL: Verify all components are in packages/ui**
- [ ] **CRITICAL: Verify all hooks are in packages/core**
- [ ] **CRITICAL: Verify all types are in packages/core**
- [ ] Update imports across codebase

### Task 8.5: Final Testing & Validation
- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Run all E2E tests
- [ ] **Test all 3 apps at their respective routes (domain.com/graphic/, domain.com/concept/, domain.com/floor/)**
- [ ] Test in production-like environment
- [ ] Perform security audit
- [ ] Check performance metrics
- [ ] Validate all requirements are met
- [ ] **Verify shared packages work correctly across all 3 apps**

## Phase 9: Deployment Preparation

### Task 9.1: Configure Production Build for Multi-App Setup
- [ ] Optimize Vite production build for all 3 apps
- [ ] Configure code splitting per app
- [ ] Enable compression
- [ ] Add source maps
- [ ] **Configure build output directories (dist/graphic, dist/concept, dist/floor)**
- [ ] **Test production build locally for all apps**
- [ ] **Verify each app serves correctly at its base path**

### Task 9.2: Setup CI/CD Pipeline for Monorepo
- [ ] Create GitHub Actions workflow
- [ ] Add automated testing for all packages
- [ ] Add build verification for all 3 apps
- [ ] Add deployment automation
- [ ] Configure environment secrets
- [ ] **Add parallel build jobs for each app**
- [ ] **Configure deployment to serve all apps from same domain**

### Task 9.3: Setup Monitoring for Multi-App Architecture
- [ ] Add error tracking (e.g., Sentry) for all 3 apps
- [ ] Add performance monitoring per app
- [ ] Add API usage tracking
- [ ] Configure alerts
- [ ] Create monitoring dashboard
- [ ] **Tag errors by app (graphic/concept/floor)**

### Task 9.4: Security Hardening
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Add rate limiting middleware
- [ ] Enable CORS properly for all apps
- [ ] Audit dependencies for vulnerabilities
- [ ] **Configure security headers per app route**

### Task 9.5: Production Deployment
- [ ] Deploy to production environment
- [ ] **Verify domain.com/graphic/ works**
- [ ] **Verify domain.com/concept/ works**
- [ ] **Verify domain.com/floor/ works**
- [ ] Monitor for errors
- [ ] Test performance under load
- [ ] Create rollback plan
- [ ] **Document multi-app deployment architecture**
