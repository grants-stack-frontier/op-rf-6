import { useToast } from "@/components/ui/use-toast";
import { agoraRoundsAPI } from "@/config";
import { request } from "@/lib/request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Comment = {
  address: string;
  comment: string;
  commentId: number;
  createdAt: string;
  updatedAt: string;
  votes: [];
  voteCount: number;
};
type CommentVote = {
  commentId: string;
  voter: string;
  vote: number;
  createdAt: string;
  updatedAt: string;
};
type Meta = {
  has_next: boolean;
  next_offset: number;
  total_returned: number;
};

export type CommentSort = "newest" | "votes";
export type CommentFilter = {
  sort: CommentSort;
  limit: number;
  offset: number;
};
export const defaultCommentFilter: CommentFilter = {
  limit: 10,
  offset: 0,
  sort: "votes",
};
export const commentSortLabels = {
  votes: "Top comments",
  newest: "Newest",
};
export function useComments(metricId = "_", filter: CommentFilter) {
  return useQuery({
    enabled: Boolean(metricId),
    queryKey: ["comments", { metricId, filter }],
    queryFn: async () =>
      request
        .get(`${agoraRoundsAPI}/impactMetrics/${metricId}/comments`, {
          searchParams: filter,
        })
        .json<{ data: Comment[]; meta: Meta }>(),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      metricId,
      comment,
    }: {
      metricId: string;
      comment: string;
    }) =>
      request
        .put(`${agoraRoundsAPI}/impactMetrics/${metricId}/comments`, {
          json: { comment },
        })
        .then(async (r) => {
          await queryClient.invalidateQueries({
            queryKey: ["comments", { metricId }],
          });
          return r;
        }),
  });
}

export function useDeleteComment() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      metricId,
      commentId,
    }: {
      metricId: string;
      commentId: string;
    }) =>
      request.delete(
        `${agoraRoundsAPI}/impactMetrics/${metricId}/comments/${commentId}`
      ),
    onError: () =>
      toast({ variant: "destructive", title: "Error deleting comment" }),
  });
}

export function useCommentVotes({
  commentId,
  metricId,
}: {
  commentId: string;
  metricId: string;
}) {
  const { toast } = useToast();
  return useQuery({
    enabled: Boolean(commentId),
    queryKey: ["comments", { metricId, commentId }],
    queryFn: async () =>
      request
        .get(
          `${agoraRoundsAPI}/impactMetrics/${metricId}/comments/${commentId}/votes`
        )
        .json<CommentVote[]>()
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Error loading comment votes",
          });

          return [];
        }),
  });
}

export function useVoteComment() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      metricId,
      commentId,
    }: {
      metricId: string;
      commentId: string;
    }) =>
      request.put(
        `${agoraRoundsAPI}/impactMetrics/${metricId}/comments/${commentId}/votes`
      ),
    onError: () =>
      toast({ variant: "destructive", title: "Error voting on comment" }),
  });
}
