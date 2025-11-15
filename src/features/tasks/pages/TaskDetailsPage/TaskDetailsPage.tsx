import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { tasksApi } from '../../api.ts'
import type { Task } from '../../types.ts'
import { BackButton } from '../../../../shared/components/BackButton.tsx'
import './TaskDetailsPage.css'

export const TaskDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await tasksApi.getById(id!)
        setTask(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task')
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      )
    }

    if (!task) {
      return (
        <div className="not-found-state">
          <p>Task not found</p>
        </div>
      )
    }

    return (
      <div className="task-details-card">
        <h1>
          {task.title}
          {task.completed && <span className="completed-badge">✓</span>}
        </h1>
        {task.description && (
          <div className="description-section">
            <h3>Description</h3>
            <p>{task.description}</p>
          </div>
        )}
        <div className="task-details-meta">
          <div className="meta-item">
            <span className="meta-label">Status:</span>
            <span className={`task-status task-status-${task.status}`}>
              {task.status.replace('-', ' ')}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Priority:</span>
            <span className={`task-priority task-priority-${task.priority}`}>
              {task.priority}
            </span>
          </div>
          {task.deadline && (
            <div className="meta-item">
              <span className="meta-label">Deadline:</span>
              <span className="task-deadline">
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            </div>
          )}
          {task.createdAt && (
            <div className="meta-item">
              <span className="meta-label">Created:</span>
              <span className="task-date">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="task-details-page">
      <BackButton />
      {renderContent()}
    </div>
  )
}
