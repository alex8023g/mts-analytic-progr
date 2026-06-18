import { ReadonlyURLSearchParams } from 'next/navigation';

export function createSearchParams(
  params: Record<string, string | number | Date | null | undefined>,
  searchParams: ReadonlyURLSearchParams,
) {
  const newSearchParams = new URLSearchParams(searchParams?.toString());

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams;
}
