import { useEffect } from 'preact/hooks'

import Loader from '@/components/core/Loader'
import Editor from '@/components/editor/Editor'
import { Project } from '@/models'
import { docStore } from '@/stores/docStore'
import { fileStore } from '@/stores/fileStore'
import { projectStore } from '@/stores/projectStore'
import { taskStore } from '@/stores/taskStore'
import { uiStore } from '@/stores/uiStore'
import { useStore } from '@nanostores/preact'

// document is a higher-order component that manages the doc object
export default ({ projectId, id }: { projectId?: string; id?: string }) => {
  const project = useStore(projectStore.projectMap)[projectId!]
  const contents = useStore(docStore.document)

  useEffect(() => {
    if (project) {
      projectStore.setCurrentProject(project)
      setTimeout(() => taskStore.initTopic(project.id), 500)
    }
    if (project && id) {
      docStore.loadDoc(project, id)
      setTimeout(() => uiStore.addRecentNote(id, project.id), 50)
    }
  }, [project, projectId, id])

  const saveContents = (project: Project, id: string, contents: any) => {
    docStore.saveDoc(project, id, contents)
  }

  if (!project) return null

  if (contents === undefined)
    return (
      <div className="flex justify-center mt-10">
        <Loader size={40} />
      </div>
    )

  return <Editor project={project} id={id} contents={contents} saveContents={saveContents} />
}
