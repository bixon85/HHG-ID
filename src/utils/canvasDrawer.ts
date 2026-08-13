import { BuilderData, PhotoTransform, TemplateId, PhotoFilter, BadgeSticker } from '../types';
import QRCode from 'qrcode';

/**
 * High-performance QR Code generator cache
 */
const qrCache = new Map<string, HTMLCanvasElement>();

export async function generateQrCanvas(text: string, size: number): Promise<HTMLCanvasElement> {
  const cacheKey = `${text}-${size}`;
  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 1,
    color: {
      dark: '#032012',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });

  qrCache.set(cacheKey, canvas);
  return canvas;
}

/**
 * Draw rounded rectangle path
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | number[]
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    const r = typeof radius === 'number' ? radius : radius[0] || 0;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Draw 3D realistic Pushpin / Tack
 */
export function drawPushPin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  headColor: string = '#095c34',
  highlightColor: string = '#00e5a3'
) {
  ctx.save();
  // Pin drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 6, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pin base rim
  ctx.fillStyle = '#042615';
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();

  // Pin outer body
  const pinGrad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 8);
  pinGrad.addColorStop(0, highlightColor);
  pinGrad.addColorStop(0.4, headColor);
  pinGrad.addColorStop(1, '#021a0d');
  ctx.fillStyle = pinGrad;
  ctx.beginPath();
  ctx.arc(x, y, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Specular top highlight dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(x - 2.5, y - 2.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw Checkmark Verification Badge
 */
export function drawCheckmarkBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 44
) {
  ctx.save();
  // Outer green box
  ctx.fillStyle = '#064e2d';
  drawRoundedRect(ctx, x, y, size, size, 8);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#00e5a3';
  ctx.stroke();

  // White checkmark tick
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.52);
  ctx.lineTo(x + size * 0.44, y + size * 0.72);
  ctx.lineTo(x + size * 0.76, y + size * 0.28);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw brand title with Hindi "गोवा" in neon pink
 */
export function drawBrandTitle(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  fontSize: number = 42,
  goldColor: string = '#f3db47',
  pinkColor: string = '#ff2a85'
) {
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  const fontStyle = `900 ${fontSize}px "Cinzel", serif`;
  ctx.font = fontStyle;

  const hackerText = 'HACKER ';
  const goaText = 'गोवा ';
  const houseText = 'HOUSE';

  const hackerWidth = ctx.measureText(hackerText).width;
  ctx.font = `800 ${fontSize * 0.92}px "Space Grotesk", sans-serif`;
  const goaWidth = ctx.measureText(goaText).width;
  ctx.font = fontStyle;
  const houseWidth = ctx.measureText(houseText).width;

  const totalWidth = hackerWidth + goaWidth + houseWidth;
  const startX = centerX - totalWidth / 2;

  // HACKER
  ctx.font = fontStyle;
  ctx.fillStyle = goldColor;
  ctx.fillText(hackerText, startX, centerY);

  // गोवा (Pink)
  ctx.font = `800 ${fontSize * 0.92}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = pinkColor;
  ctx.fillText(goaText, startX + hackerWidth, centerY);

  // HOUSE
  ctx.font = fontStyle;
  ctx.fillStyle = goldColor;
  ctx.fillText(houseText, startX + hackerWidth + goaWidth, centerY);

  ctx.restore();
}

/**
 * Draw transformed and filtered photo onto canvas
 */
export function drawTransformedPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  transform: PhotoTransform,
  filter?: PhotoFilter
) {
  ctx.save();

  // Apply photo filter
  if (filter === 'tropical') {
    ctx.filter = 'saturate(1.35) contrast(1.15) brightness(1.05) hue-rotate(-8deg)';
  } else if (filter === 'cyber') {
    ctx.filter = 'contrast(1.3) saturate(1.4) hue-rotate(30deg) brightness(1.1)';
  } else if (filter === 'vintage') {
    ctx.filter = 'sepia(0.35) contrast(1.1) brightness(0.95) saturate(1.1)';
  } else if (filter === 'bw') {
    ctx.filter = 'grayscale(1) contrast(1.4) brightness(1.05)';
  } else {
    ctx.filter = 'none';
  }

  // Translate to center of photo viewport
  const cx = x + width / 2;
  const cy = y + height / 2;
  ctx.translate(cx, cy);

  // User manual pan offset
  ctx.translate(transform.offsetX, transform.offsetY);

  // Rotation
  if (transform.rotation) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
  }

  // Horizontal flip
  if (transform.flipH) {
    ctx.scale(-1, 1);
  }

  // Zoom scale
  ctx.scale(transform.zoom, transform.zoom);

  // Calculate cover aspect ratio
  const imgAspect = img.width / img.height;
  const frameAspect = width / height;

  let drawW = width;
  let drawH = height;

  if (imgAspect > frameAspect) {
    drawH = height;
    drawW = height * imgAspect;
  } else {
    drawW = width;
    drawH = width / imgAspect;
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

/**
 * Draw wrapped text helper
 */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 2
) {
  const words = text.split(' ');
  let line = '';
  let linesDrawn = 0;
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (linesDrawn === maxLines - 1) {
        ctx.fillText(line.trim() + '...', x, curY);
        return;
      }
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
      linesDrawn++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}

/**
 * Draw detailed palm tree
 */
export function drawDetailedPalmTree(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  height: number = 380,
  leanAngle: number = 25,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(scale, scale);

  const topX = leanAngle * 3.5;
  const topY = -height;

  // Segmented palm trunk
  const segments = 12;
  let prevX = 0;
  let prevY = 0;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const currX = Math.pow(t, 1.4) * topX;
    const currY = -t * height;
    const w = 18 * (1 - t * 0.4);

    ctx.fillStyle = i % 2 === 0 ? '#4d3018' : '#694121';
    ctx.beginPath();
    ctx.moveTo(prevX - w * 0.5, prevY);
    ctx.lineTo(prevX + w * 0.5, prevY);
    ctx.lineTo(currX + w * 0.45, currY);
    ctx.lineTo(currX - w * 0.45, currY);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#271508';
    ctx.stroke();

    prevX = currX;
    prevY = currY;
  }

  // Coconuts at top
  ctx.fillStyle = '#4a2f0f';
  ctx.beginPath();
  ctx.arc(topX - 6, topY + 8, 9, 0, Math.PI * 2);
  ctx.arc(topX + 5, topY + 10, 8.5, 0, Math.PI * 2);
  ctx.arc(topX, topY + 16, 8, 0, Math.PI * 2);
  ctx.fill();

  // Lush Palm Fronds
  const frondAngles = [-130, -90, -50, -20, 20, 50, 90, 130];
  frondAngles.forEach((angleDeg, idx) => {
    const rad = (angleDeg * Math.PI) / 180;
    const frondLen = 170 + (idx % 2) * 25;

    ctx.save();
    ctx.translate(topX, topY);
    ctx.rotate(rad);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(frondLen * 0.5, -28, frondLen, 35);
    ctx.strokeStyle = '#053d1e';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Leaflets
    const leaflets = 18;
    for (let j = 3; j < leaflets; j++) {
      const lt = j / leaflets;
      const lx = lt * frondLen;
      const ly = Math.pow(lt, 2) * 35;
      const leafletH = Math.sin(lt * Math.PI) * 38;

      ctx.fillStyle = idx % 2 === 0 ? '#0d8a43' : '#14a854';
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 5, ly + leafletH);
      ctx.lineTo(lx + 4, ly + leafletH * 0.85);
      ctx.closePath();
      ctx.fill();

      // Top side
      ctx.fillStyle = '#0b6631';
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 4, ly - leafletH * 0.8);
      ctx.lineTo(lx + 3, ly - leafletH * 0.65);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();
}

/**
 * Draw Badge Sticker / Event Stamp
 */
export function drawBadgeSticker(
  ctx: CanvasRenderingContext2D,
  sticker: BadgeSticker,
  x: number,
  y: number,
  tiltDeg: number = 8
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tiltDeg * Math.PI) / 180);

  let label = 'GOA VERIFIED';
  let emoji = '🌴';
  let color = '#00e5a3';
  let textColor = '#031f11';

  if (sticker === 'coffee-fueled') {
    label = '99% CAFFEINE';
    emoji = '☕';
    color = '#f3db47';
  } else if (sticker === 'coconut-water') {
    label = 'COCONUT FUEL';
    emoji = '🥥';
    color = '#00f0ff';
  } else if (sticker === 'ship-it') {
    label = 'SHIP TO PROD';
    emoji = '🚀';
    color = '#ff2a85';
    textColor = '#ffffff';
  } else if (sticker === 'triangle-day') {
    label = 'DAY OF TRIANGLE';
    emoji = '🔺';
    color = '#ff0055';
    textColor = '#ffffff';
  } else if (sticker === 'beach-chill') {
    label = 'BEACH CHILL';
    emoji = '🏖️';
    color = '#ffbe0b';
  }

  // Stamp shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  drawRoundedRect(ctx, -68, -17, 140, 38, 19);
  ctx.fill();

  // Stamp body
  ctx.fillStyle = color;
  drawRoundedRect(ctx, -70, -19, 140, 38, 19);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.font = '800 13px "Space Grotesk", sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${emoji} ${label}`, 0, 0);

  ctx.restore();
}

/**
 * =========================================================================
 * TEMPLATE 1: THE NOTICE BOARD CARD (16:9, 1600 x 1000px)
 * =========================================================================
 */
export async function renderNoticeBoardTemplate(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement | null,
  builder: BuilderData,
  transform: PhotoTransform
) {
  const W = 1600;
  const H = 1000;

  // Background deep forest backdrop
  ctx.fillStyle = '#062917';
  ctx.fillRect(0, 0, W, H);

  // Outer Notice Board Green Frame
  const frameMargin = 40;
  const frameW = W - frameMargin * 2;
  const frameH = H - frameMargin * 2;

  // Thick Green Border with Bevel
  ctx.fillStyle = '#095c34';
  drawRoundedRect(ctx, frameMargin, frameMargin, frameW, frameH, 28);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#042615';
  ctx.stroke();

  // Inner Cream / Ivory Cardstock
  const cardInset = 35;
  const cardX = frameMargin + cardInset;
  const cardY = frameMargin + cardInset;
  const cardW = frameW - cardInset * 2;
  const cardH = frameH - cardInset * 2;

  // Drop shadow inside notice board
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  drawRoundedRect(ctx, cardX + 4, cardY + 6, cardW, cardH, 16);
  ctx.fill();

  // Ivory Pinboard Paper
  const paperGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  paperGrad.addColorStop(0, '#fbf8ea');
  paperGrad.addColorStop(1, '#f4efd5');
  ctx.fillStyle = paperGrad;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 16);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#d6cca8';
  ctx.stroke();

  // 4 Corner Pushpins holding the board
  drawPushPin(ctx, cardX + 25, cardY + 25, '#095c34', '#00e5a3');
  drawPushPin(ctx, cardX + cardW - 25, cardY + 25, '#095c34', '#00e5a3');
  drawPushPin(ctx, cardX + 25, cardY + cardH - 25, '#095c34', '#00e5a3');
  drawPushPin(ctx, cardX + cardW - 25, cardY + cardH - 25, '#095c34', '#00e5a3');

  // Top Section: Brand Header & Verified Resident Seal
  const titleX = cardX + 530;
  const titleY = cardY + 70;

  drawBrandTitle(ctx, titleX + 175, titleY + 12, 34, '#064e2d', '#ff2a85');

  // Checkmark Verified Badge in Top Right
  drawCheckmarkBadge(ctx, cardX + cardW - 140, cardY + 60, 64);

  // Left Side: Pinned Polaroid Photo
  const polW = 380;
  const polH = 500;
  const polX = cardX + 75;
  const polY = cardY + 155;

  ctx.save();
  // Slight natural tilt
  ctx.translate(polX + polW / 2, polY + polH / 2);
  ctx.rotate((-3.5 * Math.PI) / 180);

  // Polaroid Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  drawRoundedRect(ctx, -polW / 2 + 8, -polH / 2 + 10, polW, polH, 12);
  ctx.fill();

  // Polaroid White Paper
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, -polW / 2, -polH / 2, polW, polH, 12);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e0ded2';
  ctx.stroke();

  // Photo Square Viewport
  const pMargin = 22;
  const pSize = polW - pMargin * 2;
  const pTop = -polH / 2 + pMargin;

  ctx.save();
  drawRoundedRect(ctx, -polW / 2 + pMargin, pTop, pSize, pSize + 25, 6);
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(
      ctx,
      userImage,
      -polW / 2 + pMargin,
      pTop,
      pSize,
      pSize + 25,
      transform,
      builder.filter
    );
  } else {
    ctx.fillStyle = '#082e1b';
    ctx.fillRect(-polW / 2 + pMargin, pTop, pSize, pSize + 25);
  }
  ctx.restore();

  // Photo border
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#063a21';
  drawRoundedRect(ctx, -polW / 2 + pMargin, pTop, pSize, pSize + 25, 6);
  ctx.stroke();

  // Polaroid Stamp at bottom: "GOA 2026 RESIDENT"
  const stampY = pTop + pSize + 58;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#064e2d';
  ctx.setLineDash([5, 4]);
  drawRoundedRect(ctx, -125, stampY - 26, 250, 42, 6);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '900 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#064e2d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GOA 2026 RESIDENT', 0, stampY - 5);

  // Top Pin holding the Polaroid
  drawPushPin(ctx, 0, -polH / 2 + 10, '#095c34', '#00e5a3');

  ctx.restore();

  // Right Side: Builder Credentials List
  const fieldsX = cardX + 530;
  let curY = cardY + 200;
  const spacing = 115;

  // 1. BUILDER
  ctx.textAlign = 'left';
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#095c34';
  ctx.fillText('BUILDER:', fieldsX, curY);

  ctx.font = '900 44px "Cinzel", serif';
  ctx.fillStyle = '#031c0e';
  ctx.fillText((builder.name || 'DAVID KIM').toUpperCase(), fieldsX, curY + 46);

  curY += spacing;

  // 2. ROLE & STACK
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#095c34';
  ctx.fillText('ROLE & TECH STACK:', fieldsX, curY);

  ctx.font = '800 32px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00874e';
  ctx.fillText(builder.role || 'Full Stack Dev', fieldsX, curY + 40);

  curY += spacing;

  // 3. HACKATHON TRACK
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#095c34';
  ctx.fillText('HACKATHON TRACK:', fieldsX, curY);

  ctx.font = '800 28px monospace';
  ctx.fillStyle = '#031c0e';
  ctx.fillText(builder.track || 'AI AGENTS & DEPIN', fieldsX, curY + 36);

  curY += spacing;

  // 4. BUILDER MOTTO / QUIRK
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#095c34';
  ctx.fillText('BUILDER MOTTO:', fieldsX, curY);

  ctx.font = 'italic 700 28px "Cinzel", serif';
  ctx.fillStyle = '#031c0e';
  drawWrappedText(ctx, `"${builder.quote || 'Documentation Sensei'}"`, fieldsX, curY + 38, 750, 32, 2);

  // Bottom Notice Board Subtext & Branding
  const footY = cardY + cardH - 35;
  ctx.font = '800 16px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#064e2d';
  ctx.textAlign = 'left';
  ctx.fillText('HACKER HOUSE GOA • 28-31 OCT 2026', cardX + 75, footY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ff2a85';
  ctx.fillText('#FrameInGoa', cardX + cardW - 75, footY);

  // Draw Sticker if selected
  if (builder.stickers && builder.stickers.length > 0) {
    drawBadgeSticker(ctx, builder.stickers[0], cardX + cardW - 160, cardY + cardH - 120, -10);
  }
}

/**
 * =========================================================================
 * TEMPLATE 2: HACKER DESK PASS (4:5 Portrait, 1200 x 1500px)
 * =========================================================================
 */
export async function renderHackerDeskTemplate(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement | null,
  builder: BuilderData,
  transform: PhotoTransform
) {
  const W = 1200;
  const H = 1500;

  // Rich dark emerald gradient backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#041d10');
  bgGrad.addColorStop(0.4, '#02130a');
  bgGrad.addColorStop(1, '#010905');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Outer border with gold neon glow
  ctx.strokeStyle = 'rgba(243, 219, 71, 0.4)';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 30, 30, W - 60, H - 60, 24);
  ctx.stroke();

  // Clip background foliage strictly inside the frame boundary
  ctx.save();
  drawRoundedRect(ctx, 32, 32, W - 64, H - 64, 22);
  ctx.clip();

  // Framing Palm Leaves at top corners (tucked gracefully inside the frame)
  drawDetailedPalmTree(ctx, 40, 270, 235, 38, 0.62);
  drawDetailedPalmTree(ctx, W - 40, 270, 235, -38, 0.62);
  ctx.restore();

  // Top Brand Header: "HACKER गोवा HOUSE"
  drawBrandTitle(ctx, W / 2, 85, 38, '#f3db47', '#ff2a85');

  // Hanging Wooden Event Banners: Day 02 & Day 04
  const drawHangingBanner = (
    bx: number,
    by: number,
    bw: number,
    bh: number,
    dayText: string,
    nameText: string,
    accentColor: string
  ) => {
    // Hanging Ropes
    ctx.strokeStyle = '#c49a58';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx + 18, 32);
    ctx.lineTo(bx + 18, by);
    ctx.moveTo(bx + bw - 18, 32);
    ctx.lineTo(bx + bw - 18, by);
    ctx.stroke();

    // Brass Grommet Ring
    ctx.fillStyle = '#f3db47';
    ctx.beginPath();
    ctx.arc(bx + 18, by + 4, 4, 0, Math.PI * 2);
    ctx.arc(bx + bw - 18, by + 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Wood Banner Body
    ctx.fillStyle = '#22150a';
    drawRoundedRect(ctx, bx, by, bw, bh, 10);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = accentColor;
    ctx.stroke();

    // Subtext Day
    ctx.font = '800 12px "Space Grotesk", sans-serif';
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(dayText, bx + bw / 2, by + 18);

    // Title
    ctx.font = '900 13px "Cinzel", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(nameText, bx + bw / 2, by + 37);
  };

  drawHangingBanner(65, 115, 185, 52, 'DAY 02 • 29 OCT', 'DAY OF TRIANGLE', '#ff2a85');
  drawHangingBanner(W - 250, 115, 185, 52, 'DAY 04 • 31 OCT', 'LAUNCH DAY', '#f3db47');

  // ==========================================
  // Photo Frame (Upper Center)
  // ==========================================
  const photoW = 380;
  const photoH = 440;
  const photoX = (W - photoW) / 2;
  const photoY = 175;

  // Photo Frame Drop Shadow & Base
  ctx.fillStyle = '#03140b';
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 18);
  ctx.fill();

  // Double Border: Glowing Outer Gold + Inner Emerald
  ctx.save();
  ctx.shadowColor = '#00e5a3';
  ctx.shadowBlur = 16;
  ctx.strokeStyle = '#00e5a3';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 18);
  ctx.stroke();
  ctx.restore();

  // Photo Viewport
  ctx.save();
  drawRoundedRect(ctx, photoX + 6, photoY + 6, photoW - 12, photoH - 12, 14);
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(ctx, userImage, photoX + 6, photoY + 6, photoW - 12, photoH - 12, transform, builder.filter);
  } else {
    ctx.fillStyle = '#052917';
    ctx.fillRect(photoX + 6, photoY + 6, photoW - 12, photoH - 12);
  }
  ctx.restore();

  // Corner Photo Brackets / Crosshairs
  ctx.strokeStyle = '#f3db47';
  ctx.lineWidth = 3.5;
  const bLen = 22;
  // Top-Left
  ctx.beginPath();
  ctx.moveTo(photoX - 4, photoY + bLen);
  ctx.lineTo(photoX - 4, photoY - 4);
  ctx.lineTo(photoX + bLen, photoY - 4);
  ctx.stroke();
  // Top-Right
  ctx.beginPath();
  ctx.moveTo(photoX + photoW + 4 - bLen, photoY - 4);
  ctx.lineTo(photoX + photoW + 4, photoY - 4);
  ctx.lineTo(photoX + photoW + 4, photoY + bLen);
  ctx.stroke();
  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(photoX - 4, photoY + photoH - bLen);
  ctx.lineTo(photoX - 4, photoY + photoH + 4);
  ctx.lineTo(photoX + bLen, photoY + photoH + 4);
  ctx.stroke();
  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(photoX + photoW + 4 - bLen, photoY + photoH + 4);
  ctx.lineTo(photoX + photoW + 4, photoY + photoH + 4);
  ctx.lineTo(photoX + photoW + 4, photoY + photoH + 4);
  ctx.stroke();

  // Sticker on Photo
  if (builder.stickers && builder.stickers.length > 0) {
    drawBadgeSticker(ctx, builder.stickers[0], photoX + photoW - 20, photoY + 22, 10);
  }

  // ==========================================
  // First-Person Coder Desk & MacBook Laptop Scene
  // ==========================================
  const deskX = 60;
  const deskY = 640;
  const deskW = W - deskX * 2;
  const deskH = 245;

  // 1. Rich Teak / Mahogany Desk Surface
  const deskGrad = ctx.createLinearGradient(deskX, deskY, deskX, deskY + deskH);
  deskGrad.addColorStop(0, '#5a3517');
  deskGrad.addColorStop(0.5, '#42240e');
  deskGrad.addColorStop(1, '#2c1607');
  ctx.fillStyle = deskGrad;
  drawRoundedRect(ctx, deskX, deskY, deskW, deskH, [16, 16, 0, 0]);
  ctx.fill();

  // Desk top beveled edge
  ctx.fillStyle = '#7a4a22';
  ctx.fillRect(deskX, deskY, deskW, 6);

  // Wood Grain Horizontal Plank Lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;
  for (let pl = 1; pl < 5; pl++) {
    ctx.beginPath();
    ctx.moveTo(deskX, deskY + pl * 50);
    ctx.lineTo(deskX + deskW, deskY + pl * 50);
    ctx.stroke();
  }

  // 2. Open Metallic MacBook Laptop (Center)
  const lapW = 460;
  const lapH = 195;
  const lapX = (W - lapW) / 2;
  const lapY = deskY + 25;

  // --- Laptop Screen (Tilted Up) ---
  const scrW = 390;
  const scrH = 145;
  const scrX = (W - scrW) / 2;
  const scrY = lapY - 105;

  // Laptop Outer Shell / Bezel
  ctx.fillStyle = '#1e2029';
  drawRoundedRect(ctx, scrX - 10, scrY - 10, scrW + 20, scrH + 20, [10, 10, 0, 0]);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#374151';
  ctx.stroke();

  // Screen Viewport (Dark IDE Editor)
  ctx.fillStyle = '#0a0e1a';
  drawRoundedRect(ctx, scrX, scrY, scrW, scrH, 6);
  ctx.fill();

  // Top macOS Window Control Dots
  ctx.fillStyle = '#ff5f56';
  ctx.beginPath();
  ctx.arc(scrX + 14, scrY + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffbd2e';
  ctx.beginPath();
  ctx.arc(scrX + 26, scrY + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#27c93f';
  ctx.beginPath();
  ctx.arc(scrX + 38, scrY + 12, 4, 0, Math.PI * 2);
  ctx.fill();

  // Editor Tab: "main.ts — Hacker House Goa"
  ctx.font = '700 9px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'left';
  ctx.fillText('main.ts • HHG Goa 2026', scrX + 54, scrY + 15);

  // Live Syntax Highlighted Code Inside IDE
  const codeX = scrX + 16;
  ctx.font = '700 11px monospace';

  ctx.fillStyle = '#ff2a85';
  ctx.fillText('import', codeX, scrY + 38);
  ctx.fillStyle = '#f3db47';
  ctx.fillText(' { Solana, Vibe }', codeX + 48, scrY + 38);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(' from "@hhg/goa";', codeX + 155, scrY + 38);

  ctx.fillStyle = '#00e5a3';
  ctx.fillText('async function shipToProd() {', codeX, scrY + 58);

  ctx.fillStyle = '#f3db47';
  ctx.fillText('  await deployApp({ builder: "', codeX + 14, scrY + 76);
  ctx.fillStyle = '#00f0ff';
  ctx.fillText((builder.name || 'ANON').split(' ')[0], codeX + 208, scrY + 76);
  ctx.fillStyle = '#f3db47';
  ctx.fillText('" });', codeX + 245, scrY + 76);

  ctx.fillStyle = '#00e5a3';
  ctx.fillText('}', codeX, scrY + 94);

  ctx.fillStyle = '#00e5a3';
  ctx.fillText('> [HHG-2026]: DEPLOYED TO SOLANA ✓', codeX, scrY + 118);

  // --- Laptop Aluminum Lower Body (Chassis) ---
  const baseGrad = ctx.createLinearGradient(lapX, lapY + 35, lapX, lapY + lapH);
  baseGrad.addColorStop(0, '#e5e7eb');
  baseGrad.addColorStop(0.7, '#cbd5e1');
  baseGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = baseGrad;
  drawRoundedRect(ctx, lapX, lapY + 35, lapW, lapH - 35, [0, 0, 16, 16]);
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#64748b';
  ctx.stroke();

  // Keyboard Recessed Well
  const kbX = lapX + 28;
  const kbY = lapY + 45;
  const kbW = lapW - 56;
  const kbH = 75;

  ctx.fillStyle = '#1e293b';
  drawRoundedRect(ctx, kbX, kbY, kbW, kbH, 6);
  ctx.fill();

  // Rows of Chiclet Black Keys
  const keyRows = 4;
  const keysPerRow = 13;
  const kw = (kbW - 14) / keysPerRow;
  const kh = 13;

  for (let r = 0; r < keyRows; r++) {
    for (let k = 0; k < keysPerRow; k++) {
      const kx = kbX + 6 + k * kw;
      const ky = kbY + 5 + r * 17;
      ctx.fillStyle = '#0f172a';
      drawRoundedRect(ctx, kx, ky, kw - 3, kh, 2);
      ctx.fill();
    }
  }

  // Spacebar Key
  ctx.fillStyle = '#0f172a';
  drawRoundedRect(ctx, kbX + kbW / 2 - 55, kbY + 5 + 3 * 17, 110, 12, 2);
  ctx.fill();

  // Metallic Glass Trackpad
  const tpW = 120;
  const tpH = 26;
  const tpX = (W - tpW) / 2;
  const tpY = lapY + 132;
  ctx.fillStyle = '#e2e8f0';
  drawRoundedRect(ctx, tpX, tpY, tpW, tpH, 4);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#94a3b8';
  ctx.stroke();

  // =========================================================================
  // 3. Realistic First-Person Typing Hands (Natural Anatomy & Perspective)
  // =========================================================================
  const skinBase = '#f5ba93';
  const skinShadow = '#d4916a';
  const skinHighlight = '#ffdfcb';
  const nailColor = 'rgba(255, 255, 255, 0.45)';

  // Helper function to draw a single natural finger with knuckles and nail
  const drawNaturalFinger = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    thickness: number,
    angleDeg: number
  ) => {
    ctx.save();
    // Drop shadow under finger
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX + 2, startY + 3);
    ctx.lineTo(endX + 2, endY + 3);
    ctx.stroke();

    // Finger main segment
    ctx.strokeStyle = skinBase;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Knuckle line
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(midX, midY, thickness * 0.4, 0, Math.PI);
    ctx.stroke();

    // Fingertip pad highlight
    ctx.fillStyle = skinHighlight;
    ctx.beginPath();
    ctx.arc(endX, endY, thickness * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Delicate fingernail
    ctx.fillStyle = nailColor;
    ctx.beginPath();
    ctx.ellipse(endX, endY - 1, thickness * 0.35, thickness * 0.25, (angleDeg * Math.PI) / 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // --- LEFT HAND & FOREARM ---
  const leftWristX = lapX + 90;
  const leftWristY = lapY + 145;

  // Left Forearm Sleeve (Hoodie Arm coming up from bottom)
  ctx.save();
  ctx.fillStyle = '#064e2d';
  ctx.beginPath();
  ctx.moveTo(lapX + 20, deskY + deskH);
  ctx.lineTo(lapX + 60, leftWristY + 15);
  ctx.lineTo(lapX + 125, leftWristY + 15);
  ctx.lineTo(lapX + 160, deskY + deskH);
  ctx.closePath();
  ctx.fill();

  // Left Ribbed Cuff
  ctx.fillStyle = '#00e5a3';
  drawRoundedRect(ctx, lapX + 60, leftWristY + 10, 65, 8, 4);
  ctx.fill();
  ctx.restore();

  // Left Palm / Hand Base
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(leftWristX + 15, leftWristY - 10, 32, 22, (-15 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(leftWristX + 12, leftWristY - 14, 30, 20, (-15 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();

  // Left Palm Highlight
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.ellipse(leftWristX + 8, leftWristY - 18, 16, 10, (-15 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();

  // Left Thumb (reaching inward towards spacebar)
  drawNaturalFinger(leftWristX + 32, leftWristY - 15, leftWristX + 54, leftWristY - 22, 11, 40);

  // Left 4 Fingers reaching up over A, S, D, F keys
  // Index Finger (on F)
  drawNaturalFinger(leftWristX + 26, leftWristY - 26, leftWristX + 32, leftWristY - 65, 9.5, 0);
  // Middle Finger (on D)
  drawNaturalFinger(leftWristX + 12, leftWristY - 28, leftWristX + 14, leftWristY - 72, 10, 0);
  // Ring Finger (on S)
  drawNaturalFinger(leftWristX - 2, leftWristY - 26, leftWristX - 4, leftWristY - 67, 9.5, 0);
  // Pinky Finger (on A)
  drawNaturalFinger(leftWristX - 16, leftWristY - 22, leftWristX - 20, leftWristY - 55, 8.5, -10);
  ctx.restore();

  // --- RIGHT HAND & FOREARM ---
  const rightWristX = lapX + lapW - 90;
  const rightWristY = lapY + 145;

  // Right Forearm Sleeve (Hoodie Arm coming up from bottom)
  ctx.save();
  ctx.fillStyle = '#064e2d';
  ctx.beginPath();
  ctx.moveTo(lapX + lapW - 160, deskY + deskH);
  ctx.lineTo(lapX + lapW - 125, rightWristY + 15);
  ctx.lineTo(lapX + lapW - 60, rightWristY + 15);
  ctx.lineTo(lapX + lapW - 20, deskY + deskH);
  ctx.closePath();
  ctx.fill();

  // Right Wristband ("HHG 2026" Festival Band)
  ctx.fillStyle = '#ff2a85';
  drawRoundedRect(ctx, lapX + lapW - 125, rightWristY + 6, 65, 12, 4);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.font = '900 8px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HHG 2026 🌴', lapX + lapW - 92, rightWristY + 12);
  ctx.restore();

  // Right Palm / Hand Base
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(rightWristX - 15, rightWristY - 10, 32, 22, (15 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(rightWristX - 12, rightWristY - 14, 30, 20, (15 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();

  // Right Palm Highlight
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.ellipse(rightWristX - 8, rightWristY - 18, 16, 10, (15 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();

  // Right Thumb (reaching inward towards spacebar)
  drawNaturalFinger(rightWristX - 32, rightWristY - 15, rightWristX - 54, rightWristY - 22, 11, -40);

  // Right 4 Fingers reaching up over J, K, L, ; keys
  // Index Finger (on J)
  drawNaturalFinger(rightWristX - 26, rightWristY - 26, rightWristX - 32, rightWristY - 65, 9.5, 0);
  // Middle Finger (on K)
  drawNaturalFinger(rightWristX - 12, rightWristY - 28, rightWristX - 14, rightWristY - 72, 10, 0);
  // Ring Finger (on L)
  drawNaturalFinger(rightWristX + 2, rightWristY - 26, rightWristX + 4, rightWristY - 67, 9.5, 0);
  // Pinky Finger (on ;)
  drawNaturalFinger(rightWristX + 16, rightWristY - 22, rightWristX + 20, rightWristY - 55, 8.5, 10);
  ctx.restore();

  // 4. Steaming Ceramic Coffee Mug (Left Side of Desk)
  const mugX = 110;
  const mugY = deskY + 65;
  const mugW = 60;
  const mugH = 70;

  // Mug Body
  ctx.fillStyle = '#fbf8ee';
  drawRoundedRect(ctx, mugX, mugY, mugW, mugH, 8);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d6cca8';
  ctx.stroke();

  // Mug Handle
  ctx.strokeStyle = '#fbf8ee';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(mugX - 8, mugY + mugH / 2, 16, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.stroke();

  // Coffee inside top
  ctx.fillStyle = '#3e220e';
  ctx.beginPath();
  ctx.ellipse(mugX + mugW / 2, mugY + 6, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mug Brand Stamp
  ctx.font = '900 11px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#064e2d';
  ctx.textAlign = 'center';
  ctx.fillText('100x ☕', mugX + mugW / 2, mugY + 42);

  // Steaming Wisps
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let s = 0; s < 3; s++) {
    const sx = mugX + 18 + s * 13;
    ctx.beginPath();
    ctx.moveTo(sx, mugY - 4);
    ctx.bezierCurveTo(sx - 6, mugY - 18, sx + 6, mugY - 30, sx - 2, mugY - 45);
    ctx.stroke();
  }

  // 5. Tropical Coconut Drink (Right Side of Desk)
  const cocoX = W - 140;
  const cocoY = deskY + 95;

  // Round Coconut
  ctx.fillStyle = '#4a2f13';
  ctx.beginPath();
  ctx.arc(cocoX, cocoY, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#271707';
  ctx.stroke();

  // Top opening
  ctx.fillStyle = '#e8d8b5';
  ctx.beginPath();
  ctx.ellipse(cocoX, cocoY - 20, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pink Straw
  ctx.strokeStyle = '#ff2a85';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(cocoX - 4, cocoY - 14);
  ctx.lineTo(cocoX - 16, cocoY - 52);
  ctx.stroke();

  // Little Yellow Cocktail Umbrella
  ctx.fillStyle = '#f3db47';
  ctx.beginPath();
  ctx.arc(cocoX + 14, cocoY - 36, 20, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e67e22';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ==========================================
  // Boarding Pass Ticket Stub (Bottom)
  // ==========================================
  const stubY = 890;
  const stubH = 530;
  const stubX = 75;
  const stubW = W - stubX * 2;

  // Ticket Outer Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  drawRoundedRect(ctx, stubX + 4, stubY + 6, stubW, stubH, 22);
  ctx.fill();

  // Ivory Ticket Paper
  const tGrad = ctx.createLinearGradient(stubX, stubY, stubX, stubY + stubH);
  tGrad.addColorStop(0, '#fdfbf2');
  tGrad.addColorStop(1, '#f6f1df');
  ctx.fillStyle = tGrad;
  drawRoundedRect(ctx, stubX, stubY, stubW, stubH, 22);
  ctx.fill();

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#084826';
  ctx.stroke();

  // Tear-off Dashed Line with Notches
  const tearY = stubY + 80;

  // Left & Right Semicircle Punch Notches
  ctx.fillStyle = '#010905';
  ctx.beginPath();
  ctx.arc(stubX, tearY, 14, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(stubX + stubW, tearY, 14, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.fill();

  // Dashed Perforation Line
  ctx.strokeStyle = '#b8af94';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(stubX + 22, tearY);
  ctx.lineTo(stubX + stubW - 22, tearY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Flight Info Header
  ctx.font = '800 16px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.textAlign = 'left';
  ctx.fillText('ORIGIN: CYBERSPACE', stubX + 40, stubY + 46);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ff2a85';
  ctx.fillText('DESTINATION: GOA (GOI) ✈', stubX + stubW - 40, stubY + 46);

  // Passenger Credentials
  let textY = stubY + 140;
  ctx.textAlign = 'left';

  // 1. PASSENGER BUILDER
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.fillText('PASSENGER BUILDER:', stubX + 45, textY);

  ctx.font = '900 44px "Cinzel", serif';
  ctx.fillStyle = '#031c0e';
  ctx.fillText((builder.name || 'ALEX RIVERA').toUpperCase(), stubX + 45, textY + 48);

  textY += 108;

  // 2. ROLE & TECH STACK
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.fillText('ROLE / TECH STACK:', stubX + 45, textY);

  ctx.font = '800 30px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00874e';
  ctx.fillText(builder.role || 'Full Stack Developer', stubX + 45, textY + 38);

  textY += 98;

  // 3. BUILDER MOTTO / QUIRK
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.fillText('BUILDER MOTTO:', stubX + 45, textY);

  ctx.font = 'italic 700 24px "Cinzel", serif';
  ctx.fillStyle = '#031c0e';
  drawWrappedText(ctx, `"${builder.quote || 'Touches grass less than the server'}"`, stubX + 45, textY + 34, 620, 30, 2);

  // QR Code on right of ticket
  try {
    const qrCanvas = await generateQrCanvas(`https://hhgoa.com/pass/${encodeURIComponent(builder.badgeNumber)}`, 160);
    ctx.drawImage(qrCanvas, stubX + stubW - 210, stubY + 125, 160, 160);
  } catch {}

  // Flight Tags on Ticket Right
  ctx.font = '800 13px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#064e2d';
  ctx.textAlign = 'center';
  ctx.fillText('GATE: 01A • SEAT: 26B', stubX + stubW - 130, stubY + 310);

  // Barcode lines at bottom
  const barY = stubY + stubH - 65;
  ctx.fillStyle = '#031c0e';
  for (let b = 0; b < 46; b++) {
    const bw = (b % 3 === 0) ? 5 : (b % 2 === 0) ? 3 : 2;
    ctx.fillRect(stubX + 45 + b * 14, barY, bw, 40);
  }
}

/**
 * =========================================================================
 * TEMPLATE 3: GOA BEACH SHACK (4:5 Portrait, 1200 x 1500px)
 * =========================================================================
 */
export async function renderBeachShackTemplate(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement | null,
  builder: BuilderData,
  transform: PhotoTransform
) {
  const W = 1200;
  const H = 1500;

  // Sunset Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 800);
  skyGrad.addColorStop(0, '#0a2215');
  skyGrad.addColorStop(0.4, '#1b4d30');
  skyGrad.addColorStop(0.7, '#d35400');
  skyGrad.addColorStop(1, '#f39c12');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, 800);

  // Golden Sun
  ctx.fillStyle = '#f3db47';
  ctx.beginPath();
  ctx.arc(W / 2, 450, 110, 0, Math.PI * 2);
  ctx.fill();

  // Ocean Water & Reflections
  const seaGrad = ctx.createLinearGradient(0, 520, 0, 780);
  seaGrad.addColorStop(0, '#0c4e3b');
  seaGrad.addColorStop(1, '#052e22');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 520, W, 260);

  // Sandy Beach Shore
  ctx.fillStyle = '#e8d8b5';
  ctx.beginPath();
  ctx.moveTo(0, 760);
  ctx.quadraticCurveTo(W / 2, 720, W, 770);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Framing Palm Trees
  drawDetailedPalmTree(ctx, 80, 800, 480, 35, 1.1);
  drawDetailedPalmTree(ctx, W - 80, 800, 480, -35, 1.1);

  // Beach Shack Bar
  const barX = W / 2 - 200;
  const barY = 620;
  ctx.fillStyle = '#6e3c1b';
  ctx.fillRect(barX, barY + 60, 400, 90);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2d1808';
  ctx.strokeRect(barX, barY + 60, 400, 90);

  // Shack Thatch Roof
  ctx.fillStyle = '#9e782f';
  ctx.beginPath();
  ctx.moveTo(barX - 40, barY + 60);
  ctx.lineTo(barX + 200, barY - 20);
  ctx.lineTo(barX + 440, barY + 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // GOA BEACH Signboard
  ctx.fillStyle = '#063a1f';
  drawRoundedRect(ctx, barX + 100, barY + 75, 200, 40, 8);
  ctx.fill();
  ctx.font = '900 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.textAlign = 'center';
  ctx.fillText('GOA BEACH 2026', barX + 200, barY + 100);

  // Top Header: 2:47 PM STUDIO
  ctx.font = '800 16px monospace';
  ctx.fillStyle = '#f3db47';
  ctx.textAlign = 'left';
  ctx.fillText('2:47 PM STUDIO', 60, 70);

  drawBrandTitle(ctx, W / 2, 110, 36, '#f3db47', '#ff2a85');

  // Floating Glass Credential Card (Bottom Half)
  const cardW = 1000;
  const cardH = 580;
  const cardX = (W - cardW) / 2;
  const cardY = 860;

  // Glass Card Background
  ctx.fillStyle = '#052917ee';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#00e5a3';
  ctx.stroke();

  // Photo on Left of Card
  const photoSize = 380;
  const pX = cardX + 50;
  const pY = cardY + 100;

  ctx.fillStyle = '#03140b';
  drawRoundedRect(ctx, pX, pY, photoSize, photoSize, 18);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#f3db47';
  ctx.stroke();

  ctx.save();
  drawRoundedRect(ctx, pX + 6, pY + 6, photoSize - 12, photoSize - 12, 14);
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(ctx, userImage, pX + 6, pY + 6, photoSize - 12, photoSize - 12, transform, builder.filter);
  } else {
    ctx.fillStyle = '#062916';
    ctx.fillRect(pX + 6, pY + 6, photoSize - 12, photoSize - 12);
  }
  ctx.restore();

  // Right Side Credentials
  const credX = pX + photoSize + 50;
  let textY = cardY + 130;

  ctx.textAlign = 'left';
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('BEACH RESIDENT:', credX, textY);

  ctx.font = '900 44px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText((builder.name || 'SATOSHI NAKAMOTO').toUpperCase(), credX, textY + 46);

  textY += 110;

  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('SPECIALTY / STACK:', credX, textY);

  ctx.font = '800 30px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00e5a3';
  ctx.fillText(builder.role || 'Solana Protocol Eng', credX, textY + 38);

  textY += 100;

  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('VIBE CHECK:', credX, textY);

  ctx.font = 'italic 700 24px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  drawWrappedText(ctx, `"${builder.quote || 'Converting coconut water into smart contracts'}"`, credX, textY + 36, 450, 30, 2);

  // Bottom Tag
  ctx.font = '800 15px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00e5a3';
  ctx.fillText(`ID: ${builder.badgeNumber || 'BLD-GOA26-001'}`, cardX + 50, cardY + cardH - 35);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ff2a85';
  ctx.fillText('#FrameInGoa', cardX + cardW - 50, cardY + cardH - 35);

  // Draw Sticker
  if (builder.stickers && builder.stickers.length > 0) {
    drawBadgeSticker(ctx, builder.stickers[0], pX + photoSize - 15, pY + 25, 14);
  }
}

/**
 * =========================================================================
 * TEMPLATE 4: BAMBOO VIP PASS (16:9 Landscape, 1600 x 900px)
 * =========================================================================
 */
export async function renderBambooVipTemplate(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement | null,
  builder: BuilderData,
  transform: PhotoTransform
) {
  const W = 1600;
  const H = 900;

  // Background deep forest
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#062916');
  bgGrad.addColorStop(1, '#021209');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 3D Bamboo Canopy at Top
  const bambooCount = 14;
  for (let b = 0; b < bambooCount; b++) {
    const bx = b * 120 - 40;
    ctx.fillStyle = (b % 2 === 0) ? '#607d3b' : '#7b9f4a';
    ctx.fillRect(bx, 0, 110, 70);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#273812';
    ctx.strokeRect(bx, 0, 110, 70);

    // Hemp ties
    ctx.fillStyle = '#b89758';
    ctx.fillRect(bx + 35, 20, 40, 12);
  }

  // Bougainvillea Floral Garland along footer
  for (let fl = 0; fl < 28; fl++) {
    const fx = fl * 60 + 20;
    const fy = H - 35 + Math.sin(fl * 0.8) * 15;
    ctx.fillStyle = (fl % 3 === 0) ? '#ff2a85' : (fl % 2 === 0) ? '#ff4081' : '#e91e63';
    ctx.beginPath();
    ctx.arc(fx, fy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Leaf
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.ellipse(fx + 10, fy + 8, 12, 6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // VIP Pass Container Card
  const cardX = 100;
  const cardY = 110;
  const cardW = W - 200;
  const cardH = H - 200;

  ctx.fillStyle = '#083a21ee';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#f3db47';
  ctx.stroke();

  // Top Left Brand Logo
  drawBrandTitle(ctx, cardX + 220, cardY + 55, 34, '#f3db47', '#ff2a85');

  // Top Right VIP Pill
  const vipW = 200;
  const vipH = 46;
  ctx.fillStyle = '#ff2a85';
  drawRoundedRect(ctx, cardX + cardW - vipW - 40, cardY + 32, vipW, vipH, 23);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.font = '900 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⭐ VIP BUILDER', cardX + cardW - vipW / 2 - 40, cardY + 32 + vipH / 2);

  // Scalloped Photo Frame (Left)
  const photoSize = 340;
  const photoCenterX = cardX + 240;
  const photoCenterY = cardY + 330;

  // Mandala Petals around Photo
  for (let p = 0; p < 16; p++) {
    const rad = (p * Math.PI * 2) / 16;
    const px = photoCenterX + Math.cos(rad) * (photoSize / 2 + 10);
    const py = photoCenterY + Math.sin(rad) * (photoSize / 2 + 10);
    ctx.fillStyle = '#ff2a85';
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Photo Circular Clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(ctx, userImage, photoCenterX - photoSize / 2, photoCenterY - photoSize / 2, photoSize, photoSize, transform, builder.filter);
  } else {
    ctx.fillStyle = '#052917';
    ctx.fillRect(photoCenterX - photoSize / 2, photoCenterY - photoSize / 2, photoSize, photoSize);
  }
  ctx.restore();

  ctx.lineWidth = 5;
  ctx.strokeStyle = '#f3db47';
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  // Right Side Credentials
  const infoX = cardX + 460;
  let curY = cardY + 180;

  ctx.textAlign = 'left';
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('VIP OPERATOR:', infoX, curY);

  ctx.font = '900 46px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText((builder.name || 'ELON MUSK').toUpperCase(), infoX, curY + 48);

  curY += 120;

  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('SPECIALTY / ROLE:', infoX, curY);

  ctx.font = '800 32px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00e5a3';
  ctx.fillText(builder.role || 'Full Stack Visionary', infoX, curY + 40);

  curY += 110;

  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('MOTTO:', infoX, curY);

  ctx.font = 'italic 700 26px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  drawWrappedText(ctx, `"${builder.quote || 'Solana speed, Goa chill'}"`, infoX, curY + 38, 480, 32, 2);

  // Vertical Ticket Stub on Right
  const stubW = 240;
  const stubX = cardX + cardW - stubW;
  const stubY = cardY;
  const stubH = cardH;

  ctx.fillStyle = '#fcfbf2';
  drawRoundedRect(ctx, stubX, stubY, stubW, stubH, [0, 24, 24, 0]);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#084826';
  ctx.stroke();

  // Vertical text
  ctx.save();
  ctx.translate(stubX + 45, stubY + stubH / 2);
  ctx.rotate((-90 * Math.PI) / 180);
  ctx.font = '900 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.textAlign = 'center';
  ctx.fillText('HH GOA 2026 • VIP ACCESS', 0, 0);
  ctx.restore();

  // QR Code on Stub
  try {
    const qrCanvas = await generateQrCanvas(`https://hhgoa.com/vip/${encodeURIComponent(builder.badgeNumber)}`, 140);
    ctx.drawImage(qrCanvas, stubX + 50, stubY + 80, 140, 140);
  } catch {}

  // Draw Sticker
  if (builder.stickers && builder.stickers.length > 0) {
    drawBadgeSticker(ctx, builder.stickers[0], photoCenterX + photoSize * 0.4, photoCenterY - photoSize * 0.4, 12);
  }
}

/**
 * =========================================================================
 * TEMPLATE 5: GOAN VILLA & BEACH CODERS (16:9 Landscape, 1600 x 950px)
 * =========================================================================
 */
export async function renderVillaCodersTemplate(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement | null,
  builder: BuilderData,
  transform: PhotoTransform
) {
  const W = 1600;
  const H = 950;

  // Deep Emerald Green Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0c5c36');
  bgGrad.addColorStop(0.6, '#084729');
  bgGrad.addColorStop(1, '#052e1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Stitched Dashed Border
  ctx.strokeStyle = '#00e5a3';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([10, 8]);
  drawRoundedRect(ctx, 35, 35, W - 70, H - 70, 24);
  ctx.stroke();
  ctx.setLineDash([]);

  // Top Lanyard Slot
  const slotW = 120;
  const slotH = 18;
  ctx.fillStyle = '#031f11';
  drawRoundedRect(ctx, (W - slotW) / 2, 45, slotW, slotH, 9);
  ctx.fill();

  const groundY = 600;

  // Sandy Beach Ground
  ctx.fillStyle = '#e8d8b5';
  ctx.fillRect(40, groundY, W - 80, H - groundY - 40);

  // 1. Goan Villa Portuguese House (Left)
  const villaX = 140;
  const villaY = 220;
  const villaW = 600;
  const villaH = 380;

  // Terracotta Red/Orange Roof
  ctx.fillStyle = '#d35400';
  ctx.fillRect(villaX + 20, villaY + 40, villaW - 40, 50);
  ctx.beginPath();
  ctx.moveTo(villaX, villaY + 90);
  ctx.lineTo(villaX + villaW / 2, villaY + 15);
  ctx.lineTo(villaX + villaW, villaY + 90);
  ctx.closePath();
  ctx.fillStyle = '#c0392b';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1b1208';
  ctx.stroke();

  // Villa White Walls
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(villaX + 30, villaY + 90, villaW - 60, villaH - 90);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1b1208';
  ctx.strokeRect(villaX + 30, villaY + 90, villaW - 60, villaH - 90);

  // Shutter Windows (Hot Pink & Sunshine Yellow)
  const drawShutter = (sx: number, sy: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, 65, 120);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1b1208';
    ctx.strokeRect(sx, sy, 65, 120);
    for (let sl = 1; sl < 6; sl++) {
      ctx.beginPath();
      ctx.moveTo(sx + 5, sy + sl * 20);
      ctx.lineTo(sx + 60, sy + sl * 20);
      ctx.stroke();
    }
  };

  drawShutter(villaX + 70, villaY + 140, '#ff2a85');
  drawShutter(villaX + 175, villaY + 140, '#ff2a85');
  drawShutter(villaX + 370, villaY + 140, '#f3db47');
  drawShutter(villaX + 475, villaY + 140, '#f3db47');

  // Balcony White Railing Pillars
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(villaX + 30, villaY + 280, villaW - 60, 60);
  ctx.strokeRect(villaX + 30, villaY + 280, villaW - 60, 60);
  for (let r = 0; r < 14; r++) {
    const rx = villaX + 50 + r * 38;
    ctx.beginPath();
    ctx.moveTo(rx, villaY + 280);
    ctx.lineTo(rx, villaY + 340);
    ctx.stroke();
  }

  // 2. Tropical Palm Tree
  drawDetailedPalmTree(ctx, 120, groundY + 80, 480, 35, 1.05);

  // 3. Propped Surfboard
  const surfX = 145;
  const surfY = groundY - 140;
  ctx.save();
  ctx.translate(surfX, surfY);
  ctx.rotate((-6 * Math.PI) / 180);

  ctx.fillStyle = '#f3db47';
  ctx.beginPath();
  ctx.ellipse(0, 0, 38, 140, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1b1208';
  ctx.stroke();

  ctx.fillStyle = '#ff2a85';
  ctx.fillRect(-6, -135, 12, 270);

  ctx.save();
  ctx.rotate((90 * Math.PI) / 180);
  ctx.font = '800 13px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#1b1208';
  ctx.textAlign = 'center';
  ctx.fillText('GOA BEACH 2026', 0, 4);
  ctx.restore();

  ctx.restore();

  // 4. Long Wooden Hacker Table with 5 Builders Coding
  const tableX = 180;
  const tableY = groundY + 110;
  const tableW = 1240;
  const tableH = 65;

  ctx.fillStyle = '#b87c4c';
  ctx.fillRect(tableX, tableY, tableW, tableH);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2d1808';
  ctx.strokeRect(tableX, tableY, tableW, tableH);

  const shirtColors = ['#008f5d', '#f3db47', '#ff2a85', '#ffffff', '#00b4d8'];
  const coderCount = 5;
  const coderSpacing = tableW / (coderCount + 1);

  for (let c = 0; c < coderCount; c++) {
    const cx = tableX + (c + 1) * coderSpacing;
    const cy = tableY - 10;

    // Head
    ctx.fillStyle = '#ffb399';
    ctx.beginPath();
    ctx.arc(cx, cy - 65, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1b1208';
    ctx.stroke();

    // Hair
    ctx.fillStyle = '#1b1208';
    ctx.beginPath();
    ctx.arc(cx, cy - 75, 22, Math.PI, 0);
    ctx.fill();

    // Shirt Body
    ctx.fillStyle = shirtColors[c];
    ctx.beginPath();
    ctx.ellipse(cx, cy - 15, 36, 32, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Laptop
    ctx.fillStyle = '#063a21';
    drawRoundedRect(ctx, cx - 35, cy - 25, 70, 45, 6);
    ctx.fill();
    ctx.stroke();

    // Screen
    ctx.fillStyle = '#00e5a3';
    ctx.fillRect(cx - 28, cy - 20, 56, 32);

    // Hands
    ctx.fillStyle = '#ffb399';
    ctx.beginPath();
    ctx.arc(cx - 26, cy + 8, 8, 0, Math.PI * 2);
    ctx.arc(cx + 26, cy + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Drinks on table
    if (c % 2 === 0) {
      ctx.fillStyle = '#7a4214';
      ctx.fillRect(cx + 45, cy - 15, 14, 35);
      ctx.strokeRect(cx + 45, cy - 15, 14, 35);
      ctx.fillStyle = '#f3db47';
      ctx.fillRect(cx + 47, cy - 5, 10, 12);
    }
  }

  // Center Circular Photo Frame
  const photoSize = 310;
  const photoCenterX = 790;
  const photoCenterY = 280;

  // Glow Rings
  ctx.save();
  ctx.shadowColor = '#00e5a3';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoSize * 0.5 + 14, 0, Math.PI * 2);
  ctx.strokeStyle = '#00e5a3';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  ctx.shadowColor = '#f3db47';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoSize * 0.5 + 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#f3db47';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // Circular Clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoSize * 0.5, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(ctx, userImage, photoCenterX - photoSize / 2, photoCenterY - photoSize / 2, photoSize, photoSize, transform, builder.filter);
  } else {
    ctx.fillStyle = '#052917';
    ctx.fillRect(photoCenterX - photoSize / 2, photoCenterY - photoSize / 2, photoSize, photoSize);
  }
  ctx.restore();

  // Right Side Credentials
  const credX = 1010;

  // Top Pill: "BOARDING: BUILDER"
  const pillW = 260;
  const pillH = 48;
  ctx.fillStyle = '#ff2a85';
  drawRoundedRect(ctx, credX, 105, pillW, pillH, 24);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.font = '900 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BOARDING: BUILDER', credX + pillW / 2, 105 + pillH / 2);

  // 1. OPERATOR
  ctx.textAlign = 'left';
  ctx.font = '800 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('OPERATOR:', credX, 200);

  ctx.font = '900 42px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText((builder.name || 'K. TANAKA').toUpperCase(), credX, 248);

  // 2. PRIMARY TOOL
  ctx.font = '800 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('PRIMARY TOOL:', credX, 310);

  ctx.font = '800 30px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00e5a3';
  ctx.fillText(builder.role || 'Svelte (Frontend)', credX, 350);

  // 3. QUIRK (Quote)
  ctx.font = '800 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('quirk:', credX, 415);

  ctx.font = 'italic 700 24px "Cinzel", serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`"${builder.quote || 'Caffeine powered.'}"`, credX + 75, 415);

  // 4. TITLE
  ctx.font = '800 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText('title:', credX, 478);

  ctx.font = '800 26px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.fillText(builder.track || 'Pixel Alchemist', credX + 70, 478);

  // Draw Sticker
  if (builder.stickers && builder.stickers.length > 0) {
    drawBadgeSticker(ctx, builder.stickers[0], photoCenterX + photoSize * 0.42, photoCenterY - photoSize * 0.42, 12);
  }
}

/**
 * =========================================================================
 * TEMPLATE 6: TROPICAL PALM LANYARD (16:9 Landscape, 1600 x 1000px)
 * =========================================================================
 */
export async function renderPalmLanyardTemplate(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement | null,
  builder: BuilderData,
  transform: PhotoTransform
) {
  const W = 1600;
  const H = 1000;

  // Background deep lush emerald
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#094827');
  bgGrad.addColorStop(1, '#052c17');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Background Tropical Palm Fronds Framing
  drawDetailedPalmTree(ctx, 40, H + 60, 550, 40, 1.2);
  drawDetailedPalmTree(ctx, W - 40, H + 60, 550, -40, 1.2);
  drawDetailedPalmTree(ctx, 60, 200, 380, 50, 0.9);
  drawDetailedPalmTree(ctx, W - 60, 200, 380, -50, 0.9);

  // Main Lanyard Pass Card
  const cardX = 120;
  const cardY = 100;
  const cardW = W - cardX * 2;
  const cardH = H - cardY * 2;

  // Card Outer Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  drawRoundedRect(ctx, cardX + 6, cardY + 8, cardW, cardH, 30);
  ctx.fill();

  // Emerald Green Card Face
  ctx.fillStyle = '#0a542e';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#00e5a3';
  ctx.stroke();

  // Stitched Dashed Inner Line
  ctx.strokeStyle = 'rgba(243, 219, 71, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  drawRoundedRect(ctx, cardX + 16, cardY + 16, cardW - 32, cardH - 32, 22);
  ctx.stroke();
  ctx.setLineDash([]);

  // Top Lanyard Slot
  const slotW = 140;
  const slotH = 20;
  ctx.fillStyle = '#031c0e';
  drawRoundedRect(ctx, (W - slotW) / 2, cardY + 22, slotW, slotH, 10);
  ctx.fill();

  // Top Left: "HACKER गोवा HOUSE" Logo
  drawBrandTitle(ctx, cardX + 220, cardY + 70, 36, '#f3db47', '#ff2a85');

  // Top Right: "Boarding: Builder" Yellow Pill
  const pillW = 260;
  const pillH = 50;
  const pillX = cardX + cardW - pillW - 40;
  const pillY = cardY + 48;

  ctx.fillStyle = '#f3db47';
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 25);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#031c0e';
  ctx.stroke();

  ctx.font = '900 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#063a1f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Boarding: Builder', pillX + pillW / 2, pillY + pillH / 2 + 1);

  // Left Photo Box with Neon Gold Double Border
  const photoW = 380;
  const photoH = 460;
  const photoX = cardX + 55;
  const photoY = cardY + 150;

  ctx.fillStyle = '#031c0e';
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 22);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = '#f3db47';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#f3db47';
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 22);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  drawRoundedRect(ctx, photoX + 8, photoY + 8, photoW - 16, photoH - 16, 16);
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(ctx, userImage, photoX + 8, photoY + 8, photoW - 16, photoH - 16, transform, builder.filter);
  } else {
    ctx.fillStyle = '#062916';
    ctx.fillRect(photoX + 8, photoY + 8, photoW - 16, photoH - 16);
  }
  ctx.restore();

  // Right Side: Ivory Info Panel
  const panelX = photoX + photoW + 45;
  const panelY = photoY;
  const panelW = cardW - (photoW + 155);
  const panelH = photoH;

  ctx.fillStyle = '#fcfbf2';
  drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 20);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#063a1f';
  ctx.stroke();

  const infoLeft = panelX + 45;
  let textY = panelY + 55;

  // 1. NAME
  ctx.textAlign = 'left';
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.fillText('NAME:', infoLeft, textY);

  ctx.font = '900 40px "Cinzel", serif';
  ctx.fillStyle = '#031c0e';
  ctx.fillText((builder.name || 'ALEX RIVERA').toUpperCase(), infoLeft, textY + 45);

  ctx.strokeStyle = '#d6cca8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(infoLeft, textY + 62);
  ctx.lineTo(panelX + panelW - 50, textY + 62);
  ctx.stroke();

  textY += 115;

  // 2. DEPARTING FROM
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.fillText('DEPARTING FROM:', infoLeft, textY);

  ctx.font = '800 32px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#031c0e';
  ctx.fillText(builder.role || 'Rust (Backend)', infoLeft, textY + 42);

  ctx.beginPath();
  ctx.moveTo(infoLeft, textY + 58);
  ctx.lineTo(panelX + panelW - 50, textY + 58);
  ctx.stroke();

  textY += 115;

  // 3. SEAT ASSIGNMENT
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#084826';
  ctx.fillText('SEAT ASSIGNMENT:', infoLeft, textY);

  ctx.font = '800 24px monospace';
  ctx.fillStyle = '#031c0e';
  ctx.fillText(builder.quote || 'Senior Pixel Pusher', infoLeft, textY + 36);
  ctx.fillText(`'${builder.customId || '0x01A'}'`, infoLeft, textY + 68);

  // 4. Live Scannable QR Code
  try {
    const qrCanvas = await generateQrCanvas(
      `https://hhgoa.com/builder/${encodeURIComponent(builder.badgeNumber)}`,
      130
    );
    ctx.drawImage(qrCanvas, panelX + panelW - 165, panelY + panelH - 165, 130, 130);
  } catch {}

  // Bottom Ribbon: "Build, Ship, Launch, Repeat"
  const ribW = 480;
  const ribH = 46;
  const ribX = (W - ribW) / 2;
  const ribY = cardY + cardH - 58;

  ctx.fillStyle = '#073c20';
  drawRoundedRect(ctx, ribX, ribY, ribW, ribH, 23);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#f3db47';
  ctx.stroke();

  ctx.font = '900 20px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#f3db47';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Build, Ship, Launch, Repeat', W / 2, ribY + ribH / 2);

  // Draw Sticker
  if (builder.stickers && builder.stickers.length > 0) {
    drawBadgeSticker(ctx, builder.stickers[0], photoX + photoW - 20, photoY + 25, 15);
  }
}

/**
 * =========================================================================
 * TEMPLATE 7: TROPICAL PFP OVERLAY (1:1 Square, 1200 x 1200px)
 * =========================================================================
 */
export async function renderPfpOverlayTemplate(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement | null,
  builder: BuilderData,
  transform: PhotoTransform
) {
  const W = 1200;
  const H = 1200;

  // Background
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 600);
  bgGrad.addColorStop(0, '#0a3d24');
  bgGrad.addColorStop(1, '#03140b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Center Circular Photo Frame
  const circleRadius = 430;
  const circleCenterX = W / 2;
  const circleCenterY = H / 2;

  // Photo Circular Clip
  ctx.save();
  ctx.beginPath();
  ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (userImage) {
    drawTransformedPhoto(ctx, userImage, circleCenterX - circleRadius, circleCenterY - circleRadius, circleRadius * 2, circleRadius * 2, transform, builder.filter);
  } else {
    ctx.fillStyle = '#062014';
    ctx.fillRect(circleCenterX - circleRadius, circleCenterY - circleRadius, circleRadius * 2, circleRadius * 2);
  }
  ctx.restore();

  // Multi-layered Glowing Neon Rings
  ctx.save();
  ctx.shadowColor = '#ff2a85';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(circleCenterX, circleCenterY, circleRadius + 14, 0, Math.PI * 2);
  ctx.strokeStyle = '#ff2a85';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.shadowColor = '#f3db47';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(circleCenterX, circleCenterY, circleRadius + 28, 0, Math.PI * 2);
  ctx.strokeStyle = '#f3db47';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();

  // Corner Palm Fronds
  drawDetailedPalmTree(ctx, 40, H - 40, 180, 50, 0.6);
  drawDetailedPalmTree(ctx, W - 40, H - 40, 180, -50, 0.6);
  drawDetailedPalmTree(ctx, 40, 160, 180, 50, 0.6);
  drawDetailedPalmTree(ctx, W - 40, 160, 180, -50, 0.6);

  // Top Badge Arch: "HACKER गोवा HOUSE"
  const topPillW = 560;
  const topPillH = 75;
  const topPillX = (W - topPillW) / 2;
  const topPillY = 110;

  ctx.fillStyle = '#052917';
  drawRoundedRect(ctx, topPillX, topPillY, topPillW, topPillH, 37);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f3db47';
  ctx.stroke();

  drawBrandTitle(ctx, W / 2, topPillY + 54, 40, '#f3db47', '#ff2a85');

  // Bottom Ribbon: "#FRAMEINGOA • 2026"
  const botPillW = 520;
  const botPillH = 68;
  const botPillX = (W - botPillW) / 2;
  const botPillY = H - 170;

  ctx.fillStyle = '#052917';
  drawRoundedRect(ctx, botPillX, botPillY, botPillW, botPillH, 34);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ff2a85';
  ctx.stroke();

  ctx.font = '900 24px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('#FRAMEINGOA  •  2026', W / 2, botPillY + botPillH / 2);
}

/**
 * Helper to asynchronously load an image with crossOrigin
 */
const imageCache = new Map<string, HTMLImageElement>();

export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Main Master Canvas Rendering Dispatcher
 */
export async function renderBadgeOnCanvas(
  canvas: HTMLCanvasElement,
  templateId: TemplateId,
  userImage: HTMLImageElement | string | null,
  builder: BuilderData,
  transform: PhotoTransform
): Promise<void> {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // Resolve userImage if passed as string
  let resolvedImg: HTMLImageElement | null = null;
  if (userImage instanceof HTMLImageElement) {
    resolvedImg = userImage;
  } else if (typeof userImage === 'string' && userImage.length > 0) {
    try {
      resolvedImg = await loadImageAsync(userImage);
    } catch (err) {
      console.warn('Could not load user image:', err);
    }
  }

  // Set crisp antialiasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  switch (templateId) {
    case 'notice-board':
      canvas.width = 1600;
      canvas.height = 1000;
      await renderNoticeBoardTemplate(ctx, resolvedImg, builder, transform);
      break;

    case 'hacker-desk':
      canvas.width = 1200;
      canvas.height = 1500;
      await renderHackerDeskTemplate(ctx, resolvedImg, builder, transform);
      break;

    case 'beach-shack':
      canvas.width = 1200;
      canvas.height = 1500;
      await renderBeachShackTemplate(ctx, resolvedImg, builder, transform);
      break;

    case 'bamboo-vip':
      canvas.width = 1600;
      canvas.height = 900;
      await renderBambooVipTemplate(ctx, resolvedImg, builder, transform);
      break;

    case 'villa-coders':
      canvas.width = 1600;
      canvas.height = 950;
      await renderVillaCodersTemplate(ctx, resolvedImg, builder, transform);
      break;

    case 'palm-lanyard':
      canvas.width = 1600;
      canvas.height = 1000;
      await renderPalmLanyardTemplate(ctx, resolvedImg, builder, transform);
      break;

    case 'pfp-frame':
      canvas.width = 1200;
      canvas.height = 1200;
      await renderPfpOverlayTemplate(ctx, resolvedImg, builder, transform);
      break;

    default:
      canvas.width = 1600;
      canvas.height = 1000;
      await renderNoticeBoardTemplate(ctx, resolvedImg, builder, transform);
      break;
  }
}
