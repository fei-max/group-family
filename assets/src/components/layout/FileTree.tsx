import { h } from 'preact'
import { Link } from 'preact-router'
import Match from 'preact-router/match'

import { ContextMenuTrigger, triggerContextMenu } from '@/components/core/ContextMenu'
import { paths } from '@/config'
import { FileType, TreeFile } from '@/models'
import { fileStore } from '@/stores/fileStore'
import {} from '@/stores/modalStore'
import { projectStore } from '@/stores/projectStore'
import { classNames } from '@/utils'
import {
    ChevronDownIcon, ChevronRightIcon, DotsHorizontalIcon, FolderIcon, FolderOpenIcon
} from '@heroicons/react/outline'
import { useStore } from '@nanostores/preact'

const DRAG_FILE_PREFIX = 'file:'

export default ({ projectId }: { projectId: string }) => {
  const files = useStore(fileStore.fileTree)[projectId]
  const project = useStore(projectStore.projectMap)[projectId]

  if (!files) return null

  return (
    <nav className="px-2 space-y-1">
      {files.length == 0 && <div className="text-gray-500 italic text-sm px-2">Empty</div>}
      <FileTree projectId={projectId} nodes={files} indent={0} />
      <RootFolderDropZone projectId={projectId} />
    </nav>
  )
}

function FileTree({
  nodes,
  indent,
  projectId,
}: {
  nodes: TreeFile[]
  indent: number
  projectId: string
}) {
  return (
    <>
      {nodes.map((node) => {
        const item = node.file
        if (item.type == FileType.DOC) {
          return <FileNode {...{ indent, node, projectId }} />
        } else if (item.type == FileType.FOLDER) {
          return <FolderNode {...{ indent, node, projectId }} />
        } else {
          return null
        }
      })}
    </>
  )
}

function allowDrop(ev: DragEvent) {
  ev.preventDefault()
}

function dragHandler(itemId: string) {
  return function drag(ev: DragEvent) {
    if (!ev.dataTransfer) return
    ev.dataTransfer.setData('text', DRAG_FILE_PREFIX + itemId)
    ev.dataTransfer.effectAllowed = 'move'
  }
}

function dropHandler(projectId: string, parentId: string | null) {
  return function onDrop(ev: DragEvent) {
    const data = ev.dataTransfer?.getData('text')
    if (!data?.startsWith(DRAG_FILE_PREFIX)) return
    const id = data.substring(DRAG_FILE_PREFIX.length)

    const file = fileStore.idToFile.get()[id]
    fileStore.moveFile(projectId, file, parentId)
  }
}

type ChildProps = {
  indent: number
  node: TreeFile
  projectId: string
}

function FileNode({ indent, node, projectId }: ChildProps) {
  const item = node.file
  const href = `${paths.DOC}/${projectId}/${item.id}`

  return (
    <ContextMenuTrigger
      id="file-tree-doc"
      key={item.id}
      data={{ file: item, projectId: projectId }}
    >
      <Match path={href}>
        {({ url }: { url: string }) => {
          const matches = location.pathname == encodeURI(href)
          return (
            <Link
              draggable
              key={item.name}
              href={href}
              onDragOver={allowDrop}
              onDragStart={dragHandler(item.id)}
              onDrop={dropHandler(projectId, item.parent!)}
              onContextMenu={(e) =>
                triggerContextMenu(e.clientX, e.clientY, 'file-tree-doc', {
                  file: item,
                  projectId: projectId,
                })
              }
              className={classNames(
                matches ? 'bg-blue-200 ' : ' hover:bg-blue-300 ',
                'text-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all'
              )}
              style={{ marginLeft: indent * 10 }}
            >
              {item.name}
              {matches && (
                <>
                  <div class="grow" />
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      triggerContextMenu(e.clientX - 200, e.clientY, 'file-tree-doc', {
                        file: item,
                        projectId: projectId,
                      })
                    }}
                  >
                    <DotsHorizontalIcon class="w-4 h-4" />
                  </div>
                </>
              )}
            </Link>
          )
        }}
      </Match>
    </ContextMenuTrigger>
  )
}

function FolderNode({ indent, node, projectId }: ChildProps) {
  const item = node.file

  const expansionKey = projectId + '/' + item.id
  const expanded = useStore(fileStore.expanded)[expansionKey]

  const setExpanded = (setting: boolean) => {
    fileStore.setExpanded(expansionKey, setting)
  }

  const Icon = expanded ? ChevronDownIcon : ChevronRightIcon

  return (
    <>
      <ContextMenuTrigger
        id="file-tree-folder"
        key={item.id}
        data={{ file: item, projectId: projectId }}
      >
        <div
          draggable
          onDragOver={allowDrop}
          onDragStart={dragHandler(item.id)}
          onDrop={dropHandler(projectId, item.id)}
          onContextMenu={(e) =>
            triggerContextMenu(e.clientX, e.clientY, 'file-tree-folder', {
              file: item,
              projectId: projectId,
            })
          }
          className="text-gray-700 hover:bg-gray-300 group flex
        items-center px-2 py-2 text-sm font-medium rounded-md transition-all cursor-pointer"
          style={{ marginLeft: indent * 10 }}
          onClick={() => setExpanded(!expanded)}
        >
          <Icon className="text-gray-500  mr-2 flex-shrink-0 h-4 w-4" aria-hidden="true" />
          {item.name}
        </div>
      </ContextMenuTrigger>
      {expanded && <FileTree nodes={node.nodes!} indent={indent + 1} projectId={projectId} />}
    </>
  )
}

function RootFolderDropZone({ projectId }: { projectId: string }) {
  return <div className="h-10" onDragOver={allowDrop} onDrop={dropHandler(projectId, null)}></div>
}
