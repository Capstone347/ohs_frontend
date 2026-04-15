import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Loader2,
  XCircle,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';
import { useAdminSjpContent } from '@/hooks/admin/useAdminSjpContent';
import { useEditSjpSection, useRegenerateSjpEntry } from '@/hooks/admin/useAdminMutations';
import type { SjpContentEntry, SjpContentSections, SjpTocEntryStatus } from '@/services/api';
import type { EditSjpSectionRequest } from '@/services/adminApi';

interface SjpReviewPanelProps {
  orderId: number;
  isEditable: boolean;
}

const statusConfig: Record<SjpTocEntryStatus, { icon: React.ElementType; color: string; label: string }> = {
  completed: { icon: Check, color: 'text-success', label: 'Completed' },
  generating: { icon: Loader2, color: 'text-warning', label: 'Generating' },
  failed: { icon: XCircle, color: 'text-destructive', label: 'Failed' },
  pending: { icon: Circle, color: 'text-text-muted', label: 'Pending' },
};

const sectionLabels: Record<keyof SjpContentSections, string> = {
  task_description: 'Task Description',
  required_ppe: 'Required PPE',
  step_by_step_instructions: 'Step-by-Step Instructions',
  identified_hazards: 'Identified Hazards',
  control_measures: 'Control Measures',
  training_requirements: 'Training Requirements',
  emergency_procedures: 'Emergency Procedures',
  legislative_references: 'Legislative References',
};

const arraySections: (keyof SjpContentSections)[] = [
  'required_ppe',
  'step_by_step_instructions',
  'identified_hazards',
  'control_measures',
  'training_requirements',
];

export function SjpReviewPanel({ orderId, isEditable }: SjpReviewPanelProps) {
  const { data: sjpContent, isLoading } = useAdminSjpContent(orderId);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  const toggleEntry = (id: number) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-bg-surface rounded-2xl border border-border-dark p-6"
      >
        <h2 className="font-heading text-lg text-text-light mb-4">SJP Content Review</h2>
        <div className="space-y-3">
          <Skeleton className="h-12 bg-bg-surface-light rounded-lg" />
          <Skeleton className="h-12 bg-bg-surface-light rounded-lg" />
          <Skeleton className="h-12 bg-bg-surface-light rounded-lg" />
        </div>
      </motion.div>
    );
  }

  if (!sjpContent || sjpContent.entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-bg-surface rounded-2xl border border-border-dark p-6"
      >
        <h2 className="font-heading text-lg text-text-light mb-4">SJP Content Review</h2>
        <div className="flex flex-col items-center py-8">
          <FileText className="w-8 h-8 text-text-muted mb-3" />
          <p className="text-text-muted text-sm">No SJP content available yet.</p>
          <p className="text-text-muted text-xs mt-1">Content will appear once generation begins.</p>
        </div>
      </motion.div>
    );
  }

  const completedCount = sjpContent.entries.filter((e) => e.status === 'completed').length;
  const allCompleted = sjpContent.entries.every((e) => e.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-bg-surface rounded-2xl border border-border-dark p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg text-text-light">SJP Content Review</h2>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            allCompleted
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}>
            {completedCount} / {sjpContent.entries.length} completed
          </span>
        </div>
      </div>

      {sjpContent.disclaimer && (
        <div className="bg-bg-surface-light rounded-lg p-3 mb-4">
          <p className="text-xs text-text-muted italic">{sjpContent.disclaimer}</p>
        </div>
      )}

      <div className="space-y-2">
        {sjpContent.entries.map((entry) => (
          <SjpEntryAccordion
            key={entry.toc_entry_id}
            entry={entry}
            isExpanded={expandedEntries.has(entry.toc_entry_id)}
            onToggle={() => toggleEntry(entry.toc_entry_id)}
            isEditable={isEditable}
          />
        ))}
      </div>
    </motion.div>
  );
}

function SjpEntryAccordion({
  entry,
  isExpanded,
  onToggle,
  isEditable,
}: {
  entry: SjpContentEntry;
  isExpanded: boolean;
  onToggle: () => void;
  isEditable: boolean;
}) {
  const regenerate = useRegenerateSjpEntry();
  const config = statusConfig[entry.status];
  const StatusIcon = config.icon;

  return (
    <div className="rounded-lg border border-border-dark overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-bg-surface-light/50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
        <StatusIcon
          className={`w-4 h-4 ${config.color} flex-shrink-0 ${
            entry.status === 'generating' ? 'animate-spin' : ''
          }`}
        />
        <span className="text-sm text-text-light font-medium flex-1">{entry.title}</span>
        <span className={`text-xs ${config.color}`}>{config.label}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-border-dark p-4 space-y-4">
          {entry.status === 'failed' && (
            <div className="bg-destructive/10 rounded-lg p-3 flex items-start gap-3">
              <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium">Generation Failed</p>
                {entry.error_message && (
                  <p className="text-xs text-text-muted mt-1">{entry.error_message}</p>
                )}
              </div>
              {isEditable && (
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      disabled={regenerate.isPending}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Regenerate
                    </Button>
                  }
                  title="Regenerate SJP Entry"
                  description={`This will re-run AI generation for "${entry.title}". The current content will be replaced.`}
                  confirmLabel="Regenerate"
                  isLoading={regenerate.isPending}
                  onConfirm={() => regenerate.mutate(entry.toc_entry_id)}
                />
              )}
            </div>
          )}

          {entry.sections ? (
            <div className="space-y-4">
              {(Object.keys(sectionLabels) as (keyof SjpContentSections)[]).map((key) => (
                <SjpSectionEditor
                  key={key}
                  sectionKey={key}
                  label={sectionLabels[key]}
                  value={entry.sections![key]}
                  isArray={arraySections.includes(key)}
                  isEditable={isEditable && entry.status === 'completed'}
                  tocEntryId={entry.toc_entry_id}
                />
              ))}

              {isEditable && entry.status === 'completed' && (
                <div className="pt-2 border-t border-border-dark">
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border-dark text-text-muted hover:bg-bg-surface-light"
                        disabled={regenerate.isPending}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Regenerate This Entry
                      </Button>
                    }
                    title="Regenerate SJP Entry"
                    description={`This will re-run AI generation for "${entry.title}". All current content and edits will be replaced.`}
                    confirmLabel="Regenerate"
                    variant="destructive"
                    isLoading={regenerate.isPending}
                    onConfirm={() => regenerate.mutate(entry.toc_entry_id)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Loader2 className="w-6 h-6 text-text-muted animate-spin mx-auto mb-2" />
              <p className="text-sm text-text-muted">Content not yet generated.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SjpSectionEditor({
  sectionKey,
  label,
  value,
  isArray,
  isEditable,
  tocEntryId,
}: {
  sectionKey: keyof SjpContentSections;
  label: string;
  value: string | string[] | null;
  isArray: boolean;
  isEditable: boolean;
  tocEntryId: number;
}) {
  const editSection = useEditSjpSection();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | string[]>('');

  const startEditing = () => {
    if (isArray) {
      setEditValue(Array.isArray(value) ? [...value] : []);
    } else {
      setEditValue(typeof value === 'string' ? value : value ?? '');
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    const data: EditSjpSectionRequest = {
      [sectionKey]: editValue,
    };
    editSection.mutate(
      { tocEntryId, data },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Array item helpers
  const addItem = () => {
    if (Array.isArray(editValue)) {
      setEditValue([...editValue, '']);
    }
  };

  const removeItem = (index: number) => {
    if (Array.isArray(editValue)) {
      setEditValue(editValue.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, newVal: string) => {
    if (Array.isArray(editValue)) {
      const updated = [...editValue];
      updated[index] = newVal;
      setEditValue(updated);
    }
  };

  return (
    <div className="rounded-lg bg-bg-surface-light p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {label}
        </span>
        {isEditable && !isEditing && (
          <button
            onClick={startEditing}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {isArray && Array.isArray(editValue) ? (
            <>
              {editValue.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-xs text-text-muted mt-2.5 w-5 text-right flex-shrink-0">
                    {index + 1}.
                  </span>
                  <textarea
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    className="flex-1 rounded-md border border-border-dark bg-bg-surface px-3 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[36px]"
                    rows={1}
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="text-text-muted hover:text-destructive mt-2 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
              >
                <Plus className="w-3 h-3" /> Add item
              </button>
            </>
          ) : (
            <textarea
              value={editValue as string}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full rounded-md border border-border-dark bg-bg-surface px-3 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[80px]"
              rows={4}
            />
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={editSection.isPending}
            >
              {editSection.isPending ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-3.5 h-3.5 mr-1.5" /> Save</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="border-border-dark text-text-muted hover:bg-bg-surface"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-text-light">
          {isArray && Array.isArray(value) ? (
            value.length > 0 ? (
              <ul className="space-y-1">
                {value.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-text-muted text-xs mt-0.5 w-5 text-right flex-shrink-0">
                      {i + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-text-muted italic">No items</span>
            )
          ) : value ? (
            <p className="whitespace-pre-wrap">{value}</p>
          ) : (
            <span className="text-text-muted italic">Not provided</span>
          )}
        </div>
      )}
    </div>
  );
}
