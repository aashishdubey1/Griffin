export interface Attachment {
  type: "image" | "file"
  url: string
  name: string
  size?: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  parts: Array<{
    type: "text" | string
    text?: string
    [key: string]: any
  }>
  createdAt?: Date
}
