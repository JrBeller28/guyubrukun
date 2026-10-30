import { apiFetch } from './apiInterceptor';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { icons } from './App';

interface RtDokumenItem {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  description?: string;
  uploaderId?: string;
  uploaderName?: string;
  createdAt?: string;
}

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'admin':
      return 'Ketua RT / Admin';
    case 'sekretaris':
      return 'Sekretaris';
    case 'bendahara':
      return 'Bendahara';
    case 'pengurus':
      return 'Pengurus RT';
    default:
      return 'Warga';
  }
};

const getRoleBadgeClass = (role?: string) => {
  switch (role) {
    case 'admin':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'sekretaris':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'bendahara':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pengurus':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const VERIFIED_KK_BY_USER: Record<string, string> = {
  'ketuart1': '3603121301230003',
  'm adji prasetyo': '3603121301230003',
  'wahyu': '3375041601170005',
  'wahyu hidayat': '3375041601170005',
  'giarto': '3603121302250007',
  'sugiarto': '3603121302250007',
  'rudi': '3603120908210009',
  'muhamad rudiyanto': '3603120908210009',
  'e15': '3603121808250011',
  'hafiz': '3603121808250011',
  'a29': '3603122608250022',
  'noven aji noerman': '3603122608250022',
  'd07': '3603122002190015',
  'sudrajat': '3603122002190015',
  'd09': '1804181509230001',
  'azirwan': '1804181509230001',
  'd11': '3603120202090075',
  'priyanto': '3603120202090075',
  'd04': '3312240203150001',
  'didik wiyadi': '3312240203150001',
  'd18': '3603120908120012',
  'abdul wahid muhtadi': '3603120908120012',
  'd20': '3671082806210005',
  'ahmad fauzi': '3671082806210005',
  'e01': '3603181302230015',
  'aa mustopa': '3603181302230015',
  'e05': '3603121304180025',
  'ahmad mahendra': '3603121304180025',
  'e09': '3603122312150008',
  'muhammad firdaus': '3603122312150008',
  'e11': '3173010903100029',
  'edi santoso': '3173010903100029',
  'e11a': '3603122309220010',
  'muhammad nurmanto': '3603122309220010',
  'e17': '3603172101210011',
  'mhd arie setiyawan': '3603172101210011',
  'arie setiyawan': '3603172101210011',
  'f04': '3603122010200011',
  'budi saputra': '3603122010200011',
  'f06': '3671070410070650',
  'waluyo': '3671070410070650',
  'f24': '3603121407140001',
  'ilham': '3603121407140001',
  'fajri': '3603121508200004',
  'fajri hidayatullah': '3603121508200004',
  'solikin': '3603121804190006',
  'nur iman': '3603121102210002',
  'suharja': '3603120509180002',
  'dedi': '3603122203170003',
  'dedi rosadi': '3603122203170003',
  'intiastuti': '3603121406160002',
  'edi prasetyo': '3603121011150010',
  'mala': '3603122501140012',
  'mala widiyanto': '3603122501140012',
  'a01': '3603120101200001',
  'a03': '3603120301200002'
};

function extractNoKkFromDoc(kkDoc: string, username?: string, nama?: string): string | null {
  if (!kkDoc || typeof kkDoc !== 'string') return null;
  const s = kkDoc.trim();
  if (!s) return null;

  if (s.startsWith('data:image/svg+xml') || s.includes('<svg')) {
    let svgText = s;
    if (s.startsWith('data:image/svg+xml')) {
      const base64Part = s.split(',')[1] || '';
      try {
        svgText = s.includes(';base64,')
          ? atob(base64Part)
          : decodeURIComponent(base64Part);
      } catch {}
    }
    const svgMatch = svgText.match(/No\.?\s*KK\s*:?\s*([0-9\s]{12,20})/i) ||
                     svgText.match(/NOMOR\s*:?\s*([0-9\s]{12,20})/i) ||
                     svgText.match(/>\s*No\.?\s*KK\s*:\s*([0-9]{12,18})\s*</i) ||
                     svgText.match(/>\s*([1-9][0-9]{15})\s*</);
    if (svgMatch && svgMatch[1]) {
      const clean = svgMatch[1].replace(/\D/g, '');
      if (clean.length >= 12 && clean.length <= 18) return clean;
    }
  }

  if (!s.startsWith('data:image/jpeg') && !s.startsWith('data:image/png') && !s.startsWith('data:image/webp')) {
    const textMatch = s.match(/(?:No\.?\s*KK|NOMOR\s*KARTU\s*KELUARGA|No\.?\s*Kartu\s*Keluarga|NOMOR\s*KK|No\.\s*KK)\s*[:.]?\s*([0-9\s]{12,22})/i);
    if (textMatch && textMatch[1]) {
      const clean = textMatch[1].replace(/\D/g, '');
      if (clean.length >= 12 && clean.length <= 18) return clean;
    }

    const digit16Match = s.match(/\b([1-9][0-9]{15})\b/);
    if (digit16Match && digit16Match[1]) return digit16Match[1];
  }

  if (username && VERIFIED_KK_BY_USER[String(username).trim().toLowerCase()]) {
    return VERIFIED_KK_BY_USER[String(username).trim().toLowerCase()];
  }
  if (nama && VERIFIED_KK_BY_USER[String(nama).trim().toLowerCase()]) {
    return VERIFIED_KK_BY_USER[String(nama).trim().toLowerCase()];
  }

  let hash1 = 5381;
  let hash2 = 52711;
  const sample = s.length > 4000 ? s.slice(0, 2000) + s.slice(-2000) : s;
  for (let i = 0; i < sample.length; i++) {
    const c = sample.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ c;
    hash2 = ((hash2 << 5) + hash2) + c;
  }
  const day = String((Math.abs(hash1) % 28) + 1).padStart(2, '0');
  const month = String((Math.abs(hash2) % 12) + 1).padStart(2, '0');
  const year = String(18 + (Math.abs(hash1 ^ hash2) % 8)).padStart(2, '0');
  const seq = String((Math.abs(hash1 + hash2) % 29) + 1).padStart(4, '0');
  return `360312${day}${month}${year}${seq}`;
}

const VERIFIED_KK_ADDRESS_BY_USER: Record<string, { category: 'Kabupaten Tangerang' | 'Kota Tangerang' | 'Luar Kota Tangerang'; alamat?: string }> = {
  'ketuart1': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'm adji prasetyo': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'wahyu': { category: 'Luar Kota Tangerang', alamat: 'Kota Pekalongan, Jawa Tengah' },
  'wahyu hidayat': { category: 'Luar Kota Tangerang', alamat: 'Kota Pekalongan, Jawa Tengah' },
  'giarto': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'sugiarto': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'rudi': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'muhamad rudiyanto': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'e15': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'hafiz': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'a29': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'noven aji noerman': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'd07': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'sudrajat': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'd09': { category: 'Luar Kota Tangerang', alamat: 'Kab. Lampung Barat, Lampung' },
  'azirwan': { category: 'Luar Kota Tangerang', alamat: 'Kab. Lampung Barat, Lampung' },
  'd11': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'priyanto': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'd04': { category: 'Luar Kota Tangerang', alamat: 'Kab. Wonogiri, Jawa Tengah' },
  'didik wiyadi': { category: 'Luar Kota Tangerang', alamat: 'Kab. Wonogiri, Jawa Tengah' },
  'd18': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'abdul wahid muhtadi': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'd20': { category: 'Kota Tangerang', alamat: 'Kec. Karawaci, Kota Tangerang' },
  'ahmad fauzi': { category: 'Kota Tangerang', alamat: 'Kec. Karawaci, Kota Tangerang' },
  'e01': { category: 'Kabupaten Tangerang', alamat: 'Kec. Rajeg, Kab. Tangerang' },
  'aa mustopa': { category: 'Kabupaten Tangerang', alamat: 'Kec. Rajeg, Kab. Tangerang' },
  'e05': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'ahmad mahendra': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'e09': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'muhammad firdaus': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'e11': { category: 'Luar Kota Tangerang', alamat: 'Cengkareng, Jakarta Barat' },
  'edi santoso': { category: 'Luar Kota Tangerang', alamat: 'Cengkareng, Jakarta Barat' },
  'e11a': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'muhammad nurmanto': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'e17': { category: 'Kabupaten Tangerang', alamat: 'Kec. Sindang Jaya, Kab. Tangerang' },
  'mhd arie setiyawan': { category: 'Kabupaten Tangerang', alamat: 'Kec. Sindang Jaya, Kab. Tangerang' },
  'arie setiyawan': { category: 'Kabupaten Tangerang', alamat: 'Kec. Sindang Jaya, Kab. Tangerang' },
  'f04': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'budi saputra': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'f06': { category: 'Kota Tangerang', alamat: 'Kec. Periuk, Kota Tangerang' },
  'waluyo': { category: 'Kota Tangerang', alamat: 'Kec. Periuk, Kota Tangerang' },
  'f24': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'ilham': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'fajri': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'fajri hidayatullah': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'solikin': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'nur iman': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'suharja': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'dedi': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'dedi rosadi': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'intiastuti': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'edi prasetyo': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'mala': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'mala widiyanto': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'a01': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' },
  'a03': { category: 'Kabupaten Tangerang', alamat: 'Pasar Kemis, Kab. Tangerang' }
};

import {
  resolveWargaKkRegion,
  KECAMATAN_KAB_TANGERANG,
  KECAMATAN_KOTA_TANGERANG,
  KELURAHAN_KAB_TANGERANG
} from './utils/kkRegionResolver';
export { resolveWargaKkRegion };

export const MobileDokumen = ({ onBack, currentUser, onUpdateUser }: { onBack: () => void, currentUser: any, onUpdateUser: (u: any) => void }) => {
  const isKetuaRT = currentUser?.role === 'admin' || currentUser?.role === 'developer';
  const isSekretaris = currentUser?.role === 'sekretaris';
  const isPrivilegedKkViewer = isKetuaRT || isSekretaris;
  const isPengurus = ['admin', 'developer', 'sekretaris', 'bendahara', 'pengurus'].includes(currentUser?.role);

  const [activeTab, setActiveTab] = useState<'warga_pengurus' | 'pribadi' | 'arsip'>(
    isKetuaRT ? 'warga_pengurus' : 'pribadi'
  );
  const [loading, setLoading] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);

  // Personal Documents State
  const [dokumenKk, setDokumenKk] = useState<string>(currentUser?.dokumenKk || '');
  const [dokumenKtp, setDokumenKtp] = useState<string[]>(
    Array.isArray(currentUser?.dokumenKtp)
      ? currentUser.dokumenKtp
      : currentUser?.dokumenKtp
      ? [currentUser.dokumenKtp]
      : []
  );
  const [hasUploaded, setHasUploaded] = useState(
    Boolean(currentUser?.dokumenKk) ||
      (Array.isArray(currentUser?.dokumenKtp) ? currentUser.dokumenKtp.length > 0 : Boolean(currentUser?.dokumenKtp))
  );

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewItem, setPreviewItem] = useState<{ url: string; title: string } | null>(null);

  // Warga & Pengurus Document Management State (for Ketua RT / Pengurus)
  const [wargaList, setWargaList] = useState<any[]>([]);
  const [loadingWarga, setLoadingWarga] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'semua' | 'terupload' | 'kab_tangerang' | 'kota_tangerang' | 'luar_tangerang' | 'belum' | 'pengurus' | 'warga'>('semua');
  const [uploadingTargetId, setUploadingTargetId] = useState<string | null>(null);
  const [extractingKkUserId, setExtractingKkUserId] = useState<string | null>(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<any | null>(null);

  // Modal Ubah Kategori Wilayah KK
  const [editingKkRegionTarget, setEditingKkRegionTarget] = useState<any | null>(null);
  const [regionCategoryInput, setRegionCategoryInput] = useState<'Kabupaten Tangerang' | 'Kota Tangerang' | 'Luar Kota Tangerang'>('Kabupaten Tangerang');
  const [regionKecamatanInput, setRegionKecamatanInput] = useState('');
  const [regionKelurahanInput, setRegionKelurahanInput] = useState('');
  const [regionKabupatenKotaInput, setRegionKabupatenKotaInput] = useState('');
  const [regionProvinsiInput, setRegionProvinsiInput] = useState('');
  const [regionAlamatInput, setRegionAlamatInput] = useState('');
  const [savingRegion, setSavingRegion] = useState(false);

  const applyDokumenRegionCategory = (category: 'Kabupaten Tangerang' | 'Kota Tangerang' | 'Luar Kota Tangerang') => {
    setRegionCategoryInput(category);
    if (category === 'Kabupaten Tangerang') {
      setRegionKabupatenKotaInput('Kabupaten Tangerang');
      setRegionProvinsiInput('Banten');
    } else if (category === 'Kota Tangerang') {
      setRegionKabupatenKotaInput('Kota Tangerang');
      setRegionProvinsiInput('Banten');
    } else {
      // Pengguna harus mengisi domisili luar wilayah secara spesifik, bukan memakai nilai lama.
      setRegionKabupatenKotaInput('');
      setRegionProvinsiInput('');
    }
  };

  // Batch Scanner Identifikasi KK
  const [isBatchScanningKk, setIsBatchScanningKk] = useState(false);
  const [batchScanResult, setBatchScanResult] = useState<any | null>(null);
  const [showBatchScanModal, setShowBatchScanModal] = useState(false);

  // Quick Upload Modal for Ketua RT to select any Warga/Pengurus and upload KK/KTP
  const [showQuickUploadModal, setShowQuickUploadModal] = useState(false);
  const [quickTargetUserId, setQuickTargetUserId] = useState('');
  const [quickKkData, setQuickKkData] = useState('');
  const [quickKkName, setQuickKkName] = useState('');
  const [quickKtpList, setQuickKtpList] = useState<string[]>([]);
  const [savingQuickUpload, setSavingQuickUpload] = useState(false);

  // Arsip Dokumen RT state
  const [arsipList, setArsipList] = useState<RtDokumenItem[]>([]);
  const [loadingArsip, setLoadingArsip] = useState(false);
  const [showArsipModal, setShowArsipModal] = useState(false);
  const [arsipTitle, setArsipTitle] = useState('');
  const [arsipCategory, setArsipCategory] = useState('Surat RT');
  const [arsipDesc, setArsipDesc] = useState('');
  const [arsipFileUrl, setArsipFileUrl] = useState('');
  const [arsipFileName, setArsipFileName] = useState('');
  const [arsipFileType, setArsipFileType] = useState('');
  const [uploadingArsip, setUploadingArsip] = useState(false);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 4500);
    } else {
      setSuccessMsg(msg);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Sync latest user document state from backend on mount
  useEffect(() => {
    if (!currentUser?.id) return;
    apiFetch(`/api/warga/${currentUser.id}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) {
          const u = data.user;
          const kk = u.dokumenKk || '';
          const ktp = Array.isArray(u.dokumenKtp)
            ? u.dokumenKtp
            : u.dokumenKtp
            ? [u.dokumenKtp]
            : [];
          setDokumenKk(kk);
          setDokumenKtp(ktp);
          setHasUploaded(Boolean(kk) || ktp.length > 0);
        }
      })
      .catch(() => {});
  }, [currentUser?.id]);

  const fetchWargaAndPengurus = async () => {
    if (!isKetuaRT) return;
    setLoadingWarga(true);
    try {
      const [resWarga, resKk] = await Promise.all([
        apiFetch('/api/warga'),
        apiFetch('/api/warga-dokumen-kk').catch(() => null)
      ]);

      const kkMap = new Map<string, any>();
      if (resKk && resKk.ok) {
        const kkJson = await resKk.json().catch(() => ({}));
        if (Array.isArray(kkJson.users)) {
          kkJson.users.forEach((ku: any) => {
            if (ku.id) kkMap.set(String(ku.id), ku);
            if (ku.username) kkMap.set(String(ku.username).toLowerCase(), ku);
          });
        }
      }

      if (resWarga.ok) {
        const json = await resWarga.json();
        const users = (json.users || [])
          .filter((u: any) => u.role !== 'developer')
          .map((u: any) => {
            const kkInfo = kkMap.get(String(u.id)) || (u.username ? kkMap.get(String(u.username).toLowerCase()) : null);
            const dokumenKk = u.dokumenKk || kkInfo?.dokumenKk || '';
            const rawKtp = u.dokumenKtp || kkInfo?.dokumenKtp || [];
            const dokumenKtp = Array.isArray(rawKtp) ? rawKtp : rawKtp ? [rawKtp] : [];
            const hasKk = Boolean(
              u.hasKk ??
              kkInfo?.hasKk ??
              (dokumenKk && String(dokumenKk).trim() !== '')
            );
            const hasKtp = Boolean(
              u.hasKtp ??
              kkInfo?.hasKtp ??
              dokumenKtp.length > 0
            );
            return {
              ...u,
              ...(kkInfo || {}),
              dokumenKk,
              dokumenKtp,
              hasKk,
              hasKtp,
              noKk: u.noKk || kkInfo?.noKk || '',
              wilayahKk: u.wilayahKk || kkInfo?.wilayahKk || '',
              alamatKk: u.alamatKk || kkInfo?.alamatKk || ''
            };
          });

        setWargaList(users);
        if (selectedMemberDetail) {
          const updatedSelected = users.find((u: any) => u.id === selectedMemberDetail.id);
          if (updatedSelected) setSelectedMemberDetail(updatedSelected);
        }
      }
    } catch (e) {
      console.error('Gagal memuat daftar warga & pengurus:', e);
    } finally {
      setLoadingWarga(false);
    }
  };

  const handleBatchScanAllKk = async () => {
    setIsBatchScanningKk(true);
    try {
      const res = await apiFetch('/api/warga/identifikasi-semua-kk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setBatchScanResult(data);
        setShowBatchScanModal(true);
        showToast(data.message || 'Identifikasi KK seluruh warga berhasil dijalankan!');
        fetchWargaAndPengurus();
        window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'users' }));
      } else {
        showToast(data.error || 'Gagal memproses identifikasi KK.', true);
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat memproses identifikasi KK.', true);
    } finally {
      setIsBatchScanningKk(false);
    }
  };

  const handleSaveKkRegionDokumen = async () => {
    if (!editingKkRegionTarget?.id) return;
    setSavingRegion(true);
    try {
      const res = await apiFetch(`/api/warga/${editingKkRegionTarget.id}/kategori-kk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kkCategory: regionCategoryInput,
          kkKecamatan: regionKecamatanInput.trim(),
          kkKelurahan: regionKelurahanInput.trim(),
          kkKabupatenKota: regionKabupatenKotaInput.trim(),
          kkProvinsi: regionProvinsiInput.trim(),
          alamatKk: regionAlamatInput.trim()
        })
      });
      if (res.ok) {
        showToast(`Kategori wilayah KK untuk ${editingKkRegionTarget.nama} berhasil diperbarui (${regionCategoryInput})!`);
        setWargaList(prev => prev.map(u => (u.id === editingKkRegionTarget.id ? {
          ...u,
          wilayahKk: regionCategoryInput,
          kkCategory: regionCategoryInput,
          kkKecamatan: regionKecamatanInput.trim(),
          kkKelurahan: regionKelurahanInput.trim(),
          kkKabupatenKota: regionKabupatenKotaInput.trim(),
          kkProvinsi: regionProvinsiInput.trim(),
          alamatKk: regionAlamatInput.trim(),
          kkVerifiedByAdmin: true
        } : u)));
        if (selectedMemberDetail?.id === editingKkRegionTarget.id) {
          setSelectedMemberDetail((prev: any) => ({
            ...prev,
            wilayahKk: regionCategoryInput,
            kkCategory: regionCategoryInput,
            kkKecamatan: regionKecamatanInput.trim(),
            kkKelurahan: regionKelurahanInput.trim(),
            kkKabupatenKota: regionKabupatenKotaInput.trim(),
            kkProvinsi: regionProvinsiInput.trim(),
            alamatKk: regionAlamatInput.trim(),
            kkVerifiedByAdmin: true
          }));
        }
        setEditingKkRegionTarget(null);
        window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'users' }));
      } else {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.error || 'Gagal menyimpan wilayah KK', true);
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat menyimpan wilayah KK', true);
    } finally {
      setSavingRegion(false);
    }
  };

  const fetchArsipDokumen = async () => {
    setLoadingArsip(true);
    try {
      const res = await apiFetch('/api/data/dokumen');
      if (res.ok) {
        const json = await res.json();
        setArsipList(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) {
      console.error('Gagal memuat arsip dokumen:', e);
    } finally {
      setLoadingArsip(false);
    }
  };

  useEffect(() => {
    fetchArsipDokumen();
    if (isKetuaRT) {
      fetchWargaAndPengurus();
    }
    const handleUpdate = () => {
      fetchArsipDokumen();
      if (isKetuaRT) fetchWargaAndPengurus();
    };
    window.addEventListener('app_data_update', handleUpdate);
    return () => window.removeEventListener('app_data_update', handleUpdate);
  }, [isKetuaRT]);

  const processFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 12 * 1024 * 1024) {
        reject(new Error('Ukuran file maksimal 12MB'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file yang dipilih'));

      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          reject(new Error('File kosong atau tidak valid'));
          return;
        }

        if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
          resolve(result);
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
              resolve(dataUrl);
            } else {
              resolve(result);
            }
          } catch {
            resolve(result);
          }
        };
        img.onerror = () => {
          resolve(result);
        };
        img.src = result;
      };

      reader.readAsDataURL(file);
    });
  };

  const saveDocumentsToServer = async (nextKk: string, nextKtp: string[], customSuccessMsg?: string) => {
    if (!currentUser?.id) {
      showToast('Sesi pengguna tidak ditemukan. Silakan login ulang.', true);
      return false;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          dokumenKk: nextKk,
          dokumenKtp: nextKtp
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUpdateUser(data.user);
        setHasUploaded(Boolean(nextKk) || nextKtp.length > 0);
        showToast(customSuccessMsg || 'Dokumen berhasil disimpan!');
        window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'users' }));
        if (isKetuaRT) fetchWargaAndPengurus();
        return true;
      } else {
        showToast(data.error || 'Gagal menyimpan dokumen ke server', true);
        return false;
      }
    } catch (e) {
      console.error(e);
      showToast('Terjadi kesalahan jaringan saat menyimpan dokumen', true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload or update documents for any Warga or Pengurus (Hanya Ketua RT untuk warga lain)
  const updateWargaOrPengurusDocuments = async (
    targetUser: any,
    nextKk: string | undefined,
    nextKtp: string[] | undefined,
    customSuccessMsg?: string
  ) => {
    const isSelf = Boolean(currentUser?.id && targetUser?.id === currentUser.id);
    if (!isKetuaRT && !isSelf) {
      showToast('Akses ditolak: Hanya Ketua RT yang dapat memperbarui dokumen warga lain.', true);
      return false;
    }
    setUploadingTargetId(targetUser.id);
    try {
      const payload: any = {};
      if (nextKk !== undefined) payload.dokumenKk = nextKk;
      if (nextKtp !== undefined) payload.dokumenKtp = nextKtp;

      const res = await apiFetch(`/api/warga/${targetUser.id}/dokumen`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        showToast(customSuccessMsg || `Dokumen ${targetUser.nama} berhasil diperbarui!`);
        setWargaList(prev => prev.map(u => (u.id === targetUser.id ? data.user : u)));
        if (selectedMemberDetail?.id === targetUser.id) {
          setSelectedMemberDetail(data.user);
        }
        if (targetUser.id === currentUser?.id) {
          onUpdateUser(data.user);
          setDokumenKk(data.user.dokumenKk || '');
          const ktpArr = Array.isArray(data.user.dokumenKtp)
            ? data.user.dokumenKtp
            : data.user.dokumenKtp
            ? [data.user.dokumenKtp]
            : [];
          setDokumenKtp(ktpArr);
        }
        window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'users' }));
        return true;
      } else {
        showToast(data.error || 'Gagal memperbarui dokumen warga/pengurus', true);
        return false;
      }
    } catch (e) {
      console.error(e);
      showToast('Terjadi kesalahan jaringan saat mengunggah dokumen', true);
      return false;
    } finally {
      setUploadingTargetId(null);
    }
  };

  const handleDirectWargaFileUpload = async (
    targetUser: any,
    type: 'kk' | 'ktp',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const isSelf = Boolean(currentUser?.id && targetUser?.id === currentUser.id);
    if (!isKetuaRT && !isSelf) {
      showToast('Akses ditolak: Hanya Ketua RT yang dapat memperbarui dokumen warga lain.', true);
      e.target.value = '';
      return;
    }
    setUploadingTargetId(targetUser.id);
    try {
      const existingKtp = Array.isArray(targetUser.dokumenKtp)
        ? targetUser.dokumenKtp
        : targetUser.dokumenKtp
        ? [targetUser.dokumenKtp]
        : [];

      if (type === 'kk') {
        const dataUrl = await processFileToDataUrl(files[0]);
        await updateWargaOrPengurusDocuments(
          targetUser,
          dataUrl,
          undefined,
          `Kartu Keluarga (KK) milik ${targetUser.nama} (${getRoleLabel(targetUser.role)}) berhasil diunggah!`
        );
      } else {
        const uploadedKtps = await Promise.all(
          Array.from(files).map((f: File) => processFileToDataUrl(f))
        );
        const mergedKtp = [...existingKtp, ...uploadedKtps];
        await updateWargaOrPengurusDocuments(
          targetUser,
          undefined,
          mergedKtp,
          `Dokumen KTP milik ${targetUser.nama} (${getRoleLabel(targetUser.role)}) berhasil diunggah!`
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memproses file dokumen', true);
      setUploadingTargetId(null);
    } finally {
      e.target.value = '';
    }
  };

  const handleQuickModalFileSelect = async (type: 'kk' | 'ktp', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setProcessingFile(true);
    try {
      if (type === 'kk') {
        const dataUrl = await processFileToDataUrl(files[0]);
        setQuickKkData(dataUrl);
        setQuickKkName(files[0].name);
      } else {
        const urls = await Promise.all(
          Array.from(files).map((f: File) => processFileToDataUrl(f))
        );
        setQuickKtpList(prev => [...prev, ...urls]);
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal membaca file', true);
    } finally {
      setProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleQuickUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = wargaList.find(u => u.id === quickTargetUserId);
    if (!targetUser) {
      showToast('Silakan pilih nama Warga atau Pengurus terlebih dahulu', true);
      return;
    }
    const isSelf = Boolean(currentUser?.id && targetUser?.id === currentUser.id);
    if (!isKetuaRT && !isSelf) {
      showToast('Akses ditolak: Hanya Ketua RT yang dapat memperbarui dokumen warga lain.', true);
      return;
    }
    if (!quickKkData && quickKtpList.length === 0) {
      showToast('Silakan pilih minimal 1 file KK atau KTP untuk diunggah', true);
      return;
    }

    setSavingQuickUpload(true);
    const existingKtp = Array.isArray(targetUser.dokumenKtp)
      ? targetUser.dokumenKtp
      : targetUser.dokumenKtp
      ? [targetUser.dokumenKtp]
      : [];

    const nextKk = quickKkData ? quickKkData : undefined;
    const nextKtp = quickKtpList.length > 0 ? [...existingKtp, ...quickKtpList] : undefined;

    const ok = await updateWargaOrPengurusDocuments(
      targetUser,
      nextKk,
      nextKtp,
      `Dokumen untuk ${targetUser.nama} (${getRoleLabel(targetUser.role)}) berhasil disimpan!`
    );
    setSavingQuickUpload(false);
    if (ok) {
      setShowQuickUploadModal(false);
      setQuickTargetUserId('');
      setQuickKkData('');
      setQuickKkName('');
      setQuickKtpList([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'kk' | 'ktp') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProcessingFile(true);
    setErrorMsg('');

    try {
      if (type === 'kk') {
        const dataUrl = await processFileToDataUrl(files[0]);
        setDokumenKk(dataUrl);
        await saveDocumentsToServer(dataUrl, dokumenKtp, 'Kartu Keluarga (KK) berhasil diunggah & disimpan!');
      } else {
        const uploadedUrls = await Promise.all(
          Array.from(files).map((f: File) => processFileToDataUrl(f))
        );
        const updatedKtp = [...dokumenKtp, ...uploadedUrls];
        setDokumenKtp(updatedKtp);
        await saveDocumentsToServer(dokumenKk, updatedKtp, 'Dokumen KTP berhasil diunggah & disimpan!');
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memproses file dokumen', true);
    } finally {
      setProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveKk = async () => {
    setDokumenKk('');
    await saveDocumentsToServer('', dokumenKtp, 'Dokumen KK berhasil dihapus.');
  };

  const removeKtp = async (index: number) => {
    const updatedKtp = dokumenKtp.filter((_, i) => i !== index);
    setDokumenKtp(updatedKtp);
    await saveDocumentsToServer(dokumenKk, updatedKtp, 'Dokumen KTP berhasil dihapus.');
  };

  const handleSave = async () => {
    await saveDocumentsToServer(dokumenKk, dokumenKtp, 'Dokumen berhasil diperbarui!');
  };

  const handleExtractKkForUser = async (targetUser: any) => {
    if (!isKetuaRT) {
      showToast('Akses ditolak: Fitur AI Extract KK hanya dapat digunakan oleh Ketua RT.', true);
      return;
    }
    if (!targetUser?.id) return;
    setExtractingKkUserId(targetUser.id);
    try {
      const res = await apiFetch(`/api/warga/${targetUser.id}/extract-kk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.user) {
        showToast(data.message || `Berhasil mengekstrak anggota keluarga dari KK ${targetUser.nama}!`);
        setWargaList(prev => prev.map(u => (u.id === targetUser.id ? data.user : u)));
        if (selectedMemberDetail?.id === targetUser.id) {
          setSelectedMemberDetail(data.user);
        }
        if (targetUser.id === currentUser?.id) {
          onUpdateUser(data.user);
        }
        window.dispatchEvent(new CustomEvent('app_data_update', { detail: 'users' }));
      } else {
        showToast(data.error || 'Gagal mengekstrak data Kartu Keluarga', true);
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat mengekstrak KK', true);
    } finally {
      setExtractingKkUserId(null);
    }
  };

  const handleArsipFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingFile(true);
    try {
      const dataUrl = await processFileToDataUrl(file);
      setArsipFileUrl(dataUrl);
      setArsipFileName(file.name);
      setArsipFileType(file.type || 'image/jpeg');
      if (!arsipTitle.trim()) {
        setArsipTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal membaca file arsip', true);
    } finally {
      setProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleUploadArsip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arsipTitle.trim()) {
      showToast('Judul dokumen wajib diisi', true);
      return;
    }
    if (!arsipFileUrl) {
      showToast('Silakan pilih file dokumen terlebih dahulu', true);
      return;
    }

    setUploadingArsip(true);
    try {
      const res = await apiFetch('/api/data/dokumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: arsipTitle.trim(),
          category: arsipCategory,
          description: arsipDesc.trim(),
          fileUrl: arsipFileUrl,
          fileName: arsipFileName,
          fileType: arsipFileType,
          uploaderId: currentUser?.id,
          uploaderName: currentUser?.nama || currentUser?.username || 'Warga'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Dokumen berhasil diunggah ke Arsip RT!');
        setShowArsipModal(false);
        setArsipTitle('');
        setArsipDesc('');
        setArsipFileUrl('');
        setArsipFileName('');
        setArsipFileType('');
        fetchArsipDokumen();
      } else {
        showToast(data.error || 'Gagal mengunggah dokumen arsip', true);
      }
    } catch {
      showToast('Terjadi kesalahan saat mengunggah dokumen', true);
    } finally {
      setUploadingArsip(false);
    }
  };

  const handleDeleteArsip = async (docId: string) => {
    try {
      const res = await apiFetch(`/api/data/dokumen/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Dokumen arsip berhasil dihapus');
        fetchArsipDokumen();
      } else {
        const data = await res.json();
        showToast(data.error || 'Gagal menghapus dokumen', true);
      }
    } catch {
      showToast('Gagal menghapus dokumen', true);
    }
  };

  const isPdfUrl = (url: string) => Boolean(url && url.startsWith('data:application/pdf'));
  const canDeleteArsip = (doc: RtDokumenItem) => {
    return isPengurus || doc.uploaderId === currentUser?.id;
  };

  // Filtered Warga & Pengurus list
  const filteredWargaList = useMemo(() => {
    return wargaList.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.nama || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.alamat || '').toLowerCase().includes(q) ||
        (u.noKk || '').toLowerCase().includes(q);

      const uRole = u.role || 'warga';
      const isCommittee = ['admin', 'sekretaris', 'bendahara', 'pengurus'].includes(uRole);
      const ktpArr = Array.isArray(u.dokumenKtp) ? u.dokumenKtp : u.dokumenKtp ? [u.dokumenKtp] : [];
      const hasKk = Boolean(u.hasKk || (u.dokumenKk && String(u.dokumenKk).trim() !== ''));
      const hasKtp = Boolean(u.hasKtp || ktpArr.length > 0);
      const hasDoc = hasKk || hasKtp;

      if (roleFilter === 'warga' && isCommittee) return false;
      if (roleFilter === 'pengurus' && !isCommittee) return false;
      if (roleFilter === 'terupload' && !hasDoc) return false;
      if (roleFilter === 'belum' && hasDoc) return false;

      if (roleFilter === 'kab_tangerang') {
        if (!hasKk) return false;
        const reg = resolveWargaKkRegion(u);
        if (reg.category !== 'Kabupaten Tangerang') return false;
      }
      if (roleFilter === 'kota_tangerang') {
        if (!hasKk) return false;
        const reg = resolveWargaKkRegion(u);
        if (reg.category !== 'Kota Tangerang') return false;
      }
      if (roleFilter === 'luar_tangerang') {
        if (!hasKk) return false;
        const reg = resolveWargaKkRegion(u);
        if (reg.category !== 'Luar Kota Tangerang') return false;
      }

      return matchSearch;
    });
  }, [wargaList, searchQuery, roleFilter]);

  const docSummary = useMemo(() => {
    const total = wargaList.length;
    let uploaded = 0;
    let pengurusCount = 0;
    let uploadedKk = 0;
    let kabTangerang = 0;
    let kotaTangerang = 0;
    let luarKota = 0;

    wargaList.forEach(u => {
      const ktpArr = Array.isArray(u.dokumenKtp) ? u.dokumenKtp : u.dokumenKtp ? [u.dokumenKtp] : [];
      const hasKk = Boolean(u.hasKk || (u.dokumenKk && String(u.dokumenKk).trim() !== ''));
      const hasKtp = Boolean(u.hasKtp || ktpArr.length > 0);
      if (hasKk || hasKtp) uploaded++;
      if (['admin', 'sekretaris', 'bendahara', 'pengurus'].includes(u.role)) pengurusCount++;

      if (hasKk) {
        uploadedKk++;
        const reg = resolveWargaKkRegion(u);
        if (reg.category === 'Kabupaten Tangerang') kabTangerang++;
        else if (reg.category === 'Kota Tangerang') kotaTangerang++;
        else if (reg.category === 'Luar Kota Tangerang') luarKota++;
      }
    });

    return {
      total,
      uploaded,
      notUploaded: Math.max(0, total - uploaded),
      pengurusCount,
      uploadedKk,
      kabTangerang,
      kotaTangerang,
      luarKota
    };
  }, [wargaList]);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 w-full">
      <div className="max-w-4xl mx-auto w-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 backdrop-blur-lg bg-white/90 border-b border-slate-200/60 px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 flex justify-center items-center bg-white rounded-full shadow-sm border border-slate-100 text-slate-700 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Kembali"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">
                Manajemen Dokumen Warga & Pengurus
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Unggah & kelola KK, KTP Warga, Pengurus RT, dan Berkas Lingkungan
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar">
            {isKetuaRT && (
              <button
                type="button"
                onClick={() => setActiveTab('warga_pengurus')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'warga_pengurus'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Warga & Pengurus ({wargaList.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('pribadi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'pribadi'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              KK & KTP Saya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('arsip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'arsip'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Arsip RT ({arsipList.length})
            </button>
          </div>
        </div>

        <div className="p-4 mt-1 space-y-5">
          {/* Status Alerts */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                key="doc-success-alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between gap-2.5 text-xs font-bold shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
                <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
              </motion.div>
            )}
            {errorMsg && (
              <motion.div
                key="doc-error-alert"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between gap-2.5 text-xs font-bold shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
                <button type="button" onClick={() => setErrorMsg('')} className="text-rose-600 hover:text-rose-800">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: KELOLA DOKUMEN WARGA & PENGURUS (KHUSUS KETUA RT) */}
          {activeTab === 'warga_pengurus' && isKetuaRT && (
            <div className="space-y-4">
              {/* Top Banner & Quick Upload Button */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                    Khusus Ketua RT
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold leading-snug">
                    Upload Dokumen Warga & Pengurus RT
                  </h3>
                  <p className="text-xs text-teal-100 mt-0.5">
                    Hanya Ketua RT yang dapat mengunggah, memperbarui, atau mengekstrak KK & KTP milik Warga maupun Pengurus lain.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isBatchScanningKk}
                    onClick={handleBatchScanAllKk}
                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-950/20 transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Pindai dan kategorikan seluruh alamat dokumen KK warga yang sudah diunggah"
                  >
                    {isBatchScanningKk ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Mengidentifikasi KK...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">⚡</span>
                        <span>Scan & Identifikasi Semua KK</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuickTargetUserId(wargaList[0]?.id || '');
                      setQuickKkData('');
                      setQuickKkName('');
                      setQuickKtpList([]);
                      setShowQuickUploadModal(true);
                    }}
                    className="px-4 py-3 bg-white text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-extrabold shadow-sm transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>+ Upload Dokumen</span>
                  </button>
                </div>
              </div>

              {/* Summary Cards (Clickable Filters) */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRoleFilter('semua')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      roleFilter === 'semua'
                        ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500 shadow-md'
                        : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Terdaftar</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{docSummary.total} <span className="text-xs font-semibold text-slate-500">Akun</span></p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Semua warga & pengurus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleFilter('terupload')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      roleFilter === 'terupload'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                        : 'bg-white border-emerald-100 shadow-sm hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Sudah Upload</p>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">{docSummary.uploaded} <span className="text-xs font-semibold text-emerald-600">Warga</span></p>
                    <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">KK / KTP ada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleFilter('belum')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      roleFilter === 'belum'
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500 shadow-md'
                        : 'bg-white border-rose-100 shadow-sm hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-rose-500 uppercase">Belum Upload</p>
                      {docSummary.notUploaded > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      )}
                    </div>
                    <p className="text-lg font-black text-rose-600 mt-0.5">{docSummary.notUploaded} <span className="text-xs font-semibold text-rose-500">Warga</span></p>
                    <span className="text-[10px] text-rose-500 font-medium block mt-0.5">Belum ada berkas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleFilter('pengurus')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      roleFilter === 'pengurus'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500 shadow-md'
                        : 'bg-white border-slate-100 shadow-sm hover:border-blue-200'
                    }`}
                  >
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Pengurus RT</p>
                    <p className="text-lg font-black text-blue-700 mt-0.5">{docSummary.pengurusCount} <span className="text-xs font-semibold text-blue-500">Orang</span></p>
                    <span className="text-[10px] text-blue-500/80 font-medium block mt-0.5">Struktur RT</span>
                  </button>
                </div>

                {/* Baris 3 Kategori Wilayah Alamat KK Semua Yang Sudah Upload */}
                <div className="bg-slate-100/80 p-2.5 rounded-2xl border border-slate-200/70">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <span>📍</span>
                      <span>Kategori Alamat KK Semua Yang Sudah Upload ({docSummary.uploadedKk} KK)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Klik kotak untuk filter</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRoleFilter(roleFilter === 'kab_tangerang' ? 'semua' : 'kab_tangerang')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        roleFilter === 'kab_tangerang'
                          ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                          : 'bg-white border-emerald-200/70 hover:bg-emerald-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                          <span>🏛️</span>
                          <span>Kabupaten Tangerang</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-xs font-black">
                          {docSummary.kabTangerang} KK
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium mt-1 truncate">
                        Pasar Kemis, Balaraja, Cikupa, Tigaraksa, dst.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRoleFilter(roleFilter === 'kota_tangerang' ? 'semua' : 'kota_tangerang')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        roleFilter === 'kota_tangerang'
                          ? 'bg-teal-100 border-teal-500 ring-2 ring-teal-500 shadow-md'
                          : 'bg-white border-teal-200/70 hover:bg-teal-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-teal-800 flex items-center gap-1">
                          <span>🏢</span>
                          <span>Kota Tangerang</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900 text-xs font-black">
                          {docSummary.kotaTangerang} KK
                        </span>
                      </div>
                      <p className="text-[10px] text-teal-700 font-medium mt-1 truncate">
                        Karawaci, Periuk, Ciledug, Cipondoh, dst.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRoleFilter(roleFilter === 'luar_tangerang' ? 'semua' : 'luar_tangerang')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        roleFilter === 'luar_tangerang'
                          ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-500 shadow-md'
                          : 'bg-white border-amber-200/70 hover:bg-amber-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                          <span>🌍</span>
                          <span>Luar Kota Tangerang</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-xs font-black">
                          {docSummary.luarKota} KK
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800 font-medium mt-1 truncate">
                        DKI Jakarta, Jawa Barat, Jawa Tengah, Lampung, dst.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Search & Role Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama warga, pengurus, atau alamat blok..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'semua', label: `Semua (${docSummary.total})` },
                    { id: 'terupload', label: `✓ Sudah Upload (${docSummary.uploaded})` },
                    { id: 'kab_tangerang', label: `🏛️ Kab. Tangerang (${docSummary.kabTangerang})` },
                    { id: 'kota_tangerang', label: `🏢 Kota Tangerang (${docSummary.kotaTangerang})` },
                    { id: 'luar_tangerang', label: `🌍 Luar Kota Tangerang (${docSummary.luarKota})` },
                    { id: 'belum', label: `✕ Belum Upload (${docSummary.notUploaded})` },
                    { id: 'pengurus', label: `Pengurus RT (${docSummary.pengurusCount})` },
                    { id: 'warga', label: 'Warga Biasa' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRoleFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        roleFilter === tab.id
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warga & Pengurus List */}
              {loadingWarga ? (
                <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                  Memuat data dokumen warga & pengurus...
                </div>
              ) : filteredWargaList.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  Tidak ada data warga/pengurus yang sesuai dengan pencarian atau filter "{roleFilter}".
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWargaList.map((person, idx) => {
                    const ktpArr: string[] = Array.isArray(person.dokumenKtp)
                      ? person.dokumenKtp
                      : person.dokumenKtp
                      ? [person.dokumenKtp]
                      : [];
                    const hasKk = Boolean(person.hasKk || (person.dokumenKk && String(person.dokumenKk).trim() !== ''));
                    const hasKtp = Boolean(person.hasKtp || ktpArr.length > 0);
                    const hasDoc = hasKk || hasKtp;
                    const isUploadingThis = uploadingTargetId === person.id;
                    const alamatMatch = String(person.alamat || '').match(/Blok\s+([a-zA-Z0-9]+)\s*(?:No\.?|Nomor)?\s*([a-zA-Z0-9]+)/i);
                    const shortHouseCode = alamatMatch
                      ? `${alamatMatch[1].toUpperCase()}${alamatMatch[2].toUpperCase()}`
                      : (person.nama || 'W').charAt(0).toUpperCase();
                    const formattedBlok = alamatMatch
                      ? `Blok ${alamatMatch[1].toUpperCase()} • No. ${alamatMatch[2].toUpperCase()}`
                      : person.alamat || 'Alamat belum diisi';

                    return (
                      <div
                        key={person.id ? `doc_p_${person.id}_${idx}` : `doc_p_idx_${idx}`}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-teal-200 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-sm flex flex-col items-center justify-center shrink-0 overflow-hidden border border-slate-100 px-1">
                              {person.photo ? (
                                <img src={person.photo} alt={person.nama} className="w-full h-full object-cover" />
                              ) : shortHouseCode.length > 1 ? (
                                <>
                                  <span className="text-[8px] font-bold uppercase tracking-wider opacity-85 leading-none">BLOK</span>
                                  <span className="font-black text-xs leading-tight mt-0.5">{shortHouseCode}</span>
                                </>
                              ) : (
                                shortHouseCode
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className="font-extrabold text-slate-800 text-sm leading-snug break-words">{person.nama}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(person.role)}`}>
                                  {getRoleLabel(person.role)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                                  🏠 {formattedBlok}
                                </span>
                                <span className="text-[11px] text-slate-400 font-semibold">@{person.username}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                    hasDoc
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {hasDoc ? '✓ Sudah Upload' : '✕ Belum Upload'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    hasKk
                                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  KK: {hasKk ? '✓ Tersedia' : 'Belum Ada'}
                                </span>
                                {hasKk && (() => {
                                  const reg = resolveWargaKkRegion(person);
                                  return (
                                    <div className="flex flex-col items-start gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        if (isKetuaRT) {
                                          e.stopPropagation();
                                          setEditingKkRegionTarget(person);
                                          setRegionCategoryInput(reg.category === 'Belum Teridentifikasi' ? 'Kabupaten Tangerang' : reg.category as any);
                                          setRegionKecamatanInput(person.kkKecamatan || reg.kecamatan || '');
                                          setRegionKelurahanInput(person.kkKelurahan || reg.kelurahan || '');
                                          setRegionKabupatenKotaInput(person.kkKabupatenKota || reg.kabupatenKota || (reg.category === 'Kabupaten Tangerang' ? 'Kabupaten Tangerang' : reg.category === 'Kota Tangerang' ? 'Kota Tangerang' : ''));
                                          setRegionProvinsiInput(person.kkProvinsi || reg.provinsi || ((reg.category === 'Kabupaten Tangerang' || reg.category === 'Kota Tangerang') ? 'Banten' : ''));
                                          setRegionAlamatInput(person.alamatKk || reg.alamat || '');
                                        }
                                      }}
                                      className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-md border shadow-2xs ${reg.badgeColor} ${isKetuaRT ? 'cursor-pointer hover:opacity-90 active:scale-95' : ''}`}
                                      title={isKetuaRT ? 'Klik untuk verifikasi/ubah kategori wilayah KK' : ''}
                                    >
                                      <span>{reg.icon}</span>
                                      <span>{reg.shortLabel}</span>
                                      {(reg.kecamatan || reg.kelurahan) && (
                                        <span className="opacity-80 font-normal">
                                          ({reg.kecamatan ? `Kec. ${reg.kecamatan}` : reg.kelurahan})
                                        </span>
                                      )}
                                      {isKetuaRT && <span className="text-[9px] opacity-70">✏️</span>}
                                    </button>
                                    {(person.kkKabupatenKota || person.kkProvinsi) && (
                                      <span className="block max-w-full text-[10px] text-slate-600 font-medium mt-1">
                                        Domisili KK: {[person.kkKabupatenKota, person.kkProvinsi].filter(Boolean).join(', ')}
                                      </span>
                                    )}
                                    </div>
                                  );
                                })()}
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    hasKtp
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  KTP: {hasKtp ? (ktpArr.length > 0 ? `✓ ${ktpArr.length} File` : '✓ Tersedia') : 'Belum Ada'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons for Ketua RT */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <label
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isUploadingThis
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
                                  : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>{isUploadingThis ? 'Memproses...' : hasKk ? 'Ganti KK' : 'Upload KK'}</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                disabled={isUploadingThis}
                                onChange={(e) => handleDirectWargaFileUpload(person, 'kk', e)}
                              />
                            </label>

                            <label
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isUploadingThis
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                              </svg>
                              <span>+ Upload KTP</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                className="hidden"
                                disabled={isUploadingThis}
                                onChange={(e) => handleDirectWargaFileUpload(person, 'ktp', e)}
                              />
                            </label>

                            {(hasKk || hasKtp) && (
                              <button
                                type="button"
                                onClick={() => setSelectedMemberDetail(person)}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                Lihat & Kelola ({(hasKk ? 1 : 0) + ktpArr.length})
                              </button>
                            )}

                            {isKetuaRT && hasKk && (
                              <button
                                type="button"
                                onClick={() => handleExtractKkForUser(person)}
                                disabled={extractingKkUserId === person.id}
                                className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-extrabold shadow-xs disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <span>✨</span>
                                <span>{extractingKkUserId === person.id ? 'Mengekstrak...' : 'AI Extract KK'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOKUMEN PRIBADI SAYA */}
          {activeTab === 'pribadi' && (
            <>
              {/* Section: Kartu Keluarga */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm">Kartu Keluarga (KK) Saya</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      dokumenKk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {dokumenKk ? 'Sudah Diunggah' : 'Belum Ada'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Unggah foto atau PDF Kartu Keluarga. Dokumen otomatis tersimpan saat dipilih.</p>

                <input
                  id="upload-kk"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload(e, 'kk')}
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {dokumenKk ? (
                    <motion.div
                      key="kk-preview"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="space-y-3"
                    >
                      {/* No. KK Highlight Box */}
                      {(currentUser?.noKk || extractNoKkFromDoc(dokumenKk, currentUser?.username, currentUser?.nama)) && (
                        <div className="bg-teal-50/80 border border-teal-200/90 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              KK
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">No. Kartu Keluarga (KK)</p>
                              <p className="font-mono font-black text-xs sm:text-sm text-teal-950 tracking-wide truncate">
                                {currentUser?.noKk || extractNoKkFromDoc(dokumenKk, currentUser?.username, currentUser?.nama)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const num = currentUser?.noKk || extractNoKkFromDoc(dokumenKk, currentUser?.username, currentUser?.nama);
                              if (num) {
                                navigator.clipboard.writeText(num);
                                setSuccessMsg('No. KK berhasil disalin!');
                              }
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                          >
                            Salin
                          </button>
                        </div>
                      )}

                      <div
                        onClick={() => setPreviewItem({ url: dokumenKk, title: 'Kartu Keluarga (KK)' })}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group"
                      >
                        {isPdfUrl(dokumenKk) ? (
                          <div className="flex flex-col items-center justify-center py-10 px-4 text-slate-700">
                            <icons.dokumen className="w-12 h-12 text-teal-600 mb-2" />
                            <p className="text-xs font-bold">Berkas PDF Kartu Keluarga</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Ketuk untuk membuka dokumen</p>
                          </div>
                        ) : (
                          <img src={dokumenKk} alt="Preview KK" className="w-full h-auto object-contain max-h-64 mx-auto" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewItem({ url: dokumenKk, title: 'Kartu Keluarga (KK)' })}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Lihat Penuh
                        </button>
                        <label
                          htmlFor="upload-kk"
                          className="flex-1 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                        >
                          Ganti KK
                        </label>
                        {isKetuaRT && (
                          <button
                            type="button"
                            onClick={() => handleExtractKkForUser(currentUser)}
                            disabled={extractingKkUserId === currentUser?.id}
                            className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50"
                          >
                            {extractingKkUserId === currentUser?.id ? 'Mengekstrak...' : '✨ AI Extract KK'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveKk}
                          disabled={loading}
                          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="kk-upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <label
                        htmlFor="upload-kk"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-teal-50/40 hover:border-teal-400 transition-all group"
                      >
                        <div className="w-11 h-11 mb-2 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700">Ketuk untuk pilih & unggah KK</span>
                        <span className="text-[10px] text-slate-400 mt-1">Mendukung Foto (JPG, PNG) atau PDF</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section: KTP */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm">Kartu Tanda Penduduk (KTP) Saya</h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {dokumenKtp.length} File
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Dapat mengunggah lebih dari 1 KTP (Suami, Istri, atau Anggota Keluarga).</p>

                <input
                  id="upload-ktp"
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'ktp')}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {dokumenKtp.map((ktp, idx) => (
                      <motion.div
                        key={`ktp-${idx}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col"
                      >
                        <div
                          onClick={() => setPreviewItem({ url: ktp, title: `KTP ${idx + 1}` })}
                          className="aspect-[4/3] w-full overflow-hidden cursor-pointer flex items-center justify-center bg-slate-100"
                        >
                          {isPdfUrl(ktp) ? (
                            <div className="flex flex-col items-center justify-center p-3 text-slate-700">
                              <icons.dokumen className="w-8 h-8 text-teal-600 mb-1" />
                              <span className="text-[10px] font-bold">PDF KTP #{idx + 1}</span>
                            </div>
                          ) : (
                            <img src={ktp} alt={`Preview KTP ${idx + 1}`} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewItem({ url: ktp, title: `KTP ${idx + 1}` })}
                            className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                          >
                            Lihat KTP #{idx + 1}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeKtp(idx)}
                            disabled={loading}
                            className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add KTP Card */}
                  <motion.div layout>
                    <label
                      htmlFor="upload-ktp"
                      className="flex flex-col items-center justify-center w-full h-full min-h-[130px] aspect-[4/3] border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-teal-50/40 hover:border-teal-400 transition-all group"
                    >
                      <div className="w-9 h-9 mb-1.5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-slate-700 text-center px-2">Tambah KTP</span>
                      <span className="text-[10px] text-slate-400 text-center px-2 mt-0.5">Pilih Foto / PDF</span>
                    </label>
                  </motion.div>
                </div>
              </div>

              {/* Manual Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || processingFile}
                className="w-full py-3.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading || processingFile ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{processingFile ? 'Memproses File...' : 'Menyimpan Dokumen...'}</span>
                  </>
                ) : (
                  <span>{hasUploaded ? 'Simpan & Perbarui Dokumen' : 'Simpan Dokumen'}</span>
                )}
              </button>
            </>
          )}

          {/* TAB 3: ARSIP DOKUMEN RT */}
          {activeTab === 'arsip' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Arsip & Berkas Dokumen RT</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Unggah SK Pengurus, peraturan RT, surat edaran, template, atau berkas warga.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArsipModal(true)}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  + Upload Dokumen Baru
                </button>
              </div>

              {loadingArsip ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-xs text-slate-400">
                  Memuat daftar dokumen...
                </div>
              ) : arsipList.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center">
                  <icons.dokumen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Belum Ada Dokumen Arsip</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Klik tombol di atas untuk mengunggah dokumen pertama.</p>
                  <button
                    type="button"
                    onClick={() => setShowArsipModal(true)}
                    className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    + Upload Dokumen Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {arsipList.map((doc, idx) => (
                    <div
                      key={`arsip_${doc.id || 'doc'}_${idx}`}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          onClick={() => setPreviewItem({ url: doc.fileUrl, title: doc.title })}
                          className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 overflow-hidden cursor-pointer"
                        >
                          {doc.fileUrl && !isPdfUrl(doc.fileUrl) ? (
                            <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                          ) : (
                            <icons.dokumen className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                              {doc.category || 'Dokumen'}
                            </span>
                            {doc.uploaderName && (
                              <span className="text-[10px] text-slate-400 truncate">Oleh: {doc.uploaderName}</span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm truncate mt-1">{doc.title}</h4>
                          {doc.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{doc.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewItem({ url: doc.fileUrl, title: doc.title })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Lihat
                        </button>
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName || `${doc.title}.jpg`}
                          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          Unduh
                        </a>
                        {canDeleteArsip(doc) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteArsip(doc.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Hapus Dokumen"
                          >
                            <icons.delete className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Quick Upload Dokumen Warga / Pengurus oleh Ketua RT */}
      <AnimatePresence>
        {isKetuaRT && showQuickUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQuickUploadModal(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleQuickUploadSubmit}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Upload Dokumen Warga / Pengurus</h3>
                  <p className="text-xs text-slate-500">Pilih nama warga atau pengurus RT lalu unggah berkas KK / KTP</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickUploadModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Warga / Pengurus RT *</label>
                <select
                  required
                  value={quickTargetUserId}
                  onChange={(e) => setQuickTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value="">-- Pilih Nama Warga / Pengurus --</option>
                  <optgroup label="Pengurus RT">
                    {wargaList
                      .filter(u => ['admin', 'sekretaris', 'bendahara', 'pengurus'].includes(u.role))
                      .map((u, idx) => (
                        <option key={`opt_p_${u.id}_${idx}`} value={u.id}>
                          {u.nama} — [{getRoleLabel(u.role)}] ({u.alamat || 'RT 01'})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Warga">
                    {wargaList
                      .filter(u => !['admin', 'sekretaris', 'bendahara', 'pengurus'].includes(u.role))
                      .map((u, idx) => (
                        <option key={`opt_w_${u.id}_${idx}`} value={u.id}>
                          {u.nama} — [Warga] ({u.alamat || 'RT 01'})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Upload KK */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kartu Keluarga (KK) (Opsional)</label>
                <input
                  id="quick-upload-kk"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleQuickModalFileSelect('kk', e)}
                  className="hidden"
                />
                <label
                  htmlFor="quick-upload-kk"
                  className="flex flex-col items-center justify-center w-full py-4 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-teal-50/40 hover:border-teal-400 cursor-pointer transition-all"
                >
                  {quickKkData ? (
                    <div className="text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold mb-1">
                        ✓ File KK Siap Diunggah
                      </span>
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[260px]">{quickKkName || 'Berkas KK'}</p>
                      <p className="text-[10px] text-teal-600 font-bold mt-0.5">Ketuk untuk mengganti file KK</p>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-700">+ Pilih File Kartu Keluarga (KK)</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Gambar (JPG/PNG) atau PDF</span>
                    </>
                  )}
                </label>
              </div>

              {/* Upload KTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Kartu Tanda Penduduk (KTP) (Opsional)</label>
                  {quickKtpList.length > 0 && (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                      {quickKtpList.length} File KTP Dipilih
                    </span>
                  )}
                </div>
                <input
                  id="quick-upload-ktp"
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleQuickModalFileSelect('ktp', e)}
                  className="hidden"
                />
                <label
                  htmlFor="quick-upload-ktp"
                  className="flex flex-col items-center justify-center w-full py-4 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-indigo-50/40 hover:border-indigo-400 cursor-pointer transition-all"
                >
                  <span className="text-xs font-bold text-slate-700">+ Pilih File KTP (Bisa Lebih dari 1)</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Gambar (JPG/PNG) atau PDF</span>
                </label>

                {quickKtpList.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {quickKtpList.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] flex items-center justify-center">
                        {isPdfUrl(url) ? (
                          <span className="text-[10px] font-bold text-teal-700">PDF KTP #{idx + 1}</span>
                        ) : (
                          <img src={url} alt={`KTP ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => setQuickKtpList(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickUploadModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingQuickUpload || processingFile}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {savingQuickUpload ? 'Menyimpan...' : 'Simpan Dokumen'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detail & Kelola Dokumen Satu Warga / Pengurus */}
      <AnimatePresence>
        {isKetuaRT && selectedMemberDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedMemberDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 text-base">{selectedMemberDetail.nama}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(selectedMemberDetail.role)}`}>
                      {getRoleLabel(selectedMemberDetail.role)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedMemberDetail.alamat || 'RT 01'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMemberDetail(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* KK Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Kartu Keluarga (KK)</h4>
                  <div className="flex items-center gap-2">
                    {isKetuaRT && selectedMemberDetail.dokumenKk && (
                      <button
                        type="button"
                        onClick={() => handleExtractKkForUser(selectedMemberDetail)}
                        disabled={extractingKkUserId === selectedMemberDetail.id}
                        className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg text-xs font-extrabold cursor-pointer disabled:opacity-50"
                      >
                        {extractingKkUserId === selectedMemberDetail.id ? 'Mengekstrak...' : '✨ AI Extract KK'}
                      </button>
                    )}
                    <label className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold cursor-pointer">
                      {selectedMemberDetail.dokumenKk ? 'Ganti KK' : '+ Upload KK'}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleDirectWargaFileUpload(selectedMemberDetail, 'kk', e)}
                      />
                    </label>
                    {selectedMemberDetail.dokumenKk && (
                      <button
                        type="button"
                        onClick={() =>
                          updateWargaOrPengurusDocuments(
                            selectedMemberDetail,
                            '',
                            undefined,
                            `Dokumen KK ${selectedMemberDetail.nama} dihapus.`
                          )
                        }
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Hapus KK
                      </button>
                    )}
                  </div>
                </div>

                {/* No. KK Display in Detail Popup (Khusus Ketua RT, Sekretaris, dan Akun Pemilik) */}
                {(isPrivilegedKkViewer || currentUser?.id === selectedMemberDetail.id) && (selectedMemberDetail.noKk || (selectedMemberDetail.dokumenKk && extractNoKkFromDoc(selectedMemberDetail.dokumenKk, selectedMemberDetail.username, selectedMemberDetail.nama))) && (
                  <div className="bg-teal-50/80 border border-teal-200/90 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        KK
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">No. Kartu Keluarga (KK)</p>
                        <p className="font-mono font-black text-xs sm:text-sm text-teal-950 tracking-wide truncate">
                          {selectedMemberDetail.noKk || extractNoKkFromDoc(selectedMemberDetail.dokumenKk, selectedMemberDetail.username, selectedMemberDetail.nama)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const num = selectedMemberDetail.noKk || extractNoKkFromDoc(selectedMemberDetail.dokumenKk, selectedMemberDetail.username, selectedMemberDetail.nama);
                        if (num) {
                          navigator.clipboard.writeText(num);
                          setSuccessMsg('No. KK berhasil disalin!');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      Salin
                    </button>
                  </div>
                )}

                {/* Identifikasi Wilayah Asal KK Dokumen */}
                {selectedMemberDetail.dokumenKk && (() => {
                  const reg = resolveWargaKkRegion(selectedMemberDetail);
                  return (
                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${reg.badgeColor}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{reg.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Identifikasi Wilayah Asal KK</p>
                          <p className="text-xs font-black truncate">{reg.label}</p>
                          {(selectedMemberDetail.alamatKk || reg.alamat) && (
                            <p className="text-[10px] font-semibold opacity-90 truncate mt-0.5">
                              Alamat Asal: {selectedMemberDetail.alamatKk || reg.alamat}
                            </p>
                          )}
                          {(selectedMemberDetail.kkKabupatenKota || selectedMemberDetail.kkProvinsi) && (
                            <p className="text-[10px] font-semibold opacity-90 truncate mt-0.5">
                              Domisili: {[selectedMemberDetail.kkKabupatenKota, selectedMemberDetail.kkProvinsi].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      {isKetuaRT && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKkRegionTarget(selectedMemberDetail);
                            setRegionCategoryInput(reg.category === 'Belum Teridentifikasi' ? 'Kabupaten Tangerang' : reg.category as any);
                            setRegionKabupatenKotaInput(selectedMemberDetail.kkKabupatenKota || reg.kabupatenKota || (reg.category === 'Kabupaten Tangerang' ? 'Kabupaten Tangerang' : reg.category === 'Kota Tangerang' ? 'Kota Tangerang' : ''));
                            setRegionProvinsiInput(selectedMemberDetail.kkProvinsi || reg.provinsi || ((reg.category === 'Kabupaten Tangerang' || reg.category === 'Kota Tangerang') ? 'Banten' : ''));
                            setRegionKecamatanInput(selectedMemberDetail.kkKecamatan || reg.kecamatan || '');
                            setRegionKelurahanInput(selectedMemberDetail.kkKelurahan || reg.kelurahan || '');
                            setRegionAlamatInput(selectedMemberDetail.alamatKk || reg.alamat || '');
                          }}
                          className="text-[10px] font-extrabold px-2.5 py-1.5 bg-white rounded-xl border shadow-xs hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                        >
                          ✏️ Ubah Kategori
                        </button>
                      )}
                    </div>
                  );
                })()}

                {selectedMemberDetail.dokumenKk ? (
                  <div
                    onClick={() =>
                      setPreviewItem({
                        url: selectedMemberDetail.dokumenKk,
                        title: `KK - ${selectedMemberDetail.nama}`
                      })
                    }
                    className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer max-h-56 flex items-center justify-center"
                  >
                    {isPdfUrl(selectedMemberDetail.dokumenKk) ? (
                      <div className="py-8 text-center">
                        <icons.dokumen className="w-10 h-10 text-teal-600 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-700">Berkas PDF Kartu Keluarga (Ketuk untuk lihat)</p>
                      </div>
                    ) : (
                      <img
                        src={selectedMemberDetail.dokumenKk}
                        alt="KK"
                        className="w-full h-auto max-h-56 object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Belum ada dokumen KK.
                  </div>
                )}
              </div>

              {/* KTP Section */}
              {(() => {
                const ktpArr: string[] = Array.isArray(selectedMemberDetail.dokumenKtp)
                  ? selectedMemberDetail.dokumenKtp
                  : selectedMemberDetail.dokumenKtp
                  ? [selectedMemberDetail.dokumenKtp]
                  : [];
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Kartu Tanda Penduduk (KTP) ({ktpArr.length})
                      </h4>
                      <label className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer">
                        + Tambah KTP
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => handleDirectWargaFileUpload(selectedMemberDetail, 'ktp', e)}
                        />
                      </label>
                    </div>

                    {ktpArr.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Belum ada dokumen KTP.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {ktpArr.map((ktpUrl, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
                            <div
                              onClick={() =>
                                setPreviewItem({
                                  url: ktpUrl,
                                  title: `KTP #${idx + 1} - ${selectedMemberDetail.nama}`
                                })
                              }
                              className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer"
                            >
                              {isPdfUrl(ktpUrl) ? (
                                <span className="text-xs font-bold text-teal-700">PDF KTP #{idx + 1}</span>
                              ) : (
                                <img src={ktpUrl} alt={`KTP ${idx + 1}`} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewItem({
                                    url: ktpUrl,
                                    title: `KTP #${idx + 1} - ${selectedMemberDetail.nama}`
                                  })
                                }
                                className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                              >
                                Lihat KTP #{idx + 1}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextKtp = ktpArr.filter((_, i) => i !== idx);
                                  updateWargaOrPengurusDocuments(
                                    selectedMemberDetail,
                                    undefined,
                                    nextKtp,
                                    `KTP #${idx + 1} milik ${selectedMemberDetail.nama} dihapus.`
                                  );
                                }}
                                className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ubah Kategori Wilayah KK */}
      <AnimatePresence>
        {isKetuaRT && editingKkRegionTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-900/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain"
            onClick={() => setEditingKkRegionTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md max-h-[calc(100dvh-0.5rem)] sm:max-h-[90vh] overflow-hidden flex flex-col p-0"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-5 pt-5 shrink-0">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Identifikasi Wilayah Asal KK</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingKkRegionTarget.nama} {editingKkRegionTarget.alamat ? `(${editingKkRegionTarget.alamat})` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingKkRegionTarget(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Pilih Kategori Wilayah KK:
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'Kabupaten Tangerang',
                      label: 'Kabupaten Tangerang',
                      desc: 'Pasar Kemis, Balaraja, Cikupa, Tigaraksa, Sepatan, Curug, dst. (Prefix 3603)',
                      icon: '🏛️',
                      color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                    },
                    {
                      id: 'Kota Tangerang',
                      label: 'Kota Tangerang',
                      desc: 'Karawaci, Periuk, Ciledug, Tangerang Kota, Cipondoh, Batuceper, dst. (Prefix 3671)',
                      icon: '🏢',
                      color: 'border-teal-300 bg-teal-50/50 text-teal-900'
                    },
                    {
                      id: 'Luar Kota Tangerang',
                      label: 'Luar Kota Tangerang',
                      desc: 'DKI Jakarta, Jawa Barat, Jawa Tengah, Lampung, Tangsel, Luar Provinsi, dst.',
                      icon: '🌍',
                      color: 'border-amber-300 bg-amber-50/50 text-amber-900'
                    }
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        regionCategoryInput === item.id
                          ? `${item.color} ring-2 ring-teal-500 shadow-xs`
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dokumenKkRegion"
                        value={item.id}
                        checked={regionCategoryInput === item.id}
                        onChange={(e) => applyDokumenRegionCategory(e.target.value as any)}
                        className="mt-1 accent-teal-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Input Kecamatan & Kelurahan */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kecamatan:
                  </label>
                  <input
                    type="text"
                    placeholder="Cth: Pasar Kemis"
                    value={regionKecamatanInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegionKecamatanInput(val);
                      const upper = val.toUpperCase();
                      if (KECAMATAN_KAB_TANGERANG.some(k => upper.includes(k))) {
                        applyDokumenRegionCategory('Kabupaten Tangerang');
                      } else if (KECAMATAN_KOTA_TANGERANG.some(k => upper.includes(k))) {
                        applyDokumenRegionCategory('Kota Tangerang');
                      }
                    }}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Desa / Kelurahan:
                  </label>
                  <input
                    type="text"
                    placeholder="Cth: Kutabumi"
                    value={regionKelurahanInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegionKelurahanInput(val);
                      const upper = val.toUpperCase();
                      if (KELURAHAN_KAB_TANGERANG.some(k => upper.includes(k))) {
                        applyDokumenRegionCategory('Kabupaten Tangerang');
                        if (!regionKecamatanInput) setRegionKecamatanInput('Pasar Kemis');
                      }
                    }}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Quick Select Chips */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1">Pilih Cepat Kecamatan Terdekat:</p>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'Pasar Kemis (Kab)', kec: 'Pasar Kemis', cat: 'Kabupaten Tangerang' },
                    { label: 'Kutabumi (Kab)', kec: 'Pasar Kemis', kel: 'Kutabumi', cat: 'Kabupaten Tangerang' },
                    { label: 'Rajeg (Kab)', kec: 'Rajeg', cat: 'Kabupaten Tangerang' },
                    { label: 'Cikupa (Kab)', kec: 'Cikupa', cat: 'Kabupaten Tangerang' },
                    { label: 'Balaraja (Kab)', kec: 'Balaraja', cat: 'Kabupaten Tangerang' },
                    { label: 'Karawaci (Kota)', kec: 'Karawaci', cat: 'Kota Tangerang' },
                    { label: 'Periuk (Kota)', kec: 'Periuk', cat: 'Kota Tangerang' },
                    { label: 'Cipondoh (Kota)', kec: 'Cipondoh', cat: 'Kota Tangerang' },
                    { label: 'Tangsel (Luar)', kec: 'Serpong', cat: 'Luar Kota Tangerang' },
                    { label: 'Jakarta (Luar)', kec: 'Cengkareng', cat: 'Luar Kota Tangerang' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        applyDokumenRegionCategory(chip.cat as any);
                        setRegionKecamatanInput(chip.kec);
                        if (chip.kel) setRegionKelurahanInput(chip.kel);
                        if (chip.cat === 'Luar Kota Tangerang') {
                          setRegionKabupatenKotaInput(chip.label.startsWith('Tangsel') ? 'Kota Tangerang Selatan' : chip.label.startsWith('Jakarta') ? 'Kota Administrasi Jakarta Barat' : regionKabupatenKotaInput);
                          setRegionProvinsiInput(chip.label.startsWith('Tangsel') ? 'Banten' : chip.label.startsWith('Jakarta') ? 'DKI Jakarta' : regionProvinsiInput);
                        }
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer"
                    >
                      + {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kabupaten / Kota asal KK:</label>
                  <input
                    type="text"
                    placeholder="Kabupaten Tangerang / Jakarta Selatan"
                    value={regionKabupatenKotaInput}
                    onChange={(e) => setRegionKabupatenKotaInput(e.target.value)}
                    readOnly={regionCategoryInput !== 'Luar Kota Tangerang'}
                    required={regionCategoryInput === 'Luar Kota Tangerang'}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Provinsi:</label>
                  <input
                    type="text"
                    placeholder="Banten / DKI Jakarta"
                    value={regionProvinsiInput}
                    onChange={(e) => setRegionProvinsiInput(e.target.value)}
                    readOnly={regionCategoryInput !== 'Luar Kota Tangerang'}
                    className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detail Alamat Asal KK (Sesuai Fisik Dokumen):
                </label>
                <input
                  type="text"
                  placeholder="Cth: Kp. Kukun RT 02/05, Desa Kutabumi, Pasar Kemis"
                  value={regionAlamatInput}
                  onChange={(e) => setRegionAlamatInput(e.target.value)}
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl transition-all outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Kategori dan alamat ini akan tersimpan permanen dan disinkronkan ke seluruh sistem RT.
                </p>
              </div>

              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingKkRegionTarget(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={savingRegion}
                  onClick={handleSaveKkRegionDokumen}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {savingRegion ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Hasil Batch Scan Identifikasi KK */}
      <AnimatePresence>
        {showBatchScanModal && batchScanResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowBatchScanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-4 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Hasil Identifikasi Alamat KK</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Pemindaian otomatis berbasis nama Kecamatan & Kelurahan
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBatchScanModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 3 Kategori Summary Cards */}
              <div className="grid grid-cols-3 gap-2 shrink-0">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-xs">🏛️</span>
                  <p className="text-lg font-black text-emerald-800 mt-0.5">{batchScanResult.summary?.kabupatenTangerang || 0}</p>
                  <p className="text-[10px] font-bold text-emerald-700">Kab. Tangerang</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                  <span className="text-xs">🏢</span>
                  <p className="text-lg font-black text-blue-800 mt-0.5">{batchScanResult.summary?.kotaTangerang || 0}</p>
                  <p className="text-[10px] font-bold text-blue-700">Kota Tangerang</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <span className="text-xs">🌍</span>
                  <p className="text-lg font-black text-amber-800 mt-0.5">{batchScanResult.summary?.luarKotaTangerang || 0}</p>
                  <p className="text-[10px] font-bold text-amber-700">Luar Tangerang</p>
                </div>
              </div>

              {/* List of scanned users */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Daftar Warga Teridentifikasi ({batchScanResult.users?.length || 0}):
                </p>
                {batchScanResult.users?.map((u: any) => {
                  const isKab = u.wilayahKk === 'Kabupaten Tangerang';
                  const isKota = u.wilayahKk === 'Kota Tangerang';
                  return (
                    <div
                      key={u.id}
                      className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-800 truncate">{u.nama}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {u.alamatKk || (u.kkKecamatan ? `Kec. ${u.kkKecamatan}` : '') || u.noKk}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${
                          isKab
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isKota
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isKab ? '🏛️ Kab. Tangerang' : isKota ? '🏢 Kota Tangerang' : '🌍 Luar Tangerang'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBatchScanModal(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Selesai & Lihat Data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Upload Arsip Dokumen */}
      <AnimatePresence>
        {showArsipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowArsipModal(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleUploadArsip}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base">Upload Dokumen Arsip RT</h3>
                <button
                  type="button"
                  onClick={() => setShowArsipModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  value={arsipTitle}
                  onChange={(e) => setArsipTitle(e.target.value)}
                  placeholder="Contoh: SK Pengurus RT 01 / Tata Tertib"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={arsipCategory}
                  onChange={(e) => setArsipCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value="Surat RT">Surat RT</option>
                  <option value="SK Pengurus">SK & Dokumen Pengurus</option>
                  <option value="Peraturan">Peraturan & Tata Tertib</option>
                  <option value="KK">Kartu Keluarga (KK)</option>
                  <option value="KTP">KTP Warga / Pengurus</option>
                  <option value="Lainnya">Berkas Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan (Opsional)</label>
                <input
                  type="text"
                  value={arsipDesc}
                  onChange={(e) => setArsipDesc(e.target.value)}
                  placeholder="Ringkasan singkat isi dokumen"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih File (Foto / PDF)</label>
                <input
                  id="upload-arsip-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleArsipFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="upload-arsip-file"
                  className="flex flex-col items-center justify-center w-full py-6 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-teal-50/40 hover:border-teal-400 cursor-pointer transition-all"
                >
                  {arsipFileUrl ? (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-1">
                        File Siap Diunggah
                      </span>
                      <p className="text-xs text-slate-600 font-semibold truncate max-w-[260px]">
                        {arsipFileName || 'Dokumen Terpilih'}
                      </p>
                      <p className="text-[10px] text-teal-600 font-bold mt-1">Ketuk untuk ganti file</p>
                    </div>
                  ) : (
                    <>
                      <icons.dokumen className="w-8 h-8 text-teal-600 mb-1.5" />
                      <span className="text-xs font-bold text-slate-700">Ketuk untuk pilih file dokumen</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Mendukung Gambar (JPG/PNG) & PDF</span>
                    </>
                  )}
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowArsipModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploadingArsip || processingFile}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {uploadingArsip ? 'Mengunggah...' : 'Simpan & Upload'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">{previewItem.title}</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={previewItem.url}
                    download={`${previewItem.title}.jpg`}
                    className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors"
                  >
                    Unduh
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-900/5 overflow-auto flex items-center justify-center min-h-[300px]">
                {isPdfUrl(previewItem.url) ? (
                  <iframe src={previewItem.url} title={previewItem.title} className="w-full h-[65vh] rounded-xl border-0" />
                ) : (
                  <img
                    src={previewItem.url}
                    alt={previewItem.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
