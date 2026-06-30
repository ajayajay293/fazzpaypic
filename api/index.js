
const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files dari folder public secara manual jika diperlukan
app.use(express.static(path.join(__dirname, '../public')));

// API Key Rahasia Owner
const OWNER_API_KEY = "fazzganzz";

// Endpoint API untuk Generate Bukti Transaksi (Mengembalikan format PNG)
app.get('/api/generate', (req, res) => {
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
            message: "API Key tidak valid atau tidak disertakan! Hubungi @FazzGanteng untuk mendapatkan API Key resmi."
        });
    }

    // 2. Validasi Parameter Wajib
    if (!price || !buyer || !tx_id || !product || !owner_name) {
        return res.status(400).json({
            status: false,
            message: "Parameter tidak lengkap. Pastikan mengisi price, buyer, tx_id, product, dan owner_name."
        });
    }

    // Default nilai opsional jika tidak diisi
    const displayDate = date || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';
    const displayOwnerUsername = owner_username ? `@${owner_username.replace('@', '')}` : '@fazzganteng';

    try {
        // Set ukuran canvas (lebar x tinggi)
        const width = 500;
        const height = 750;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Skema Warna berdasarkan Pilihan Template
        let primaryColor = '#3B82F6'; // Default Blue
        let secondaryColor = '#EFF6FF';
        let accentColor = '#10B981'; // Green untuk tanda sukses

        if (template === 'emerald') {
            primaryColor = '#10B981';
            secondaryColor = '#ECFDF5';
        } else if (template === 'violet') {
            primaryColor = '#8B5CF6';
            secondaryColor = '#F5F3FF';
        } else if (template === 'dark') {
            primaryColor = '#1F2937';
            secondaryColor = '#F3F4F6';
        }

        // --- BACKGROUND ---
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // --- HEADER GRADIENT BAND ---
        const gradient = ctx.createLinearGradient(0, 0, width, 180);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, adjustColorBrightness(primaryColor, -20));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, 180);

        // --- DRAW SUCCESS BADGE & ICON (Logo FazzPay Sederhana) ---
        // Lingkaran Putih Tengah Atas
        ctx.beginPath();
        ctx.arc(width / 2, 100, 45, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset shadow

        // Icon Centang Sukses (Warna Hijau Sukses)
        ctx.beginPath();
        ctx.arc(width / 2, 100, 35, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(width / 2 - 12, 100);
        ctx.lineTo(width / 2 - 3, 109);
        ctx.lineTo(width / 2 + 13, 91);
        ctx.stroke();

        // --- APP TITLE (FazzPay) ---
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FAZZPAY', width / 2, 45);

        // Subtitle Transaksi Sukses
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '13px Arial, Helvetica, sans-serif';
        ctx.fillText('TRANSAKSI BERHASIL', width / 2, 160);

        // --- KONTEN DETAIL TRANSAKSI ---
        let currentY = 220;

        // Teks Nominal Utama
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 32px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Rp ${formatRupiah(price)}`, width / 2, currentY);

        currentY += 40;

        // Nama Produk di bawah nominal
        ctx.fillStyle = '#4B5563';
        ctx.font = '15px Arial, Helvetica, sans-serif';
        ctx.fillText(product, width / 2, currentY);

        // Pembatas Dekoratif Gergaji / Garis Putus-putus
        currentY += 30;
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(40, currentY);
        ctx.lineTo(width - 40, currentY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // --- LIST DETAIL (Grid Key-Value Style) ---
        currentY += 40;
        const drawRow = (label, value, isBold = false) => {
            ctx.textAlign = 'left';
            ctx.fillStyle = '#6B7280';
            ctx.font = '14px Arial, Helvetica, sans-serif';
            ctx.fillText(label, 50, currentY);

            ctx.textAlign = 'right';
            ctx.fillStyle = isBold ? '#111827' : '#374151';
            ctx.font = isBold ? 'bold 14px Arial, Helvetica, sans-serif' : '14px Arial, Helvetica, sans-serif';
            ctx.fillText(value, width - 50, currentY);

            currentY += 35;
        };

        drawRow('No. Transaksi', tx_id, true);
        drawRow('Waktu Transaksi', displayDate);
        drawRow('Nama Pembeli', buyer);
        drawRow('Metode Pembayaran', 'FazzPay Saldo');
        drawRow('Nama Merchant / Owner', owner_name);
        drawRow('Username Owner', displayOwnerUsername);
        drawRow('Status', 'SUKSES / PAID', true);

        // --- FOOTER & WATERMARK ---
        currentY = height - 100;
        
        // Garis Pembatas Bawah
        ctx.strokeStyle = '#F3F4F6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, currentY);
        ctx.lineTo(width - 40, currentY);
        ctx.stroke();

        currentY += 35;
        
        // Terima kasih
        ctx.fillStyle = '#9CA3AF';
        ctx.font = 'italic 12px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Terima kasih telah menggunakan layanan kami.', width / 2, currentY);

        currentY += 25;

        // WATERMARK UTAMA (fazzpaypic.vercel.app)
        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 13px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('fazzpaypic.vercel.app', width / 2, currentY);

        // Kirim response berupa PNG Buffer langsung
        const buffer = canvas.toBuffer('image/png');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Gagal merender gambar bukti transaksi.",
            error: error.message
        });
    }
});

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

// Helper: Ubah kegelapan warna (hex) untuk gradasi dinamis
function adjustColorBrightness(hex, percent) {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = (R > 0) ? R : 0;
    G = (G > 0) ? G : 0;
    B = (B > 0) ? B : 0;

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

// Handler Default untuk vercel function environment
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Listen server jika dijalankan lokal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app
