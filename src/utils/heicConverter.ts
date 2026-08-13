import heic2any from 'heic2any';

export async function convertHeicIfNecessary(file: File): Promise<string> {
  const isHeic = file.type === 'image/heic' || 
                 file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') || 
                 file.name.toLowerCase().endsWith('.heif');

  if (!isHeic) {
    return URL.createObjectURL(file);
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('HEIC conversion error:', err);
    // Fallback: create object URL directly
    return URL.createObjectURL(file);
  }
}
