/**
 * Optional in-browser AI backend. The hosted demo build sets `json` to call Claude through the
 * viewer's own account; the server build leaves it empty and uses the Anthropic SDK instead.
 */
export const aiHooks: {
  json?: (system: string, prompt: string, images?: string[]) => Promise<unknown>;
} = {};
