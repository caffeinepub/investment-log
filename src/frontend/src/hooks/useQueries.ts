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
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ["records"] });
      await queryClient.cancelQueries({ queryKey: ["totalMinutes"] });
      const prevRecords = queryClient.getQueryData(["records"]);
      const prevTotal = queryClient.getQueryData(["totalMinutes"]);
      const tempId = BigInt(-Date.now());
      queryClient.setQueryData(["records"], (old: any[]) => [
        ...(old ?? []),
        {
          id: tempId,
          record: {
            date: args.date,
            duration: args.duration,
            moodBefore: args.moodBefore,
            moodAfter: args.moodAfter,
            memo: args.memo,
          },
        },
      ]);
      queryClient.setQueryData(
        ["totalMinutes"],
        (old: bigint) => (old ?? BigInt(0)) + args.duration,
      );
      return { prevRecords, prevTotal };
    },
    onError: (_err, _args, context: any) => {
      if (context?.prevRecords !== undefined)
        queryClient.setQueryData(["records"], context.prevRecords);
      if (context?.prevTotal !== undefined)
        queryClient.setQueryData(["totalMinutes"], context.prevTotal);
    },
    onSettled: () => {
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
    onMutate: async (id: bigint) => {
      await queryClient.cancelQueries({ queryKey: ["records"] });
      await queryClient.cancelQueries({ queryKey: ["totalMinutes"] });
      const prevRecords = queryClient.getQueryData<any[]>(["records"]) ?? [];
      const prevTotal =
        queryClient.getQueryData<bigint>(["totalMinutes"]) ?? BigInt(0);
      const removing = prevRecords.find((r: any) => r.id === id);
      queryClient.setQueryData(
        ["records"],
        prevRecords.filter((r: any) => r.id !== id),
      );
      if (removing) {
        queryClient.setQueryData(["totalMinutes"], (old: bigint) => {
          const next = (old ?? BigInt(0)) - removing.record.duration;
          return next < BigInt(0) ? BigInt(0) : next;
        });
      }
      return { prevRecords, prevTotal };
    },
    onError: (_err, _id, context: any) => {
      if (context?.prevRecords !== undefined)
        queryClient.setQueryData(["records"], context.prevRecords);
      if (context?.prevTotal !== undefined)
        queryClient.setQueryData(["totalMinutes"], context.prevTotal);
    },
    onSettled: () => {
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
  useQuery<any[]>({ queryKey: ["investments"], queryFn: async () => [] });
export const useAddInvestment = () =>
  useMutation({ mutationFn: async (_args: unknown) => {} });
export const useDeleteInvestment = () =>
  useMutation({ mutationFn: async (_id: unknown) => {} });
