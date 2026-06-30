
const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis dari direktori public
app.use(express.static(path.join(__dirname, '../public')));

// Path penyimpanan font di direktori sementara Vercel
const fontBoldPath = '/tmp/PlusJakartaSans-ExtraBold.ttf';
const fontMediumPath = '/tmp/PlusJakartaSans-Medium.ttf';

// Helper untuk mengunduh file font secara aman dan sinkron sebelum render
function downloadFont(url, dest) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) {
            // Jika font sudah terunduh di container instance ini, lewati proses unduh
            return resolve();
        }
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Gagal mengunduh font: Status ${response.statusCode}`));
                return;
            }
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

let fontsLoaded = false;
async function loadFonts() {
    if (fontsLoaded) return;
    try {
        // Mengunduh font Plus Jakarta Sans yang sangat elegan untuk desain Fintech
        await downloadFont(
            'https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/static/PlusJakartaSans-ExtraBold.ttf',
            fontBoldPath
        );
        await downloadFont(
            'https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/static/PlusJakartaSans-Medium.ttf',
            fontMediumPath
        );
        
        // Daftarkan font ke sistem Node Canvas
        registerFont(fontBoldPath, { family: 'PlusJakartaSansBold' });
        registerFont(fontMediumPath, { family: 'PlusJakartaSansMedium' });
        fontsLoaded = true;
        console.log("Font premium FazzPayPic berhasil didaftarkan.");
    } catch (e) {
        console.error("Gagal memuat custom fonts, menggunakan default system font fallback", e);
    }
}

// API Key Rahasia Owner
const OWNER_API_KEY = "fazzganzz";

// Endpoint API Utama untuk Merender Gambar PNG Premium
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
            message: "API Key tidak valid! Hubungi @FazzGanteng untuk mendapatkannya."
        });
    }

    // 2. Validasi Parameter Wajib
    if (!price || !buyer || !tx_id || !product || !owner_name) {
        return res.status(400).json({
            status: false,
            message: "Parameter tidak lengkap. Pastikan mengisi price, buyer, tx_id, product, dan owner_name."
        });
    }

    // Blokir proses render hingga font selesai diunduh & diregistrasi sepenuhnya
    await loadFonts();

    const displayDate = date || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';
    const displayOwnerUsername = owner_username ? `@${owner_username.replace('@', '')}` : '@FazzGanteng';

    try {
        // Dimensi Canvas Premium Beresolusi Tinggi (750 x 1100 px) - Rasio Sempurna Struk Layar HP
        const width = 750;
        const height = 1100;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Font Family Setup dengan Fallback aman
        const fontBold = fontsLoaded ? 'PlusJakartaSansBold' : 'sans-serif';
        const fontMedium = fontsLoaded ? 'PlusJakartaSansMedium' : 'sans-serif';

        // Konfigurasi Gradasi Premium Berdasarkan Pilihan Template
        let gradStart = '#0252DF', gradMid = '#003594', gradEnd = '#001D56'; 
        let accentColor = '#10B981'; // Hijau Sukses
        let textAccent = '#0252DF';

        if (template === 'emerald') {
            gradStart = '#059669'; gradMid = '#047857'; gradEnd = '#064e3b';
            textAccent = '#10B981';
        } else if (template === 'violet') {
            gradStart = '#7c3aed'; gradMid = '#6d28d9'; gradEnd = '#4c1d95';
            textAccent = '#8b5cf6';
        }

        // ==========================================
        // 1. LATAR BELAKANG CANVAS (DEEP GLOWING FINTECH)
        // ==========================================
        const bgGrad = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width * 0.8);
        bgGrad.addColorStop(0, '#0a1020'); // Sangat gelap kebiruan
        bgGrad.addColorStop(1, '#03050a'); 
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Pola abstrak diamond glowing di latar belakang luar struk
        ctx.fillStyle = 'rgba(2, 82, 223, 0.04)';
        drawDiamond(ctx, 100, 250, 200);
        drawDiamond(ctx, 650, 900, 250);
        drawDiamond(ctx, 670, 150, 120);

        // ==========================================
        // 2. KARTU UTAMA (STRUK PUTIH DI TENGAH)
        // ==========================================
        const cardX = 40;
        const cardY = 40;
        const cardW = width - 80;
        const cardH = height - 80;
        const cardR = 36; // Sudut melengkung halus

        // Bayangan luar kartu (Soft Shadow)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        roundRect(ctx, cardX, cardY + 12, cardW, cardH, cardR, true, false);

        // Badan kartu putih utama
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR, true, false);

        // ==========================================
        // 3. HEADER GRADASI STRUK
        // ==========================================
        ctx.save();
        // Clip area agar header gradasi mengikuti rounded corner kartu utama
        roundRect(ctx, cardX, cardY, cardW, cardH, cardR, false, true);

        const headerH = 260;
        const headGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
        headGrad.addColorStop(0, gradStart);
        headGrad.addColorStop(0.5, gradMid);
        headGrad.addColorStop(1, gradEnd);
        ctx.fillStyle = headGrad;
        ctx.fillRect(cardX, cardY, cardW, headerH);

        // Pola geometris diamond futuristik di dalam header
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        drawDiamond(ctx, cardX + 90, cardY + 80, 100);
        drawDiamond(ctx, cardX + cardW - 90, cardY + 160, 120);
        drawDiamond(ctx, cardX + cardW/2 - 150, cardY + 190, 70);

        // Teks Utama Brand (FAZZPAY)
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 38px ${fontBold}`;
        ctx.fillText('FAZZPAY', width / 2, cardY + 75);

        // Subtitle Transaksi Sukses
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `700 13px ${fontBold}`;
        ctx.fillText('BUKTI TRANSAKSI SUKSES', width / 2, cardY + 110);
        ctx.restore();

        // ==========================================
        // 4. LINGKARAN CENTANG SUKSES (GLOWING BADGE)
        // ==========================================
        const badgeY = cardY + headerH;
        
        // Lingkaran Putih Luar
        ctx.beginPath();
        ctx.arc(width/2, badgeY, 56, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Efek Ring Glow Transparan di sekeliling centang
        ctx.beginPath();
        ctx.arc(width/2, badgeY, 66, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Bulatan Hijau Sukses Dalam
        ctx.beginPath();
        ctx.arc(width/2, badgeY, 46, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();

        // Gambar Centang Putih Presisi Tinggi
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(width/2 - 16, badgeY + 1);
        ctx.lineTo(width/2 - 3, badgeY + 14);
        ctx.lineTo(width/2 + 16, badgeY - 11);
        ctx.stroke();

        // ==========================================
        // 5. NOMINAL PEMBAYARAN & PIL BADGE DETAIL
        // ==========================================
        let currentY = badgeY + 105;

        // Label: TOTAL PEMBAYARAN
        ctx.textAlign = 'center';
        ctx.fillStyle = textAccent;
        ctx.font = `800 13px ${fontBold}`;
        ctx.fillText('TOTAL PEMBAYARAN', width / 2, currentY);

        // Garis dekoratif kiri dan kanan label "TOTAL PEMBAYARAN"
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width/2 - 220, currentY - 4);
        ctx.lineTo(width/2 - 90, currentY - 4);
        ctx.moveTo(width/2 + 90, currentY - 4);
        ctx.lineTo(width/2 + 220, currentY - 4);
        ctx.stroke();

        currentY += 55;

        // Nilai Harga Transaksi (Besar & Jelas)
        ctx.fillStyle = '#0f172a';
        ctx.font = `800 48px ${fontBold}`;
        ctx.fillText(`Rp ${formatRupiah(price)}`, width / 2, currentY);

        currentY += 40;

        // Pil Latar Belakang Teks Produk
        const textProduct = product.toUpperCase();
        ctx.font = `800 13px ${fontBold}`;
        const textWidth = ctx.measureText(textProduct).width;
        const badgeW = Math.max(textWidth + 60, 320);
        const badgeH = 38;

        ctx.fillStyle = '#f1f5f9';
        roundRect(ctx, width/2 - badgeW/2, currentY - 26, badgeW, badgeH, 12, true, false);

        // Teks Nama Produk di dalam Pil
        ctx.fillStyle = '#334155';
        ctx.fillText(textProduct, width / 2, currentY - 2);

        // ==========================================
        // 6. GARIS PUTUS-PUTUS PEMBATAS DETAIL
        // ==========================================
        currentY += 35;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cardX + 45, currentY);
        ctx.lineTo(cardX + cardW - 45, currentY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash agar tidak mempengaruhi garis lain

        // ==========================================
        // 7. BARIS DATA DETIL DENGAN IKON PRESISI TINGGI
        // ==========================================
        currentY += 48;
        const leftColX = cardX + 45;
        const rightColX = cardX + cardW - 45;

        const drawDataRow = (iconType, label, value, valColor = '#1e293b') => {
            // Latar belakang bulat biru muda untuk ikon
            ctx.fillStyle = '#eff6ff';
            ctx.beginPath();
            ctx.arc(leftColX + 16, currentY - 5, 18, 0, Math.PI * 2);
            ctx.fill();

            // Render Gambar Ikon Berbasis Path (Vector Garis Tajam)
            ctx.strokeStyle = '#0252DF';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.save();
            ctx.translate(leftColX + 8, currentY - 13);
            drawVectorIcon(ctx, iconType);
            ctx.restore();

            // Label Teks Kiri (Bold & Berwarna Slate Gray)
            ctx.textAlign = 'left';
            ctx.fillStyle = '#64748b';
            ctx.font = `800 14px ${fontBold}`;
            ctx.fillText(label, leftColX + 46, currentY);

            // Value Teks Kanan
            ctx.textAlign = 'right';
            ctx.fillStyle = valColor;
            ctx.font = `800 14px ${fontBold}`;
            ctx.fillText(value, rightColX, currentY);

            currentY += 46; // Jarak antar baris
        };

        drawDataRow('id', 'ID Transaksi', tx_id);
        drawDataRow('calendar', 'Tanggal Transaksi', displayDate);
        drawDataRow('user', 'Pelanggan / Pembeli', buyer);
        drawDataRow('wallet', 'Metode Pembayaran', 'FazzPay Saldo');
        drawDataRow('merchant', 'Nama Merchant', owner_name);
        drawDataRow('telegram', 'Kontak Telegram', displayOwnerUsername, textAccent);
        drawDataRow('status', 'Status Transaksi', 'BERHASIL / PAID', '#10B981');

        // ==========================================
        // 8. BOX KEAMANAN BAWAH (SHIELD SECURE NOTIF)
        // ==========================================
        currentY += 8;
        const notifW = cardW - 90;
        const notifH = 88;
        const notifX = cardX + 45;

        // Latar Belakang Box
        ctx.fillStyle = '#f8fafc';
        roundRect(ctx, notifX, currentY, notifW, notifH, 16, true, false);
        
        // Border Halus Box
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        roundRect(ctx, notifX, currentY, notifW, notifH, 16, false, true);

        // Bulatan Biru untuk Ikon Shield Keamanan
        ctx.fillStyle = '#0252DF';
        ctx.beginPath();
        ctx.arc(notifX + 35, currentY + 44, 20, 0, Math.PI * 2);
        ctx.fill();

        // Menggambar Ikon Shield Putih di dalam Box
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.save();
        ctx.translate(notifX + 27, currentY + 36);
        drawVectorIcon(ctx, 'shield');
        ctx.restore();

        // Teks Deskripsi Proteksi
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1e293b';
        ctx.font = `800 12px ${fontBold}`;
        ctx.fillText('Terima kasih atas kepercayaan Anda.', notifX + 70, currentY + 36);

        ctx.fillStyle = '#64748b';
        ctx.font = `800 11px ${fontBold}`;
        ctx.fillText('Transaksi Anda telah berhasil diproses dengan aman.', notifX + 70, currentY + 56);

        // ==========================================
        // 9. FOOTER WATERMARK UTAMA (fazzpaypic.vercel.app)
        // ==========================================
        currentY = cardY + cardH - 55;
        
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.font = `800 11px ${fontBold}`;
        ctx.fillText('Lihat bukti transaksi ini di', width / 2, currentY);

        currentY += 22;
        
        // Gabungan Ikon Globe + Text Domain Utama
        ctx.fillStyle = textAccent;
        ctx.font = `800 13px ${fontBold}`;
        const wmText = '  fazzpaypic.vercel.app';
        
        ctx.textAlign = 'center';
        ctx.fillText(`🌐${wmText}`, width / 2, currentY);

        // Mengirimkan data gambar biner PNG langsung ke klien
        const buffer = canvas.toBuffer('image/png');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Gagal memproses gambar bukti transaksi.",
            error: error.message
        });
    }
});

// ==========================================
// KUMPULAN FUNGSI HELPER GRAFIS CANVAS
// ==========================================

// Helper: Menggambar Ikon Vector Presisi (Sempurna di Resolusi Tinggi)
function drawVectorIcon(ctx, type) {
    if (type === 'id') {
        ctx.beginPath();
        ctx.rect(0, 0, 16, 16);
        ctx.moveTo(4, 4); ctx.lineTo(12, 4);
        ctx.moveTo(4, 8); ctx.lineTo(12, 8);
        ctx.moveTo(4, 12); ctx.lineTo(9, 12);
        ctx.stroke();
    } else if (type === 'calendar') {
        ctx.beginPath();
        ctx.rect(0, 2, 16, 13);
        ctx.moveTo(4, 0); ctx.lineTo(4, 3);
        ctx.moveTo(12, 0); ctx.lineTo(12, 3);
        ctx.moveTo(0, 6); ctx.lineTo(16, 6);
        ctx.stroke();
    } else if (type === 'user') {
        ctx.beginPath();
        ctx.arc(8, 5, 3.5, 0, Math.PI * 2);
        ctx.moveTo(1, 15);
        ctx.arcTo(1, 11, 8, 11, 7);
        ctx.arcTo(15, 11, 15, 15, 7);
        ctx.stroke();
    } else if (type === 'wallet') {
        ctx.beginPath();
        ctx.rect(0, 3, 16, 10);
        ctx.arc(13, 8, 2, 0, Math.PI * 2);
        ctx.stroke();
    } else if (type === 'merchant') {
        ctx.beginPath();
        ctx.moveTo(0, 4); ctx.lineTo(8, 0); ctx.lineTo(16, 4);
        ctx.rect(2, 6, 12, 9);
        ctx.stroke();
    } else if (type === 'telegram') {
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(6, 10);
        ctx.lineTo(16, 0);
        ctx.lineTo(11, 14);
        ctx.lineTo(16, 0);
        ctx.stroke();
    } else if (type === 'status') {
        ctx.beginPath();
        ctx.arc(8, 8, 7, 0, Math.PI * 2);
        ctx.moveTo(5, 8); ctx.lineTo(7, 10); ctx.lineTo(11, 6);
        ctx.stroke();
    } else if (type === 'shield') {
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.quadraticCurveTo(15, 1, 16, 4);
        ctx.quadraticCurveTo(15, 12, 8, 16);
        ctx.quadraticCurveTo(1, 12, 0, 4);
        ctx.quadraticCurveTo(1, 1, 8, 0);
        ctx.stroke();
        // Inner Checkmark
        ctx.beginPath();
        ctx.moveTo(5, 8); ctx.lineTo(7, 10); ctx.lineTo(11, 6);
        ctx.stroke();
    }
}

// Helper: Menggambar Pola Diamond Geometris
function drawDiamond(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size / 2);
    ctx.lineTo(x + size / 2, y);
    ctx.lineTo(x, y + size / 2);
    ctx.lineTo(x - size / 2, y);
    ctx.closePath();
    ctx.fill();
}

// Helper: Membuat rounded rectangle pada Canvas
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, bl: radius, br: radius};
    } else {
        const defaultRadius = {tl: 0, tr: 0, bl: 0, br: 0};
        for (const side in defaultRadius) {
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

// Fallback Port lokal saat pengujian non-Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FazzPayPic Engine berjalan lancar di port ${PORT}`);
});

module.exports = app;
