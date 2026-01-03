/**
 * Notification repository
 * ID: NOTIFICATION_REPO_001
 */
import { supabase } from '../lib/supabase';
import { Notification } from '../types/database';

export class NotificationRepository {
  /**
   * Get notifications for current user
   */
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('delivered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Mark notification as opened
   */
  async markAsOpened(notificationId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('opened_at', null);

    if (error) {
      return 0;
    }

    return count || 0;
  }
}

export const notificationRepository = new NotificationRepository();
