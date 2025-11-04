import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { TaskListPage } from './TaskListPage'
import { tasksApi } from '../api'
import type { Task } from '../types'

vi.mock('../api')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test description 1',
    status: 'pending',
    priority: 'high',
    completed: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test description 2',
    status: 'in-progress',
    priority: 'medium',
    completed: false,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Completed Task',
    description: 'Completed description',
    status: 'completed',
    priority: 'low',
    completed: true,
    createdAt: '2024-01-03T00:00:00Z',
  },
]

describe('TaskListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays items correctly with all required fields present', async () => {
    vi.mocked(tasksApi.getAll).mockResolvedValue(mockTasks)

    renderWithRouter(<TaskListPage />)

    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument()
    })

    // Check if all tasks are displayed
    expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    expect(screen.getByText('Test description 1')).toBeInTheDocument()
    expect(screen.getByText('Test Task 2')).toBeInTheDocument()
    expect(screen.getByText('Test description 2')).toBeInTheDocument()
    expect(screen.getByText('Completed Task')).toBeInTheDocument()
    expect(screen.getByText('Completed description')).toBeInTheDocument()

    // Check if completed badge is shown for completed task
    const completedBadge = screen.getByText('Completed Task').parentElement?.querySelector('.completed-badge')
    expect(completedBadge).toBeInTheDocument()
  })

  it('displays empty state when list is empty', async () => {
    vi.mocked(tasksApi.getAll).mockResolvedValue([])

    renderWithRouter(<TaskListPage />)

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    })

    expect(screen.getByText('Create your first task to get started')).toBeInTheDocument()
    expect(screen.getAllByText('Create Task')).toHaveLength(2) // One in header, one in empty state
  })

  it('displays error message when error occurs', async () => {
    const errorMessage = 'Failed to fetch tasks'
    vi.mocked(tasksApi.getAll).mockRejectedValue(new Error(errorMessage))

    renderWithRouter(<TaskListPage />)

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    vi.mocked(tasksApi.getAll).mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithRouter(<TaskListPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('navigates to create page when Create Task button is clicked', async () => {
    vi.mocked(tasksApi.getAll).mockResolvedValue([])

    renderWithRouter(<TaskListPage />)

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    })

    const createButtons = screen.getAllByText('Create Task')
    createButtons[0].click()

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/create')
  })

  it('navigates to task details when task card is clicked', async () => {
    vi.mocked(tasksApi.getAll).mockResolvedValue(mockTasks)

    renderWithRouter(<TaskListPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    })

    const taskCard = screen.getByText('Test Task 1').closest('.task-card')
    expect(taskCard).toBeInTheDocument()
    
    taskCard?.click()

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1')
  })
})

