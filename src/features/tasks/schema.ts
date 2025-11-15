import {z} from 'zod'

export const taskSchema = z.object({
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

export type TaskFormData = z.infer<typeof taskSchema>

