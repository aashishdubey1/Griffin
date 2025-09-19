"use client";

import { AuthFlowExample } from "@/components/auth-flow-example";

export default function AuthDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Authentication Flow Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete implementation of secure authentication and API request handling
        </p>
      </div>
      
      <AuthFlowExample />
    </div>
  );
}