
const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Path penyimpanan font lokal di direktori sementara Vercel (/tmp)
const fontPath = '/tmp/PlusJakartaSans-Bold.ttf';
const fontRegularPath = '/tmp/PlusJakartaSans-Medium.ttf';

// Fungsi helper untuk mengunduh font secara aman sebelum rendering pertama kali
function downloadFont(url, dest) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) {
            return resolve();
        }
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

// Inisialisasi register font pendukung agar teks tidak kotak-kotak di Vercel
let fontsLoaded = false;
async function loadFonts() {
    if (fontsLoaded) return;
    try {
        // Download font Plus Jakarta Sans dari Google Fonts CDN secara dinamis
        await downloadFont(
            'https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf',
            fontRegularPath
        );
        registerFont(fontRegularPath, { family: 'PlusJakartaSans' });
        fontsLoaded = true;
        console.log("Fonts loaded successfully!");
    } catch (e) {
        console.error("Gagal memuat custom fonts, menggunakan fallback default", e);
    }
}

// API Key Rahasia Owner
const OWNER_API_KEY = "fajarganzz";

// Endpoint API untuk Generate Bukti Transaksi
app.get('/api/generate', async (req, res) => {
    const {
        price,
        buyer,
        owner_username,
        tx_id,
        product,
        date,
        owner_name,
        template = 'blue',
        apikey
    } = req.query;

    // 1. Validasi API Key
    if (!apikey || apikey !== OWNER_API_KEY) {
        return res.status(401).json({
            status: false,
            message: "API Key tidak valid! Hubungi @FazzGanteng untuk mendapatkan API Key resmi."
        });
    }

    // 2. Validasi Parameter Wajib
    if (!price || !buyer || !tx_id || !product || !owner_name) {
        return res.status(400).json({
            status: false,
            message: "Parameter tidak lengkap. Pastikan mengisi price, buyer, tx_id, product, dan owner_name."
        });
    }

    // Pastikan font sudah terunduh sebelum menggambar
    await loadFonts();

    const displayDate = date || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';
    const displayOwnerUsername = owner_username ? `@${owner_username.replace('@', '')}` : '@fazzganteng';

    try {
        // Set ukuran canvas premium (520 x 780)
        const width = 520;
        const height = 780;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Font Family yang diregister
        const fontSans = fontsLoaded ? 'PlusJakartaSans' : 'sans-serif';

        // Konfigurasi Tema Warna Premium
        let primaryColor = '#1e293b'; // Default Slate-Dark
        let gradientStart = '#2563eb'; // Royal Blue
        let gradientEnd = '#1d4ed8';
        let lightBg = '#f8fafc';
        let badgeColor = '#3b82f6';

        if (template === 'blue') {
            gradientStart = '#2563eb';
            gradientEnd = '#1d4ed8';
            badgeColor = '#3b82f6';
        } else if (template === 'emerald') {
            gradientStart = '#059669';
            gradientEnd = '#047857';
            badgeColor = '#10b981';
        } else if (template === 'violet') {
            gradientStart = '#7c3aed';
            gradientEnd = '#6d28d9';
            badgeColor = '#8b5cf6';
        }

        // --- 1. BACKGROUND UTAMA ---
        ctx.fillStyle = '#f1f5f9'; // Latar belakang abu-abu sangat muda/mewah
        ctx.fillRect(0, 0, width, height);

        // --- 2. CARD UTAMA (STRUK) DENGAN ROUNDED CORNERS & SHADOW ---
        const cardX = 30;
        const cardY = 30;
        const cardWidth = width - 60;
        const cardHeight = height - 80;
        const radius = 24;

        // Gambar bayangan halus (soft shadow) secara manual
        ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
        roundRect(ctx, cardX + 2, cardY + 6, cardWidth, cardHeight, radius, true, false);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
        roundRect(ctx, cardX, cardY + 3, cardWidth, cardHeight, radius, true, false);

        // Gambar card putih utama
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius, true, false);

        // --- 3. HEADER GRADIENT BAND (BAGIAN ATAS STRUK) ---
        const headerHeight = 140;
        ctx.save();
        // Clip header agar mengikuti kelengkungan card putih
        roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius, false, true);
        
        const grad = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + headerHeight);
        grad.addColorStop(0, gradientStart);
        grad.addColorStop(1, gradientEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(cardX, cardY, cardWidth, headerHeight);
        ctx.restore();

        // --- 4. LOGO & TEKS HEADER ---
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Brand Title
        ctx.font = `800 20px ${fontSans}`;
        ctx.fillText('FAZZPAY', width / 2, cardY + 45);

        // Subtitle Transaksi Sukses
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = `600 11px ${fontSans}`;
        ctx.fillText('BUKTI TRANSAKSI SUKSES', width / 2, cardY + 68);

        // --- 5. LINGKARAN CENTANG SUKSES ---
        const iconY = cardY + headerHeight;
        ctx.beginPath();
        ctx.arc(width / 2, iconY, 36, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Shadow lingkaran centang
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, iconY, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981'; // Hijau Sukses
        ctx.fill();

        // Centang Putih di dalam lingkaran hijau
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(width / 2 - 10, iconY);
        ctx.lineTo(width / 2 - 2, iconY + 8);
        ctx.lineTo(width / 2 + 10, iconY - 6);
        ctx.stroke();

        // --- 6. HARGA & NAMA PRODUK ---
        let currentY = iconY + 65;
        
        // Nominal Pembayaran
        ctx.fillStyle = '#0f172a'; // Slate 900
        ctx.font = `800 28px ${fontSans}`;
        ctx.textAlign = 'center';
        ctx.fillText(`Rp ${formatRupiah(price)}`, width / 2, currentY);

        currentY += 24;

        // Label Produk
        ctx.fillStyle = '#64748b'; // Slate 500
        ctx.font = `600 13px ${fontSans}`;
        ctx.fillText(product.toUpperCase(), width / 2, currentY);

        // --- 7. PEMBATAS GARIS PUTUS-PUTUS ---
        currentY += 28;
        ctx.strokeStyle = '#cbd5e1'; // Slate 300
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cardX + 25, currentY);
        ctx.lineTo(cardX + cardWidth - 25, currentY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset agar garis lain normal

        // --- 8. BAGIAN DETAIL TRANSAKSI (KEY-VALUE GRID) ---
        currentY += 35;
        const paddingLeft = cardX + 30;
        const paddingRight = cardX + cardWidth - 30;

        const drawInfoRow = (label, value, isHighlighted = false) => {
            // Label di sisi kiri
            ctx.textAlign = 'left';
            ctx.fillStyle = '#64748b'; // Slate 500
            ctx.font = `600 12px ${fontSans}`;
            ctx.fillText(label, paddingLeft, currentY);

            // Value di sisi kanan
            ctx.textAlign = 'right';
            if (isHighlighted) {
                ctx.fillStyle = badgeColor;
                ctx.font = `700 13px ${fontSans}`;
            } else {
                ctx.fillStyle = '#334155'; // Slate 700
                ctx.font = `700 12px ${fontSans}`;
            }
            ctx.fillText(value, paddingRight, currentY);

            currentY += 34; // Spasi antar baris
        };

        drawInfoRow('ID Transaksi', tx_id);
        drawInfoRow('Tanggal Transaksi', displayDate);
        drawInfoRow('Pelanggan / Pembeli', buyer);
        drawInfoRow('Metode Pembayaran', 'FazzPay Saldo');
        drawInfoRow('Nama Merchant', owner_name);
        drawInfoRow('Kontak Telegram', displayOwnerUsername, true);
        drawInfoRow('Status Transaksi', 'BERHASIL / PAID');

        // --- 9. GARIS PEMBATAS FOOTER ---
        currentY = cardY + cardHeight - 85;
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 25, currentY);
        ctx.lineTo(cardX + cardWidth - 25, currentY);
        ctx.stroke();

        // --- 10. TANDA AIR / WATERMARK (fazzpaypic.vercel.app) ---
        currentY += 35;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8'; // Slate 400
        ctx.font = `500 11px ${fontSans}`;
        ctx.fillText('Terima kasih atas kepercayaan Anda.', width / 2, currentY);

        currentY += 18;
        ctx.fillStyle = gradientStart;
        ctx.font = `800 12px ${fontSans}`;
        ctx.fillText('fazzpaypic.vercel.app', width / 2, currentY);

        // Kembalikan sebagai stream PNG
        const buffer = canvas.toBuffer('image/png');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Gagal merender gambar bukti transaksi dengan font eksternal.",
            error: error.message
        });
    }
});

// Helper: Membuat rounded rectangle pada Canvas
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, bl: radius, br: radius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, bl: 0, br: 0};
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

// Helper: Format Rupiah
function formatRupiah(angka) {
    const numberString = angka.toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        const separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
}

// Server lokal fallback
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
