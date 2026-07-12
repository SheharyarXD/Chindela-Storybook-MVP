import { trpc } from "@/providers/trpc";

export function useChildAuth() {
  return trpc.auth.childMe.useQuery(undefined, { retry: false });
}
