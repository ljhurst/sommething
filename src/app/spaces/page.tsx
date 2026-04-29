'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateSpaceModal } from '@/components/modals/CreateSpaceModal';
import { ShareSpaceModal } from '@/components/modals/ShareSpaceModal';
import { useSpaces } from '@/hooks/useSpaces';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentSpace } from '@/hooks/useCurrentSpace';
import { getSpaceTypeIcon } from '@/components/icons/space-icons';
import type { NewSpace, Space } from '@/lib/types';

export default function SpacesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { spaces, loading, addSpace, updateSpace, deleteSpace } = useSpaces();
  const { selectSpace } = useCurrentSpace(spaces);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [sharingSpace, setSharingSpace] = useState<Space | null>(null);

  const handleCreateSpace = async (space: Omit<NewSpace, 'owner_user_id'>) => {
    await addSpace(space as NewSpace);
  };

  const handleEditSpace = async (spaceId: string, space: Omit<NewSpace, 'owner_user_id'>) => {
    const success = await updateSpace(spaceId, space);
    if (success) {
      setEditingSpace(null);
    }
  };

  const handleDeleteSpace = async (spaceId: string, spaceName: string) => {
    if (confirm(`Are you sure you want to delete "${spaceName}"? This cannot be undone.`)) {
      await deleteSpace(spaceId);
    }
  };

  const handleViewSpace = (spaceId: string) => {
    selectSpace(spaceId);
    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      router.push('/');
    }, 10);
  };

  return (
    <PageLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Spaces</h2>
          <p className="text-gray-600">
            {spaces.length} space{spaces.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        {user && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="text-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Space
          </Button>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading spaces..." />}

      {!loading && spaces.length === 0 && (
        <EmptyState
          title="No Spaces Yet"
          message="Create your first storage space to get started"
          actionLabel="Create Your First Space"
          onAction={() => setShowCreateModal(true)}
        />
      )}

      {!loading && spaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => {
            const capacity = space.rows * space.columns;
            return (
              <div
                key={space.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>{getSpaceTypeIcon(space.space_type, 'w-12 h-12 text-gray-700')}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{space.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{space.space_type}</p>
                    </div>
                  </div>
                </div>

                {space.description && (
                  <p className="text-sm text-gray-600 mb-4">{space.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-medium text-gray-900">
                      {capacity} bottles ({space.columns} × {space.rows})
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleViewSpace(space.id)}
                    className="w-full px-3 py-2 bg-wine-red text-white rounded-lg hover:bg-wine-red/90 transition-colors text-sm font-medium"
                  >
                    View Space
                  </button>
                  {user?.id === space.owner_user_id && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSharingSpace(space)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        title="Share space"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => setEditingSpace(space.id)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSpace(space.id, space.name)}
                        className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateSpaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSpace}
      />

      {editingSpace && (
        <CreateSpaceModal
          isOpen={true}
          onClose={() => setEditingSpace(null)}
          onSubmit={(space) => handleEditSpace(editingSpace, space)}
          initialData={spaces.find((s) => s.id === editingSpace)}
        />
      )}

      {sharingSpace && (
        <ShareSpaceModal isOpen={true} space={sharingSpace} onClose={() => setSharingSpace(null)} />
      )}
    </PageLayout>
  );
}
