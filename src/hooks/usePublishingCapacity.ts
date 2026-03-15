import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PublishingStats {
  articlesThisMonth: number;
  articlesThisWeek: number;
  maxMonthly: number;
  maxWeekly: number;
}

export function usePublishingCapacity() {
  const { user } = useAuth();

  const { data: stats, isLoading, refetch, error } = useQuery<PublishingStats>({
    queryKey: ['publishingCapacity', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const [thisMonth, thisWeek] = await Promise.all([
        supabase
          .from('articles')
          .select('id', { count: 'exact' })
          .eq('author_id', user.id)
          .gte('created_at', getFirstDayOfMonth())
          .then(r => r.count || 0),
        supabase
          .from('articles')
          .select('id', { count: 'exact' })
          .eq('author_id', user.id)
          .gte('created_at', getFirstDayOfWeek())
          .then(r => r.count || 0),
      ]);

      return {
        articlesThisMonth: thisMonth,
        articlesThisWeek: thisWeek,
        maxMonthly: 20,
        maxWeekly: 5,
      };
    },
    enabled: !!user,
  });

  return {
    stats,
    canPublish: !stats || (stats.articlesThisMonth < stats.maxMonthly && stats.articlesThisWeek < stats.maxWeekly),
    loading: isLoading,
    error,
    refetch,
  };
}

function getFirstDayOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getFirstDayOfWeek(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as first day
  return new Date(now.setDate(diff)).toISOString().split('T')[0] + 'T00:00:00.000Z';
}