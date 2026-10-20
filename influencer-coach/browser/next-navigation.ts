import { navigate } from "./router.ts";
export const useRouter = () => ({ push: navigate, replace: navigate });
