import React, { useState } from "react";
import { motion } from "motion/react";
import { X, GitCommit, FileDiff, AlertCircle, Sparkles } from "lucide-react";
import { GitHubConfig } from "../types";

interface CommitModalProps {
  onCommit: (commitMessage: string) => void;
  onClose: () => void;
  config: GitHubConfig;
  stats: {
    added: number;
    modified: number;
    deleted: number;
    total: number;
  };
}

export default function CommitModal({ onCommit, onClose, config, stats }: CommitModalProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate a beautiful descriptive message based on stats
  const generateMessage = () => {
    const parts: string[] = [];
    if (stats.added > 0) parts.push(`añadidos ${stats.added}`);
    if (stats.modified > 0) parts.push(`modificados ${stats.modified}`);
    if (stats.deleted > 0) parts.push(`eliminados ${stats.deleted}`);
    
    if (parts.length === 0) {
      return "Actualización de catálogo de productos";
    }
    
    const summary = parts.join(", ");
    return `Catálogo actualizado (${summary})`;
  };

  const handleFillTemplate = () => {
    setCommitMessage(generateMessage());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    onCommit(commitMessage.trim() || "Actualización del catálogo desde interfaz web");
  };

  const isConfigured = config.token && config.owner && config.repo && config.filePath;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-md font-semibold text-slate-900 flex items-center gap-2">
              <GitCommit size={18} className="text-emerald-600" />
              Guardar Cambios en GitHub
            </h3>
            <p className="text-xs text-slate-500">
              Registra un commit en el repositorio remoto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
            disabled={isSubmitting}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Change Summary Stats */}
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4">
            <h4 className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
              <FileDiff size={14} className="text-slate-400" />
              Resumen de Cambios Locales
            </h4>
            
            <div className="grid grid-cols-3 gap-2.5 text-center mb-1">
              <div className="bg-white border border-slate-100 p-2 rounded-xl">
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Añadidos</span>
                <span className={`text-lg font-bold ${stats.added > 0 ? "text-emerald-600" : "text-slate-400"}`}>{stats.added}</span>
              </div>

              <div className="bg-white border border-slate-100 p-2 rounded-xl">
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Editados</span>
                <span className={`text-lg font-bold ${stats.modified > 0 ? "text-amber-500" : "text-slate-400"}`}>{stats.modified}</span>
              </div>

              <div className="bg-white border border-slate-100 p-2 rounded-xl">
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Eliminados</span>
                <span className={`text-lg font-bold ${stats.deleted > 0 ? "text-red-500" : "text-slate-400"}`}>{stats.deleted}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-2.5">
              El catálogo final tendrá un total de <strong className="text-slate-800">{stats.total} productos</strong>.
            </p>
          </div>

          {!isConfigured ? (
            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Falta Configuración</p>
                <p>No has completado tu configuración de GitHub en el panel correspondiente. Cierra este diálogo e ingresa tus credenciales de escritura.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Mensaje de Commit *</span>
                  <button
                    type="button"
                    onClick={handleFillTemplate}
                    className="text-[10px] text-slate-500 hover:text-slate-950 inline-flex items-center gap-1 font-medium bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-all"
                  >
                    <Sparkles size={9} />
                    Auto-escribir
                  </button>
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Ej: Sincronización de stock e imágenes de mobiliario"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 font-mono text-xs"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Destination Details */}
              <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-mono flex flex-col gap-0.5">
                <span>Destino: {config.owner}/{config.repo}</span>
                <span>Rama: {config.branch || "main"}</span>
                <span>Archivo: {config.filePath}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Escribiendo...
                    </span>
                  ) : (
                    <>
                      <GitCommit size={14} />
                      Confirmar Commit
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
