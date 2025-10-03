// src/utils/hash.ts
export function readSearchParamsFromHash(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }

  const hash = window.location.hash || '';
  const idx = hash.indexOf('?');
  const qs = idx >= 0 ? hash.slice(idx + 1) : '';

  return new URLSearchParams(qs);
}

export function buildPeopleHashFromParams(params: URLSearchParams): string {
  const qs = params.toString();

  return qs ? `#/people?${qs}` : '#/people';
}
