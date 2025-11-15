import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {tasksApi} from '../../api.ts'
import type { TaskFormData } from '../../schema.ts'
import {CreateTaskForm} from '../../components/CreateTaskForm/CreateTaskForm.tsx'
import {BackButton} from '../../../../shared/components/BackButton.tsx'
import './CreateTaskPage.css'

export const CreateTaskPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (data: TaskFormData) => {
        try {
            setIsLoading(true)
            setError(null)
            await tasksApi.create(data)
            navigate('/tasks')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task')
            setIsLoading(false)
        }
    }

    return (
        <div className="create-task-page">
            <BackButton/>

            {error && (
                <div className="error-message-container">
                    {error}
                </div>
            )}

            <CreateTaskForm onSubmit={handleSubmit} isLoading={isLoading}/>
        </div>
    )
}
