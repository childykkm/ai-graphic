export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

export const downloadSingle = (url: string, filename: string): void => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  a.click();
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
    zip.file(getFilename(i), img.url.split(',')[1], { base64: true });
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
