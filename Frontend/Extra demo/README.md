# Demo & Test Components

This folder contains all demo, test, and debug components that were moved from the main application structure to keep the production code clean.

## Structure

### `/components/`
- **auth/** - Authentication components (login-form, register-form) moved from main app
- **file-upload/** - File upload components (drag-drop-zone) moved from main app
- **griffin-interface.tsx** - Legacy Griffin interface component used only in demos
- **auth-test.tsx** - Complete authentication flow test component
- **auth-flow-example.tsx** - Example component demonstrating authentication workflow
- **debug-api.tsx** - API debugging tool for testing backend connections
- **demo-job-flow.tsx** - Job submission and status checking demo
- **test-job-flow.tsx** - Test component for job tracking functionality

### `/pages/`
- **auth-demo/** - Authentication demo page (`/auth-demo`)
- **auth-test/** - Authentication test page (`/auth-test`)
- **debug/** - Debug tools page (`/debug`)
- **demo/** - General demo page (`/demo`)
- **test-job/** - Job testing page (`/test-job`)

## Usage

These components are for development and testing purposes only. They demonstrate:

1. **Authentication Flow**
   - Email-based login
   - Token storage in localStorage
   - Authenticated API requests

2. **Job Submission & Tracking**
   - Code review submission
   - Job status polling
   - Real-time status updates

3. **API Testing**
   - Backend connection testing
   - Error handling verification
   - Request/response debugging

## Integration

To use these demo components in the main application, update the import paths:

```typescript
// Before (when in main components folder)
import { AuthTest } from "@/components/auth-test"

// After (from demo folder)
import { AuthTest } from "@/demo/components/auth-test"
```

## Notes

- These components should NOT be included in production builds
- They contain extensive logging and debugging features
- Update import paths if moving components back to main application
- Consider adding these pages to `.gitignore` for production deployments