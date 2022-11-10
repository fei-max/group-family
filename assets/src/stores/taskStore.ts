import { action, atom, map } from 'nanostores'

import { API } from '@/api'
import { EphemeralTopic } from '@/api/topicflowTopic'
import { config } from '@/config'
import { Project, Task } from '@/models'
import { authStore } from '@/stores/authStore'
import { projectStore } from '@/stores/projectStore'
import { topicStore } from '@/stores/topicStore'
import { assertIsDefined, logger } from '@/utils'

export type TaskMap = { [id: string]: Task }

const KEY_TASK = 'task|'

class TaskStore {
  // --- topics

  topics: { [id: string]: EphemeralTopic } = {}

  // --- stores

  taskList = atom<Task[]>([])

  taskMap = map<TaskMap>({})

  deletedTask = atom<Task>()

  // --- actions

  updateTaskMap = action(this.taskMap, 'updateTaskMap', (store, task: Task) => {
    task = Task.fromJSON(task)
    store.setKey(task.id, task)
  })

  loadTasks = async (project: Project) => {
    if (authStore.debugMode()) (window as any)['taskStore'] = taskStore

    const response = await API.listTasks(project)
    const tasks = response.tasks.map((t) => Task.fromJSON(t))
    const taskMap = this.taskMap.get()
    tasks.forEach((t) => (taskMap[t.id] = t))
    this.taskMap.notify()
    this.taskList.set(tasks)
    return tasks
  }

  loadTask = async (id: string, force?: boolean) => {
    if (!force && this.taskMap.get()[id]) return

    const response = await API.getTask(id)
    this.updateTaskMap(response.task)
  }

  createTask = async (attrs: Partial<Task>) => {
    const project = projectStore.currentProject.get()
    assertIsDefined(project, 'has project')

    const response = await API.createTask(project, attrs)
    logger.info('TASKS - create', response)
    this.updateTaskMap(response.task)
    return response.task
  }

  saveTask = async (task: Task, attrs: Partial<Task>) => {
    this.updateTaskMap(Object.assign({}, task, attrs))

    const response = await API.updateTask(task.id, attrs)
    this.updateTaskMap(response.task)
    this.onTaskUpdated(task)

    return response.task
  }

  toggleArchived = async (task: Task) => {
    this.saveTask(task, { archived_at: task.archived_at ? null : new Date().toISOString() })
  }

  undeleteTask = async (task: Task) => {
    this.saveTask(task, { deleted_at: null })
  }

  deleteTask = async (task: Task) => {
    this.deletedTask.set(task)
    this.taskList.set(this.taskList.get().filter((t) => t.id != task.id))
    this.saveTask(task, { deleted_at: new Date().toISOString() })
  }

  initTopic = (projectId: string) => {
    if (this.topics[projectId]) return
    const topicName = `tasks:${projectId}`
    const topic = topicStore.initEphemeralTopic(topicName)
    this.topics[projectId] = topic

    topic.onAllKeyChange((key, value) => {
      if (key.startsWith(KEY_TASK)) {
        const id = key.substring(KEY_TASK.length)
        this.loadTask(id, true)
      }
    })
  }

  onTaskUpdated = (task: Task) => {
    const projectId = projectStore.currentProject.get()?.id
    this.topics[projectId!]?.setSharedKey(`${KEY_TASK}${task.id}`, Date.now())
  }
}

export const taskStore = new TaskStore()
