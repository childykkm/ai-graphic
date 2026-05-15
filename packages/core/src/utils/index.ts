export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

export const formatErrorMessage = (err: unknown): string => {
  if (!(err instanceof Error)) return '알 수 없는 오류가 발생했습니다.';

  const msg = err.message;

  if (msg.includes('403') && msg.includes('permission')) {
    return 'API 키에 해당 모델 접근 권한이 없습니다. 다른 모델을 선택하거나 권한이 부여된 API 키를 확인하세요.';
  }

  return msg || '생성 중 오류가 발생했습니다. 다시 시도해주세요.';
};
