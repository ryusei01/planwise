/**
 * Subscription repository
 * ID: SUBSCRIPTION_REPO_001
 */
import { supabase } from '../lib/supabase';
import { Subscription, SubscriptionStatus } from '../types/database';

export class SubscriptionRepository {
  /**
   * Get subscription for current user
   */
  async getSubscription(): Promise<Subscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    return data;
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    const subscription = await this.getSubscription();
    if (!subscription) {
      return false;
    }

    const activeStatuses: SubscriptionStatus[] = ['active', 'trialing'];
    return activeStatuses.includes(subscription.status);
  }
}

export const subscriptionRepository = new SubscriptionRepository();

