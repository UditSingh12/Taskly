import * as React from 'react';
import { X, Lock, Save, FolderGit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api-client';
import { Project } from '@taskly/shared-types';

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(true);
  
  // Password state
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { projects: allProjects } = await api.getProjects();
        // Filter projects where user is a member or owner
        const userProjects = allProjects.filter(
          (p) => p.owner === user?._id || p.memberIds.includes(user?._id || '')
        );
        setProjects(userProjects);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await api.changePassword({ oldPassword, newPassword });
      setPasswordSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none custom-scrollbar text-center">
        {/* Trick to center the modal vertically */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div className="inline-block w-full max-w-2xl text-left align-middle bg-card border border-border sm:rounded-2xl shadow-2xl pointer-events-auto sm:my-8 animate-in fade-in zoom-in-95 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-secondary/30 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 relative">
              <div className="ring-4 ring-background rounded-full shadow-lg">
                <Avatar name={user.name} color={user.avatarColor} url={user.avatarUrl} size="xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {user.email} 
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </p>
                {user.jobTitle && <p className="text-xs text-muted-foreground mt-1">{user.jobTitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors relative z-10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Assigned Projects Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-primary" />
                Assigned Projects
              </h3>
              
              {loadingProjects ? (
                <div className="flex justify-center p-4">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl border border-border border-dashed text-center">
                  You are not assigned to any projects yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map(project => (
                    <div key={project._id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: project.color }}>
                        <FolderGit2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="h-px bg-border/50" />

            {/* Change Password Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Security & Password
              </h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md bg-secondary/10 p-5 rounded-xl border border-border/40">
                {passwordError && (
                  <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    {passwordSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={saving || !oldPassword || !newPassword || !confirmPassword}>
                    {saving ? (
                      <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
