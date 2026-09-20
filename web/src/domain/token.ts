export type Token = { kind: 'number'; value: number } | { kind: 'letter'; value: string };

export function tokenLabel(token: Token): string {
  return token.kind === 'number' ? String(token.value) : token.value;
}

export function tokensEqual(a: Token, b: Token): boolean {
  return a.kind === b.kind && a.value === b.value;
}
