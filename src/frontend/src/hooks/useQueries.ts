import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// TreeState type (matches backend.d.ts; backend.ts is protected and doesn't export it yet)
interface TreeState {
  personality: string;
  cycleIndex: bigint;
  stayHere: boolean;
  cycleCompleteShown: boolean;
}

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

export function useGetTreeState() {
  const { actor, isFetching } = useActor();
  return useQuery<TreeState | null>({
    queryKey: ["treeState"],
    queryFn: async () => {
      if (!actor) return null;
      // biome-ignore lint/suspicious/noExplicitAny: backend.ts is protected; method exists at runtime
      return (actor as any).getTreeState() as Promise<TreeState>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetTreeState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      personality: string;
      cycleIndex: bigint;
      stayHere: boolean;
      cycleCompleteShown: boolean;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // biome-ignore lint/suspicious/noExplicitAny: backend.ts is protected; method exists at runtime
      return (actor as any).setTreeState(
        args.personality,
        args.cycleIndex,
        args.stayHere,
        args.cycleCompleteShown,
      ) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treeState"] });
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
