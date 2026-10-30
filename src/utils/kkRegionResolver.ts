// Utilitas identifikasi wilayah asal alamat Kartu Keluarga (KK).
// Jika dokumen hanya menulis "Tangerang", kecamatan/kelurahan harus cocok terlebih dahulu.

export type KkRegionCategory =
  | 'Kabupaten Tangerang'
  | 'Kota Tangerang'
  | 'Luar Kota Tangerang'
  | 'Belum Teridentifikasi';

export const KECAMATAN_KAB_TANGERANG: string[] = [
  'BALARAJA', 'CIKUPA', 'CISAUK', 'CISOKA', 'CURUG', 'GUNUNG KALER', 'JAMBE',
  'JAYANTI', 'KELAPA DUA', 'KEMIRI', 'KOSAMBI', 'KRESEK', 'KRONJO', 'LEGOK',
  'MAUK', 'MEKAR BARU', 'PAGEDANGAN', 'PAKUHAJI', 'PANONGAN', 'PASAR KEMIS',
  'RAJEG', 'SEPATAN', 'SEPATAN TIMUR', 'SINDANG JAYA', 'SOLEAR', 'SUKADIRI',
  'SUKAMULYA', 'TELUKNAGA', 'TIGARAKSA'
];

export const KELURAHAN_KAB_TANGERANG: string[] = [
  'KUTABUMI', 'KUTA BUMI', 'KUTA BARU', 'KUTABARU', 'SUKAMANTRI', 'GELAM JAYA',
  'PASAR KEMIS', 'SUKA ASIH', 'PANGADEGAN', 'BITUNG JAYA', 'KADU', 'KADU JAYA',
  'BOJONG NANGKA', 'BENCONGAN', 'BENCONGAN INDAH', 'CURUG KULON', 'CURUG WETAN',
  'MEDANG', 'SAMPORA', 'SURADITA', 'CIBOGO', 'SITUGADUNG', 'SINDANG ASIH',
  'SINDANG PANON', 'SUKAHARJA', 'RANCA IYUH', 'PASIR GADUNG',
  'TALAGA', 'TOBAT', 'SUKATANI', 'KEDUNG DALEM', 'KOSAMBI TIMUR', 'SALEMBARAN',
  'DADAP', 'CANGKUDU', 'SENTUL', 'SENTUL JAYA', 'SAGA', 'GEMBONG', 'PASIR BOLANG',
  'MATAGARA', 'PETE', 'TEGALSARI', 'CISEREH', 'CILELES', 'SODONG', 'TAPOS',
  'BANTAR PANJANG', 'SUKAMANAH', 'JAMBE', 'TIPAR RAYA', 'TABAN', 'DARU', 'KUTRUK',
  'RANCA BUAYA', 'MEKARSARI', 'ANCOL PASIR', 'PASIR BARAT', 'PANGKAT', 'PABUARAN',
  'PASIR MUNCANG', 'SUMUR BANDUNG', 'DANGDEUR', 'CIKANDE', 'PASIR GINTUNG'
];

export const KECAMATAN_KOTA_TANGERANG: string[] = [
  'BATUCEPER', 'BENDA', 'CIBODAS', 'CILEDUG', 'CIPONDOH', 'JATIUWUNG',
  'KARANG TENGAH', 'KARANGTENGAH', 'KARAWACI', 'LARANGAN', 'NEGLASARI',
  'PERIUK', 'PINANG', 'TANGERANG'
];

export const KELURAHAN_KOTA_TANGERANG: string[] = [
  'PORIS GAGA', 'PORIS PLAWAD', 'PORIS JAYA', 'SUDIMARA', 'PANINGGILAN',
  'GEBANG RAYA', 'PERIUK JAYA', 'UWUNG JAYA', 'GANDASARI', 'MANIS JAYA',
  'PASIR JAYA', 'CIMONE', 'CIMONE JAYA', 'PABUARAN', 'KOANG JAYA', 'NUSA JAYA',
  'BUGEL', 'GERENDENG', 'MARGASARI', 'SANGIANG JAYA', 'SUKAJADI', 'BELENDUNG',
  'JURUMUDI', 'PAJANG', 'KUNCIRAN', 'NEROGTOG', 'PAKUJAYA', 'CIPETE', 'BABAKAN',
  'SUKASARI', 'TANAH TINGGI', 'BUARAN INDAH', 'CIKOKOL', 'PETIR', 'GONDRONG',
  'KETAPANG', 'KELAPA INDAH', 'SUKARASA', 'SUKAASIH', 'KUNCIRAN INDAH',
  'KUNCIRAN JAYA', 'PANUNGGANGAN', 'PANUNGGANGAN UTARA', 'PANUNGGANGAN TIMUR',
  'PORIS PLAWAD INDAH', 'PORIS PLAWAD UTARA', 'PORIS PLAWAD SELATAN',
  'KARANG SARI', 'KARANG ANYAR', 'KARANG TIMUR', 'KARANG MULYA', 'KARANG TENGAH'
];

export const KECAMATAN_TANGSEL: string[] = [
  'CIPUTAT', 'CIPUTAT TIMUR', 'PAMULANG', 'PONDOK AREN', 'SERPONG', 'SERPONG UTARA', 'SETU'
];

const CATEGORIES: KkRegionCategory[] = [
  'Kabupaten Tangerang', 'Kota Tangerang', 'Luar Kota Tangerang'
];

export interface KkRegionInfo {
  category: KkRegionCategory;
  label: string;
  shortLabel: string;
  badgeColor: string;
  badgeBorder: string;
  badgeText: string;
  icon: string;
  alamat?: string;
  kecamatan?: string;
  kelurahan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  isVerified?: boolean;
  needsReview?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  source?: string;
}

function normalize(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/&AMP;/g, '&')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[.,:;()\[\]{}]/g, ' ')
    .replace(/\bKEC(?:AMATAN)?\b/g, ' ')
    .replace(/\bKEL(?:URAHAN)?\b/g, ' ')
    .replace(/\bDESA\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesTerm(text: string, term: string): boolean {
  const haystack = ` ${normalize(text)} `;
  const needle = ` ${normalize(term)} `;
  return Boolean(normalize(term)) && haystack.includes(needle);
}

function findMatchedTerm(value: string, list: string[]): string | undefined {
  const text = normalize(value);
  if (!text) return undefined;
  const candidates = [...list].sort((a, b) => normalize(b).length - normalize(a).length);
  return candidates.find(term => text === normalize(term) || includesTerm(text, term));
}

function regionResult(
  category: KkRegionCategory,
  data: Partial<KkRegionInfo> = {}
): KkRegionInfo {
  const isKab = category === 'Kabupaten Tangerang';
  const isKota = category === 'Kota Tangerang';
  const pending = category === 'Belum Teridentifikasi';
  const defaultColor = isKab
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : isKota
      ? 'bg-blue-50 text-blue-800 border-blue-300'
      : pending
        ? 'bg-slate-100 text-slate-700 border-slate-300'
        : 'bg-amber-50 text-amber-800 border-amber-300';
  const defaultBorder = isKab ? 'border-emerald-300' : isKota ? 'border-blue-300' : pending ? 'border-slate-300' : 'border-amber-300';
  const defaultText = isKab ? 'text-emerald-800' : isKota ? 'text-blue-800' : pending ? 'text-slate-700' : 'text-amber-800';
  const defaultIcon = isKab ? '🏛️' : isKota ? '🏢' : pending ? '🔎' : '🌍';
  return {
    ...data,
    category,
    label: category,
    shortLabel: isKab ? 'Kab. Tangerang' : category,
    badgeColor: defaultColor,
    badgeBorder: defaultBorder,
    badgeText: defaultText,
    icon: defaultIcon,
    needsReview: pending || data.needsReview === true
  };
}

export function extractKkAddressFromText(text: string): {
  desaKelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  alamatLengkap?: string;
} {
  if (!text) return {};
  const clean = String(text)
    .replace(/&amp;/gi, '&')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(?:text|tspan|p|div|tr|td|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '\n');
  const nextField = '(?=\\s*(?:RT\\s*\\/\\s*RW|Kode\\s*Pos|Kodepos|Kabupaten\\s*\\/\\s*Kota|Kab\\.?\\s*\\/\\s*Kota|Kabupaten|Kota|Provinsi|Kecamatan|Kec\\.?|Desa\\s*\\/\\s*Kelurahan|Kelurahan\\s*\\/\\s*Desa|Desa|Kelurahan|No\\.?\\s*KK|NIK|$|\\n))';
  const capture = (pattern: RegExp): string | undefined => {
    const match = clean.match(pattern);
    return match?.[1]?.replace(/\s+/g, ' ').trim().replace(/[.,;]+$/, '') || undefined;
  };

  const desa = capture(new RegExp(`(?:Desa\\s*\\/\\s*Kelurahan|Kelurahan\\s*\\/\\s*Desa|Desa|Kelurahan)\\s*[:.]?\\s*([A-Za-z0-9\\s.'-]+?)${nextField}`, 'i'));
  const kec = capture(new RegExp(`(?:Kecamatan|Kec\\.)\\s*[:.]?\\s*([A-Za-z0-9\\s.'-]+?)${nextField}`, 'i'));
  const kabMatch = clean.match(/\b(Kabupaten\s*\/\s*Kota|Kab\.?\s*\/\s*Kota|Kabupaten|Kota)\s*[:.]?\s*([A-Za-z0-9\s.'-]+?)(?=\s*(?:Provinsi|Kode\s*Pos|Kodepos|No\.?\s*KK|NIK|$|\n))/i);
  let kabupatenKota: string | undefined;
  if (kabMatch?.[2]) {
    const prefix = normalize(kabMatch[1]);
    const value = kabMatch[2].replace(/\s+/g, ' ').trim().replace(/[.,;]+$/, '');
    if (prefix === 'KABUPATEN') kabupatenKota = `Kabupaten ${value}`;
    else if (prefix === 'KOTA') kabupatenKota = `Kota ${value}`;
    else kabupatenKota = value;
  }
  const provinsi = capture(new RegExp(`Provinsi\\s*[:.]?\\s*([A-Za-z0-9\\s.'-]+?)(?=\\s*(?:Kode\\s*Pos|Kodepos|No\\.?\\s*KK|NIK|$|\\n))`, 'i'));
  const alamat = capture(new RegExp(`Alamat\\s*[:.]?\\s*([A-Za-z0-9\\s.,'/-]+?)(?=\\s*(?:RT\\s*\\/\\s*RW|Desa|Kelurahan|$|\\n))`, 'i'));

  return {
    desaKelurahan: desa,
    kecamatan: kec,
    kabupatenKota,
    provinsi,
    alamatLengkap: alamat
  };
}

function readDocumentText(docKk: string): string {
  if (!docKk) return '';
  if (docKk.startsWith('data:image/svg+xml')) {
    try {
      const base64Part = docKk.split(',')[1] || '';
      return docKk.includes(';base64,')
        ? decodeURIComponent(escape(atob(base64Part)))
        : decodeURIComponent(base64Part);
    } catch {
      return '';
    }
  }
  if (docKk.includes('<svg')) return docKk;
  if (!docKk.startsWith('data:image/') && !docKk.startsWith('data:application/pdf')) return docKk;
  return '';
}

export function resolveWargaKkRegion(warga: any): KkRegionInfo {
  const verifiedCategory = String(warga?.kkCategory || warga?.wilayahKk || '').trim() as KkRegionCategory;
  if (Boolean(warga?.kkVerifiedByAdmin) && CATEGORIES.includes(verifiedCategory)) {
    return regionResult(verifiedCategory, {
      alamat: warga.alamatKk || '',
      kecamatan: warga.kkKecamatan || '',
      kelurahan: warga.kkKelurahan || '',
      kabupatenKota: warga.kkKabupatenKota || verifiedCategory,
      provinsi: warga.kkProvinsi || '',
      isVerified: true,
      confidence: 'high',
      source: 'manual'
    });
  }

  // Kategori hasil scan yang sudah disimpan dipakai saat data sumber yang sama ditampilkan kembali.
  if (warga?.kkScanStatus === 'automatic' && CATEGORIES.includes(verifiedCategory)) {
    return regionResult(verifiedCategory, {
      alamat: warga.alamatKk || '',
      kecamatan: warga.kkKecamatan || '',
      kelurahan: warga.kkKelurahan || '',
      kabupatenKota: warga.kkKabupatenKota || '',
      provinsi: warga.kkProvinsi || '',
      confidence: warga.kkScanConfidence === 'high' ? 'high' : 'medium',
      source: 'automatic'
    });
  }

  const docText = readDocumentText(String(warga?.dokumenKk || ''));
  const ocrText = String(warga?.kkOcrText || '');
  const parsedDoc = extractKkAddressFromText(docText);
  const parsedOcr = extractKkAddressFromText(ocrText);
  const rawKec = String(warga?.kkKecamatan || parsedOcr.kecamatan || parsedDoc.kecamatan || '').trim();
  const rawKel = String(warga?.kkKelurahan || parsedOcr.desaKelurahan || parsedDoc.desaKelurahan || '').trim();
  const rawKabKota = String(warga?.kkKabupatenKota || parsedOcr.kabupatenKota || parsedDoc.kabupatenKota || '').trim();
  const rawProv = String(warga?.kkProvinsi || parsedOcr.provinsi || parsedDoc.provinsi || '').trim();
  const rawAlamat = String(warga?.alamatKk || parsedOcr.alamatLengkap || parsedDoc.alamatLengkap || '').trim();
  const kecNorm = normalize(rawKec);
  const kelNorm = normalize(rawKel);
  const kabNorm = normalize(rawKabKota);
  const allDocText = `${docText}\n${ocrText}\n${rawAlamat}`;
  const allNorm = normalize(allDocText);

  const base = {
    alamat: rawAlamat,
    kecamatan: rawKec,
    kelurahan: rawKel,
    kabupatenKota: rawKabKota,
    provinsi: rawProv,
    isVerified: false
  };

  // Prioritaskan nama wilayah administratif yang ditulis eksplisit pada dokumen.
  if (kabNorm.includes('KABUPATEN TANGERANG') || kabNorm === 'KAB TANGERANG') {
    return regionResult('Kabupaten Tangerang', { ...base, confidence: 'high', source: 'kabupaten-kota-field' });
  }
  if ((kabNorm.includes('KOTA TANGERANG') && !kabNorm.includes('SELATAN')) || kabNorm === 'KOTA TANGERANG') {
    return regionResult('Kota Tangerang', { ...base, confidence: 'high', source: 'kabupaten-kota-field' });
  }
  if (kabNorm && kabNorm !== 'TANGERANG' && !kabNorm.includes('KABUPATEN KOTA') &&
      !kabNorm.includes('KAB KOTA') && !kabNorm.includes('KOTA KABUPATEN')) {
    return regionResult('Luar Kota Tangerang', { ...base, confidence: 'high', source: 'other-kabupaten-kota' });
  }

  // Saat dokumen hanya menulis "Tangerang", gunakan kecamatan/kelurahan sebagai penentu.
  const kabKec = findMatchedTerm(kecNorm, KECAMATAN_KAB_TANGERANG);
  if (kabKec) {
    return regionResult('Kabupaten Tangerang', {
      ...base, kecamatan: kabKec, kabupatenKota: 'Kabupaten Tangerang',
      confidence: 'high', source: 'kecamatan'
    });
  }
  const kotaKec = findMatchedTerm(kecNorm, KECAMATAN_KOTA_TANGERANG);
  if (kotaKec) {
    return regionResult('Kota Tangerang', {
      ...base, kecamatan: kotaKec, kabupatenKota: 'Kota Tangerang',
      confidence: 'high', source: 'kecamatan'
    });
  }
  const tangselKec = findMatchedTerm(kecNorm, KECAMATAN_TANGSEL);
  if (tangselKec) {
    return regionResult('Luar Kota Tangerang', {
      ...base, kecamatan: tangselKec, kabupatenKota: 'Kota Tangerang Selatan',
      confidence: 'high', source: 'kecamatan-tangsel'
    });
  }

  // Cocokkan desa/kelurahan setelah kecamatan karena beberapa nama bisa serupa.
  const kabKel = findMatchedTerm(kelNorm, KELURAHAN_KAB_TANGERANG);
  if (kabKel) {
    return regionResult('Kabupaten Tangerang', {
      ...base, kelurahan: kabKel, kabupatenKota: 'Kabupaten Tangerang',
      confidence: 'medium', source: 'kelurahan'
    });
  }
  const kotaKel = findMatchedTerm(kelNorm, KELURAHAN_KOTA_TANGERANG);
  if (kotaKel) {
    return regionResult('Kota Tangerang', {
      ...base, kelurahan: kotaKel, kabupatenKota: 'Kota Tangerang',
      confidence: 'medium', source: 'kelurahan'
    });
  }

  // Bila label kecamatan kurang terbaca, cari kecamatan yang dikenal pada baris alamat KK.
  const kecFromAddressKab = findMatchedTerm(rawAlamat, KECAMATAN_KAB_TANGERANG);
  if (kecFromAddressKab) {
    return regionResult('Kabupaten Tangerang', {
      ...base, kecamatan: rawKec || kecFromAddressKab, kabupatenKota: 'Kabupaten Tangerang',
      confidence: 'medium', source: 'alamat-kk'
    });
  }
  const kecFromAddressKota = findMatchedTerm(rawAlamat, KECAMATAN_KOTA_TANGERANG);
  if (kecFromAddressKota) {
    return regionResult('Kota Tangerang', {
      ...base, kecamatan: rawKec || kecFromAddressKota, kabupatenKota: 'Kota Tangerang',
      confidence: 'medium', source: 'alamat-kk'
    });
  }

  // Frasa eksplisit pada teks hasil baca/OCR, tetapi jangan menganggap kata "Tangerang" saja cukup.
  if (includesTerm(allNorm, 'TANGERANG SELATAN') || includesTerm(allNorm, 'TANGSEL')) {
    return regionResult('Luar Kota Tangerang', { ...base, kabupatenKota: rawKabKota || 'Kota Tangerang Selatan', confidence: 'high', source: 'address-text' });
  }
  if (includesTerm(allNorm, 'KABUPATEN TANGERANG') || includesTerm(allNorm, 'KAB TANGERANG')) {
    return regionResult('Kabupaten Tangerang', { ...base, kabupatenKota: 'Kabupaten Tangerang', confidence: 'high', source: 'address-text' });
  }
  // Hapus label generik "Kabupaten/Kota" sebelum mencari frasa "Kota Tangerang".
  // Kalau tidak, teks "Kabupaten/Kota: TANGERANG" bisa keliru dianggap Kota Tangerang.
  const textWithoutGenericAdminLabel = allNorm.replace(/\bKABUPATEN\s*\/\s*KOTA\b/g, ' ');
  if (includesTerm(textWithoutGenericAdminLabel, 'KOTA TANGERANG')) {
    return regionResult('Kota Tangerang', { ...base, kabupatenKota: 'Kota Tangerang', confidence: 'high', source: 'address-text' });
  }

  const outsidePlaceTokens = [
    'JAKARTA', 'PEKALONGAN', 'LAMPUNG', 'WONOGIRI', 'BANDUNG', 'BOGOR', 'DEPOK',
    'BEKASI', 'SERANG', 'CILEGON', 'TANGERANG SELATAN', 'KOTA TANGSEL', 'JAWA TENGAH',
    'JAWA BARAT', 'JAWA TIMUR', 'SUMATERA', 'YOGYAKARTA', 'SEMARANG', 'SURABAYA'
  ];
  if (outsidePlaceTokens.some(token => includesTerm(allNorm, token))) {
    return regionResult('Luar Kota Tangerang', { ...base, confidence: 'medium', source: 'other-location-text' });
  }

  // Prefix No. KK resmi membantu saat alamat tidak terbaca OCR.
  const noKk = String(warga?.noKk || '').replace(/\D/g, '');
  if (/^\d{16}$/.test(noKk)) {
    const prefix4 = noKk.slice(0, 4);
    if (prefix4 === '3603') {
      return regionResult('Kabupaten Tangerang', { ...base, kabupatenKota: 'Kabupaten Tangerang', confidence: 'high', source: 'nomor-kk-prefix' });
    }
    if (prefix4 === '3671') {
      return regionResult('Kota Tangerang', { ...base, kabupatenKota: 'Kota Tangerang', confidence: 'high', source: 'nomor-kk-prefix' });
    }
    return regionResult('Luar Kota Tangerang', { ...base, confidence: 'medium', source: 'nomor-kk-prefix' });
  }

  return regionResult('Belum Teridentifikasi', {
    ...base,
    alamat: rawAlamat || 'Alamat asal KK belum terbaca',
    confidence: 'low',
    needsReview: true,
    source: 'insufficient-address-data'
  });
}
