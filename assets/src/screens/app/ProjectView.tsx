import { useEffect, useState } from 'preact/hooks'

import Button from '@/components/core/Button'
import NewProjectModal from '@/components/modals/NewProjectModal'
import TaskRow from '@/components/task/TaskRow'
import NoProjects from '@/screens/app/NoProjects'
import { modalStore } from '@/stores/modalStore'
import { projectStore } from '@/stores/projectStore'
import { taskStore } from '@/stores/taskStore'
import { PlusIcon } from '@heroicons/react/solid'
import { useStore } from '@nanostores/preact'

type Props = {
  id?: string
  path: string
}
export default ({ id }: Props) => {
  const project = useStore(projectStore.projectMap)[id || '']
  const tasks = useStore(taskStore.taskList)

  useEffect(() => {
    if (project) {
      projectStore.setCurrentProject(project)
      taskStore.loadTasks(project)
    }
  }, [project?.id])

  if (!project) return null

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {project.name} ({project.shortcode})
        </h1>
      </div>

      <div className="h-8" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-gray-600 italic">Settings coming soon.</div>
      </div>

      <div className="max-w-7xl mx-auto my-4 px-4 sm:px-6 md:px-8">
        {tasks.map((t) => (
          <div key={t.id}>
            <TaskRow id={t.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
