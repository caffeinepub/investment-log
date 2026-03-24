import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ---- Meditation Log hooks ----

export function useGetAllRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecordsWithIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalMinutes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["totalMinutes"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalMinutes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      date: string;
      duration: bigint;
      moodBefore: bigint;
      moodAfter: bigint;
      memo: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addRecord(
        args.date,
        args.duration,
        args.moodBefore,
        args.moodAfter,
        args.memo,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["totalMinutes"] });
    },
  });
}

export function useDeleteRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.invalidateQueries({ queryKey: ["totalMinutes"] });
    },
  });
}

// ---- Legacy stubs (kept for InvestmentLog.tsx compat) ----
export const useGetInvestments = () =>
  // biome-ignore lint/suspicious/noExplicitAny: legacy stub
  useQuery<any[]>({ queryKey: ["investments"], queryFn: async () => [] });
export const useAddInvestment = () =>
  useMutation({ mutationFn: async (_args: unknown) => {} });
export const useDeleteInvestment = () =>
  useMutation({ mutationFn: async (_id: unknown) => {} });
