import type { Task, CreateTaskInput } from './types'

const API_BASE_URL = 'http://localhost:3001'

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`)
    if (!response.ok) {
      throw new Error('Failed to fetch tasks')
    }
    return response.json()
  },

  getById: async (id: string): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch task')
    }
    return response.json()
  },

  create: async (task: CreateTaskInput): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...task,
        completed: task.status === 'completed',
        createdAt: new Date().toISOString(),
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to create task')
    }
    return response.json()
  },
}