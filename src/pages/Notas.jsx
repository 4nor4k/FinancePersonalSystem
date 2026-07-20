import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  IconChevronLeft, IconPlus, IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconList, IconListNumbers, IconListCheck, IconH1, IconH2, IconQuote, IconCode,
  IconLink, IconTrash, IconArrowBackUp, IconArrowForwardUp,
} from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { stripHtml } from '../lib/format'

export default function Notas() {
  const navigate = useNavigate()
  const { notas, addNota, updateNota, deleteNota } = useData()
  const [abertaId, setAbertaId] = useState(null)

  const notaAberta = notas.find((n) => n.id === abertaId)

  async function handleNova() {
    const nova = await addNota('Nova nota')
    setAbertaId(nova.id)
  }

  if (notaAberta) {
    return <EditorNota nota={notaAberta} onVoltar={() => setAbertaId(null)} onUpdate={updateNota} onDelete={deleteNota} />
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Notas</span>
        <button onClick={handleNova} style={{ color: 'var(--accent-color)' }}>
          <IconPlus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {notas.map((n) => (
          <button
            key={n.id}
            onClick={() => setAbertaId(n.id)}
            className="bg-bg-card rounded-xl p-3 text-left min-h-[100px] flex flex-col"
          >
            <p className="text-sm font-medium mb-1.5 truncate">{n.titulo || 'Sem título'}</p>
            <p className="text-[11px] text-text-secondary line-clamp-3 flex-1">
              {stripHtml(n.conteudo) || 'Nota vazia'}
            </p>
            <p className="text-[10px] text-text-muted mt-2">
              {new Date(n.atualizado_em).toLocaleDateString('pt-BR')}
            </p>
          </button>
        ))}
        <button
          onClick={handleNova}
          className="rounded-xl min-h-[100px] flex items-center justify-center border border-dashed border-bg-raised text-text-muted"
        >
          <IconPlus size={22} />
        </button>
      </div>
    </div>
  )
}

function EditorNota({ nota, onVoltar, onUpdate, onDelete }) {
  const [titulo, setTitulo] = useState(nota.titulo)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Escreva algo...' }),
    ],
    content: nota.conteudo || '',
    onUpdate: ({ editor }) => {
      onUpdate(nota.id, { conteudo: editor.getHTML() })
    },
  })

  // Troca de nota -> recarrega o conteúdo certo no editor
  useEffect(() => {
    if (editor && editor.getHTML() !== (nota.conteudo || '')) {
      editor.commands.setContent(nota.conteudo || '', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nota.id])

  function handleLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Link (com https://)')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-6">
      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); color: #5c5c59; float: left; height: 0; pointer-events: none;
        }
        .ProseMirror ul { list-style: disc; padding-left: 1.4em; margin: 0.4em 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.4em; margin: 0.4em 0; }
        .ProseMirror li { margin: 0.15em 0; }
        .ProseMirror h1 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0 0.3em; }
        .ProseMirror h2 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.3em; }
        .ProseMirror blockquote { border-left: 2px solid var(--accent-color); padding-left: 0.8em; margin: 0.5em 0; color: #8a8a87; }
        .ProseMirror code { background: #1a1a1a; padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
        .ProseMirror pre { background: #141414; padding: 0.6em; border-radius: 8px; overflow-x: auto; margin: 0.5em 0; }
        .ProseMirror a { color: var(--accent-color); text-decoration: underline; }
        .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0.2em; }
        .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
        .ProseMirror ul[data-type="taskList"] li > label { margin-top: 0.2em; }
        .ProseMirror ul[data-type="taskList"] input[type="checkbox"] { accent-color: var(--accent-color); }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <button onClick={onVoltar} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-[11px] text-text-muted">Salvo automaticamente</span>
        <button onClick={() => { onDelete(nota.id); onVoltar() }} className="text-text-secondary">
          <IconTrash size={16} />
        </button>
      </div>

      <input
        value={titulo}
        onChange={(e) => { setTitulo(e.target.value); onUpdate(nota.id, { titulo: e.target.value }) }}
        className="w-full bg-transparent text-base font-medium outline-none mb-2 px-0.5"
        placeholder="Título"
      />

      <div className="bg-bg-card rounded-xl p-3.5 min-h-[280px] text-sm leading-relaxed mb-3">
        <EditorContent editor={editor} />
      </div>

      {editor && (
        <div className="flex items-center gap-1 bg-bg-card rounded-xl p-2 flex-wrap">
          <ToolbarBtn icon={IconBold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
          <ToolbarBtn icon={IconItalic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <ToolbarBtn icon={IconUnderline} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <ToolbarBtn icon={IconStrikethrough} active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
          <ToolbarBtn icon={IconCode} active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
          <span className="w-px h-5 bg-bg-raised mx-0.5" />
          <ToolbarBtn icon={IconH1} active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <ToolbarBtn icon={IconH2} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <ToolbarBtn icon={IconQuote} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <span className="w-px h-5 bg-bg-raised mx-0.5" />
          <ToolbarBtn icon={IconList} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <ToolbarBtn icon={IconListNumbers} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <ToolbarBtn icon={IconListCheck} active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
          <span className="w-px h-5 bg-bg-raised mx-0.5" />
          <ToolbarBtn icon={IconLink} active={editor.isActive('link')} onClick={handleLink} />
          <span className="w-px h-5 bg-bg-raised mx-0.5" />
          <ToolbarBtn icon={IconArrowBackUp} onClick={() => editor.chain().focus().undo().run()} />
          <ToolbarBtn icon={IconArrowForwardUp} onClick={() => editor.chain().focus().redo().run()} />
        </div>
      )}
    </div>
  )
}

function ToolbarBtn({ icon: Icon, onClick, active }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={active ? { background: 'var(--accent-bg)', color: 'var(--accent-color)' } : { color: '#e5e5e3' }}
    >
      <Icon size={15} />
    </button>
  )
}
