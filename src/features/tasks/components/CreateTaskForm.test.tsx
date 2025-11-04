import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTaskForm } from './CreateTaskForm'

describe('CreateTaskForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('has submit button disabled when form is empty', async () => {
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /create task/i })
    expect(submitButton).toBeDisabled()
  })

  it('has submit button disabled when form is invalid', async () => {
    const user = userEvent.setup()
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/task name/i)
    
    // Enter invalid title (less than 3 characters)
    await user.type(titleInput, 'ab')

    const submitButton = screen.getByRole('button', { name: /create task/i })
    
    // Wait for validation
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup()
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/task name/i)
    
    // Enter valid title (at least 3 characters)
    await user.type(titleInput, 'Valid Task Name')

    const submitButton = screen.getByRole('button', { name: /create task/i })
    
    // Wait for validation
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('shows validation error message when title is too short', async () => {
    const user = userEvent.setup()
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/task name/i)
    
    // Enter invalid title and blur to trigger validation
    await user.type(titleInput, 'ab')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error message when title is empty and touched', async () => {
    const user = userEvent.setup()
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/task name/i)
    
    // Focus and blur without entering anything
    await user.click(titleInput)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error message when deadline is in the past', async () => {
    const user = userEvent.setup()
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/task name/i)
    const deadlineInput = screen.getByLabelText(/deadline/i)
    
    // Enter valid title
    await user.type(titleInput, 'Valid Task Name')
    
    // Set deadline to yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]
    
    await user.type(deadlineInput, yesterdayString)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/deadline cannot be in the past/i)).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /create task/i })
    expect(submitButton).toBeDisabled()
  })

  it('submits form with correct data when valid', async () => {
    const user = userEvent.setup()
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText(/task name/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const statusSelect = screen.getByLabelText(/status/i)
    const prioritySelect = screen.getByLabelText(/priority/i)
    
    // Fill in the form
    await user.type(titleInput, 'New Task')
    await user.type(descriptionInput, 'Task description')
    await user.selectOptions(statusSelect, 'in-progress')
    await user.selectOptions(prioritySelect, 'high')

    const submitButton = screen.getByRole('button', { name: /create task/i })
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        status: 'in-progress',
        priority: 'high',
        deadline: '', // Empty date input returns empty string
      })
    })
  })

  it('disables submit button when isLoading is true', () => {
    render(<CreateTaskForm onSubmit={mockOnSubmit} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton).toBeDisabled()
  })

  it('renders all form fields', () => {
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument()
  })

  it('has default values for status and priority', () => {
    render(<CreateTaskForm onSubmit={mockOnSubmit} />)

    const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
    const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement

    expect(statusSelect.value).toBe('pending')
    expect(prioritySelect.value).toBe('low')
  })
})

