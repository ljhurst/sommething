'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpaces } from '@/hooks/useSpaces';
import { useAuth } from '@/contexts/AuthContext';
import type { Space, SpaceMember } from '@/lib/types';

interface ShareSpaceModalProps {
  isOpen: boolean;
  space: Space;
  onClose: () => void;
}

export function ShareSpaceModal({ isOpen, space, onClose }: ShareSpaceModalProps) {
  const { user } = useAuth();
  const { getSpaceMembers, inviteMemberByEmail, updateSpaceMember, removeSpaceMember } =
    useSpaces();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const isOwner = user?.id === space.owner_user_id;

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const membersData = await getSpaceMembers(space.id);
    setMembers(membersData);
    setLoading(false);
  }, [getSpaceMembers, space.id]);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, loadMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);

    const result = await inviteMemberByEmail(space.id, inviteEmail, inviteRole);

    if (result.success) {
      setInviteEmail('');
      setInviteRole('editor');
      await loadMembers();
    } else {
      setInviteError(result.error || 'Failed to invite member');
    }

    setInviting(false);
  };

  const handleRoleChange = async (memberId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    const success = await updateSpaceMember(memberId, newRole);
    if (success) {
      await loadMembers();
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (confirm(`Remove ${memberEmail} from this space?`)) {
      const success = await removeSpaceMember(memberId);
      if (success) {
        await loadMembers();
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return '👑';
      case 'editor':
        return '✏️';
      case 'viewer':
        return '👁️';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Share {space.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isOwner && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Invite Member
              </h3>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine-red focus:border-transparent text-gray-900"
                    placeholder="colleague@example.com"
                    disabled={inviting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="editor"
                        checked={inviteRole === 'editor'}
                        onChange={(e) => setInviteRole(e.target.value as 'editor')}
                        className="mr-2"
                        disabled={inviting}
                      />
                      <div>
                        <span className="font-medium text-gray-900">Editor</span>
                        <span className="text-sm text-gray-600 ml-2">
                          Can add and remove bottles
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="viewer"
                        checked={inviteRole === 'viewer'}
                        onChange={(e) => setInviteRole(e.target.value as 'viewer')}
                        className="mr-2"
                        disabled={inviting}
                      />
                      <div>
                        <span className="font-medium text-gray-900">Viewer</span>
                        <span className="text-sm text-gray-600 ml-2">Can only view collection</span>
                      </div>
                    </label>
                  </div>
                </div>

                {inviteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {inviteError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full px-4 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Members ({members.length})
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No members yet</div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const isCurrentUser = member.user_id === user?.id;
                  const isMemberOwner = member.role === 'owner';

                  return (
                    <div
                      key={member.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getRoleIcon(member.role)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {member.user?.email || 'Unknown'}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-gray-500">(you)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">{member.role}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>

                      {isOwner && !isMemberOwner && !isCurrentUser && (
                        <div className="flex gap-2">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(
                                member.id,
                                e.target.value as 'owner' | 'editor' | 'viewer'
                              )
                            }
                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={() =>
                              handleRemoveMember(member.id, member.user?.email || 'this member')
                            }
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium border border-red-300 rounded hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!isOwner && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                You are a {getRoleIcon(members.find((m) => m.user_id === user?.id)?.role || '')}{' '}
                {members.find((m) => m.user_id === user?.id)?.role} of this space.
              </p>
              <button
                onClick={() => {
                  const myMember = members.find((m) => m.user_id === user?.id);
                  if (myMember && confirm('Leave this space?')) {
                    removeSpaceMember(myMember.id).then(() => onClose());
                  }
                }}
                className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Leave Space
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
