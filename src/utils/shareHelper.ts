import { BuilderData } from '../types';

export function getCanvasBlob(canvas: HTMLCanvasElement, format: 'image/png' | 'image/jpeg' = 'image/png', quality: number = 0.95): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), format, quality);
  });
}

export async function saveCanvasToFile(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'jpg' | 'jpeg' = 'png'
): Promise<void> {
  const isJpg = format === 'jpg' || format === 'jpeg';
  const mimeType = isJpg ? 'image/jpeg' : 'image/png';
  const ext = isJpg ? 'jpg' : 'png';

  // Ensure clean filename ending strictly with .png or .jpg
  let baseName = filename.replace(/\.(png|jpg|jpeg)$/i, '').trim();
  if (!baseName) baseName = 'HH_Goa_2026_Badge';
  // Remove any non-alphanumeric/safe characters
  baseName = baseName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const fullFileName = `${baseName}.${ext}`;

  // Get binary Blob from Canvas
  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), mimeType, isJpg ? 0.95 : 1.0);
  });

  if (!blob) {
    // Direct Data URL fallback
    const dataUrl = canvas.toDataURL(mimeType, isJpg ? 0.95 : 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fullFileName;
    link.setAttribute('download', fullFileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 2000);
    return;
  }

  // Strategy 1: Native File System Access API (Windows / Chrome / Edge)
  // This explicitly sets the file type in Windows Explorer Save As dialog so it cannot lose its .png/.jpg extension
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const pickerOptions = {
        suggestedName: fullFileName,
        types: [
          {
            description: isJpg ? 'JPEG Image (*.jpg)' : 'PNG Image (*.png)',
            accept: {
              [mimeType]: [`.${ext}`]
            }
          }
        ]
      };
      const fileHandle = await (window as any).showSaveFilePicker(pickerOptions);
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (pickerErr: any) {
      if (pickerErr.name === 'AbortError') {
        // User cancelled the save dialog, do not fallback
        return;
      }
      console.warn('Native picker skipped, using File Blob fallback:', pickerErr);
    }
  }

  // Strategy 2: Typed File Object with prolonged ObjectURL
  try {
    const file = new File([blob], fullFileName, { type: mimeType });
    const objectUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = objectUrl;
    link.download = fullFileName;
    link.setAttribute('download', fullFileName);
    document.body.appendChild(link);
    link.click();

    // Keep Object URL alive for 5 minutes so Windows background downloader never loses the file
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(objectUrl);
    }, 300000);
  } catch (fileErr) {
    console.error('File Blob download error:', fileErr);
    // Strategy 3: Data URL fallback
    const dataUrl = canvas.toDataURL(mimeType, isJpg ? 0.95 : 1.0);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fullFileName;
    link.setAttribute('download', fullFileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 2000);
  }
}

export function openCanvasInNewTab(canvas: HTMLCanvasElement): void {
  try {
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const win = window.open();
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hacker House Goa 2026 — Builder ID</title>
            <style>
              body { margin: 0; background: #03140b; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; color: #fff; padding: 20px; box-sizing: border-box; }
              img { max-width: 90vw; max-height: 85vh; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border: 2px solid #00e5a3; }
              p { margin-top: 16px; color: #00e5a3; font-size: 16px; font-weight: bold; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="HH Goa 2026 Builder ID" />
            <p>🌴 Right-click or hold on image and select "Save Image As..."</p>
          </body>
        </html>
      `);
      win.document.close();
    }
  } catch (e) {
    console.error('Could not open in new tab:', e);
  }
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await getCanvasBlob(canvas, 'image/png');
    if (!blob) return false;

    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

export function generateTweetUrl(builder: BuilderData, templateName: string): string {
  const name = builder.name.trim() || 'Builder';
  const role = builder.role.trim() || 'Developer';
  const quote = builder.quote.trim();

  const textLines = [
    `🌴 Official Builder ID for Hacker House Goa 2026! 🚀`,
    ``,
    `👤 Builder: ${name}`,
    `⚡ Stack / Role: ${role}`,
    quote ? `💬 "${quote}"` : '',
    ``,
    `🌴 #FrameInGoa @HackerHouseGoa #HHGoa2026 #Solana`
  ].filter(Boolean).join('\n');

  const encodedText = encodeURIComponent(textLines);
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

export async function shareViaNativeOrX(canvas: HTMLCanvasElement, builder: BuilderData, templateName: string): Promise<'native_shared' | 'x_opened' | 'downloaded'> {
  const blob = await getCanvasBlob(canvas, 'image/png');
  const filename = `HHGoa2026_${builder.name.replace(/\s+/g, '_') || 'Builder'}.png`;

  if (blob && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Hacker House Goa 2026 Builder ID',
          text: `🌴 Here is my official Builder ID for Hacker House Goa 2026! #FrameInGoa @HackerHouseGoa #HHGoa2026 #Solana`
        });
        return 'native_shared';
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Native share failed, falling back to X intent:', err);
      } else {
        return 'native_shared';
      }
    }
  }

  // Fallback: Copy to clipboard and open X intent
  if (canvas) {
    await copyCanvasToClipboard(canvas);
  }
  const tweetUrl = generateTweetUrl(builder, templateName);
  window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  return 'x_opened';
}
