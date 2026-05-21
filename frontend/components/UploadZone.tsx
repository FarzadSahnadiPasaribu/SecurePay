'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileImage, FileText, X, CheckCircle } from 'lucide-react'

interface UploadZoneProps {
  onFileSelected: (file: File) => void
  onClear?: () => void
  disabled?: boolean
  selectedFile?: File | null
}

export default function UploadZone({ onFileSelected, onClear, disabled, selectedFile }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onFileSelected(accepted[0])
      }
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return FileText
    return FileImage
  }

  return (
    <AnimatePresence mode="wait">
      {selectedFile ? (
        <motion.div
          key="selected"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card border border-neon-blue/30 p-6 flex items-center gap-4"
          style={{ boxShadow: '0 0 20px rgba(0,212,255,0.1)' }}
        >
          {(() => {
            const FileIcon = getFileIcon(selectedFile)
            return (
              <div className="w-14 h-14 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center flex-shrink-0">
                <FileIcon size={24} className="text-neon-blue" />
              </div>
            )
          })()}

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{selectedFile.name}</p>
            <p className="text-white/40 text-sm">{formatSize(selectedFile.size)}</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle size={12} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs">Ready for analysis</span>
            </div>
          </div>

          {onClear && !disabled && (
            <button
              onClick={onClear}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X size={16} className="text-white/40" />
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...(getRootProps() as any)}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
            transition-all duration-300
            ${isDragActive
              ? 'border-neon-blue/70 bg-neon-blue/10 scale-[1.01]'
              : 'border-white/20 bg-white/3 hover:border-neon-blue/40 hover:bg-neon-blue/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <div className="absolute inset-0 cyber-grid-bg opacity-30" />

          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-neon-blue/40 rounded-tl" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-neon-blue/40 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-neon-blue/40 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-neon-blue/40 rounded-br" />

          <div className="relative z-10">
            <motion.div
              animate={{ y: isDragActive ? -8 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                  isDragActive
                    ? 'bg-neon-blue/20 border-neon-blue/60 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                    : 'bg-white/5 border-white/20'
                }`}
              >
                <Upload
                  size={28}
                  className={`transition-colors ${isDragActive ? 'text-neon-blue' : 'text-white/40'}`}
                />
              </div>

              <div>
                <p className="text-white font-semibold text-lg mb-1">
                  {isDragActive ? 'Drop your file here' : 'Drop invoice or bukti transfer'}
                </p>
                <p className="text-white/40 text-sm">
                  or <span className="text-neon-blue">click to browse</span>
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/30">
                <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-full">JPG</span>
                <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-full">PNG</span>
                <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-full">PDF</span>
                <span>Max 10 MB</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
