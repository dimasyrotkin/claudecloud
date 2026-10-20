/** The demo never calls the Anthropic SDK directly (it uses the viewer's Claude via ai-hooks). */
class APIError extends Error {
  status?: number;
}
export default class Anthropic {
  static APIError = APIError;
  constructor() {
    throw new Error("Anthropic SDK is not available in the browser demo");
  }
}
export const betaZodOutputFormat = (x: unknown) => x;
