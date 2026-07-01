
const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static UI assets locally or serve dynamically
app.use(express.static(path.join(__dirname, 'public')));

// Secure API Key Rule
const REQUIRED_API_KEY = "fazzganzz";

// Helper to draw rounded rectangles
function drawRoundRect(ctx, x, y, width, height, radius, fillStyle = null, strokeStyle = null, lineWidth = 1) {
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
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

// Generate receipt endpoint
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
        template = 'minimal' // 'minimal', 'fintech', 'glass'
    } = req.body;

    // Strict authentication verification
    if (!apiKey || apiKey !== REQUIRED_API_KEY) {
        return res.status(401).json({ error: "Unauthorized. Invalid or missing API Key." });
    }

    // Required fields validation
    if (!amount || !buyerName || !ownerName || !transactionId || !productName) {
        return res.status(400).json({ error: "Missing required fields for receipt generation." });
    }

    try {
        // High resolution Canvas 1080x1920 (2K portrait receipt format)
        const canvasWidth = 1080;
        const canvasHeight = 1920;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Clean Canvas rendering parameters
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Set layout variables
        const displayDateTime = dateTime ? dateTime.replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' ');

        // ================= TEMPLATE RENDERING =================
        if (template === 'glass') {
            // Theme: Dark Glass
            // 1. Base dark futuristic grid/gradient background
            const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            bgGrad.addColorStop(0, '#06090e');
            bgGrad.addColorStop(0.5, '#0b121e');
            bgGrad.addColorStop(1, '#05070a');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Draw abstract cyber glows
            ctx.beginPath();
            const radGrad1 = ctx.createRadialGradient(200, 300, 10, 200, 300, 600);
            radGrad1.addColorStop(0, 'rgba(0, 200, 150, 0.15)');
            radGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = radGrad1;
            ctx.arc(200, 300, 600, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            const radGrad2 = ctx.createRadialGradient(900, 1400, 10, 900, 1400, 700);
            radGrad2.addColorStop(0, 'rgba(30, 144, 255, 0.15)');
            radGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = radGrad2;
            ctx.arc(900, 1400, 700, 0, Math.PI * 2);
            ctx.fill();

            // 2. Receipt Container glass background
            const receiptX = 100;
            const receiptY = 220;
            const receiptW = 880;
            const receiptH = 1450;
            const radius = 40;

            // Glass reflection gradient stroke
            const glassStroke = ctx.createLinearGradient(receiptX, receiptY, receiptX + receiptW, receiptY + receiptH);
            glassStroke.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
            glassStroke.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
            glassStroke.addColorStop(1, 'rgba(0, 200, 150, 0.2)');

            drawRoundRect(ctx, receiptX, receiptY, receiptW, receiptH, radius, 'rgba(20, 28, 41, 0.75)', glassStroke, 3);

            // 3. Status Circle & Check Icon (Glassy neon glow)
            const checkX = canvasWidth / 2;
            const checkY = receiptY + 160;
            ctx.shadowColor = '#00C896';
            ctx.shadowBlur = 30;
            
            ctx.beginPath();
            ctx.arc(checkX, checkY, 60, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 200, 150, 0.2)';
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 4;
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow

            // Checkmark Path drawing
            ctx.beginPath();
            ctx.moveTo(checkX - 25, checkY + 2);
            ctx.lineTo(checkX - 8, checkY + 20);
            ctx.lineTo(checkX + 25, checkY - 15);
            ctx.strokeStyle = '#EAF2FF';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Status Text
            ctx.fillStyle = '#EAF2FF';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Payment Successful', checkX, checkY + 120);

            // Amount Banner
            ctx.fillStyle = '#8FA3BF';
            ctx.font = '28px sans-serif';
            ctx.fillText('TOTAL TRANSACTED AMOUNT', checkX, checkY + 190);

            ctx.fillStyle = '#00C896';
            ctx.font = '900 78px sans-serif';
            ctx.fillText(amount, checkX, checkY + 290);

            // Subtle divider line
            ctx.beginPath();
            ctx.moveTo(receiptX + 60, checkY + 360);
            ctx.lineTo(receiptX + receiptW - 60, checkY + 360);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // List Details
            const startDetailsY = checkY + 440;
            const leftColX = receiptX + 80;
            const rightColX = receiptX + receiptW - 80;

            const details = [
                { label: 'PRODUCT / SERVICE', value: productName, highlight: true },
                { label: 'TRANSACTION ID', value: transactionId },
                { label: 'SENDER / BUYER', value: `${buyerName} (@${buyerUsername || 'buyer'})` },
                { label: 'MERCHANT / OWNER', value: `${ownerName} (@${ownerUsername || 'owner'})` },
                { label: 'DATE AND TIME', value: displayDateTime }
            ];

            details.forEach((item, index) => {
                const currentY = startDetailsY + (index * 130);

                // Draw sub-labels
                ctx.textAlign = 'left';
                ctx.fillStyle = '#8FA3BF';
                ctx.font = '24px sans-serif';
                ctx.fillText(item.label, leftColX, currentY);

                // Draw values
                ctx.textAlign = 'right';
                ctx.fillStyle = item.highlight ? '#00C896' : '#EAF2FF';
                ctx.font = 'bold 28px sans-serif';
                
                // Truncate logic if too long
                let textVal = item.value;
                if (textVal.length > 28) {
                    textVal = textVal.substring(0, 25) + "...";
                }
                ctx.fillText(textVal, rightColX, currentY);

                // Underline helper dots for structure
                if (index < details.length - 1) {
                    ctx.beginPath();
                    ctx.setLineDash([4, 6]);
                    ctx.moveTo(leftColX, currentY + 40);
                    ctx.lineTo(rightColX, currentY + 40);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.setLineDash([]); // Reset
                }
            });

            // Footer brand banner inside card
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            drawRoundRect(ctx, receiptX + 40, receiptH + 80, receiptW - 80, 110, 20, 'rgba(0, 0, 0, 0.2)', 'rgba(255,255,255,0.06)', 1.5);
            
            ctx.fillStyle = '#8FA3BF';
            ctx.font = 'italic 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Transaction verified by FazzPay Secure Network', checkX, receiptH + 146);

        } else if (template === 'fintech') {
            // Theme: Fintech Card (Card Deck gradient top, gorgeous high-contrast blue-green theme)
            ctx.fillStyle = '#0A0E15';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Receipt Container Card
            const receiptX = 90;
            const receiptY = 180;
            const receiptW = 900;
            const receiptH = 1530;
            const radius = 35;

            // Main white-ish gray solid receipt card
            drawRoundRect(ctx, receiptX, receiptY, receiptW, receiptH, radius, '#121A26', '#1E293B', 2);

            // Top Gradient header bar inside card
            ctx.save();
            ctx.beginPath();
            // Create a path representing top rounded corner deck
            ctx.moveTo(receiptX + radius, receiptY);
            ctx.lineTo(receiptX + receiptW - radius, receiptY);
            ctx.quadraticCurveTo(receiptX + receiptW, receiptY, receiptX + receiptW, receiptY + radius);
            ctx.lineTo(receiptX + receiptW, receiptY + 280);
            ctx.lineTo(receiptX, receiptY + 280);
            ctx.lineTo(receiptX, receiptY + radius);
            ctx.quadraticCurveTo(receiptX, receiptY, receiptX + radius, receiptY);
            ctx.closePath();
            ctx.clip();

            const topGrad = ctx.createLinearGradient(receiptX, receiptY, receiptX + receiptW, receiptY + 280);
            topGrad.addColorStop(0, '#00C896');
            topGrad.addColorStop(1, '#1E90FF');
            ctx.fillStyle = topGrad;
            ctx.fill();
            ctx.restore();

            // Status within fintech card
            const checkX = canvasWidth / 2;
            const checkY = receiptY + 140;

            // Pure white checkmark disc
            ctx.beginPath();
            ctx.arc(checkX, checkY, 55, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Check icon in green
            ctx.beginPath();
            ctx.moveTo(checkX - 22, checkY + 2);
            ctx.lineTo(checkX - 7, checkY + 17);
            ctx.lineTo(checkX + 22, checkY - 14);
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Success Label inside grey card body
            ctx.fillStyle = '#EAF2FF';
            ctx.font = 'bold 38px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('TRANSFER RECEIPT', checkX, receiptY + 360);

            // Big amount area
            ctx.fillStyle = '#00C896';
            ctx.font = '900 85px sans-serif';
            ctx.fillText(amount, checkX, receiptY + 470);

            ctx.fillStyle = '#8FA3BF';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText(productName.toUpperCase(), checkX, receiptY + 530);

            // Dashed Divider line
            ctx.beginPath();
            ctx.setLineDash([12, 10]);
            ctx.moveTo(receiptX + 50, receiptY + 590);
            ctx.lineTo(receiptX + receiptW - 50, receiptY + 590);
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.setLineDash([]); // Reset

            // Detail fields placement
            const detailsY = receiptY + 660;
            const paddingX = 150;

            const fields = [
                { k: "Sender Profile", v: buyerName },
                { k: "Sender Username", v: `@${buyerUsername || 'buyer'}` },
                { k: "Receiver Merchant", v: ownerName },
                { k: "Merchant Username", v: `@${ownerUsername || 'owner'}` },
                { k: "Transaction ID", v: transactionId },
                { k: "Processed On", v: displayDateTime }
            ];

            fields.forEach((field, idx) => {
                const currentY = detailsY + (idx * 115);

                // Draw label left
                ctx.textAlign = 'left';
                ctx.fillStyle = '#8FA3BF';
                ctx.font = '24px sans-serif';
                ctx.fillText(field.k, receiptX + 60, currentY);

                // Draw value right
                ctx.textAlign = 'right';
                ctx.fillStyle = '#EAF2FF';
                ctx.font = 'bold 26px sans-serif';
                ctx.fillText(field.v, receiptX + receiptW - 60, currentY);

                // Draw separation line
                ctx.beginPath();
                ctx.moveTo(receiptX + 60, currentY + 35);
                ctx.lineTo(receiptX + receiptW - 60, currentY + 35);
                ctx.strokeStyle = '#1E293B';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Security assurance line
            ctx.fillStyle = '#1E90FF';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✓ End-To-End Encrypted Financial Receipt', checkX, receiptY + 1420);

        } else {
            // Theme: Minimal Clean (Clean professional modern contrast theme)
            ctx.fillStyle = '#0B0F14';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Receipt card body
            const receiptX = 110;
            const receiptY = 240;
            const receiptW = 860;
            const receiptH = 1380;
            
            // Soft card fill
            drawRoundRect(ctx, receiptX, receiptY, receiptW, receiptH, 24, '#121821', 'rgba(255,255,255,0.04)', 1.5);

            // Status Icon Circle (Minimal Green accent)
            const checkX = canvasWidth / 2;
            const checkY = receiptY + 160;

            ctx.beginPath();
            ctx.arc(checkX, checkY, 60, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 200, 150, 0.1)';
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();

            // Checkmark SVG path conversion
            ctx.beginPath();
            ctx.moveTo(checkX - 20, checkY + 2);
            ctx.lineTo(checkX - 6, checkY + 16);
            ctx.lineTo(checkX + 22, checkY - 14);
            ctx.strokeStyle = '#00C896';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Main Info Header
            ctx.fillStyle = '#EAF2FF';
            ctx.font = 'bold 38px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Payment Receipt', checkX, checkY + 120);

            ctx.fillStyle = '#8FA3BF';
            ctx.font = '24px sans-serif';
            ctx.fillText('Successfully Sent to Merchant', checkX, checkY + 170);

            // Huge Premium Amount presentation
            ctx.fillStyle = '#EAF2FF';
            ctx.font = 'bold 96px sans-serif';
            ctx.fillText(amount, checkX, checkY + 320);

            ctx.fillStyle = '#00C896';
            ctx.font = '24px sans-serif';
            ctx.fillText(`For product: ${productName}`, checkX, checkY + 380);

            // Solid Divider Line
            ctx.beginPath();
            ctx.moveTo(receiptX + 80, checkY + 440);
            ctx.lineTo(receiptX + receiptW - 80, checkY + 440);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Data Lists
            const dataY = checkY + 530;
            const listItems = [
                { k: "Sender Profile", v: `${buyerName} (@${buyerUsername || 'buyer'})` },
                { k: "Received By", v: `${ownerName} (@${ownerUsername || 'owner'})` },
                { k: "Reference Code", v: transactionId },
                { k: "Transaction Timestamp", v: displayDateTime }
            ];

            listItems.forEach((item, index) => {
                const currentY = dataY + (index * 135);

                // Title Label left-aligned
                ctx.textAlign = 'left';
                ctx.fillStyle = '#8FA3BF';
                ctx.font = '24px sans-serif';
                ctx.fillText(item.k, receiptX + 80, currentY);

                // Info value right-aligned
                ctx.textAlign = 'right';
                ctx.fillStyle = '#EAF2FF';
                ctx.font = 'bold 26px sans-serif';
                
                // Truncation safeguard
                let textVal = item.v;
                if (textVal.length > 30) {
                    textVal = textVal.substring(0, 27) + "...";
                }
                ctx.fillText(textVal, receiptX + receiptW - 80, currentY);

                // Subtle separating line
                ctx.beginPath();
                ctx.moveTo(receiptX + 80, currentY + 45);
                ctx.lineTo(receiptX + receiptW - 80, currentY + 45);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Secured logo text label
            ctx.textAlign = 'center';
            ctx.fillStyle = '#8FA3BF';
            ctx.font = '22px sans-serif';
            ctx.fillText('🔒 Official FazzPay Bank Transfer Record', checkX, receiptY + 1280);
        }

        // ================= UNIVERSAL FOOTER WATERMARK =================
        // Draw the sleek and required watermarked website indicator to look highly authentic
        ctx.fillStyle = 'rgba(143, 163, 191, 0.4)'; // #8FA3BF with 0.4 opacity
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('fazzpaypic.vercel.app', canvasWidth / 2, canvasHeight - 90);

        // Convert the Canvas directly to a Buffer
        const buffer = canvas.toBuffer('image/png');
        
        // Respond with high quality PNG directly
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="receipt.png"');
        return res.send(buffer);

    } catch (err) {
        console.error("Error creating payment receipt canvas image:", err);
        return res.status(500).json({ error: "Failed to generate payment success image.", details: err.message });
    }
});

// Dynamic fallback server listener trigger
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`FazzPay Payment Receipt engine listening on port ${PORT}`);
});
