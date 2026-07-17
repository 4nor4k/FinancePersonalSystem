import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconBold, IconItalic, IconUnderline, IconList, IconTrash } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { stripHtml } from '../lib/format'

export default function Notas() {
  const navigate = useNavigate()
  const { notas, addNota, updateNota, deleteNota } = useData()
  const [abertaId, setAbertaId] = useState(null)
  const editorRef = useRef(null)

  const notaAberta = notas.find((n) => n.id === abertaId)

  // O editor é "não controlado": o conteúdo HTML só é escrito no DOM quando
  // a nota muda (abre outra nota), nunca a cada tecla digitada. Isso evita
  // o cursor voltar pro início do texto a cada letra (o bug do texto espelhado).
  useEffect(() => {
    if (editorRef.current && notaAberta) {
      editorRef.current.innerHTML = notaAberta.conteudo || ''
    }
  }, [abertaId])

  async function handleNova() {
    const nova = await addNota('Nova nota')
    setAbertaId(nova.id)
  }

  function handleFormatar(comando) {
    document.execCommand(comando)
    editorRef.current?.focus()
  }

  function handleInput() {
    if (!notaAberta) return
    updateNota(notaAberta.id, { conteudo: editorRef.current.innerHTML })
  }

  if (notaAberta) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setAbertaId(null)} className="text-text-secondary">
            <IconChevronLeft size={20} />
          </button>
          <span className="text-[11px] text-text-muted">Salvo automaticamente</span>
          <button onClick={() => { deleteNota(notaAberta.id); setAbertaId(null) }} className="text-text-secondary">
            <IconTrash size={16} />
          </button>
        </div>

        <input
          value={notaAberta.titulo}
          onChange={(e) => updateNota(notaAberta.id, { titulo: e.target.value })}
          className="w-full bg-transparent text-base font-medium outline-none mb-2 px-0.5"
          placeholder="Título"
        />

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="bg-bg-card rounded-xl p-3.5 min-h-[260px] text-sm leading-relaxed outline-none mb-3"
        />

        <div className="flex items-center gap-1.5 bg-bg-card rounded-xl p-2.5">
          <ToolbarBtn icon={IconBold} onClick={() => handleFormatar('bold')} />
          <ToolbarBtn icon={IconItalic} onClick={() => handleFormatar('italic')} />
          <ToolbarBtn icon={IconUnderline} onClick={() => handleFormatar('underline')} />
          <span className="w-px h-5 bg-bg-raised mx-1" />
          <ToolbarBtn icon={IconList} onClick={() => handleFormatar('insertUnorderedList')} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28">
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

function ToolbarBtn({ icon: Icon, onClick }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-8.5 h-8.5 rounded-lg flex items-center justify-center text-text-primary hover:bg-bg-raised"
    >
      <Icon size={16} />
    </button>
  )
}
