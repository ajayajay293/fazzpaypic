
// Backend Serverless FazzPay - Menghasilkan Bukti Transfer Berbasis Vektor SVG HD
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kunci API Rahasia yang divalidasi dengan ketat
const REQUIRED_API_KEY = "fazzganzz";

// Endpoint API Pembuat Bukti Transfer
app.post('/api/generate', (req, res) => {
    const {
        apiKey,
        amount,
        buyerName,
        buyerUsername,
        ownerName,
        ownerUsername,
        transactionId,
        productName,
        dateTime,
        template = 'minimal'
    } = req.body;

    // Validasi Keamanan API Key secara ketat
    if (!apiKey || apiKey !== REQUIRED_API_KEY) {
        return res.status(401).json({ error: "Kunci API tidak valid atau tidak diizinkan." });
    }

    // Validasi data wajib isi
    if (!amount || !buyerName || !ownerName || !transactionId || !productName) {
        return res.status(400).json({ error: "Semua parameter transaksi wajib diisi." });
    }

    const formattedDateTime = dateTime ? dateTime.replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
    const displayBuyer = `@${buyerUsername || 'buyer'}`;
    const displayOwner = `@${ownerUsername || 'owner'}`;

    let svgContent = '';

    // Render Template SVG dengan resolusi dasar tinggi (1080x1920) & Styling Font Anti-Burik
    if (template === 'glass') {
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
            <defs>
                <style>
                    .font-base { font-family: 'SF Pro Display', -apple-system, 'Inter', sans-serif; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
                    .font-bold { font-weight: 700; }
                    .font-black { font-weight: 900; }
                </style>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#06090E" />
                    <stop offset="50%" stop-color="#0B121E" />
                    <stop offset="100%" stop-color="#05070A" />
                </linearGradient>
                <radialGradient id="neonGlow1" cx="20%" cy="20%" r="60%">
                    <stop offset="0%" stop-color="#00C896" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                </radialGradient>
                <radialGradient id="neonGlow2" cx="80%" cy="80%" r="70%">
                    <stop offset="0%" stop-color="#1E90FF" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                </radialGradient>
                <linearGradient id="glassBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
                    <stop offset="50%" stop-color="#ffffff" stop-opacity="0.02" />
                    <stop offset="100%" stop-color="#00C896" stop-opacity="0.3" />
                </linearGradient>
            </defs>

            <!-- Latar Belakang -->
            <rect width="1080" height="1920" fill="url(#bgGrad)" />
            <circle cx="200" cy="300" r="600" fill="url(#neonGlow1)" />
            <circle cx="900" cy="1400" r="700" fill="url(#neonGlow2)" />

            <!-- Kartu Utama Glassmorphism -->
            <rect x="100" y="220" width="880" height="1450" rx="40" ry="40" fill="#141C29" fill-opacity="0.8" stroke="url(#glassBorder)" stroke-width="3.5" />

            <!-- Lingkaran Status Berhasil -->
            <circle cx="540" cy="380" r="60" fill="#00C896" fill-opacity="0.2" stroke="#00C896" stroke-width="4.5" />
            <path d="M515 382 L532 399 L565 364" fill="none" stroke="#EAF2FF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Header Teks -->
            <text x="540" y="500" class="font-base font-bold" font-size="36" fill="#EAF2FF" text-anchor="middle">Pembayaran Berhasil</text>
            <text x="540" y="550" class="font-base" font-size="24" fill="#8FA3BF" text-anchor="middle" letter-spacing="1">TOTAL NOMINAL TRANSAKSI</text>

            <!-- Jumlah Uang -->
            <text x="540" y="665" class="font-base font-black" font-size="80" fill="#00C896" text-anchor="middle">Rp ${amount}</text>

            <!-- Garis Pembatas -->
            <line x1="160" y1="720" x2="920" y2="720" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" />

            <!-- Detail Transaksi -->
            <!-- Baris 1: Produk -->
            <text x="160" y="790" class="font-base font-bold" font-size="24" fill="#8FA3BF">PRODUK / LAYANAN</text>
            <text x="920" y="790" class="font-base font-bold" font-size="28" fill="#00C896" text-anchor="end">${productName}</text>
            <line x1="160" y1="830" x2="920" y2="830" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 2: ID Transaksi -->
            <text x="160" y="920" class="font-base font-bold" font-size="24" fill="#8FA3BF">ID TRANSAKSI</text>
            <text x="920" y="920" class="font-base font-bold" font-size="28" fill="#EAF2FF" text-anchor="end">${transactionId}</text>
            <line x1="160" y1="960" x2="920" y2="960" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 3: Pengirim -->
            <text x="160" y="1050" class="font-base font-bold" font-size="24" fill="#8FA3BF">PENGIRIM / PEMBELI</text>
            <text x="920" y="1050" class="font-base font-bold" font-size="28" fill="#EAF2FF" text-anchor="end">${buyerName} (${displayBuyer})</text>
            <line x1="160" y1="1090" x2="920" y2="1090" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 4: Penerima -->
            <text x="160" y="1180" class="font-base font-bold" font-size="24" fill="#8FA3BF">PENERIMA / MERCHANT</text>
            <text x="920" y="1180" class="font-base font-bold" font-size="28" fill="#EAF2FF" text-anchor="end">${ownerName} (${displayOwner})</text>
            <line x1="160" y1="1220" x2="920" y2="1220" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 5: Waktu -->
            <text x="160" y="1310" class="font-base font-bold" font-size="24" fill="#8FA3BF">WAKTU TRANSAKSI</text>
            <text x="920" y="1310" class="font-base font-bold" font-size="28" fill="#EAF2FF" text-anchor="end">${formattedDateTime}</text>

            <!-- Kotak Jaminan Keamanan -->
            <rect x="140" y="1420" width="800" height="110" rx="20" ry="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />
            <text x="540" y="1485" class="font-base" font-style="italic" font-size="24" fill="#8FA3BF" text-anchor="middle">Diverifikasi Aman oleh Jaringan Secure FazzPay</text>

            <!-- Watermark Footer Wajib -->
            <text x="540" y="1820" class="font-base font-bold" font-size="22" fill="#8FA3BF" fill-opacity="0.4" text-anchor="middle">fazzpaypic.vercel.app</text>
        </svg>
        `;
    } else if (template === 'fintech') {
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
            <defs>
                <style>
                    .font-base { font-family: 'SF Pro Display', -apple-system, 'Inter', sans-serif; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
                    .font-bold { font-weight: 700; }
                    .font-black { font-weight: 900; }
                </style>
                <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00C896" />
                    <stop offset="100%" stop-color="#1E90FF" />
                </linearGradient>
            </defs>

            <rect width="1080" height="1920" fill="#0A0E15" />
            <rect x="90" y="180" width="900" height="1530" rx="35" ry="35" fill="#121A26" stroke="#1E293B" stroke-width="2.5" />

            <!-- Header Gradient Modern -->
            <path d="M 90,215 Q 90,180 125,180 L 955,180 Q 990,180 990,215 L 990,460 L 90,460 Z" fill="url(#headerGrad)" />

            <!-- Lingkaran Centang Putih -->
            <circle cx="540" cy="320" r="60" fill="#ffffff" />
            <path d="M515 322 L532 339 L565 304" fill="none" stroke="#00C896" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Judul Kwitansi -->
            <text x="540" y="550" class="font-base font-bold" font-size="38" fill="#EAF2FF" text-anchor="middle">BUKTI TRANSFER DIGITAL</text>

            <!-- Nominal Transaksi -->
            <text x="540" y="675" class="font-base font-black" font-size="85" fill="#00C896" text-anchor="middle">Rp ${amount}</text>
            <text x="540" y="735" class="font-base font-bold" font-size="26" fill="#8FA3BF" text-anchor="middle">${productName.toUpperCase()}</text>

            <!-- Garis Putus-putus -->
            <line x1="150" y1="795" x2="930" y2="795" stroke="#1E293B" stroke-width="3.5" stroke-dasharray="12 10" />

            <!-- Detail -->
            <text x="150" y="870" class="font-base font-bold" font-size="24" fill="#8FA3BF">Nama Pengirim</text>
            <text x="930" y="870" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${buyerName}</text>
            <line x1="150" y1="910" x2="930" y2="910" stroke="#1E293B" stroke-width="1.5" />

            <text x="150" y="990" class="font-base font-bold" font-size="24" fill="#8FA3BF">Username Pengirim</text>
            <text x="930" y="990" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${displayBuyer}</text>
            <line x1="150" y1="1030" x2="930" y2="1030" stroke="#1E293B" stroke-width="1.5" />

            <text x="150" y="1110" class="font-base font-bold" font-size="24" fill="#8FA3BF">Nama Penerima</text>
            <text x="930" y="1110" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${ownerName}</text>
            <line x1="150" y1="1150" x2="930" y2="1150" stroke="#1E293B" stroke-width="1.5" />

            <text x="150" y="1230" class="font-base font-bold" font-size="24" fill="#8FA3BF">Username Penerima</text>
            <text x="930" y="1230" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${displayOwner}</text>
            <line x1="150" y1="1270" x2="930" y2="1270" stroke="#1E293B" stroke-width="1.5" />

            <text x="150" y="1350" class="font-base font-bold" font-size="24" fill="#8FA3BF">Nomor Referensi</text>
            <text x="930" y="1350" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${transactionId}</text>
            <line x1="150" y1="1390" x2="930" y2="1390" stroke="#1E293B" stroke-width="1.5" />

            <text x="150" y="1470" class="font-base font-bold" font-size="24" fill="#8FA3BF">Tanggal &amp; Waktu</text>
            <text x="930" y="1470" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${formattedDateTime}</text>

            <text x="540" y="1610" class="font-base font-bold" font-size="22" fill="#1E90FF" text-anchor="middle">✓ Dokumen Elektronik Sah Berenkripsi End-To-End</text>

            <text x="540" y="1820" class="font-base font-bold" font-size="22" fill="#8FA3BF" fill-opacity="0.4" text-anchor="middle">fazzpaypic.vercel.app</text>
        </svg>
        `;
    } else {
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
            <defs>
                <style>
                    .font-base { font-family: 'SF Pro Display', -apple-system, 'Inter', sans-serif; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
                    .font-bold { font-weight: 700; }
                    .font-black { font-weight: 900; }
                </style>
            </defs>

            <rect width="1080" height="1920" fill="#0B0F14" />
            <rect x="110" y="240" width="860" height="1380" rx="24" ry="24" fill="#121821" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" />

            <!-- Centang Hijau Elegan -->
            <circle cx="540" cy="400" r="60" fill="rgba(0, 200, 150, 0.1)" stroke="#00C896" stroke-width="3.5" />
            <path d="M520 402 L534 416 L562 386" fill="none" stroke="#00C896" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

            <text x="540" y="520" class="font-base font-bold" font-size="38" fill="#EAF2FF" text-anchor="middle">Bukti Transaksi</text>
            <text x="540" y="570" class="font-base" font-size="24" fill="#8FA3BF" text-anchor="middle">Berhasil Dikirim ke Merchant</text>

            <!-- Angka Nominal -->
            <text x="540" y="725" class="font-base font-bold" font-size="96" fill="#EAF2FF" text-anchor="middle">Rp ${amount}</text>
            <text x="540" y="785" class="font-base" font-size="24" fill="#00C896" text-anchor="middle">Untuk Layanan: ${productName}</text>

            <line x1="190" y1="840" x2="890" y2="840" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

            <!-- Detail -->
            <text x="190" y="930" class="font-base font-bold" font-size="24" fill="#8FA3BF">Akun Pengirim</text>
            <text x="890" y="930" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${buyerName} (${displayBuyer})</text>
            <line x1="190" y1="975" x2="890" y2="975" stroke="rgba(255,255,255,0.04)" stroke-width="1.5" />

            <text x="190" y="1065" class="font-base font-bold" font-size="24" fill="#8FA3BF">Diterima Oleh</text>
            <text x="890" y="1065" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${ownerName} (${displayOwner})</text>
            <line x1="190" y1="1110" x2="890" y2="1110" stroke="rgba(255,255,255,0.04)" stroke-width="1.5" />

            <text x="190" y="1200" class="font-base font-bold" font-size="24" fill="#8FA3BF">Kode Referensi</text>
            <text x="890" y="1200" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${transactionId}</text>
            <line x1="190" y1="1245" x2="890" y2="1245" stroke="rgba(255,255,255,0.04)" stroke-width="1.5" />

            <text x="190" y="1335" class="font-base font-bold" font-size="24" fill="#8FA3BF">Waktu Transaksi</text>
            <text x="890" y="1335" class="font-base font-bold" font-size="26" fill="#EAF2FF" text-anchor="end">${formattedDateTime}</text>

            <text x="540" y="1520" class="font-base" font-size="22" fill="#8FA3BF" text-anchor="middle">🔒 Dokumen Resmi Transfer FazzPay</text>

            <text x="540" y="1820" class="font-base font-bold" font-size="22" fill="#8FA3BF" fill-opacity="0.4" text-anchor="middle">fazzpaypic.vercel.app</text>
        </svg>
        `;
    }

    // Mengirim langsung konten XML SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(200).send(svgContent.trim());
});

// Jalankan Server lokal (Vercel akan mengeksekusi handler ekspor ini secara otomatis)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FazzPay Payment Receipt engine berjalan di port ${PORT}`);
});

module.exports = app;
