export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function requireAuth(user: unknown, entity: string): void {
  if (!user) {
    throw new Error(`You must be logged in to ${entity}`);
  }
}
