# Griffin - AI Code Review Agent

<p align="center">
  <strong>Your code's guardian. Griffin provides instant, AI-powered code analysis to spot vulnerabilities, enforce best practices, and suggest refactoring—before you commit.</strong>
  <br>
  <br>
  <a href="#key-features">Key Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

## Overview

Griffin is an intelligent code review assistant designed to help developers write cleaner, safer, and more efficient code. By leveraging a hybrid approach of static analysis tools and large language models (LLMs), Griffin delivers deeply contextual, actionable feedback directly in your development workflow.

It’s like having a senior developer review every line of code you write.

## Key Features

- ** Deep Code Analysis:** Goes beyond syntax to understand the intent and context of your code.
- ** Security Vulnerability Detection:** Identifies critical risks like SQL injection, hardcoded secrets, and insecure API usage with severity levels.
- ** Best Practices:** Suggests improvements based on industry standards and language-specific conventions.
- ** Refactoring Suggestions:** Offers recommendations to enhance performance, readability, and architecture.
- ** Structured Reporting:** Returns a clear, organized JSON report categorized into Summary, Vulnerabilities, Best Practices, and Refactoring.
- ** Instant Feedback:** Get detailed reviews in seconds, not hours.

## How It Works

Griffin uses a powerful two-stage process to analyze your code:

1.  **Static Analysis (Semgrep):** First, it runs a lightning-fast, rule-based scan using Semgrep to catch obvious bugs and security patterns.
2.  **AI-Powered Analysis (OpenAI GPT-4):** The code, along with the initial findings, is then sent to a sophisticated LLM. The AI acts as a senior engineer, contextualizing the results, explaining the "why," and providing nuanced architectural advice.

This hybrid approach ensures both comprehensive coverage and intelligent, human-like understanding.

## Architecture

Griffin is built as a robust monolithic backend API using Bun and Express.js, designed for clarity and performance.

```

```
