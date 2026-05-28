export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

export const downloadSingle = (url: string, filename: string): void => {
  if (url.startsWith('data:')) {
    const [header, data] = url.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const ext = mimeType === 'image/jpeg' ? 'jpg'
      : mimeType === 'image/webp' ? 'webp'
      : 'png';
    const baseName = filename.replace(/\.[^.]+$/, '');
    const finalName = `${baseName}.${ext}`;
    const bytes = atob(data);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
    const blob = new Blob([buffer], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = finalName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } else {
    const finalName = filename.endsWith('.png') ? filename : `${filename}.png`;
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    a.click();
  }
};

export const formatDate = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatFileDate = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
};

export const formatDownloadDate = (ts: number): string => {
  const d = new Date(ts);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yy}${mm}${dd}_${hh}${min}`;
};

export const downloadZip = async (
  images: Array<{ url: string }>,
  zipName: string,
  getFilename: (index: number) => string
): Promise<void> => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  images.forEach((img, i) => {
    const [header, data] = img.url.split(',');
    const mimeType = header.split(':')[1]?.split(';')[0] ?? 'image/png';
    const ext = mimeType === 'image/jpeg' ? 'jpg'
      : mimeType === 'image/webp' ? 'webp'
      : 'png';
    const baseName = getFilename(i).replace(/\.[^.]+$/, '');
    zip.file(`${baseName}.${ext}`, data, { base64: true });
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = zipName;
  a.click();
};

export const formatErrorMessage = (err: unknown): string => {
  if (!(err instanceof Error)) return '알 수 없는 오류가 발생했습니다.';

  const msg = err.message;

  if (msg.includes('403') && msg.includes('permission')) {
    return 'API 키에 해당 모델 접근 권한이 없습니다. 다른 모델을 선택하거나 권한이 부여된 API 키를 확인하세요.';
  }

  return msg || '생성 중 오류가 발생했습니다. 다시 시도해주세요.';
};
