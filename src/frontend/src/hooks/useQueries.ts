import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// TreeState type (matches backend.d.ts; backend.ts is protected and doesn't export it yet)
interface TreeState {
  personality: string;
  cycleIndex: bigint;
  stayHere: boolean;
  cycleCompleteShown: boolean;
}

// ---- Meditation Log hooks ----

export function useGetAllRecords() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getAllRecordsWithIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalMinutes() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["totalMinutes"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getTotalMinutes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecord() {
  const { actor } = useActor(createActor);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).addRecord(
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).deleteRecord(id);
    },
    onMutate: async (id: bigint) => {
      await queryClient.cancelQueries({ queryKey: ["records"] });
      await queryClient.cancelQueries({ queryKey: ["totalMinutes"] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prevRecords = queryClient.getQueryData<any[]>(["records"]) ?? [];
      const prevTotal =
        queryClient.getQueryData<bigint>(["totalMinutes"]) ?? BigInt(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const removing = prevRecords.find((r: any) => r.id === id);
      queryClient.setQueryData(
        ["records"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export function useUpdateRecord() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      duration,
      memo,
    }: {
      id: bigint;
      duration: bigint;
      memo: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateRecord(id, duration, memo);
    },
    onMutate: async ({ id, duration, memo }) => {
      await queryClient.cancelQueries({ queryKey: ["records"] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prevRecords = queryClient.getQueryData<any[]>(["records"]) ?? [];
      queryClient.setQueryData(
        ["records"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prevRecords.map((r: any) =>
          r.id === id ? { ...r, record: { ...r.record, duration, memo } } : r,
        ),
      );
      return { prevRecords };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (_err: any, _vars: any, context: any) => {
      if (context?.prevRecords !== undefined)
        queryClient.setQueryData(["records"], context.prevRecords);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}

export function useGetTreeState() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TreeState | null>({
    queryKey: ["treeState"],
    queryFn: async () => {
      if (!actor) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getTreeState() as Promise<TreeState>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetTreeState() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      personality: string;
      cycleIndex: bigint;
      stayHere: boolean;
      cycleCompleteShown: boolean;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// ---- Visit & Feedback hooks ----

export function useRecordVisit() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["recordVisit"],
    queryFn: async () => {
      if (!actor) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).recordVisit();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetVisitCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["visitCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getVisitCount() as Promise<bigint>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllFeedback() {
  const { actor, isFetching } = useActor(createActor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<any[]>({
    queryKey: ["allFeedback"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getAllFeedback() as Promise<any[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (args: { name: string; message: string }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).submitFeedback(
        args.name,
        args.message,
      ) as Promise<void>;
    },
  });
}

// ---- Legacy stubs (kept for InvestmentLog.tsx compat) ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useGetInvestments = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useQuery<any[]>({ queryKey: ["investments"], queryFn: async () => [] });
export const useAddInvestment = () =>
  useMutation({ mutationFn: async (_args: unknown) => {} });
export const useDeleteInvestment = () =>
  useMutation({ mutationFn: async (_id: unknown) => {} });
