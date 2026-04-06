'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Tag,
  Shield,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import type { ClaimCategory, HistoricalClaim } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const CATEGORIES: { value: ClaimCategory; label: string }[] = [
  { value: 'emissions', label: 'Emissions' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'materials', label: 'Materials' },
  { value: 'energy', label: 'Energy' },
  { value: 'general', label: 'General' },
];

const categoryColors: Record<ClaimCategory, string> = {
  emissions: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  packaging: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  materials: 'bg-green-500/10 text-green-500 border-green-500/20',
  energy: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  general: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function CompanyClaimsPage() {
  const params = useParams();
  const router = useRouter();
  const { getCompanyById, addClaim, updateClaim, deleteClaim } = useApp();
  const company = getCompanyById(params.id as string);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<HistoricalClaim | null>(null);
  const [claimForm, setClaimForm] = useState({
    text: '',
    category: 'general' as ClaimCategory,
    date: new Date().toISOString().split('T')[0],
    verified: false,
    certifications: '',
  });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium">Company not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/companies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Link>
        </Button>
      </div>
    );
  }

  const resetForm = () => {
    setClaimForm({
      text: '',
      category: 'general',
      date: new Date().toISOString().split('T')[0],
      verified: false,
      certifications: '',
    });
    setEditingClaim(null);
  };

  const handleOpenEdit = (claim: HistoricalClaim) => {
    setEditingClaim(claim);
    setClaimForm({
      text: claim.text,
      category: claim.category,
      date: claim.date,
      verified: claim.verified,
      certifications: claim.certifications?.join(', ') || '',
    });
  };

  const handleSaveClaim = () => {
    if (!claimForm.text || !claimForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const claimData = {
      text: claimForm.text,
      category: claimForm.category,
      date: claimForm.date,
      verified: claimForm.verified,
      certifications: claimForm.certifications
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    };

    if (editingClaim) {
      updateClaim(company.id, { ...claimData, id: editingClaim.id });
      toast.success('Claim updated successfully');
    } else {
      addClaim(company.id, claimData);
      toast.success('Claim added successfully');
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleDeleteClaim = (claimId: string) => {
    deleteClaim(company.id, claimId);
    toast.success('Claim deleted successfully');
  };

  const sortedClaims = [...company.historicalClaims].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">{company.industry}</p>
        </div>
        <Dialog
          open={isAddDialogOpen || !!editingClaim}
          onOpenChange={(open) => {
            if (!open) {
              resetForm();
            }
            setIsAddDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingClaim ? 'Edit Claim' : 'Add New Claim'}</DialogTitle>
              <DialogDescription>
                {editingClaim
                  ? 'Update the historical claim details'
                  : 'Add a historical sustainability claim for this company'}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="claim-text">Claim Text *</FieldLabel>
                <Textarea
                  id="claim-text"
                  placeholder="Enter the sustainability claim..."
                  value={claimForm.text}
                  onChange={(e) => setClaimForm({ ...claimForm, text: e.target.value })}
                  rows={4}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="category">Category *</FieldLabel>
                  <Select
                    value={claimForm.category}
                    onValueChange={(value: ClaimCategory) =>
                      setClaimForm({ ...claimForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="date">Date *</FieldLabel>
                  <Input
                    id="date"
                    type="date"
                    value={claimForm.date}
                    onChange={(e) => setClaimForm({ ...claimForm, date: e.target.value })}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="certifications">Certifications</FieldLabel>
                <Input
                  id="certifications"
                  placeholder="Comma-separated: ISO 14001, FSC, etc."
                  value={claimForm.certifications}
                  onChange={(e) => setClaimForm({ ...claimForm, certifications: e.target.value })}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="verified" className="flex-1">
                  <div>
                    <p className="font-medium">Verified Claim</p>
                    <p className="text-xs text-muted-foreground">
                      Mark if this claim has been independently verified
                    </p>
                  </div>
                </FieldLabel>
                <Switch
                  id="verified"
                  checked={claimForm.verified}
                  onCheckedChange={(checked) => setClaimForm({ ...claimForm, verified: checked })}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveClaim}>
                {editingClaim ? 'Update Claim' : 'Add Claim'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Company Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium">{company.industry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Claims</p>
              <p className="font-medium">{company.historicalClaims.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certifications</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {company.sustainabilityCertifications.length > 0 ? (
                  company.sustainabilityCertifications.map((cert) => (
                    <Badge key={cert} variant="outline">
                      <Shield className="mr-1 h-3 w-3" />
                      {cert}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Claims ({sortedClaims.length})</CardTitle>
          <CardDescription>
            Claims are sorted by date, most recent first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium">No claims yet</p>
              <p className="text-sm text-muted-foreground">
                Add historical sustainability claims for this company
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="group relative rounded-lg border bg-card p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={categoryColors[claim.category]}>
                          <Tag className="mr-1 h-3 w-3" />
                          {claim.category}
                        </Badge>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(claim.date).toLocaleDateString()}
                        </span>
                        {claim.verified ? (
                          <Badge variant="outline" className="text-green-500 border-green-500/20">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <XCircle className="mr-1 h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{claim.text}</p>
                      {claim.certifications && claim.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {claim.certifications.map((cert) => (
                            <Badge key={cert} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(claim)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Claim</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this claim? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteClaim(claim.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
