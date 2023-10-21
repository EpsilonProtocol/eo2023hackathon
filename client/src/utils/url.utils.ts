export const attachParams = (
  baseUrl: string,
  params: Record<string, string>,
): string => {
  return `${baseUrl}/?` + new URLSearchParams(params).toString();
};
