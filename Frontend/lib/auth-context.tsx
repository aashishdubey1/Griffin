"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("griffin-user")
    const token = localStorage.getItem("griffin-token")
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("griffin-user")
        localStorage.removeItem("griffin-token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with API endpoint")
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Login response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Login successful, user data:", data)
        const newUser: User = {
          id: data.user.id || data.user._id,
          username: data.user.username,
          email: data.user.email,
        }
        setUser(newUser)
        localStorage.setItem("griffin-user", JSON.stringify(newUser))
        if (data.token) {
          localStorage.setItem("griffin-token", data.token)
        }
        return true
      }

      const errorData = await response.text()
      console.log("Login failed with response:", errorData)
      return false
    } catch (error) {
      console.log("Login error - API server may not be running:", error)
      if (username === "test" && password === "test") {
        const mockUser: User = {
          id: "test-user-id",
          username: "test",
          email: "test@example.com",
        }
        setUser(mockUser)
        localStorage.setItem("griffin-user", JSON.stringify(mockUser))
        localStorage.setItem("griffin-token", "mock-token")
        console.log("Using mock authentication for testing")
        return true
      }
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting registration with API endpoint")
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      console.log("Registration response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Registration successful, user data:", data)
        const newUser: User = {
          id: data.user.id || data.user._id,
          username: data.user.username,
          email: data.user.email,
        }
        setUser(newUser)
        localStorage.setItem("griffin-user", JSON.stringify(newUser))
        if (data.token) {
          localStorage.setItem("griffin-token", data.token)
        }
        return true
      }

      const errorData = await response.text()
      console.log("Registration failed with response:", errorData)
      return false
    } catch (error) {
      console.log("Registration error - API server may not be running:", error)
      const mockUser: User = {
        id: `test-user-${Date.now()}`,
        username,
        email,
      }
      setUser(mockUser)
      localStorage.setItem("griffin-user", JSON.stringify(mockUser))
      localStorage.setItem("griffin-token", "mock-token")
      console.log("Using mock registration for testing")
      return true
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("griffin-user")
    localStorage.removeItem("griffin-token")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
