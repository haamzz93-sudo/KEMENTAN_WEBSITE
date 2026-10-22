import { ProducerDistributor, MonthlySeedProduction, VarietyApplication } from '../types';

export const PROVINCES_INDONESIA = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya"
];

export interface CommodityItem {
  name: string;
  unit: string;
  varietyExamples?: string;
}

export const COMMODITIES_BY_CATEGORY: Record<'sayuran' | 'buah' | 'hias' | 'obat', CommodityItem[]> = {
  sayuran: [
    { name: "Mentimun", unit: "kg", varietyExamples: "Venus, Hercules, Roberto" },
    { name: "Buncis", unit: "kg", varietyExamples: "Lebat-3, Perkasa" },
    { name: "Cabai", unit: "kg", varietyExamples: "Cabai Merah Keriting, Cabai Besar" },
    { name: "Cabai Merah", unit: "kg", varietyExamples: "Tanjung-2, TM99, Pilar" },
    { name: "Cabai Rawit", unit: "kg", varietyExamples: "Ori 212, Nirmala, Maruti" },
    { name: "Kangkung", unit: "kg", varietyExamples: "Bangkok LP-1, Mahar" },
    { name: "Kacang Panjang", unit: "kg", varietyExamples: "Kanton Tavi, Parade Tavi" },
    { name: "Tomat", unit: "kg", varietyExamples: "Servo, Tymoti, Karina" },
    { name: "Sawi Hijau", unit: "kg", varietyExamples: "Tosakan, Shinta" },
    { name: "Bayam", unit: "kg", varietyExamples: "Maestro, Giti Hijau" },
    { name: "Jagung Manis", unit: "kg", varietyExamples: "Bonanza F1, Talenta" },
    { name: "Oyong", unit: "kg", varietyExamples: "Anggun F1, Prima" },
    { name: "Paria", unit: "kg", varietyExamples: "Lipan F1, Raden" },
    { name: "Terong", unit: "kg", varietyExamples: "Yumi F1, Antaboga" },
    { name: "Bawang Merah", unit: "kg", varietyExamples: "Bima Brebes, Tajuk, Bauji" },
    { name: "Kentang", unit: "knol", varietyExamples: "Granola L, Atlantik, Medians" },
    { name: "Bawang Putih", unit: "kg", varietyExamples: "Lumbu Hijau, Tawangmangu Baru" },
    { name: "Kol Bunga", unit: "kg", varietyExamples: "Mona F1, White Shot" }
  ],
  buah: [
    { name: "Melon", unit: "kg", varietyExamples: "Action 434, Gracia" },
    { name: "Semangka", unit: "kg", varietyExamples: "Inul, Amara, Setabindo" },
    { name: "Alpukat", unit: "batang", varietyExamples: "Miki, Kendil, Aligator" },
    { name: "Mangga", unit: "batang", varietyExamples: "Gedong Gincu, Arumanis 143" },
    { name: "Rambutan", unit: "batang", varietyExamples: "Binjai, Rapiah, Garuda" },
    { name: "Durian", unit: "batang", varietyExamples: "Musang King, Bawor, Montong" },
    { name: "Jeruk", unit: "batang", varietyExamples: "Siem Madu, Keprok Batu 55" },
    { name: "Manggis", unit: "batang", varietyExamples: "Kaligesing, Wanayasa" },
    { name: "Pisang", unit: "anakan", varietyExamples: "Cavendish, Barangan, Raja Bulu" },
    { name: "Jambu Air", unit: "batang", varietyExamples: "Citra, Deli Hijau" },
    { name: "Jambu Biji", unit: "batang", varietyExamples: "Kristal, Getas Merah" },
    { name: "Lengkeng", unit: "batang", varietyExamples: "Itoh, Diamond River, Kateki" },
    { name: "Nenas", unit: "anakan", varietyExamples: "Subang, Queen, Honi" },
    { name: "Salak", unit: "anakan", varietyExamples: "Pondoh Super, Gula Pasir" },
    { name: "Pepaya", unit: "batang", varietyExamples: "California (Callina), Merah Delima" },
    { name: "Duku", unit: "batang", varietyExamples: "Kumpeh, Condet, Rasuan" },
    { name: "Sukun", unit: "batang", varietyExamples: "Kuning Sukun, Bone" },
    { name: "Sawo", unit: "batang", varietyExamples: "Manila, Apel Madu" },
    { name: "Nangka", unit: "batang", varietyExamples: "Mini, Kandel, Madu" },
    { name: "Petai", unit: "batang", varietyExamples: "Padi, Gajah" },
    { name: "Sirsak", unit: "batang", varietyExamples: "Ratu, Madu" },
    { name: "Jambo Bol", unit: "batang", varietyExamples: "Bol Jamaika" },
    { name: "Belimbing", unit: "batang", varietyExamples: "Demak Kunir, Dewi" },
    { name: "Cempedak", unit: "batang", varietyExamples: "Nangkadak, CH28" },
    { name: "Matoa", unit: "batang", varietyExamples: "Papua Merah, Kuning" },
    { name: "Blewah", unit: "kg", varietyExamples: "Bisma, Arum Manis" },
    { name: "Stroberi", unit: "kg", varietyExamples: "Sweet Charlie, Rosalinda" }
  ],
  hias: [
    { name: "Anggrek", unit: "planlet", varietyExamples: "Phalaenopsis, Dendrobium, Vanda" },
    { name: "Krisan", unit: "stek", varietyExamples: "Puspita Pelangi, Pasopati" },
    { name: "Mawar", unit: "stek", varietyExamples: "Mawar Potong Merah, Holland" },
    { name: "Sedap Malam", unit: "batang", varietyExamples: "Roro Anteng, Dian Arum" },
    { name: "Aglaonema", unit: "batang", varietyExamples: "Pride of Sumatra, Suksom" },
    { name: "Anthurium", unit: "batang", varietyExamples: "Jenmanii, Gelombang Cinta" },
    { name: "Dracaena", unit: "batang", varietyExamples: "Lucky Bamboo, Compacta" }
  ],
  obat: [
    { name: "Jahe", unit: "kg", varietyExamples: "Jahe Merah, Jahe Gajah, Jahe Emprit" },
    { name: "Kunyit", unit: "kg", varietyExamples: "Kunyit Kuning, Curcuma Domestica" },
    { name: "Temulawak", unit: "kg", varietyExamples: "Curcuma Xanthorrhiza" },
    { name: "Lengkuas", unit: "kg", varietyExamples: "Lengkuas Putih, Merah" },
    { name: "Kencur", unit: "kg", varietyExamples: "Galesia, Balittro" },
    { name: "Kapulaga", unit: "kg", varietyExamples: "Kapulaga Jawa, Sabrang" },
    { name: "Mengkudu", unit: "batang", varietyExamples: "Morinda Citrifolia" },
    { name: "Lidah Buaya", unit: "anakan", varietyExamples: "Aloe Chinensis, Barbadensis" }
  ]
};

const COMMODITIES_STORAGE_KEY = 'kementan_master_commodities';

export function getStoredCommodities(): Record<'sayuran' | 'buah' | 'hias' | 'obat', CommodityItem[]> {
  if (typeof window === 'undefined') {
    return COMMODITIES_BY_CATEGORY;
  }
  try {
    const raw = localStorage.getItem(COMMODITIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.sayuran && parsed.buah && parsed.hias && parsed.obat) {
        return parsed;
      }
    }
  } catch {}
  return COMMODITIES_BY_CATEGORY;
}

export function saveStoredCommodities(data: Record<'sayuran' | 'buah' | 'hias' | 'obat', CommodityItem[]>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMODITIES_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('master_commodities_updated'));
  }
}


// Initial Mock Data: Modul A (Produsen & Pengedar)
export const INITIAL_PRODUCERS: ProducerDistributor[] = [
  {
    id: "prod-01",
    regNumber: "REG-BPSB-JB-2026-0012",
    businessName: "PT Horti Mandiri Sejahtera",
    ownerName: "Ir. H. Darmawan Susanto",
    roleType: "produsen",
    competencyCertNumber: "144/BPSB-JB/SERT-KOMP/2024",
    certExpiryDate: "2027-08-15",
    province: "Jawa Barat",
    regency: "Kabupaten Cianjur",
    address: "Jl. Raya Ciherang No. 45, Pacet",
    phone: "0812-3456-7890",
    commodity: "Cabai Merah",
    variety: "Tanjung-2",
    landAreaHa: 4.5,
    annualCapacity: 12500,
    unit: "kg",
    applicationType: "perpanjangan",
    status: "aktif",
    createdAt: "2026-01-10"
  },
  {
    id: "prod-02",
    regNumber: "REG-BPSB-JT-2026-0045",
    businessName: "Kelompok Tani Makmur Berkah",
    ownerName: "Sudirman",
    roleType: "produsen",
    competencyCertNumber: "082/BPSB-JT/SERT-KOMP/2025",
    certExpiryDate: "2028-02-20",
    province: "Jawa Tengah",
    regency: "Kabupaten Brebes",
    address: "Desa Larangan RT 03/RW 02",
    phone: "0813-8877-6655",
    commodity: "Bawang Merah",
    variety: "Bima Brebes",
    landAreaHa: 6.2,
    annualCapacity: 45000,
    unit: "kg",
    applicationType: "baru",
    status: "aktif",
    createdAt: "2026-02-14"
  },
  {
    id: "prod-03",
    regNumber: "REG-BPSB-ET-2026-0089",
    businessName: "CV Kusuma Agro Horti",
    ownerName: "Bambang Wijaya",
    roleType: "pengedar",
    competencyCertNumber: "210/BPSB-JATIM/PENGEDAR/2023",
    certExpiryDate: "2026-10-30",
    province: "Jawa Timur",
    regency: "Kota Batu",
    address: "Kawasan Agrowisata Bumiaji Blok C-12",
    phone: "0819-2233-4455",
    commodity: "Kentang (Knol G0/G2)",
    variety: "Granola L",
    landAreaHa: 2.0,
    annualCapacity: 80000,
    unit: "knol",
    applicationType: "perpanjangan",
    status: "perlu_perpanjangan",
    createdAt: "2026-01-20"
  }
];

// Initial Mock Data: Modul B (Neraca Produksi Benih)
export const INITIAL_SEED_PRODUCTIONS: MonthlySeedProduction[] = [
  {
    id: "bal-01",
    reportingMonth: "2026-09",
    reportingEntity: "BPSB",
    province: "Jawa Barat",
    regency: "Kabupaten Cianjur",
    category: "sayuran",
    commodity: "Cabai Merah",
    variety: "Tanjung-2",
    seedClass: "BP",
    unit: "kg",
    previousStock: 4500,
    currentProduction: 2800,
    distribution: 3100,
    remainingStock: 4200, // (4500 + 2800) - 3100 = 4200
    updatedAt: "2026-09-20"
  },
  {
    id: "bal-02",
    reportingMonth: "2026-09",
    reportingEntity: "BPSB",
    province: "Jawa Tengah",
    regency: "Kabupaten Brebes",
    category: "sayuran",
    commodity: "Bawang Merah",
    variety: "Bima Brebes",
    seedClass: "BR",
    unit: "kg",
    previousStock: 12000,
    currentProduction: 18500,
    distribution: 14200,
    remainingStock: 16300, // (12000 + 18500) - 14200 = 16300
    updatedAt: "2026-09-21"
  },
  {
    id: "bal-03",
    reportingMonth: "2026-09",
    reportingEntity: "LSSM",
    province: "Jawa Timur",
    regency: "Kota Batu",
    category: "sayuran",
    commodity: "Kentang (Knol G0/G2)",
    variety: "Granola L",
    seedClass: "BD",
    unit: "knol",
    previousStock: 25000,
    currentProduction: 40000,
    distribution: 35000,
    remainingStock: 30000,
    updatedAt: "2026-09-22"
  },
  {
    id: "bal-04",
    reportingMonth: "2026-09",
    reportingEntity: "BPSB",
    province: "Sumatera Utara",
    regency: "Kabupaten Karo",
    category: "buah",
    commodity: "Jeruk Siam / Garut",
    variety: "Siam Madu Karo",
    seedClass: "BP",
    unit: "batang",
    previousStock: 8000,
    currentProduction: 6500,
    distribution: 5200,
    remainingStock: 9300,
    updatedAt: "2026-09-18"
  }
];

// Initial Mock Data: Modul C (Pendaftaran Varietas Permentan 24/2025)
export const INITIAL_VARIETY_APPLICATIONS: VarietyApplication[] = [
  {
    id: "var-01",
    trackingCode: "VAR-2026-HORTI-0842",
    applicantName: "PT Benih Unggul Nusantara",
    institutionType: "swasta",
    cropType: "sayuran",
    commodityName: "Cabai Rawit",
    proposedVarietyName: "GARUDA NUSANTARA 1",
    lineage: "Seleksi massa populasi lokal Wonosobo x Galur Murni IPB",
    submissionDate: "2026-08-15",
    currentStage: "layanan_3_masa_sanggah",
    testNoticeLetterNo: "042/BUN-UJI/VI/2026",
    testNoticeStatus: "disetujui",
    testResponseLetterNo: "B-812/SR.120/D.2/07/2026",
    testResponseDate: "2026-07-02",
    tp2vhSessionDate: "2026-08-28",
    tp2vhSessionStatus: "lolos_disetujui",
    tp2vhNotes: "Telah memenuhi syarat keunggulan potensi hasil 22 ton/ha dan toleran antraknosa.",
    objectionStartDate: "2026-09-01",
    objectionEndDate: "2026-10-01",
    objectionDaysLeft: 8,
    totalObjectionsCount: 0,
    recommendationLetterNo: "PROSES-REKOM-0842",
    statusText: "Masa Sanggah Publik Berjalan (30 Hari) - Sisa 8 Hari"
  },
  {
    id: "var-02",
    trackingCode: "VAR-2026-HORTI-0915",
    applicantName: "Balai Penelitian Tanaman Buah Tropika (BRIN)",
    institutionType: "pemerintah",
    cropType: "buah",
    commodityName: "Alpukat",
    proposedVarietyName: "MEGA MERAPI SUPER",
    lineage: "Koleksi pohon induk introduksi dataran tinggi lereng Merapi",
    submissionDate: "2026-09-05",
    currentStage: "layanan_2_permohonan_sidang",
    testNoticeLetterNo: "118/BALITBU/VII/2026",
    testNoticeStatus: "disetujui",
    testResponseLetterNo: "B-904/SR.120/D.2/07/2026",
    testResponseDate: "2026-07-20",
    tp2vhSessionDate: "2026-09-30",
    tp2vhSessionStatus: "belum_sidang",
    tp2vhNotes: "Dijadwalkan untuk Sidang Pleno TP2VH Kuartal III.",
    totalObjectionsCount: 0,
    statusText: "Menunggu Pelaksanaan Sidang Pleno TP2VH (30 Sep 2026)"
  },
  {
    id: "var-03",
    trackingCode: "VAR-2026-HORTI-0720",
    applicantName: "CV Flori Flora Nusantara",
    institutionType: "swasta",
    cropType: "hias",
    commodityName: "Krisan",
    proposedVarietyName: "PESONA PASUNDAN YELLOW",
    lineage: "Hasil persilangan buatan varietas Fiji x Yellow Puma",
    submissionDate: "2026-06-10",
    currentStage: "layanan_4_selesai_terdaftar",
    testNoticeLetterNo: "015/FFN/IV/2026",
    testNoticeStatus: "disetujui",
    testResponseLetterNo: "B-521/SR.120/D.2/05/2026",
    tp2vhSessionDate: "2026-07-15",
    tp2vhSessionStatus: "lolos_disetujui",
    objectionStartDate: "2026-07-20",
    objectionEndDate: "2026-08-20",
    objectionDaysLeft: 0,
    totalObjectionsCount: 0,
    recommendationLetterNo: "SR.120/144/D.2/VIII/2026",
    registrationNumber: "089/Kpts/PV.240/D/VIII/2026",
    statusText: "Selesai - Tanda Daftar Diterbitkan (Resmi Terdaftar)"
  }
];
