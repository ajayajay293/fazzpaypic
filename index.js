
// Backend Serverless FazzPay - Menghasilkan Bukti Transfer Berbasis SVG Resolusi Tinggi
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan aset statis secara lokal
app.use(express.static(path.join(__dirname, 'public')));

// Kunci API Rahasia yang divalidasi dengan ketat
const REQUIRED_API_KEY = "fazzganzz";

// Endpoint API Pembuat Bukti Transfer (Menghasilkan SVG berkualitas tinggi)
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
        template = 'minimal' // Pilihan: 'minimal', 'fintech', 'glass'
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

    // Render Template berdasarkan pilihan pengguna
    if (template === 'glass') {
        // --- TEMPLATE: DARK GLASS (Visual Mewah Futuristik) ---
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
            <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#06090E" />
                    <stop offset="50%" stop-color="#0B121E" />
                    <stop offset="100%" stop-color="#05070A" />
                </linearGradient>
                <radialGradient id="neonGlow1" cx="20%" cy="20%" r="60%">
                    <stop offset="0%" stop-color="#00C896" stop-opacity="0.15" />
                    <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                </radialGradient>
                <radialGradient id="neonGlow2" cx="80%" cy="80%" r="70%">
                    <stop offset="0%" stop-color="#1E90FF" stop-opacity="0.15" />
                    <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                </radialGradient>
                <linearGradient id="glassBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
                    <stop offset="50%" stop-color="#ffffff" stop-opacity="0.02" />
                    <stop offset="100%" stop-color="#00C896" stop-opacity="0.25" />
                </linearGradient>
                <filter id="blurFilter">
                    <feGaussianBlur stdDeviation="20" />
                </filter>
            </defs>

            <!-- Latar Belakang -->
            <rect width="1080" height="1920" fill="url(#bgGrad)" />
            <circle cx="200" cy="300" r="600" fill="url(#neonGlow1)" />
            <circle cx="900" cy="1400" r="700" fill="url(#neonGlow2)" />

            <!-- Kartu Utama Glassmorphism -->
            <rect x="100" y="220" width="880" height="1450" rx="40" ry="40" fill="#141C29" fill-opacity="0.75" stroke="url(#glassBorder)" stroke-width="3" />

            <!-- Lingkaran Status Berhasil -->
            <circle cx="540" cy="380" r="60" fill="#00C896" fill-opacity="0.2" stroke="#00C896" stroke-width="4" filter="drop-shadow(0px 0px 15px rgba(0,200,150,0.5))" />
            <path d="M515 382 L532 399 L565 364" fill="none" stroke="#EAF2FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Header Teks -->
            <text x="540" y="500" font-family="system-ui, sans-serif" font-size="36" font-weight="bold" fill="#EAF2FF" text-anchor="middle">Pembayaran Berhasil</text>
            <text x="540" y="550" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF" text-anchor="middle">TOTAL NOMINAL TRANSAKSI</text>

            <!-- Jumlah Uang -->
            <text x="540" y="660" font-family="system-ui, sans-serif" font-size="80" font-weight="900" fill="#00C896" text-anchor="middle">Rp ${amount}</text>

            <!-- Garis Pembatas -->
            <line x1="160" y1="720" x2="920" y2="720" stroke="rgba(255, 255, 255, 0.1)" stroke-width="2" />

            <!-- Detail Transaksi -->
            <!-- Baris 1: Produk -->
            <text x="160" y="790" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">PRODUK / LAYANAN</text>
            <text x="920" y="790" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#00C896" text-anchor="end">${productName}</text>
            <line x1="160" y1="830" x2="920" y2="830" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 2: ID Transaksi -->
            <text x="160" y="920" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">ID TRANSAKSI</text>
            <text x="920" y="920" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#EAF2FF" text-anchor="end">${transactionId}</text>
            <line x1="160" y1="960" x2="920" y2="960" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 3: Pengirim -->
            <text x="160" y="1050" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">PENGIRIM / PEMBELI</text>
            <text x="920" y="1050" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#EAF2FF" text-anchor="end">${buyerName} (${displayBuyer})</text>
            <line x1="160" y1="1090" x2="920" y2="1090" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 4: Penerima -->
            <text x="160" y="1180" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">PENERIMA / MERCHANT</text>
            <text x="920" y="1180" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#EAF2FF" text-anchor="end">${ownerName} (${displayOwner})</text>
            <line x1="160" y1="1220" x2="920" y2="1220" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" stroke-dasharray="4 6" />

            <!-- Baris 5: Waktu -->
            <text x="160" y="1310" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">WAKTU TRANSAKSI</text>
            <text x="920" y="1310" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#EAF2FF" text-anchor="end">${formattedDateTime}</text>

            <!-- Kotak Jaminan Keamanan -->
            <rect x="140" y="1420" width="800" height="110" rx="20" ry="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />
            <text x="540" y="1485" font-family="system-ui, sans-serif" font-style="italic" font-size="24" fill="#8FA3BF" text-anchor="middle">Diverifikasi Aman oleh Jaringan Secure FazzPay</text>

            <!-- Watermark Footer Wajib -->
            <text x="540" y="1820" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#8FA3BF" fill-opacity="0.4" text-anchor="middle">fazzpaypic.vercel.app</text>
        </svg>
        `;
    } else if (template === 'fintech') {
        // --- TEMPLATE: FINTECH CARD (Modern Stripe Gradient Header) ---
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
            <defs>
                <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#00C896" />
                    <stop offset="100%" stop-color="#1E90FF" />
                </linearGradient>
            </defs>

            <!-- Latar belakang gelap -->
            <rect width="1080" height="1920" fill="#0A0E15" />

            <!-- Kartu Bukti Utama -->
            <rect x="90" y="180" width="900" height="1530" rx="35" ry="35" fill="#121A26" stroke="#1E293B" stroke-width="2" />

            <!-- Kliping Sudut Melengkung Header Gradient -->
            <g clip-path="url(#headerClip)">
                <path d="M 90,215 Q 90,180 125,180 L 955,180 Q 990,180 990,215 L 990,460 L 90,460 Z" fill="url(#headerGrad)" />
            </g>

            <!-- Lingkaran Centang Putih -->
            <circle cx="540" cy="320" r="60" fill="#ffffff" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.2))" />
            <path d="M515 322 L532 339 L565 304" fill="none" stroke="#00C896" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Judul Kwitansi -->
            <text x="540" y="550" font-family="system-ui, sans-serif" font-size="38" font-weight="bold" fill="#EAF2FF" text-anchor="middle">BUKTI TRANSFER DIGITAL</text>

            <!-- Nominal Transaksi -->
            <text x="540" y="670" font-family="system-ui, sans-serif" font-size="85" font-weight="900" fill="#00C896" text-anchor="middle">Rp ${amount}</text>
            <text x="540" y="730" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#8FA3BF" text-anchor="middle">${productName.toUpperCase()}</text>

            <!-- Garis Putus-putus -->
            <line x1="150" y1="790" x2="930" y2="790" stroke="#1E293B" stroke-width="3" stroke-dasharray="12 10" />

            <!-- List Detail Transaksi -->
            <!-- Baris 1 -->
            <text x="150" y="870" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Nama Pengirim</text>
            <text x="930" y="870" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${buyerName}</text>
            <line x1="150" y1="910" x2="930" y2="910" stroke="#1E293B" stroke-width="1" />

            <!-- Baris 2 -->
            <text x="150" y="990" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Username Pengirim</text>
            <text x="930" y="990" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${displayBuyer}</text>
            <line x1="150" y1="1030" x2="930" y2="1030" stroke="#1E293B" stroke-width="1" />

            <!-- Baris 3 -->
            <text x="150" y="1110" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Nama Penerima</text>
            <text x="930" y="1110" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${ownerName}</text>
            <line x1="150" y1="1150" x2="930" y2="1150" stroke="#1E293B" stroke-width="1" />

            <!-- Baris 4 -->
            <text x="150" y="1230" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Username Penerima</text>
            <text x="930" y="1230" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${displayOwner}</text>
            <line x1="150" y1="1270" x2="930" y2="1270" stroke="#1E293B" stroke-width="1" />

            <!-- Baris 5 -->
            <text x="150" y="1350" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Nomor Referensi</text>
            <text x="930" y="1350" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${transactionId}</text>
            <line x1="150" y1="1390" x2="930" y2="1390" stroke="#1E293B" stroke-width="1" />

            <!-- Baris 6 -->
            <text x="150" y="1470" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Tanggal &amp; Waktu</text>
            <text x="930" y="1470" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${formattedDateTime}</text>

            <!-- Teks Footer Jaminan -->
            <text x="540" y="1610" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#1E90FF" text-anchor="middle">✓ Dokumen Elektronik Sah Berenkripsi End-To-End</text>

            <!-- Watermark Footer Wajib -->
            <text x="540" y="1820" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#8FA3BF" fill-opacity="0.4" text-anchor="middle">fazzpaypic.vercel.app</text>
        </svg>
        `;
    } else {
        // --- TEMPLATE: MINIMAL CLEAN (Sederhana, Bersih, Profesional) ---
        svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
            <!-- Latar belakang gelap minimalis -->
            <rect width="1080" height="1920" fill="#0B0F14" />

            <!-- Kartu Utama -->
            <rect x="110" y="240" width="860" height="1380" rx="24" ry="24" fill="#121821" stroke="rgba(255,255,255,0.04)" stroke-width="1.5" />

            <!-- Centang Hijau Elegan -->
            <circle cx="540" cy="400" r="60" fill="rgba(0, 200, 150, 0.1)" stroke="#00C896" stroke-width="3" />
            <path d="M520 402 L534 416 L562 386" fill="none" stroke="#00C896" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Judul Atas -->
            <text x="540" y="520" font-family="system-ui, sans-serif" font-size="38" font-weight="bold" fill="#EAF2FF" text-anchor="middle">Bukti Transaksi</text>
            <text x="540" y="570" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF" text-anchor="middle">Berhasil Dikirim ke Merchant</text>

            <!-- Angka Nominal -->
            <text x="540" y="720" font-family="system-ui, sans-serif" font-size="96" font-weight="bold" fill="#EAF2FF" text-anchor="middle">Rp ${amount}</text>
            <text x="540" y="780" font-family="system-ui, sans-serif" font-size="24" fill="#00C896" text-anchor="middle">Untuk Layanan: ${productName}</text>

            <!-- Garis Pembatas Utama -->
            <line x1="190" y1="840" x2="890" y2="840" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

            <!-- List Detail Transaksi -->
            <!-- Baris 1 -->
            <text x="190" y="930" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Akun Pengirim</text>
            <text x="890" y="930" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${buyerName} (${displayBuyer})</text>
            <line x1="190" y1="975" x2="890" y2="975" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

            <!-- Baris 2 -->
            <text x="190" y="1065" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Diterima Oleh</text>
            <text x="890" y="1065" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${ownerName} (${displayOwner})</text>
            <line x1="190" y1="1110" x2="890" y2="1110" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

            <!-- Baris 3 -->
            <text x="190" y="1200" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Kode Referensi</text>
            <text x="890" y="1200" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${transactionId}</text>
            <line x1="190" y1="1245" x2="890" y2="1245" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

            <!-- Baris 4 -->
            <text x="190" y="1335" font-family="system-ui, sans-serif" font-size="24" fill="#8FA3BF">Waktu Transaksi</text>
            <text x="890" y="1335" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#EAF2FF" text-anchor="end">${formattedDateTime}</text>

            <!-- Teks Kaki Jaminan -->
            <text x="540" y="1520" font-family="system-ui, sans-serif" font-size="22" fill="#8FA3BF" text-anchor="middle">🔒 Dokumen Resmi Transfer FazzPay</text>

            <!-- Watermark Footer Wajib -->
            <text x="540" y="1820" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#8FA3BF" fill-opacity="0.4" text-anchor="middle">fazzpaypic.vercel.app</text>
        </svg>
        `;
    }

    // Berikan respons langsung berupa file SVG berkualitas tinggi
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svgContent.trim());
});

// Jalankan Server Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FazzPay Payment Receipt engine berjalan di port ${PORT}`);
});
