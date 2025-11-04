import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import type {CreateTaskInput} from '../types'
import './CreateTaskForm.css'

const taskSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']),
    priority: z.enum(['low', 'medium', 'high']),
    deadline: z.string().optional().refine(
        (date) => {
            if (!date) return true
            const selectedDate = new Date(date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            selectedDate.setHours(0, 0, 0, 0)
            return selectedDate >= today
        },
        {
            message: 'Deadline cannot be in the past',
        }
    ),
})

type TaskFormData = z.infer<typeof taskSchema>

interface CreateTaskFormProps {
    onSubmit: (data: CreateTaskInput) => Promise<void>
    isLoading?: boolean
}

export const CreateTaskForm = ({onSubmit, isLoading = false}: CreateTaskFormProps) => {
    const {
        register,
        handleSubmit,
        formState: {errors, isValid},
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        mode: 'all',
        defaultValues: {
            status: 'pending',
            priority: 'low',
            deadline: undefined,
        },
    })

    const onFormSubmit = async (data: TaskFormData) => {
        await onSubmit(data)
    }

    return (
        <div className="form-section">
            <h2>Create New Task</h2>
            <form onSubmit={handleSubmit(onFormSubmit)} className="task-form">
                <div className="form-group">
                    <label htmlFor="title">Task Name *</label>
                    <input
                        id="title"
                        type="text"
                        {...register('title')}
                        placeholder="Enter task name"
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && (
                        <span className="error-message">{errors.title.message}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        {...register('description')}
                        placeholder="Enter task description"
                        className={errors.description ? 'error' : ''}
                    />
                    {errors.description && (
                        <span className="error-message">{errors.description.message}</span>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select id="status" {...register('status')} className={errors.status ? 'error' : ''}>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        {errors.status && (
                            <span className="error-message">{errors.status.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select id="priority" {...register('priority')} className={errors.priority ? 'error' : ''}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        {errors.priority && (
                            <span className="error-message">{errors.priority.message}</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="deadline">Deadline</label>
                    <input
                        type="date"
                        id="deadline"
                        {...register('deadline')}
                        className={errors.deadline ? 'error' : ''}
                    />
                    {errors.deadline && (
                        <span className="error-message">{errors.deadline.message}</span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="btn btn-primary btn-full"
                >
                    {isLoading ? 'Creating...' : 'Create Task'}
                </button>
            </form>
        </div>
    )
}

