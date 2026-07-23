'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { useEtablissement, useUpdateEtablissement } from '@/hooks/use-etablissements';
import {
  useUpsertDirecteur, useDeleteDirecteur,
  useCreateDesignation, useUpdateDesignation, useDeleteDesignation,
  useCreateStructure, useUpdateStructure, useDeleteStructure,
} from '@/hooks/use-gestion-etablissement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { GenericPhotoUpload } from '@/components/shared/generic-photo-upload';
import { EtablissementExportModal } from '@/components/etablissements/EtablissementExportModal';
import { useEffect } from 'react';
import { Building2, User, Phone, Mail, FileText, MapPin, Pencil, Plus, Trash2, ChevronRight, Download, AlertTriangle, Route, Package, Link as LinkIcon, Unlink, X } from 'lucide-react';
import type { Designation, Structure, EtablissementAlea, EtablissementTrajet } from '@/types/etablissement';
import type { EffetAleat } from '@/types/alea';
import type { Alea } from '@/types/alea';
import type { Trajet } from '@/types/trajet';
import { useAleas } from '@/hooks/use-aleas';
import { useTrajets } from '@/hooks/use-trajets';
import { useLinkAlea, useUnlinkAlea, useLinkTrajet, useUnlinkTrajet } from '@/hooks/use-link-etablissement';

export default function EditEtablissementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const etablissementId = Number(id);

  const { data: etablissement, isLoading } = useEtablissement(etablissementId);
  const { mutate: updateEtab, isPending, error } = useUpdateEtablissement(etablissementId);
  const [couvTelephonique, setCouvTelephonique] = useState(false);
  const [couvInternet, setCouvInternet] = useState(false);

  // Sync checkbox state when data loads
  useEffect(() => {
    if (etablissement) {
      setCouvTelephonique(etablissement.couvTelephonique);
      setCouvInternet(etablissement.couvInternet);
    }
  }, [etablissement]);

  // Directeur state
  const [dirModalOpen, setDirModalOpen] = useState(false);
  const [dirDelModalOpen, setDirDelModalOpen] = useState(false);
  const [dirForm, setDirForm] = useState({ nomDirecteur: '', prenomDr: '', emailDr: '', telDr: '' });
  const { mutate: upsertDirecteur, isPending: dirLoading } = useUpsertDirecteur(etablissementId);
  const { mutate: deleteDirecteur, isPending: dirDelLoading } = useDeleteDirecteur(etablissementId);

  // Designation state
  const [desModalOpen, setDesModalOpen] = useState(false);
  const [desDelTarget, setDesDelTarget] = useState<Designation | null>(null);
  const [editingDes, setEditingDes] = useState<Designation | null>(null);
  const [desForm, setDesForm] = useState({
    nomDesign: '', typeDesignation: '', numCadastre: '', superficieDesign: '',
    estEnceinteEtab: false, estTitre: false, estLitigieux: false,
  });
  const { mutate: createDesignation, isPending: desCreateLoading } = useCreateDesignation(etablissementId);
  const { mutate: updateDesignation, isPending: desUpdateLoading } = useUpdateDesignation();
  const { mutate: deleteDesignation, isPending: desDelLoading } = useDeleteDesignation(etablissementId);

  // Structure state
  const [strModalOpen, setStrModalOpen] = useState(false);
  const [strDelTarget, setStrDelTarget] = useState<Structure | null>(null);
  const [editingStr, setEditingStr] = useState<Structure | null>(null);
  const [strForm, setStrForm] = useState({ typeStruc: '', existenceStruc: true, materiauxStruc: '', etatStruc: '' });
  const { mutate: createStructure, isPending: strCreateLoading } = useCreateStructure(etablissementId);
  const { mutate: updateStructure, isPending: strUpdateLoading } = useUpdateStructure();
  const { mutate: deleteStructure, isPending: strDelLoading } = useDeleteStructure(etablissementId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      nomEtab: form.get('nomEtab') as string,
      dren: form.get('dren') as string || undefined,
      cisco: form.get('cisco') as string || undefined,
      zap: form.get('zap') as string || undefined,
      commune: form.get('commune') as string || undefined,
      fokontany: form.get('fokontany') as string || undefined,
      quartier: form.get('quartier') as string || undefined,
      couvTelephonique,
      couvInternet,
      nbEnseignantG: Number(form.get('nbEnseignantG')) || 0,
      nbEnseignantF: Number(form.get('nbEnseignantF')) || 0,
      nbSectionG: Number(form.get('nbSectionG')) || 0,
      nbSectionF: Number(form.get('nbSectionF')) || 0,
    };
    updateEtab(data, {
      onSuccess: () => router.push('/responsable/etablissements'),
    });
  };

  // ─── Directeur handlers ──────────────────────────

  const openDirModal = () => {
    if (etablissement?.directeur) {
      setDirForm({
        nomDirecteur: etablissement.directeur.nomDirecteur,
        prenomDr: etablissement.directeur.prenomDr || '',
        emailDr: etablissement.directeur.emailDr || '',
        telDr: etablissement.directeur.telDr || '',
      });
    } else {
      setDirForm({ nomDirecteur: '', prenomDr: '', emailDr: '', telDr: '' });
    }
    setDirModalOpen(true);
  };

  const saveDirecteur = (e: React.FormEvent) => {
    e.preventDefault();
    upsertDirecteur(dirForm, {
      onSuccess: () => { toast.success('Directeur enregistré'); setDirModalOpen(false); },
      onError: () => toast.error("Erreur lors de l'enregistrement"),
    });
  };

  const handleDeleteDirecteur = () => {
    deleteDirecteur(undefined, {
      onSuccess: () => { toast.success('Directeur supprimé'); setDirDelModalOpen(false); },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  // ─── Designation handlers ────────────────────────

  const openDesModal = (des?: Designation) => {
    if (des) {
      setEditingDes(des);
      setDesForm({
        nomDesign: des.nomDesign,
        typeDesignation: des.typeDesignation || '',
        numCadastre: des.numCadastre || '',
        superficieDesign: des.superficieDesign ? String(des.superficieDesign) : '',
        estEnceinteEtab: des.estEnceinteEtab,
        estTitre: des.estTitre,
        estLitigieux: des.estLitigieux,
      });
    } else {
      setEditingDes(null);
      setDesForm({ nomDesign: '', typeDesignation: '', numCadastre: '', superficieDesign: '', estEnceinteEtab: false, estTitre: false, estLitigieux: false });
    }
    setDesModalOpen(true);
  };

  const saveDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nomDesign: desForm.nomDesign,
      typeDesignation: desForm.typeDesignation || undefined,
      numCadastre: desForm.numCadastre || undefined,
      superficieDesign: desForm.superficieDesign ? Number(desForm.superficieDesign) : undefined,
      estEnceinteEtab: desForm.estEnceinteEtab,
      estTitre: desForm.estTitre,
      estLitigieux: desForm.estLitigieux,
    };
    if (editingDes) {
      updateDesignation({ id: editingDes.idDesign, etablissementId, ...payload }, {
        onSuccess: () => { toast.success('Désignation modifiée'); setDesModalOpen(false); },
        onError: () => toast.error('Erreur lors de la modification'),
      });
    } else {
      createDesignation(payload, {
        onSuccess: () => { toast.success('Désignation ajoutée'); setDesModalOpen(false); },
        onError: () => toast.error("Erreur lors de l'ajout"),
      });
    }
  };

  const handleDeleteDesignation = () => {
    if (!desDelTarget) return;
    deleteDesignation(desDelTarget.idDesign, {
      onSuccess: () => { toast.success('Désignation supprimée'); setDesDelTarget(null); },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  // ─── Structure handlers ──────────────────────────

  const openStrModal = (str?: Structure) => {
    if (str) {
      setEditingStr(str);
      setStrForm({
        typeStruc: str.typeStruc || '',
        existenceStruc: str.existenceStruc,
        materiauxStruc: str.materiauxStruc || '',
        etatStruc: str.etatStruc || '',
      });
    } else {
      setEditingStr(null);
      setStrForm({ typeStruc: '', existenceStruc: true, materiauxStruc: '', etatStruc: '' });
    }
    setStrModalOpen(true);
  };

  const saveStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      typeStruc: strForm.typeStruc || undefined,
      existenceStruc: strForm.existenceStruc,
      materiauxStruc: strForm.materiauxStruc || undefined,
      etatStruc: strForm.etatStruc || undefined,
    };
    if (editingStr) {
      updateStructure({ id: editingStr.idStruc, etablissementId, ...payload }, {
        onSuccess: () => { toast.success('Structure modifiée'); setStrModalOpen(false); },
        onError: () => toast.error('Erreur lors de la modification'),
      });
    } else {
      createStructure(payload, {
        onSuccess: () => { toast.success('Structure ajoutée'); setStrModalOpen(false); },
        onError: () => toast.error("Erreur lors de l'ajout"),
      });
    }
  };

  const handleDeleteStructure = () => {
    if (!strDelTarget) return;
    deleteStructure(strDelTarget.idStruc, {
      onSuccess: () => { toast.success('Structure supprimée'); setStrDelTarget(null); },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Aléas : lier / délier
  const [linkAleaOpen, setLinkAleaOpen] = useState(false);
  const [selectedAleaId, setSelectedAleaId] = useState<number | null>(null);
  const { data: allAleas } = useAleas();
  const { mutate: linkAlea, isPending: linkAleaLoading } = useLinkAlea(etablissementId);
  const { mutate: unlinkAlea, isPending: unlinkAleaLoading } = useUnlinkAlea(etablissementId);

  // Trajets : lier / délier
  const [linkTrajetOpen, setLinkTrajetOpen] = useState(false);
  const [selectedTrajetId, setSelectedTrajetId] = useState<number | null>(null);
  const { data: allTrajets } = useTrajets();
  const { mutate: linkTrajet, isPending: linkTrajetLoading } = useLinkTrajet(etablissementId);
  const { mutate: unlinkTrajet, isPending: unlinkTrajetLoading } = useUnlinkTrajet(etablissementId);

  const linkedAleaIds = new Set((etablissement?.aleas ?? []).map(ea => ea.aleaId));
  const linkedTrajetIds = new Set((etablissement?.trajets ?? []).map(et => et.trajetId));

  const availableAleas = (allAleas ?? []).filter(a => !linkedAleaIds.has(a.idAleat));
  const availableTrajets = (allTrajets ?? []).filter(t => !linkedTrajetIds.has(t.idTrajet));

  // ─── Render ──────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-4 h-8 w-1/3" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!etablissement) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Établissement non trouvé</p>
        <Button onClick={() => router.push('/responsable/etablissements')} className="mt-4">Retour</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumb items={[
        { label: 'Établissements', href: '/responsable/etablissements' },
        { label: etablissement.nomEtab },
      ]} />

      {/* Barre d'actions */}
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExportModalOpen(true)}
          className="gap-2 text-primary hover:bg-primary/10"
        >
          <Download className="h-4 w-4" />
          Exporter en PDF
        </Button>
      </div>

      {/* ─── Formulaire principal ─────────────────── */}
      <Card>
        <CardHeader><CardTitle>Modifier : {etablissement.nomEtab}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" key={etablissement.id}>
            {/* ... (form fields unchanged) ... */}
            <Input id="nomEtab" name="nomEtab" label="Nom de l'établissement *" defaultValue={etablissement.nomEtab} required />
            <div className="grid grid-cols-2 gap-4">
              <Input id="dren" name="dren" label="DREN" defaultValue={etablissement.dren ?? ''} />
              <Input id="cisco" name="cisco" label="CISCO" defaultValue={etablissement.cisco ?? ''} />
            </div>
            <Input id="zap" name="zap" label="ZAP" defaultValue={etablissement.zap ?? ''} />
            <Input id="commune" name="commune" label="Commune" defaultValue={etablissement.commune ?? ''} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="fokontany" name="fokontany" label="Fokontany" defaultValue={etablissement.fokontany ?? ''} />
              <Input id="quartier" name="quartier" label="Quartier" defaultValue={etablissement.quartier ?? ''} />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={couvTelephonique} onCheckedChange={(c) => setCouvTelephonique(c === true)} />
                Couverture téléphonique
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={couvInternet} onCheckedChange={(c) => setCouvInternet(c === true)} />
                Couverture Internet
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbEnseignantG" name="nbEnseignantG" label="Enseignants (H)" type="number" defaultValue={etablissement.nbEnseignantG} />
              <Input id="nbEnseignantF" name="nbEnseignantF" label="Enseignants (F)" type="number" defaultValue={etablissement.nbEnseignantF} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input id="nbSectionG" name="nbSectionG" label="Sections (H)" type="number" defaultValue={etablissement.nbSectionG} />
              <Input id="nbSectionF" name="nbSectionF" label="Sections (F)" type="number" defaultValue={etablissement.nbSectionF} />
            </div>
            {error && <p className="text-sm text-destructive">{error instanceof Error ? error.message : 'Erreur'}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" loading={isPending}>Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ─── Photos ────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
        <CardContent>
          <GenericPhotoUpload
            entityId={etablissement.id}
            apiBasePath="/etablissements"
            queryKey={['etablissements', etablissement.id]}
            photos={etablissement.photos}
            entityName="cet établissement"
          />
        </CardContent>
      </Card>

      {/* ─── Bâtiments ──────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Bâtiments ({etablissement.batiments?.length ?? 0})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/responsable/batiments/nouveau')}>
              <Plus className="mr-1 h-4 w-4" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {etablissement.batiments && etablissement.batiments.length > 0 ? (
            <div className="space-y-3">
              {etablissement.batiments.map((b) => (
                <div
                  key={b.idBat}
                  className="group cursor-pointer rounded-xl border bg-muted/50 p-4 transition-colors hover:bg-primary/5"
                  onClick={() => router.push(`/responsable/batiments/${b.idBat}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{b.sigleBat || `Bâtiment #${b.idBat}`}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{b.nbNiveau} niveau{b.nbNiveau > 1 ? 'x' : ''}</span>
                        {b._count && (
                          <>
                            <span>{b._count.salles} salle{b._count.salles > 1 ? 's' : ''}</span>
                            <span>{b._count.toilettes} toilette{b._count.toilettes > 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-colors group-hover:text-primary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Aucun bâtiment</p>
              <Button variant="ghost" size="sm" onClick={() => router.push('/responsable/batiments/nouveau')} className="mt-2">
                <Plus className="mr-1 h-4 w-4" /> Ajouter un bâtiment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Directeur ─────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Directeur
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={openDirModal}>
                <Pencil className="mr-1 h-4 w-4" /> {etablissement.directeur ? 'Modifier' : 'Ajouter'}
              </Button>
              {etablissement.directeur && (
                <Button variant="destructive" size="sm" onClick={() => setDirDelModalOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {etablissement.directeur ? (
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="font-medium text-foreground">
                {etablissement.directeur.nomDirecteur} {etablissement.directeur.prenomDr || ''}
              </p>
              <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {etablissement.directeur.emailDr && (
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {etablissement.directeur.emailDr}</span>
                )}
                {etablissement.directeur.telDr && (
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {etablissement.directeur.telDr}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun directeur renseigné</p>
          )}
        </CardContent>
      </Card>

      {/* ─── Designations ──────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Désignations ({etablissement.designations?.length ?? 0})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => openDesModal()}>
              <Plus className="mr-1 h-4 w-4" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {etablissement.designations && etablissement.designations.length > 0 ? (
            <div className="space-y-3">
              {etablissement.designations.map((d) => (
                <div key={d.idDesign} className="group rounded-xl border bg-muted/50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{d.nomDesign}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {d.typeDesignation && <span>Type: {d.typeDesignation}</span>}
                        {d.numCadastre && (
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {d.numCadastre}</span>
                        )}
                        {d.superficieDesign && <span>Surface: {d.superficieDesign} m²</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {d.estTitre && <Badge variant="default">Titre</Badge>}
                        {d.estEnceinteEtab && <Badge variant="secondary">Enceinte</Badge>}
                        {d.estLitigieux && <Badge variant="destructive">Litigieux</Badge>}
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="sm" onClick={() => openDesModal(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => setDesDelTarget(d)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Aucune désignation</p>
              <Button variant="ghost" size="sm" onClick={() => openDesModal()} className="mt-2">
                <Plus className="mr-1 h-4 w-4" /> Ajouter une désignation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Structures ────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Structures ({etablissement.structures?.length ?? 0})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => openStrModal()}>
              <Plus className="mr-1 h-4 w-4" /> Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {etablissement.structures && etablissement.structures.length > 0 ? (
            <div className="space-y-3">
              {etablissement.structures.map((s) => (
                <div key={s.idStruc} className="group rounded-xl border bg-muted/50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{s.typeStruc || 'Structure'}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {s.materiauxStruc && <span>Matériaux: {s.materiauxStruc}</span>}
                        {s.etatStruc && <span>État: {s.etatStruc}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.existenceStruc ? 'success' : 'destructive'}>
                        {s.existenceStruc ? 'Existant' : 'Inexistant'}
                      </Badge>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="sm" onClick={() => openStrModal(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => setStrDelTarget(s)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Aucune structure</p>
              <Button variant="ghost" size="sm" onClick={() => openStrModal()} className="mt-2">
                <Plus className="mr-1 h-4 w-4" /> Ajouter une structure
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Aléas liés ───────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Aléas ({etablissement.aleas?.length ?? 0})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setLinkAleaOpen(true)} disabled={availableAleas.length === 0}>
              <LinkIcon className="mr-1 h-4 w-4" /> Lier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {etablissement.aleas && etablissement.aleas.length > 0 ? (
            <div className="space-y-3">
              {etablissement.aleas.map((ea: EtablissementAlea) => (
                <div key={ea.aleaId} className="group rounded-xl border bg-muted/50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{ea.alea.nomAleat || 'Aléa'}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {ea.alea.typeAleat && <Badge variant="warning">{ea.alea.typeAleat}</Badge>}
                        {ea.alea.dateAleat && <span>{new Date(ea.alea.dateAleat).toLocaleDateString('fr-FR')}</span>}
                        {ea.alea.explication && <span className="truncate">{ea.alea.explication}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Retirer l'aléa "${ea.alea.nomAleat || ea.alea.idAleat}" ?`)) {
                          unlinkAlea(ea.aleaId);
                        }
                      }}
                      loading={unlinkAleaLoading}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <Unlink className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {ea.alea.effets && ea.alea.effets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {ea.alea.effets.map((eff: EffetAleat) => (
                        <span key={eff.trajetId} className="rounded-md bg-muted px-2 py-0.5">
                          {eff.nbElevesG + eff.nbElevesF} élèves · {eff.nbEnseignG + eff.nbEnseignF} enseignants
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun aléa lié à cet établissement</p>
          )}
        </CardContent>
      </Card>

      {/* ─── Trajets liés ──────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" /> Trajets ({etablissement.trajets?.length ?? 0})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setLinkTrajetOpen(true)} disabled={availableTrajets.length === 0}>
              <LinkIcon className="mr-1 h-4 w-4" /> Lier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {etablissement.trajets && etablissement.trajets.length > 0 ? (
            <div className="space-y-3">
              {etablissement.trajets.map((et: EtablissementTrajet) => (
                <div key={et.trajetId} className="group rounded-xl border bg-muted/50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{et.trajet.nomTrajet || `Trajet #${et.trajet.idTrajet}`}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {et.trajet.moyens?.typeMoyen && <Badge variant="info">{et.trajet.moyens.typeMoyen}</Badge>}
                        {et.trajet.moyens?.dureeMoyen != null && <span>{et.trajet.moyens.dureeMoyen} min</span>}
                        {et.trajet.moyens?.distanceMoyen != null && <span>{et.trajet.moyens.distanceMoyen} km</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Retirer le trajet "${et.trajet.nomTrajet || et.trajet.idTrajet}" ?`)) {
                          unlinkTrajet(et.trajetId);
                        }
                      }}
                      loading={unlinkTrajetLoading}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <Unlink className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {et.trajet.periode && (
                    <p className="mt-2 text-xs text-amber-600">
                      Periode difficile: {new Date(et.trajet.periode.debutPeriode).toLocaleDateString('fr-FR')} - {new Date(et.trajet.periode.finPeriode).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun trajet lié à cet établissement</p>
          )}
        </CardContent>
      </Card>



      {/* ─── Équipements ──────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Équipements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const equipements = (etablissement.batiments ?? [])
              .flatMap(b => (b as any).salles ?? [])
              .flatMap((s: any) => s.equipements ?? []);
            if (equipements.length === 0) {
              return <p className="text-sm text-muted-foreground">Aucun équipement dans cet établissement</p>;
            }
            return (
              <div className="space-y-2">
                {equipements.map((eq: any) => (
                  <div key={eq.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{eq.nomEquip}</p>
                      <p className="text-xs text-muted-foreground">
                        {eq.typeEquip && `${eq.typeEquip} · `}
                        {eq.etat && `État: ${eq.etat} · `}
                        Quantité: {eq.quantite}
                      </p>
                    </div>
                    <Badge variant={eq.etat === 'BON' ? 'success' : eq.etat === 'MAUVAIS' ? 'destructive' : 'warning'}>
                      {eq.etat || 'N/A'}
                    </Badge>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════ */}
      {/* MODALS                                       */}
      {/* ═══════════════════════════════════════════════ */}

      {/* Modal Directeur */}
      <Modal open={dirModalOpen} onClose={() => setDirModalOpen(false)} title="Directeur de l'établissement" size="xl">
        <form onSubmit={saveDirecteur} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Input id="dir_nom" label="Nom *" value={dirForm.nomDirecteur}
              onChange={(e) => setDirForm({ ...dirForm, nomDirecteur: e.target.value })} required />
            <Input id="dir_prenom" label="Prénom" value={dirForm.prenomDr}
              onChange={(e) => setDirForm({ ...dirForm, prenomDr: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="dir_email" label="Email" type="email" value={dirForm.emailDr}
              onChange={(e) => setDirForm({ ...dirForm, emailDr: e.target.value })} />
            <Input id="dir_tel" label="Téléphone" type="tel" value={dirForm.telDr}
              onChange={(e) => setDirForm({ ...dirForm, telDr: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDirModalOpen(false)}>Annuler</Button>
            <Button type="submit" loading={dirLoading}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Designation */}
      <Modal open={desModalOpen} onClose={() => setDesModalOpen(false)}
        title={editingDes ? 'Modifier la désignation' : 'Nouvelle désignation'} size="xl">
        <form onSubmit={saveDesignation} className="space-y-4 p-6">
          <Input id="des_nom" label="Nom *" value={desForm.nomDesign}
            onChange={(e) => setDesForm({ ...desForm, nomDesign: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input id="des_type" label="Type" value={desForm.typeDesignation}
              onChange={(e) => setDesForm({ ...desForm, typeDesignation: e.target.value })} />
            <Input id="des_cadastre" label="N° Cadastre" value={desForm.numCadastre}
              onChange={(e) => setDesForm({ ...desForm, numCadastre: e.target.value })} />
          </div>
          <Input id="des_superficie" label="Superficie (m²)" type="number" min="0" step="0.01" value={desForm.superficieDesign}
            onChange={(e) => setDesForm({ ...desForm, superficieDesign: e.target.value })} />            <fieldset className="rounded-lg border border-input p-4">
            <legend className="text-sm font-medium text-foreground px-1">Options</legend>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={desForm.estTitre}
                  onCheckedChange={(c) => setDesForm({ ...desForm, estTitre: c === true })} /> Titre foncier
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={desForm.estEnceinteEtab}
                  onCheckedChange={(c) => setDesForm({ ...desForm, estEnceinteEtab: c === true })} /> Enceinte établissement
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={desForm.estLitigieux}
                  onCheckedChange={(c) => setDesForm({ ...desForm, estLitigieux: c === true })} /> Litigieux
              </label>
            </div>
          </fieldset>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setDesModalOpen(false)}>Annuler</Button>
            <Button type="submit" loading={desCreateLoading || desUpdateLoading}>
              {editingDes ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Structure */}
      <Modal open={strModalOpen} onClose={() => setStrModalOpen(false)}
        title={editingStr ? 'Modifier la structure' : 'Nouvelle structure'} size="xl">
        <form onSubmit={saveStructure} className="space-y-4 p-6">
          <Input id="str_type" label="Type de structure" value={strForm.typeStruc}
            onChange={(e) => setStrForm({ ...strForm, typeStruc: e.target.value })} placeholder="Ex: Bibliothèque, Laboratoire..." />
          <div className="grid grid-cols-2 gap-4">
            <Select id="str_materiaux" label="Matériaux"
              value={strForm.materiauxStruc}
              onChange={(e) => setStrForm({ ...strForm, materiauxStruc: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner' },
                { value: 'DUR', label: 'Dur' },
                { value: 'SEMI-DUR', label: 'Semi-dur' },
                { value: 'BANCHE', label: 'Banché' },
                { value: 'BOIS', label: 'Bois' },
                { value: 'AUTRE', label: 'Autre' },
              ]}
            />
            <Select id="str_etat" label="État"
              value={strForm.etatStruc}
              onChange={(e) => setStrForm({ ...strForm, etatStruc: e.target.value })}
              options={[
                { value: '', label: 'Sélectionner' },
                { value: 'BON', label: 'Bon' },
                { value: 'MOYEN', label: 'Moyen' },
                { value: 'MAUVAIS', label: 'Mauvais' },
              ]}
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={strForm.existenceStruc}
              onCheckedChange={(c) => setStrForm({ ...strForm, existenceStruc: c === true })} />
            Structure existante
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setStrModalOpen(false)}>Annuler</Button>
            <Button type="submit" loading={strCreateLoading || strUpdateLoading}>
              {editingStr ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation suppression Directeur */}
      <Modal open={dirDelModalOpen} onClose={() => setDirDelModalOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Supprimer le directeur <strong>{etablissement.directeur?.nomDirecteur}</strong> de cet établissement ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDirDelModalOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDeleteDirecteur} loading={dirDelLoading}>Supprimer</Button>
        </div>
      </Modal>

      {/* Confirmation suppression Désignation */}
      <Modal open={!!desDelTarget} onClose={() => setDesDelTarget(null)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Supprimer la désignation <strong>{desDelTarget?.nomDesign}</strong> ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDesDelTarget(null)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDeleteDesignation} loading={desDelLoading}>Supprimer</Button>
        </div>
      </Modal>

      {/* Confirmation suppression Structure */}
      <Modal open={!!strDelTarget} onClose={() => setStrDelTarget(null)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Supprimer cette structure{strDelTarget?.typeStruc ? <> (<strong>{strDelTarget.typeStruc}</strong>)</> : ''} ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStrDelTarget(null)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDeleteStructure} loading={strDelLoading}>Supprimer</Button>
        </div>
      </Modal>

      {/* Modal Lier un aléa */}
      <Modal open={linkAleaOpen} onClose={() => setLinkAleaOpen(false)} title="Lier un aléa" size="xl">
        <div className="space-y-2 p-6 max-h-80 overflow-y-auto">
          {availableAleas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tous les aléas sont déjà liés à cet établissement.</p>
          ) : (
            availableAleas.map((a: Alea) => (
              <button
                key={a.idAleat}
                type="button"
                onClick={() => {
                  linkAlea(a.idAleat, {
                    onSuccess: () => {
                      toast.success(`Aléa "${a.nomAleat || a.idAleat}" lié`);
                      setLinkAleaOpen(false);
                    },
                    onError: () => toast.error("Erreur lors de la liaison"),
                  });
                }}
                disabled={linkAleaLoading}
                className="w-full rounded-xl border bg-muted/50 p-3 text-left transition-colors hover:bg-primary/5 disabled:opacity-50"
              >
                <p className="font-medium text-sm text-foreground">{a.nomAleat || `Aléa #${a.idAleat}`}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {a.typeAleat && `${a.typeAleat} · `}
                  {a.dateAleat && new Date(a.dateAleat).toLocaleDateString('fr-FR')}
                </p>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Modal Lier un trajet */}
      <Modal open={linkTrajetOpen} onClose={() => setLinkTrajetOpen(false)} title="Lier un trajet" size="xl">
        <div className="space-y-2 p-6 max-h-80 overflow-y-auto">
          {availableTrajets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tous les trajets sont déjà liés à cet établissement.</p>
          ) : (
            availableTrajets.map((t: Trajet) => (
              <button
                key={t.idTrajet}
                type="button"
                onClick={() => {
                  linkTrajet(t.idTrajet, {
                    onSuccess: () => {
                      toast.success(`Trajet "${t.nomTrajet || t.idTrajet}" lié`);
                      setLinkTrajetOpen(false);
                    },
                    onError: () => toast.error("Erreur lors de la liaison"),
                  });
                }}
                disabled={linkTrajetLoading}
                className="w-full rounded-xl border bg-muted/50 p-3 text-left transition-colors hover:bg-primary/5 disabled:opacity-50"
              >
                <p className="font-medium text-sm text-foreground">{t.nomTrajet || `Trajet #${t.idTrajet}`}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.moyens?.typeMoyen && `${t.moyens.typeMoyen} · `}
                  {t.moyens?.dureeMoyen != null && `${t.moyens.dureeMoyen} min`}
                </p>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Modal Export PDF */}
      <EtablissementExportModal
        etablissementId={etablissementId}
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
