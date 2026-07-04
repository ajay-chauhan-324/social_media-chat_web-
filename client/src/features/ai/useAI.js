import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import aiService from '@/services/aiService';
import { getErrorMessage } from '@/lib/axios';

export const aiKeys = {
  tools: ['ai', 'tools'],
  history: ['ai', 'history'],
  conversation: (id) => ['ai', 'conversation', id],
};

export const useAITools = () =>
  useQuery({ queryKey: aiKeys.tools, queryFn: aiService.tools, staleTime: Infinity });

export const useAIHistory = (q = '') =>
  useQuery({
    queryKey: [...aiKeys.history, q],
    queryFn: () => aiService.history({ q, limit: 50 }).then((r) => r.data.conversations),
  });

export const useAIConversation = (id) =>
  useQuery({
    queryKey: aiKeys.conversation(id),
    queryFn: () => aiService.conversation(id),
    enabled: Boolean(id),
  });

export const useAIChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => aiService.chat(payload),
    onSuccess: (conversation) => {
      qc.setQueryData(aiKeys.conversation(conversation._id), conversation);
      qc.invalidateQueries({ queryKey: aiKeys.history });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useRunTool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => aiService.runTool(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiKeys.history }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};

export const useDeleteConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => aiService.deleteConversation(id),
    onSuccess: () => {
      toast.success('Conversation deleted');
      qc.invalidateQueries({ queryKey: aiKeys.history });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
};
