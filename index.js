
// Backend Serverless FazzPay - Menggunakan @napi-rs/canvas (Rust Engine) untuk Kecepatan Tinggi & Bebas Crash di Vercel
const express = require('express');
const { createCanvas } = require('@napi-rs/canvas');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Key Rahasia
const REQUIRED_API_KEY = "fazzganzz";

// Fungsi pembantu untuk membuat kotak melengkung (Rounded Rectangle) dengan bayangan berkualitas tinggi
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle, strokeWidth) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }
}

// Endpoint API Pembuat Bukti Transfer PNG Ultra HD (2160 x 3840 Pixel)
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

    // Validasi Keamanan API Key
    if (!apiKey || apiKey !== REQUIRED_API_KEY) {
        return res.status(401).json({ error: "Kunci API tidak valid atau tidak diizinkan." });
    }

    // Validasi data wajib isi
    if (!amount || !buyerName || !ownerName || !transactionId || !productName) {
        return res.status(400).json({ error: "Semua parameter transaksi wajib diisi." });
    }

    try {
        // Skala 2x dari 1080x1920 untuk detail Ultra HD 4K (2160 x 3840) agar tidak burik
        const width = 2160;
        const height = 3840;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Optimasi Anti-Aliasing Teks dan Gambar
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const formattedDateTime = dateTime ? dateTime.replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');
        const displayBuyer = `@${buyerUsername || 'buyer'}`;
        const displayOwner = `@${ownerUsername || 'owner'}`;

        // ================= TEMPLATE RENDERING (ULTRA HD STYLING) =================
        if (template === 'glass') {
            // --- TEMPLATE: DARK GLASS ---
            // Background Gradasi Premium
            const bgGrad = ctx.createLinearGradient(0, 0, width, height);
            bgGrad.addColorStop(0, '#06090E');
            bgGrad.addColorStop(0.5, '#0B121E');
            bgGrad.addColorStop(1, '#05070A');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // Cahaya Neon Estetis Kiri Atas
            const radialGlow1 = ctx.createRadialGradient(400, 600, 20, 400, 600, 1200);
            radialGlow1.addColorStop(0, 'rgba(0, 200, 150, 0.22)');
            radialGlow1.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radialGlow1;
            ctx.beginPath();
            ctx.arc(400, 600, 1200, 0, Math.PI * 2);
            ctx.fill();

            // Cahaya Neon Estetis Kanan Bawah
            const radialGlow2 = ctx.createRadialGradient(1800, 2800, 20, 1800, 2800, 1400);
            radialGlow2.addColorStop(0, 'rgba(30, 144, 255, 0.22)');
            radialGlow2.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radialGlow2;
            ctx.beginPath();
            ctx.arc(1800, 2800, 1400, 0, Math.PI * 2);
            ctx.fill();

            // Kartu Utama Glassmorphic (Tebal, Padat, Rapi)
            const cX = 200;
            const cY = 440;
            const cW = 1760;
            const cH = 2900;
            const cRadius = 80;

            const glassBorder = ctx.createLinearGradient(cX, cY, cX + cW, cY + cH);
            glassBorder.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
            glassBorder.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
            glassBorder.addColorStop(1, 'rgba(0, 200, 150, 0.35)');

            drawRoundedRect(ctx, cX, cY, cW, cH, cRadius, 'rgba(20, 28, 41, 0.82)', glassBorder, 7);

            // Lingkaran Centang Sukses
            const checkX = width / 2;
            const checkY = cY + 320;
            ctx.beginPath();
            ctx.arc(checkX, checkY, 120, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 200, 150, 0.2)';
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 9;
            ctx.fill();
            ctx.stroke();

            // Simbol Centang Putih
            ctx.beginPath();
            ctx.moveTo(checkX - 50, checkY + 4);
            ctx.lineTo(checkX - 16, checkY + 38);
            ctx.lineTo(checkX + 50, checkY - 32);
            ctx.strokeStyle = '#EAF2FF';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Teks Header Berhasil
            ctx.fillStyle = '#EAF2FF';
            ctx.font = '900 72px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Pembayaran Berhasil', checkX, checkY + 240);

            ctx.fillStyle = '#8FA3BF';
            ctx.font = 'bold 44px sans-serif';
            ctx.fillText('TOTAL NOMINAL TRANSAKSI', checkX, checkY + 330);

            // Teks Jumlah Nominal (Besar, Tebal, Anti-Pecah)
            ctx.fillStyle = '#00C896';
            ctx.font = '900 160px sans-serif';
            ctx.fillText(`Rp ${amount}`, checkX, checkY + 540);

            // Pembatas Utama
            ctx.beginPath();
            ctx.moveTo(cX + 120, checkY + 660);
            ctx.lineTo(cX + cW - 120, checkY + 660);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Gambar List Detail Informasi Transaksi
            const detailsY = checkY + 800;
            const items = [
                { k: 'PRODUK / LAYANAN', v: productName, isAccent: true },
                { k: 'ID TRANSAKSI', v: transactionId },
                { k: 'PENGIRIM / PEMBELI', v: `${buyerName} (${displayBuyer})` },
                { k: 'PENERIMA / MERCHANT', v: `${ownerName} (${displayOwner})` },
                { k: 'WAKTU TRANSAKSI', v: formattedDateTime }
            ];

            items.forEach((item, index) => {
                const currentY = detailsY + (index * 260);

                // Menggambar Kunci Informasi (Sebelah Kiri)
                ctx.textAlign = 'left';
                ctx.fillStyle = '#8FA3BF';
                ctx.font = 'bold 44px sans-serif';
                ctx.fillText(item.k, cX + 140, currentY);

                // Menggambar Nilai Informasi (Sebelah Kanan)
                ctx.textAlign = 'right';
                ctx.fillStyle = item.isAccent ? '#00C896' : '#EAF2FF';
                ctx.font = '900 48px sans-serif';

                let txt = item.v;
                if (txt.length > 28) txt = txt.substring(0, 25) + "...";
                ctx.fillText(txt, cX + cW - 140, currentY);

                // Garis Bantu Pemisah Antar Kolom
                if (index < items.length - 1) {
                    ctx.beginPath();
                    ctx.moveTo(cX + 140, currentY + 80);
                    ctx.lineTo(cX + cW - 140, currentY + 80);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            });

            // Footer Jaminan Kotak di bagian bawah kartu
            const fBoxY = cH + 160;
            drawRoundedRect(ctx, cX + 80, fBoxY, cW - 160, 200, 36, 'rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.06)', 3);
            ctx.fillStyle = '#8FA3BF';
            ctx.font = 'italic bold 44px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✓ Diverifikasi Aman oleh Jaringan Secure FazzPay', checkX, fBoxY + 115);

        } else if (template === 'fintech') {
            // --- TEMPLATE: FINTECH CARD ---
            ctx.fillStyle = '#0A0E15';
            ctx.fillRect(0, 0, width, height);

            const cX = 180;
            const cY = 360;
            const cW = 1800;
            const cH = 3060;
            const cRadius = 70;

            // Kartu Dasar Solid
            drawRoundedRect(ctx, cX, cY, cW, cH, cRadius, '#121A26', '#1E293B', 5);

            // Header berwarna gradien mengkilap di bagian atas kartu
            ctx.save();
            // Path kliping untuk sudut bulat bagian atas saja
            ctx.beginPath();
            ctx.moveTo(cX + cRadius, cY);
            ctx.lineTo(cX + cW - cRadius, cY);
            ctx.quadraticCurveTo(cX + cW, cY, cX + cW, cY + cRadius);
            ctx.lineTo(cX + cW, cY + 560);
            ctx.lineTo(cX, cY + 560);
            ctx.lineTo(cX, cY + cRadius);
            ctx.quadraticCurveTo(cX, cY, cX + cRadius, cY);
            ctx.closePath();
            ctx.clip();

            const headerGrad = ctx.createLinearGradient(cX, cY, cX + cW, cY + 560);
            headerGrad.addColorStop(0, '#00C896');
            headerGrad.addColorStop(1, '#1E90FF');
            ctx.fillStyle = headerGrad;
            ctx.fillRect(cX, cY, cW, 560);
            ctx.restore();

            // Centang Putih di Header
            const checkX = width / 2;
            const checkY = cY + 280;
            ctx.beginPath();
            ctx.arc(checkX, checkY, 110, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(checkX - 44, checkY + 4);
            ctx.lineTo(checkX - 12, checkY + 34);
            ctx.lineTo(checkX + 44, checkY - 28);
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Teks Judul
            ctx.fillStyle = '#EAF2FF';
            ctx.font = '900 76px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('BUKTI TRANSFER DIGITAL', checkX, cY + 740);

            // Jumlah Uang Nominal
            ctx.fillStyle = '#00C896';
            ctx.font = '900 170px sans-serif';
            ctx.fillText(`Rp ${amount}`, checkX, cY + 980);

            ctx.fillStyle = '#8FA3BF';
            ctx.font = 'bold 46px sans-serif';
            ctx.fillText(productName.toUpperCase(), checkX, cY + 1100);

            // Pembatas Garis Putus-putus Tebal dan Padat
            ctx.beginPath();
            ctx.setLineDash([24, 20]);
            ctx.moveTo(cX + 100, cY + 1220);
            ctx.lineTo(cX + cW - 100, cY + 1220);
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.setLineDash([]); // Reset

            // Detail Informasi
            const listY = cY + 1360;
            const fields = [
                { k: "Nama Pengirim", v: buyerName },
                { k: "Username Pengirim", v: displayBuyer },
                { k: "Nama Penerima", v: ownerName },
                { k: "Username Penerima", v: displayOwner },
                { k: "Nomor Referensi", v: transactionId },
                { k: "Tanggal & Waktu", v: formattedDateTime }
            ];

            fields.forEach((field, index) => {
                const currentY = listY + (index * 230);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#8FA3BF';
                ctx.font = 'bold 44px sans-serif';
                ctx.fillText(field.k, cX + 120, currentY);

                ctx.textAlign = 'right';
                ctx.fillStyle = '#EAF2FF';
                ctx.font = '900 46px sans-serif';
                ctx.fillText(field.v, cX + cW - 120, currentY);

                ctx.beginPath();
                ctx.moveTo(cX + 120, currentY + 70);
                ctx.lineTo(cX + cW - 120, currentY + 70);
                ctx.strokeStyle = '#1E293B';
                ctx.lineWidth = 3;
                ctx.stroke();
            });

            // Teks Jaminan Sah
            ctx.textAlign = 'center';
            ctx.fillStyle = '#1E90FF';
            ctx.font = '900 44px sans-serif';
            ctx.fillText('✓ Dokumen Elektronik Sah Berenkripsi End-To-End', checkX, cY + 2840);

        } else {
            // --- TEMPLATE: MINIMAL CLEAN (Bawaan Standard) ---
            ctx.fillStyle = '#0B0F14';
            ctx.fillRect(0, 0, width, height);

            const cX = 220;
            const cY = 480;
            const cW = 1720;
            const cH = 2760;

            // Kartu Utama Minimalis
            drawRoundedRect(ctx, cX, cY, cW, cH, 48, '#121821', 'rgba(255,255,255,0.06)', 3);

            // Centang Hijau
            const checkX = width / 2;
            const checkY = cY + 320;
            ctx.beginPath();
            ctx.arc(checkX, checkY, 120, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 200, 150, 0.1)';
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 7;
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(checkX - 40, checkY + 4);
            ctx.lineTo(checkX - 12, checkY + 32);
            ctx.lineTo(checkX + 44, checkY - 28);
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 12;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Judul
            ctx.fillStyle = '#EAF2FF';
            ctx.font = '900 76px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Bukti Transaksi', checkX, cY + 560);

            ctx.fillStyle = '#8FA3BF';
            ctx.font = 'bold 44px sans-serif';
            ctx.fillText('Berhasil Dikirim ke Merchant', checkX, cY + 660);

            // Nominal
            ctx.fillStyle = '#EAF2FF';
            ctx.font = '900 192px sans-serif';
            ctx.fillText(`Rp ${amount}`, checkX, cY + 970);

            ctx.fillStyle = '#00C896';
            ctx.font = 'bold 46px sans-serif';
            ctx.fillText(`Untuk Layanan: ${productName}`, checkX, cY + 1090);

            // Pembatas Solid
            ctx.beginPath();
            ctx.moveTo(cX + 160, cY + 1210);
            ctx.lineTo(cX + cW - 160, cY + 1210);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // List Detail
            const dataY = cY + 1400;
            const listItems = [
                { k: "Akun Pengirim", v: `${buyerName} (${displayBuyer})` },
                { k: "Diterima Oleh", v: `${ownerName} (${displayOwner})` },
                { k: "Kode Referensi", v: transactionId },
                { k: "Waktu Transaksi", v: formattedDateTime }
            ];

            listItems.forEach((item, index) => {
                const currentY = dataY + (index * 270);

                ctx.textAlign = 'left';
                ctx.fillStyle = '#8FA3BF';
                ctx.font = 'bold 44px sans-serif';
                ctx.fillText(item.k, cX + 160, currentY);

                ctx.textAlign = 'right';
                ctx.fillStyle = '#EAF2FF';
                ctx.font = '900 46px sans-serif';
                
                let val = item.v;
                if (val.length > 32) val = val.substring(0, 29) + "...";
                ctx.fillText(val, cX + cW - 160, currentY);

                ctx.beginPath();
                ctx.moveTo(cX + 160, currentY + 90);
                ctx.lineTo(cX + cW - 160, currentY + 90);
                ctx.strokeStyle = 'rgba(255,255,255,0.04)';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // Footer Penutup
            ctx.textAlign = 'center';
            ctx.fillStyle = '#8FA3BF';
            ctx.font = 'bold 44px sans-serif';
            ctx.fillText('🔒 Dokumen Resmi Transfer FazzPay', checkX, cY + 2520);
        }

        // ================= WATERMARK WAJIB SISI BAWAH KANVAS =================
        ctx.fillStyle = 'rgba(143, 163, 191, 0.45)';
        ctx.font = '900 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('fazzpaypic.vercel.app', width / 2, height - 160);

        // Export Buffer Gambar PNG Murni Tanpa Hambatan
        const buffer = canvas.toBuffer('image/png');

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="receipt.png"');
        return res.status(200).send(buffer);

    } catch (err) {
        console.error("Kesalahan rendering gambar:", err);
        return res.status(500).json({ error: "Gagal menggambar bukti transfer menggunakan Rust Canvas Engine.", details: err.message });
    }
});

// Jalankan server lokal
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FazzPay Premium Rust Canvas Server berjalan sempurna di port ${PORT}`);
});

module.exports = app;
