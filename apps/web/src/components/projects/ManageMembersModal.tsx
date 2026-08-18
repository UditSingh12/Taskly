'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, UserMinus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Project, User } from '@taskly/shared-types';
import { api } from '@/lib/api-client';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdate: () => Promise<void>;
}

export function ManageMembersModal({
  isOpen,
  onClose,
  project,
  onUpdate,
}: ManageMembersModalProps) {
  const [team, setTeam] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && project) {
      loadTeam();
    }
  }, [isOpen, project]);

  const loadTeam = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminTeam();
      setTeam(res.team);
    } catch (err) {
      console.error('Failed to load team', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!project) return;
    try {
      await api.addProjectMember(project._id, userId);
      await onUpdate();
    } catch (err) {
      console.error('Failed to approve', err);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!project) return;
    try {
      await api.removeProjectMember(project._id, userId);
      await onUpdate();
    } catch (err) {
      console.error('Failed to remove', err);
    }
  };

  const pendingUsers = team.filter((u) => project?.pendingMemberIds?.includes(u._id));
  const activeMembers = team.filter((u) => project?.memberIds?.includes(u._id));
  const otherUsers = team.filter(
    (u) =>
      !project?.pendingMemberIds?.includes(u._id) &&
      !project?.memberIds?.includes(u._id)
  );

  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white bg-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Manage Members
                </h3>
                <p className="text-xs text-muted-foreground">
                  {project.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingUsers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Requests ({pendingUsers.length})
                </h4>
                <div className="space-y-2">
                  {pendingUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-2 rounded-xl border border-border bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleApprove(u._id)}>
                        Approve
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Members */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Active Members ({activeMembers.length})
              </h4>
              {activeMembers.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border border-dashed border-border rounded-xl">
                  No members yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeMembers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-2 rounded-xl border border-border bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemove(u._id)}>
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Users */}
            {otherUsers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Add Members
                </h4>
                <div className="space-y-2">
                  {otherUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-2 rounded-xl border border-border bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleApprove(u._id)}>
                        <UserPlus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
