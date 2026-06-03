'use client'

import type { Version } from 'shared'

interface OutputPanelProps {
  versions: Version[]
  selectedVersion: number
  onSelectVersion: (i: number) => void
  currentVersion: Version | undefined
  editingVersion: number | null
  editText: string
  onEditTextChange: (v: string) => void
  onSaveEdit: (vi: number) => void
  onCancelEdit: () => void
  onStartEdit: (vi: number) => void
  loading: boolean
  locale: string
  onCopy: () => void
  onExportImage: () => void
  onRegenerate: () => void
  exporting: boolean
  copied: boolean
  outputRef: React.RefObject<HTMLDivElement | null>
}

function ActionButton({
  onClick,
  disabled,
  variant = 'default',
  children,
}: {
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'default' | 'outline'
  children: React.ReactNode
}) {
  const base = 'flex-1 py-2 text-sm rounded-lg font-medium transition-all duration-150 flex items-center justify-center gap-1.5'
  if (variant === 'primary') {
    return (
      <button onClick={onClick} disabled={disabled} className={`${base} bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed`}>
        {children}
      </button>
    )
  }
  if (variant === 'outline') {
    return (
      <button onClick={onClick} disabled={disabled} className={`${base} border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed`}>
        {children}
      </button>
    )
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed`}>
      {children}
    </button>
  )
}

export default function OutputPanel({
  versions, selectedVersion, onSelectVersion, currentVersion,
  editingVersion, editText, onEditTextChange, onSaveEdit, onCancelEdit, onStartEdit,
  loading, locale, onCopy, onExportImage, onRegenerate, exporting, copied, outputRef,
}: OutputPanelProps) {
  const isZh = locale === 'zh-CN'

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-xl shadow-card overflow-hidden">
      {/* Version tabs */}
      {versions.length > 1 && (
        <div className="flex gap-1 p-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40">
          {versions.map((_, i) => (
            <button
              key={i}
              onClick={() => { onSelectVersion(i); onCancelEdit() }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                selectedVersion === i
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200/60 dark:border-slate-700/40'
              }`}
            >
              {isZh ? `版本 ${i + 1}` : `V${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="p-5" ref={outputRef}>
        {currentVersion?.title && (
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 leading-snug">{currentVersion.title}</h3>
        )}

        {editingVersion === selectedVersion ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              rows={6}
              className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-sm leading-relaxed transition-all"
            />
            <div className="flex gap-2">
              <button onClick={() => onSaveEdit(selectedVersion)} className="px-4 py-2 text-sm rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors">
                {isZh ? '保存更改' : 'Save Changes'}
              </button>
              <button onClick={onCancelEdit} className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium transition-all">
                {isZh ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed border border-slate-100 dark:border-slate-700/30">
            {currentVersion?.body}
          </div>
        )}

        {currentVersion?.tags && currentVersion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {currentVersion.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2 p-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40">
        <ActionButton variant="primary" onClick={onCopy}>
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{isZh ? '已复制' : 'Copied'}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span>{isZh ? '复制' : 'Copy'}</span>
            </>
          )}
        </ActionButton>
        <ActionButton variant="outline" onClick={() => onStartEdit(selectedVersion)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>{isZh ? '编辑' : 'Edit'}</span>
        </ActionButton>
        <ActionButton variant="outline" onClick={onRegenerate} disabled={loading}>
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isZh ? '重新生成' : 'Regen'}</span>
        </ActionButton>
        <ActionButton variant="outline" onClick={onExportImage} disabled={exporting}>
          {exporting ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span>{isZh ? '保存图片' : 'Image'}</span>
        </ActionButton>
      </div>
    </div>
  )
}
