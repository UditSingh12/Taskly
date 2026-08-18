'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api-client';
import { User, AdminAuditLog } from '@taskly/shared-types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Users, 
  ListTodo, 
  ShieldAlert, 
  UserPlus, 
  Ban,
  Activity,
  Trash2
} from 'lucide-react';
import { formatFullDate, cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [activeTab, setActiveTab] = React.useState<'team' | 'tasks' | 'audit'>('team');
  const [team, setTeam] = React.useState<User[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Invite state
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteName, setInviteName] = React.useState('');
  const [inviteJobTitle, setInviteJobTitle] = React.useState('');
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteLink, setInviteLink] = React.useState('');
  const [regeneratedLinks, setRegeneratedLinks] = React.useState<Record<string, string>>({});

  const activeMembers = team.filter(m => m.status !== 'deactivated');
  const deactivatedMembers = team.filter(m => m.status === 'deactivated');

  React.useEffect(() => {
    if (isAuthLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'team') {
          const res = await api.getAdminTeam();
          setTeam(res.team);
        } else if (activeTab === 'audit') {
          const res = await api.getAdminAuditLog();
          setAuditLogs(res.logs);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthLoading, router, activeTab]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    
    setIsInviting(true);
    setInviteLink('');
    try {
      const res = await api.generateAdminInvite({ email: inviteEmail, name: inviteName, jobTitle: inviteJobTitle || undefined });
      const link = `${window.location.origin}/invite/${res.token}`;
      setInviteLink(link);
      setInviteEmail('');
      setInviteName('');
      setInviteJobTitle('');
      
      // Refresh team list
      const teamRes = await api.getAdminTeam();
      setTeam(teamRes.team);
    } catch (error) {
      console.error(error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.deactivateMember(userId);
      const res = await api.getAdminTeam();
      setTeam(res.team);
    } catch (error) {
      console.error(error);
      alert('Failed to deactivate user.');
    }
  };

  const handleRevokeInvite = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return;
    try {
      await api.revokeAdminInvite(userId);
      const res = await api.getAdminTeam();
      setTeam(res.team);
      setRegeneratedLinks(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (error) {
      console.error(error);
      alert('Failed to revoke invite.');
    }
  };

  const handleRegenerateLink = async (member: User) => {
    try {
      const res = await api.generateAdminInvite({ 
        email: member.email!, 
        name: member.name, 
        jobTitle: member.jobTitle || undefined 
      });
      const link = `${window.location.origin}/invite/${res.token}`;
      setRegeneratedLinks(prev => ({ ...prev, [member._id]: link }));
      
      const teamRes = await api.getAdminTeam();
      setTeam(teamRes.team);
    } catch (error) {
      console.error(error);
      alert('Failed to regenerate invite link.');
    }
  };

  if (isAuthLoading || (isLoading && team.length === 0 && auditLogs.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members, view all tasks, and monitor system activity.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('team')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'team' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          <Users className="h-4 w-4" />
          Team
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'tasks' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          <ListTodo className="h-4 w-4" />
          All Tasks
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'audit' ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          )}
        >
          <ShieldAlert className="h-4 w-4" />
          Audit Log
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeMembers.map((member) => (
                      <React.Fragment key={member._id}>
                        <tr className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={member.name} url={member.avatarUrl} color={member.avatarColor} />
                              <div>
                                <p className="font-medium text-foreground">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-foreground font-medium block">{member.jobTitle || 'Member'}</span>
                            {member.role === 'admin' && <span className="text-xs text-muted-foreground capitalize">Admin</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider',
                              member.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                              'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            )}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {member._id !== user?._id && (
                              <div className="flex justify-end gap-2">
                                {member.status === 'invited' && (
                                  <>
                                    <Button variant="ghost" size="sm" onClick={() => handleRegenerateLink(member)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 px-2 py-1 h-auto">
                                      Regenerate Link
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleRevokeInvite(member._id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1 h-auto">
                                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
                                    </Button>
                                  </>
                                )}
                                {member.status === 'active' && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDeactivate(member._id)} className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 px-2 py-1 h-auto">
                                    <Ban className="h-3.5 w-3.5 mr-1" /> Deactivate
                                  </Button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                        {regeneratedLinks[member._id] && (
                          <tr className="bg-secondary/20 border-b border-border/50">
                            <td colSpan={4} className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-foreground">New Link:</span>
                                <input 
                                  readOnly 
                                  value={regeneratedLinks[member._id]} 
                                  className="flex-1 bg-background border border-border rounded text-xs p-1.5 text-muted-foreground"
                                />
                                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(regeneratedLinks[member._id])} className="h-7 text-xs">
                                  Copy
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {activeMembers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No active or invited members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {deactivatedMembers.length > 0 && (
                <>
                  <div className="flex items-center justify-between mt-8">
                    <h2 className="text-lg font-semibold text-foreground">Deactivated Members</h2>
                  </div>
                  <div className="bg-card border border-border rounded-xl overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-medium">Member</th>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deactivatedMembers.map((member) => (
                          <React.Fragment key={member._id}>
                            <tr className="border-b border-border/50 last:border-0">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar name={member.name} url={member.avatarUrl} color={member.avatarColor} />
                                  <div className="opacity-70">
                                    <p className="font-medium text-foreground">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 opacity-70">
                                <span className="capitalize text-foreground font-medium block">{member.jobTitle || 'Member'}</span>
                                {member.role === 'admin' && <span className="text-xs text-muted-foreground capitalize">Admin</span>}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                                  Deactivated
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleRegenerateLink(member)} className="text-green-500 hover:text-green-600 hover:bg-green-500/10 px-2 py-1 h-auto">
                                  Reactivate & Invite
                                </Button>
                              </td>
                            </tr>
                            {regeneratedLinks[member._id] && (
                              <tr className="bg-secondary/20 border-b border-border/50">
                                <td colSpan={4} className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-foreground">Reactivation Link:</span>
                                    <input 
                                      readOnly 
                                      value={regeneratedLinks[member._id]} 
                                      className="flex-1 bg-background border border-border rounded text-xs p-1.5 text-muted-foreground"
                                    />
                                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(regeneratedLinks[member._id])} className="h-7 text-xs">
                                      Copy
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Invite Member</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Send an invitation to join the organization workspace.
                </p>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Name</label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={inviteName} 
                      onChange={e => setInviteName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Email</label>
                    <Input 
                      type="email" 
                      placeholder="jane@company.com" 
                      value={inviteEmail} 
                      onChange={e => setInviteEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Job Title <span className="text-muted-foreground">(Optional)</span></label>
                    <Input 
                      placeholder="UI/UX Designer" 
                      value={inviteJobTitle} 
                      onChange={e => setInviteJobTitle(e.target.value)} 
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full" isLoading={isInviting}>
                    Generate Invite Link
                  </Button>
                </form>

                {inviteLink && (
                  <div className="mt-6 p-3 bg-secondary/50 rounded-lg border border-border/50">
                    <p className="text-xs font-medium text-foreground mb-2">Invitation Link Generated:</p>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={inviteLink} 
                        className="flex-1 bg-background border border-border rounded text-xs p-2 text-muted-foreground"
                      />
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(inviteLink)}>
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-4">Security & Audit Log</h2>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log._id} className="flex gap-4 p-4 bg-card border border-border rounded-xl items-start">
                  <div className="p-2 bg-secondary rounded-full mt-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm text-foreground">{log.adminName}</span>
                      <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Action: <span className="text-foreground font-medium">{log.action.replace(/_/g, ' ')}</span>
                    </p>
                    {log.details && (
                      <pre className="mt-2 text-xs bg-secondary/30 p-2 rounded border border-border/50 text-muted-foreground overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  No audit logs found.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl h-64">
            <ListTodo className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Global Task View</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              This section would display a read-only list of all tasks across the organization for administrative oversight.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
