let paramCounter = 0;

export function resetQueryParams(): void {
  paramCounter = 0;
}

export function uniqueQueryParam(field: string): string {
  return `${field.replace(/\./g, '_')}_${++paramCounter}`;
}
