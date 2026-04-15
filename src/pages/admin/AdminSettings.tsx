import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  Download,
  Upload,
  UserX,
  FileText,
  Users,
  Settings,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatusBadge } from '@/components/admin/shared/AdminStatusBadge';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';
import { RequireRole } from '@/components/admin/auth/RequireRole';
import { useAdminPlans } from '@/hooks/admin/useAdminPlans';
import { useAdminTemplates } from '@/hooks/admin/useAdminTemplates';
import { useAdminStaff } from '@/hooks/admin/useAdminStaff';
import {
  useToggleApprovalSetting,
  useUpdatePlanPrice,
  useUploadTemplate,
  useCreateStaff,
  useDeactivateStaff,
} from '@/hooks/admin/useAdminMutations';
import { adminApi, AdminPlan, AdminRole } from '@/services/adminApi';
import { toast } from 'sonner';

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AdminSettings = () => {
  return (
    <RequireRole role="owner">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-heading text-3xl text-text-light mb-1">Settings</h1>
          <p className="text-text-muted">Manage plans, templates, and staff</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList className="bg-bg-surface border border-border-dark">
              <TabsTrigger value="plans" className="data-[state=active]:bg-bg-surface-light data-[state=active]:text-text-light text-text-muted">
                <Settings className="w-4 h-4 mr-2" /> Plan Approval
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-bg-surface-light data-[state=active]:text-text-light text-text-muted">
                <FileText className="w-4 h-4 mr-2" /> Templates
              </TabsTrigger>
              <TabsTrigger value="staff" className="data-[state=active]:bg-bg-surface-light data-[state=active]:text-text-light text-text-muted">
                <Users className="w-4 h-4 mr-2" /> Staff
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans"><PlanApprovalTab /></TabsContent>
            <TabsContent value="templates"><TemplatesTab /></TabsContent>
            <TabsContent value="staff"><StaffTab /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </RequireRole>
  );
};

// --- Plan Approval Tab ---
function PlanApprovalTab() {
  const { data: plans, isLoading } = useAdminPlans();
  const toggleApproval = useToggleApprovalSetting();
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 bg-bg-surface rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        When approval is enabled, orders under that plan will require admin review before documents are delivered.
      </p>
      {plans?.map((plan) => (
        <div key={plan.id} className="bg-bg-surface rounded-2xl border border-border-dark p-5 flex items-center justify-between">
          <div>
            <h3 className="text-text-light font-medium">{plan.name}</h3>
            <p className="text-text-muted text-sm">{plan.description} &middot; ${parseFloat(plan.base_price).toFixed(2)} CAD</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPlan(plan)}
              className="border-border-dark text-text-light hover:bg-bg-surface-light"
            >
              <Pencil className="w-4 h-4 mr-1" /> Edit price
            </Button>
            <span className="text-sm text-text-muted">{plan.requires_approval ? 'Approval required' : 'Auto-deliver'}</span>
            <Switch
              checked={plan.requires_approval}
              onCheckedChange={(checked) => toggleApproval.mutate({ planId: plan.id, requires_approval: checked })}
            />
          </div>
        </div>
      ))}

      <EditPlanPriceDialog
        plan={editingPlan}
        onOpenChange={(open) => { if (!open) setEditingPlan(null); }}
      />
    </div>
  );
}

// --- Edit Plan Price Dialog ---
function EditPlanPriceDialog({ plan, onOpenChange }: { plan: AdminPlan | null; onOpenChange: (open: boolean) => void }) {
  const updatePrice = useUpdatePlanPrice();
  const [priceInput, setPriceInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setPriceInput(parseFloat(plan.base_price).toFixed(2));
      setError('');
    }
  }, [plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!plan) return;

    const trimmed = priceInput.trim();
    if (!trimmed) {
      setError('Price is required.');
      return;
    }
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(trimmed)) {
      setError('Enter a non-negative amount with up to 2 decimal places.');
      return;
    }

    updatePrice.mutate(
      { planId: plan.id, base_price: trimmed },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={plan !== null} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border-border-dark sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-light">
            {plan ? `Edit ${plan.name} price` : 'Edit plan price'}
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            Updates the price charged at checkout immediately for new orders.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {plan && (
            <p className="text-sm text-text-muted">
              Current price: ${parseFloat(plan.base_price).toFixed(2)} CAD
            </p>
          )}
          <div>
            <Label className="text-text-light text-sm">New price (CAD)</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
              <Input
                type="text"
                inputMode="decimal"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="149.99"
                className="pl-7 bg-bg-surface-light border-border-dark text-text-light placeholder:text-text-muted"
                required
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border-dark text-text-light hover:bg-bg-surface-light">
              Cancel
            </Button>
            <Button type="submit" disabled={updatePrice.isPending}>
              {updatePrice.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save price
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Templates Tab ---
function TemplatesTab() {
  const { data: templates, isLoading } = useAdminTemplates();
  const uploadTemplate = useUploadTemplate();
  const [uploadSlug, setUploadSlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (planSlug: string) => {
    setUploadSlug(planSlug);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadSlug) return;

    if (!file.name.endsWith('.docx')) {
      toast.error('Only .docx files are accepted.');
      return;
    }

    uploadTemplate.mutate({ planSlug: uploadSlug, file });
    setUploadSlug(null);
    e.target.value = '';
  };

  const handleDownload = async (planSlug: string, filename: string) => {
    try {
      const blob = await adminApi.downloadTemplate(planSlug);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template.');
    }
  };

  if (isLoading) {
    return <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 bg-bg-surface rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Document templates (.docx) are used to generate customer manuals. Upload a new version to update the template.
      </p>
      <input ref={fileInputRef} type="file" accept=".docx" className="hidden" onChange={handleFileChange} />

      {templates?.map((tpl) => (
        <div key={tpl.plan_slug} className="bg-bg-surface rounded-2xl border border-border-dark p-5 flex items-center justify-between">
          <div>
            <h3 className="text-text-light font-medium">{tpl.filename}</h3>
            <p className="text-text-muted text-sm">
              Plan: {tpl.plan_slug} &middot; {formatBytes(tpl.file_size_bytes)} &middot; Modified {formatDate(tpl.last_modified)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(tpl.plan_slug, tpl.filename)}
              className="border-border-dark text-text-light hover:bg-bg-surface-light"
            >
              <Download className="w-4 h-4 mr-1" /> Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpload(tpl.plan_slug)}
              disabled={uploadTemplate.isPending}
              className="border-border-dark text-text-light hover:bg-bg-surface-light"
            >
              {uploadTemplate.isPending && uploadSlug === tpl.plan_slug ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-1" />
              )}
              Upload
            </Button>
          </div>
        </div>
      ))}

      {(!templates || templates.length === 0) && (
        <p className="text-text-muted text-sm text-center py-8">No templates found.</p>
      )}
    </div>
  );
}

// --- Staff Tab ---
function StaffTab() {
  const { data: staff, isLoading } = useAdminStaff();
  const deactivateStaff = useDeactivateStaff();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 bg-bg-surface rounded" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Manage admin staff accounts and roles.</p>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Staff
        </Button>
      </div>

      <div className="bg-bg-surface rounded-2xl border border-border-dark overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border-dark hover:bg-transparent">
              <TableHead className="text-text-muted">Name</TableHead>
              <TableHead className="text-text-muted">Email</TableHead>
              <TableHead className="text-text-muted">Role</TableHead>
              <TableHead className="text-text-muted">Status</TableHead>
              <TableHead className="text-text-muted">Last Login</TableHead>
              <TableHead className="text-text-muted"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff?.map((member) => (
              <TableRow key={member.id} className="border-border-dark">
                <TableCell className="text-text-light font-medium">{member.full_name}</TableCell>
                <TableCell className="text-text-muted text-sm">{member.email}</TableCell>
                <TableCell><AdminStatusBadge status={member.role} type="role" /></TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-text-muted text-sm">{formatDate(member.last_login)}</TableCell>
                <TableCell>
                  {member.is_active && (
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <UserX className="w-4 h-4" />
                        </Button>
                      }
                      title="Deactivate Staff Member"
                      description={`Are you sure you want to deactivate ${member.full_name}? They will no longer be able to log in.`}
                      confirmLabel="Deactivate"
                      variant="destructive"
                      isLoading={deactivateStaff.isPending}
                      onConfirm={() => deactivateStaff.mutate(member.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateStaffDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

// --- Create Staff Dialog ---
function CreateStaffDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createStaff = useCreateStaff();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('manager');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !fullName || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    createStaff.mutate(
      { email, full_name: fullName, password, role },
      {
        onSuccess: () => {
          onOpenChange(false);
          setEmail('');
          setFullName('');
          setPassword('');
          setRole('manager');
        },
        onError: () => {
          setError('Failed to create staff member. Email may already exist.');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-bg-surface border-border-dark sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-light">Add Staff Member</DialogTitle>
          <DialogDescription className="text-text-muted">
            Create a new admin account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-text-light text-sm">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 bg-bg-surface-light border-border-dark text-text-light" required />
          </div>
          <div>
            <Label className="text-text-light text-sm">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-bg-surface-light border-border-dark text-text-light" required />
          </div>
          <div>
            <Label className="text-text-light text-sm">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="mt-1.5 bg-bg-surface-light border-border-dark text-text-light placeholder:text-text-muted" required />
          </div>
          <div>
            <Label className="text-text-light text-sm">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
              <SelectTrigger className="mt-1.5 bg-bg-surface-light border-border-dark text-text-light">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-bg-surface border-border-dark">
                <SelectItem value="owner" className="text-text-light focus:bg-bg-surface-light">Owner</SelectItem>
                <SelectItem value="manager" className="text-text-light focus:bg-bg-surface-light">Manager</SelectItem>
                <SelectItem value="support" className="text-text-light focus:bg-bg-surface-light">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border-dark text-text-light hover:bg-bg-surface-light">
              Cancel
            </Button>
            <Button type="submit" disabled={createStaff.isPending}>
              {createStaff.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Staff
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdminSettings;
