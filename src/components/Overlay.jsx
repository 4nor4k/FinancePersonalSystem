import { IconX } from '@tabler/icons-react'

export default function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-md bg-bg-base rounded-t-3xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-1">
          <button onClick={onClose} className="text-text-secondary">
            <IconX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
