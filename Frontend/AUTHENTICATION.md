# Authentication Flow Implementation

This implementation provides secure authentication and API request handling following the specified requirements.

## Overview

The authentication system implements a simple email-based login flow with automatic token management and secure API requests.

## Key Components

### 1. Authentication Service (`/lib/auth-service.ts`)

The main service that handles the authentication flow:

```typescript
// Login with email only
const token = await authService.handleLogin("user@example.com");

// Submit review (token automatically included)
const jobId = await authService.submitReview({
  code: "console.log('hello world')",
  language: "javascript"
});

// Check job status (token automatically included)
const status = await authService.checkJobStatus(jobId);
```

### 2. React Hook (`/hooks/use-auth-flow.ts`)

Provides React integration with state management:

```typescript
const { login, submitReview, pollJobStatus } = useAuthFlow();

// Complete workflow
await login("user@example.com");
const jobId = await submitReview({ code: "..." });
await pollJobStatus(jobId, onComplete, onError);
```

### 3. Updated API Service (`/lib/api-service.ts`)

Enhanced with secure token handling and authentication checks.

## Flow Implementation

### Step 1: Login Flow

```typescript
// User logs in using their email
function handleLogin(email) {
  fetch("http://localhost:4000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then(res => res.json())
    .then(data => {
      // Store token in localStorage as specified
      localStorage.setItem("authToken", data.token);
    });
}
```

### Step 2: Authenticated API Requests

All API requests automatically include the token:

```typescript
// Token is retrieved and included in every request
const token = localStorage.getItem("authToken");
const headers = { Authorization: `Bearer ${token}` };
```

### Step 3: Submit Review (POST)

```typescript
async function submitReview(reviewData) {
  const token = localStorage.getItem("authToken");

  const response = await fetch("http://localhost:4000/api/review/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  const result = await response.json();
  return result.jobId;
}
```

### Step 4: Check Job Status (GET)

```typescript
async function checkJobStatus(jobId) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `http://localhost:4000/api/review/jobs/${jobId}/status`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.json();
}
```

## Security Features

### Token Management
- Tokens are stored securely in `localStorage`
- Automatic token inclusion in all API requests
- Token validation before API calls
- Automatic logout on authentication failures

### API Request Security
- All requests require authentication
- Bearer token authentication
- Automatic error handling for auth failures
- Request interceptors for consistent token handling

### Error Handling
- Authentication required errors
- Token expiration handling
- Network error recovery
- User-friendly error messages

## Usage Examples

### Complete Workflow

```typescript
import { useAuthFlow } from "@/hooks/use-auth-flow";

function MyComponent() {
  const { completeWorkflow } = useAuthFlow();

  const handleSubmit = async () => {
    await completeWorkflow(
      "user@example.com",
      { code: "console.log('hello')", language: "javascript" },
      (result) => console.log("Completed:", result),
      (error) => console.error("Failed:", error)
    );
  };
}
```

### Step-by-Step Usage

```typescript
import { useAuthFlow } from "@/hooks/use-auth-flow";

function MyComponent() {
  const { login, submitReview, pollJobStatus } = useAuthFlow();

  const handleLogin = async () => {
    const success = await login("user@example.com");
    if (success) {
      console.log("Login successful, token stored");
    }
  };

  const handleSubmit = async () => {
    const jobId = await submitReview({
      code: "console.log('hello world')",
      language: "javascript"
    });
    
    if (jobId) {
      await pollJobStatus(
        jobId,
        (result) => console.log("Review completed:", result),
        (error) => console.error("Review failed:", error)
      );
    }
  };
}
```

## API Endpoints

The implementation works with these backend endpoints:

- `POST /api/login` - Email-based login
- `POST /api/review/submit` - Submit code for review (authenticated)
- `GET /api/review/jobs/{jobId}/status` - Check job status (authenticated)

## Components Updated

### Login Form (`/components/auth/login-form.tsx`)
- Added email-only login option
- Token storage integration
- Enhanced error handling

### Code Input Form (`/components/code-review/code-input-form.tsx`)
- Authentication checks before submission
- Token validation
- Enhanced error messages

### Job Tracker (`/hooks/use-job-tracker.ts`)
- Authentication verification for polling
- Secure status checking
- Error handling for auth failures

## Demo Component

A complete demo is available at `/app/auth-demo/page.tsx` showing:
- Email-only login
- Token storage visualization
- Review submission with authentication
- Job status polling
- Complete workflow demonstration

## Testing the Implementation

1. Navigate to `/auth-demo` to see the complete flow
2. Enter an email address and click "Login"
3. Submit code for review
4. Watch the job status polling in real-time
5. See the complete workflow in action

The implementation ensures that:
- ✅ User logs in → token stored in localStorage
- ✅ User submits review → gets jobId
- ✅ Frontend periodically checks job status using that jobId
- ✅ All requests include authentication headers
- ✅ Secure token handling and validation