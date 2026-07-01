
const express = require('express');
const { createCanvas } = require('canvas');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Key yang valid secara ketat
const VALID_API_KEY = "fazzganzz";

// Helper untuk memotong teks yang terlalu panjang secara aman
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

// Helper menggambar rounded rectangle
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

// Helper menggambar centang sukses
function drawSuccessCheckmark(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#00C896';
  ctx.fill();
  
  ctx.beginPath();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.moveTo(cx - radius * 0.4, cy + radius * 0.05);
  ctx.lineTo(cx - radius * 0.1, cy + radius * 0.35);
  ctx.lineTo(cx + radius * 0.45, cy - radius * 0.25);
  ctx.stroke();
}

// Endpoint utama penghasil gambar struk
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

  // Validasi Kunci API secara ketat
  if (apiKey !== VALID_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Validasi kelengkapan parameter
  if (!amount || !buyerName || !ownerName || !transactionId || !productName || !dateTime) {
    return res.status(400).json({ error: "Mohon isi semua field formulir." });
  }

  try {
    // Ukuran Canvas Ultra-HD (1080x1920 piksel, portrait) untuk cetakan tajam
    const width = 1080;
    const height = 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Pengaturan Skema Desain berdasarkan Pilihan Template
    let bgColor = '#0B0F14';
    let cardColor = '#121821';
    let textPrimary = '#EAF2FF';
    let textSecondary = '#8FA3BF';
    let accentColor = '#00C896';
    let isGlass = false;

    if (template === "fintech") {
      bgColor = '#080C11';
      cardColor = '#151D2A';
      accentColor = '#1E90FF';
      textPrimary = '#FFFFFF';
      textSecondary = '#9AB2D3';
    } else if (template === "glass") {
      bgColor = '#040608';
      cardColor = 'rgba(255, 255, 255, 0.04)';
      accentColor = '#00C896';
      textPrimary = '#F3F7FC';
      textSecondary = '#7E91AA';
      isGlass = true;
    }

    // Menggunakan font standar Cairo/Pango 'sans-serif' agar tidak rusak/kotak-kotak di Linux/Vercel Serverless
    const fontName = 'sans-serif';

    // 1. Render Background Utama
    if (template === "glass") {
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#090E15');
      bgGrad.addColorStop(0.5, '#05070A');
      bgGrad.addColorStop(1, '#13111C');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Gambar bias cahaya estetik
      ctx.beginPath();
      ctx.arc(200, 400, 350, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 200, 150, 0.08)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(900, 1500, 450, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(30, 144, 255, 0.08)';
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

    // 2. Judul Aplikasi Teratas
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00C896';
    ctx.font = `bold 38px ${fontName}`;
    ctx.fillText("FazzPay Digital Receipt", width / 2, 130);

    // 3. Gambar Box Kartu Struk Utama
    const cardX = 90;
    const cardY = 200;
    const cardW = 900;
    const cardH = 1530;
    const cardRadius = 36;

    if (isGlass) {
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius, 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.12)', 2.5);
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
      
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius, cardColor);
      
      // Reset bayangan
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // 4. Status Centang Sukses Transaksi
    const checkY = cardY + 110;
    drawSuccessCheckmark(ctx, width / 2, checkY, 65);

    ctx.textAlign = 'center';
    ctx.fillStyle = textPrimary;
    ctx.font = `600 44px ${fontName}`;
    ctx.fillText("Pembayaran Sukses", width / 2, checkY + 125);

    ctx.fillStyle = '#00C896';
    ctx.font = `bold 28px ${fontName}`;
    ctx.fillText("VERIFIED BY FAZZPAY", width / 2, checkY + 180);

    // 5. Nominal Uang Pembayaran (Sangat Menonjol)
    const amountY = checkY + 310;
    ctx.fillStyle = textSecondary;
    ctx.font = `300 28px ${fontName}`;
    ctx.fillText("TOTAL PEMBAYARAN", width / 2, amountY);

    ctx.fillStyle = textPrimary;
    ctx.font = `bold 84px ${fontName}`;
    ctx.fillText(amount, width / 2, amountY + 110);

    // Garis Titik-titik (Dashed Divider)
    const divY = amountY + 190;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(cardX + 60, divY);
    ctx.lineTo(cardX + cardW - 60, divY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset ke solid

    // 6. Rincian Detail Transaksi (Teks Rapi & Terpotong Aman)
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
      
      // Gambar Label Kiri
      ctx.textAlign = 'left';
      ctx.fillStyle = textSecondary;
      ctx.font = `30px ${fontName}`;
      ctx.fillText(item.label, labelX, currentY);

      // Gambar Nilai Kanan
      ctx.textAlign = 'right';
      if (item.label === "Status Transaksi") {
        ctx.fillStyle = '#00C896';
        ctx.font = `bold 30px ${fontName}`;
      } else {
        ctx.fillStyle = textPrimary;
        ctx.font = `600 30px ${fontName}`;
      }

      // Truncate untuk mencegah teks saling bertumpuk
      const maxValWidth = 470;
      const safeValue = truncateText(ctx, item.val, maxValWidth);
      ctx.fillText(safeValue, valueX, currentY);
    });

    // Garis Batas Bawah Sebelum Watermark
    const bottomDivY = startDetailsY + (details.length * rowHeight) + 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 60, bottomDivY);
    ctx.lineTo(cardX + cardW - 60, bottomDivY);
    ctx.stroke();

    // 7. Watermark Pembuat & Footer
    const watermarkY = bottomDivY + 80;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = `bold 28px ${fontName}`;
    ctx.fillText("fazzpaypic.vercel.app", width / 2, watermarkY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.font = `24px ${fontName}`;
    ctx.fillText("Struk digital ini sah dan diproses secara instan oleh sistem pembayaran FazzPay.", width / 2, watermarkY + 50);

    // Kirim gambar hasil rendering langsung sebagai stream PNG
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);

  } catch (error) {
    console.error("Kesalahan pembuatan canvas gambar:", error);
    return res.status(500).json({ error: "Gagal menggambar struk transfer digital." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FazzPay Server running on port ${PORT}`);
});

