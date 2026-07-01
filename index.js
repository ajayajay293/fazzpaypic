
const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gunakan API Key yang sudah ditentukan secara ketat
const VALID_API_KEY = "fazzganzz";

// Helper untuk memotong teks jika terlalu panjang agar tidak merusak tata letak
function truncateText(ctx, text, maxWidth) {
  if (!text) return "";
  let width = ctx.measureText(text).width;
  if (width <= maxWidth) return text;
  
  let truncated = text;
  while (width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
    width = ctx.measureText(truncated + "...").width;
  }
  return truncated + "...";
}

// Helper untuk menggambar kotak berujung bulat (rounded rectangle)
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle = null, strokeWidth = 1) {
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

// Helper untuk menggambar ikon checklist sukses
function drawSuccessCheckmark(ctx, cx, cy, radius) {
  // Lingkaran luar hijau toska fintech
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#00C896';
  ctx.fill();
  
  // Tanda centang putih di dalam lingkaran
  ctx.beginPath();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Koordinat relatif tanda centang
  ctx.moveTo(cx - radius * 0.4, cy + radius * 0.05);
  ctx.lineTo(cx - radius * 0.1, cy + radius * 0.35);
  ctx.lineTo(cx + radius * 0.45, cy - radius * 0.25);
  ctx.stroke();
}

// Endpoint utama untuk menggenerasi gambar struk pembayaran
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
    template = "minimal"
  } = req.body;

  // Validasi Kunci API secara ketat sesuai instruksi core
  if (apiKey !== VALID_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Validasi parameter wajib
  if (!amount || !buyerName || !ownerName || !transactionId || !productName || !dateTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Ukuran Canvas Ultra-HD (1080x1920 piksel, portrait) untuk cetakan super tajam
    const width = 1080;
    const height = 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Pengaturan Gaya Desain berdasarkan Template
    let bgColor = '#0B0F14';
    let cardColor = '#121821';
    let textPrimary = '#EAF2FF';
    let textSecondary = '#8FA3BF';
    let accentColor = '#00C896';
    let isGlass = false;

    if (template === "fintech") {
      // Tema 2: Premium Fintech Card (Ada gradasi biru dan sentuhan aksen modern)
      bgColor = '#080C11';
      cardColor = '#151D2A';
      accentColor = '#1E90FF';
      textPrimary = '#FFFFFF';
      textSecondary = '#9AB2D3';
    } else if (template === "glass") {
      // Tema 3: Dark Glassmorphism (Gradasi gelap dengan efek blur virtual)
      bgColor = '#040608';
      cardColor = 'rgba(255, 255, 255, 0.04)';
      accentColor = '#00C896';
      textPrimary = '#F3F7FC';
      textSecondary = '#7E91AA';
      isGlass = true;
    }

    // 1. Gambar Background Utama
    if (template === "glass") {
      // Membuat gradasi warna futuristik di latar belakang untuk menunjang efek kaca transparan
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#090E15');
      bgGrad.addColorStop(0.5, '#05070A');
      bgGrad.addColorStop(1, '#13111C');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Gambar bola-bola cahaya lembut di belakang kaca untuk menambah nilai estetik
      ctx.beginPath();
      ctx.arc(200, 400, 300, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 200, 150, 0.07)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(900, 1500, 400, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(30, 144, 255, 0.07)';
      ctx.fill();
    } else if (template === "fintech") {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#060B11');
      bgGrad.addColorStop(1, '#0C1522');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Gambar Header Aplikasi "FazzPay"
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00C896';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText("FazzPay Digital Receipt", width / 2, 130);

    // 3. Rancang Area Kartu Utama Struk (Main Receipt Card Box)
    const cardX = 90;
    const cardY = 200;
    const cardW = 900;
    const cardH = 1530;
    const cardRadius = 36;

    if (isGlass) {
      // Gambar background glassmorphic tipis dengan border bercahaya halus
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius, 'rgba(255, 255, 255, 0.045)', 'rgba(255, 255, 255, 0.08)', 2);
    } else {
      // Gambar bayangan halus (soft shadow) di bawah kartu
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
      
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius, cardColor);
      
      // Matikan efek bayangan agar tidak merusak elemen teks
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // 4. Status Transaksi & Ikon Checklist Sukses
    const checkY = cardY + 110;
    drawSuccessCheckmark(ctx, width / 2, checkY, 65);

    ctx.textAlign = 'center';
    ctx.fillStyle = textPrimary;
    ctx.font = '600 42px sans-serif';
    ctx.fillText("Pembayaran Sukses", width / 2, checkY + 120);

    ctx.fillStyle = '#00C896';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText("DIVERIFIKASI OLEH FAZZPAY", width / 2, checkY + 175);

    // 5. Informasi Nominal Pembayaran Utama (Jumlah Besar)
    const amountY = checkY + 310;
    
    // Header label jumlah nominal
    ctx.fillStyle = textSecondary;
    ctx.font = '300 28px sans-serif';
    ctx.fillText("TOTAL PEMBAYARAN", width / 2, amountY);

    // Nilai nominal uang utama (diperbesar tebal)
    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 88px sans-serif';
    ctx.fillText(amount, width / 2, amountY + 110);

    // Garis Pemisah (Divider) dengan gaya titik/dash elegan
    const divY = amountY + 190;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(cardX + 60, divY);
    ctx.lineTo(cardX + cardW - 60, divY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash ke solid kembali

    // 6. List Detail Transaksi (Kiri: Label, Kanan: Nilai)
    const startDetailsY = divY + 80;
    const rowHeight = 90;
    const labelX = cardX + 70;
    const valueX = cardX + cardW - 70;

    const details = [
      { label: "Produk / Layanan", val: productName },
      { label: "Penerima (Merchant)", val: `${ownerName} (${ownerUsername || '@fazzowner'})` },
      { label: "Pengirim (Pembeli)", val: `${buyerName} (${buyerUsername || '@fazzbuyer'})` },
      { label: "ID Transaksi", val: transactionId },
      { label: "Tanggal & Waktu", val: dateTime },
      { label: "Metode Pembayaran", val: "FazzPay E-Wallet" },
      { label: "Status Transaksi", val: "Selesai / Berhasil" }
    ];

    details.forEach((item, index) => {
      const currentY = startDetailsY + (index * rowHeight);
      
      // Label di sebelah kiri
      ctx.textAlign = 'left';
      ctx.fillStyle = textSecondary;
      ctx.font = '30px sans-serif';
      ctx.fillText(item.label, labelX, currentY);

      // Value di sebelah kanan
      ctx.textAlign = 'right';
      if (item.label === "Status Transaksi") {
        ctx.fillStyle = '#00C896'; // Beri warna hijau khusus pada label status sukses
        ctx.font = 'bold 30px sans-serif';
      } else {
        ctx.fillStyle = textPrimary;
        ctx.font = '600 30px sans-serif';
      }

      // Potong nilai secara otomatis menggunakan helper jika terlalu panjang
      const maxValWidth = 460;
      const safeValue = truncateText(ctx, item.val, maxValWidth);
      ctx.fillText(safeValue, valueX, currentY);
    });

    // Garis Pembatas Bawah sebelum Watermark
    const bottomDivY = startDetailsY + (details.length * rowHeight) + 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, bottomDivY);
    ctx.lineTo(cardX + cardW - 60, bottomDivY);
    ctx.stroke();

    // 7. Keamanan Keaslian / Watermark Tanda Tangan Digital
    const watermarkY = bottomDivY + 80;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '28px sans-serif';
    ctx.fillText("fazzpaypic.vercel.app", width / 2, watermarkY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.font = '24px sans-serif';
    ctx.fillText("Struk digital ini sah dan diterbitkan secara instan oleh sistem pembayaran terenkripsi FazzPay.", width / 2, watermarkY + 50);

    // Mengirimkan hasil gambar akhir berformat PNG langsung ke klien
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);

  } catch (error) {
    console.error("Error generating canvas image:", error);
    return res.status(500).json({ error: "Gagal memproses gambar struk transaksi" });
  }
});

// Jalankan server lokal di port 3000 jika dijalankan langsung
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FazzPay Server running perfectly on port ${PORT}`);
});
