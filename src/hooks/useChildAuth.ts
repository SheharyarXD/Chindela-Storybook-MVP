import { trpc } from "@/providers/trpcClient";

export function useChildAuth() {
  return trpc.auth.childMe.useQuery(undefined, { retry: false });
}
