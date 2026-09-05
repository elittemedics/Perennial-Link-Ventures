'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

interface FollowBusinessButtonProps {
  businessId: string;
  businessName: string;
  initialFollowerCount?: number;
}

export default function FollowBusinessButton({
  businessId,
  businessName,
  initialFollowerCount = 0,
}: FollowBusinessButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/v1/businesses/${businessId}/follow`)
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success) {
          setIsFollowing(data.isFollowing);
          setFollowerCount(data.followerCount);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [businessId]);

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/businesses/${businessId}/follow`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (data.success) {
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleFollow}
      disabled={loading || initialLoading}
      aria-label={isFollowing ? `Unfollow ${businessName}` : `Follow ${businessName}`}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
        isFollowing
          ? 'bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-600 border border-slate-300 hover:border-rose-200'
          : 'bg-navy hover:bg-slate-900 text-white hover:text-gold-300 border border-gold/30'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-sea" />
      ) : isFollowing ? (
        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <UserPlus className="w-3.5 h-3.5 text-gold-400" />
      )}
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
      <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-black/10 dark:bg-white/10 font-black">
        {followerCount}
      </span>
    </button>
  );
}
