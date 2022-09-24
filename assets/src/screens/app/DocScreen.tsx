import { CSSTransition } from 'preact-transitioning'

import Banner from '@/components/core/Banner'
import Button from '@/components/core/Button'
import Helmet from '@/components/core/Helmet'
import Tooltip from '@/components/core/Tooltip'
import Document from '@/components/editor/Document'
import { Project } from '@/models'
import { docStore } from '@/stores/docStore'
import { fileStore } from '@/stores/fileStore'
import { taskStore } from '@/stores/taskStore'
import { useStore } from '@nanostores/preact'

type Props = {
  path: string
  projectId?: string
  id?: string
}

const LS_TASKS_INSERTED = 'dti:'

export default (props: Props) => {
  const docError = useStore(docStore.docError)
  const title = useStore(docStore.title)

  const isTodayJournal = title == fileStore.dailyFileTitle()
  const uncompleteTasksInserted =
    isTodayJournal && localStorage.getItem(LS_TASKS_INSERTED + props.projectId) == props.id

  const insertUncompleteTasks = async (e: MouseEvent) => {
    const tasks = await taskStore.loadTasks({ id: props.projectId! } as Project)
    const notInThisDoc = tasks.filter((t) => t.doc != props.path)
    const startIndex = 0

    let commandChain = window.editor?.chain()
    notInThisDoc.forEach((t, i) => {
      commandChain = commandChain?.insertContentAt(startIndex + i, {
        type: 'task',
        attrs: { id: t.id, ref: true },
      })
    })
    if (notInThisDoc.length)
      commandChain = commandChain?.insertContentAt(startIndex + notInThisDoc.length, '\n')
    commandChain?.run()

    localStorage.setItem(LS_TASKS_INSERTED + props.projectId, props.id || '')
    ;(e.target as HTMLDivElement).style.display = 'none'
  }

  return (
    <>
      <Helmet title={title || 'Loading'} />
      <CSSTransition appear in={!!docError} classNames="fade" duration={500}>
        <div class="relative bg-red-500">
          <Banner onClose={() => docStore.docError.set(undefined)}>
            <p>{docError}</p>
          </Banner>
        </div>
      </CSSTransition>
      <div class="flex flex-col grow bg-white w-full">
        <div class="w-full max-w-2xl mx-auto pt-6 px-8 flex items-center">
          <h1 class="text-xl font-bold ">{title}</h1>
          {isTodayJournal && !uncompleteTasksInserted && (
            <Tooltip
              message="Adds all uncompleted tasks from this project to today's journal"
              placement="bottom"
            >
              <Button onClick={insertUncompleteTasks} class="ml-4 py-1">
                Insert Uncomplete Tasks
              </Button>
            </Tooltip>
          )}
        </div>
        <Document projectId={props.projectId} id={props.id} />
      </div>
    </>
  )
}
