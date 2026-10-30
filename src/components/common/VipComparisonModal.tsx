import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check, X, Sparkles, Shield, Download, FileText, Database, Layers, ArrowRight } from 'lucide-react';

export interface VipFeatureComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  isVip?: boolean;
  currentRt?: string;
  onUpgradeClick?: () => void;
}

export const VIP_COMPARISON_DATA = [
  {
    category: 'Akses Warga',
    icon: Layers,
    reguler: 'Pendaftaran, Status Warga, Dashboard Kas & Iuran',
    vip: 'Seluruh Fitur Reguler + Prioritas Sinkronisasi Data Multi-Device'
  },
  {
    category: 'Layanan Surat & Keuangan',
    icon: FileText,
    reguler: 'Pengajuan Surat PDF (Batas Maksimal 3x Unduh) & Pencatatan Kas Manual',
    vip: 'Pengajuan Surat PDF, Cetak & Unduh Surat Pengantar Berkali-kali (Tanpa Batas)'
  },
  {
    category: 'Keamanan & Komunitas',
    icon: Shield,
    reguler: 'Tombol Darurat, Buku Tamu, UMKM, Pengumuman',
    vip: 'Seluruh Fitur Keamanan, Broadcast Prioritas & Badge Lingkungan Eksklusif'
  },
  {
    category: 'Kecerdasan Buatan (AI)',
    icon: Sparkles,
    reguler: '-',
    vip: 'Smart RT AI (Analisis Keuangan & Draf Otomatis, Ringkasan Notulen Rapat & Klasifikasi Laporan)'
  },
  {
    category: 'Manajemen Aset & Data',
    icon: Database,
    reguler: '-',
    vip: 'Inventaris Barang & Notulen Rapat Digital Terintegrasi'
  },
  {
    category: 'Backup Sistem',
    icon: Download,
    reguler: '-',
    vip: 'Export/Import Backup Data (JSON/Excel/CSV) & Cetak Neraca Keuangan Utuh'
  }
];

export const VipComparisonModal: React.FC<VipFeatureComparisonProps> = ({
  isOpen,
  onClose,
  isVip = false,
  currentRt = 'RT 01',
  onUpgradeClick
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                <Crown className="w-3.5 h-3.5" />
                <span>Paket Langganan RT SaaS</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Ringkasan Tabel Perbandingan Fitur
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Perbedaan fitur lengkap antara paket <strong className="text-slate-200">Reguler (Gratisan)</strong> dengan paket <strong className="text-amber-400">VIP / Berlangganan</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors shrink-0"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Status Pill */}
          <div className="bg-slate-950/60 px-5 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <span className="text-xs text-slate-400">
              Lingkungan Anda: <strong className="text-white uppercase font-bold">{currentRt}</strong>
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border bg-slate-800 border-slate-700">
              <span className="text-[10px] text-slate-400">Status Saat Ini:</span>
              {isVip ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP Aktif
                </span>
              ) : (
                <span className="text-slate-300">Reguler / Gratisan</span>
              )}
            </div>
          </div>

          {/* Table Content (Scrollable) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-850/80 text-[11px] sm:text-xs uppercase font-black tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 w-[28%]">Kategori Fitur</th>
                    <th className="py-3.5 px-4 w-[36%] text-slate-300">Reguler / Gratisan</th>
                    <th className="py-3.5 px-4 w-[36%] text-amber-400 bg-amber-500/5">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>VIP / Berlangganan</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {VIP_COMPARISON_DATA.map((row, idx) => {
                    const Icon = row.icon;
                    return (
                      <tr 
                        key={idx}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Kategori */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-extrabold text-white text-xs sm:text-sm">{row.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* Reguler / Gratisan */}
                        <td className="py-3.5 px-4 align-top text-slate-300 text-xs sm:text-sm leading-relaxed">
                          {row.reguler === '-' ? (
                            <span className="inline-flex items-center justify-center text-slate-500 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                              -
                            </span>
                          ) : (
                            <div className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                              <span>{row.reguler}</span>
                            </div>
                          )}
                        </td>

                        {/* VIP / Berlangganan */}
                        <td className="py-3.5 px-4 align-top text-amber-100 text-xs sm:text-sm leading-relaxed bg-amber-500/[0.02]">
                          {row.vip === '-' ? (
                            <span className="inline-flex items-center justify-center text-slate-500 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                              -
                            </span>
                          ) : (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <span className="font-semibold text-amber-200/90">{row.vip}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Special Highlight on Surat Pengantar VIP */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-300">
                    Keistimewaan Unduh Surat Pengantar VIP
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                    Pada paket <strong>Reguler</strong>, pengunduhan surat pengantar dibatasi maksimal 3 kali per dokumen untuk efisiensi penyimpanan. Pada paket <strong className="text-amber-400">VIP</strong>, warga dan pengurus RT dapat <strong>mengunduh berkali-kali tanpa batas</strong> kapan pun dibutuhkan!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-400">
              Sistem SaaS RT Guyub Rukun • Lisensi Resmi Multi-Tenant
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Tutup
              </button>
              
              {!isVip && onUpgradeClick && (
                <button
                  onClick={() => {
                    onClose();
                    onUpgradeClick();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Tingkatkan ke VIP</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipComparisonModal;
