'use client';

import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  X, Loader2, Building2, MapPin, Phone, Mail, User,
  School, Users, DoorOpen, Lightbulb, Droplets, FileText,
  ImageIcon, AlertTriangle, Star, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEtablissementExport } from '@/hooks/use-export-etablissement';
import type { ExportEtablissement } from '@/types/etablissement-export';

interface EtablissementExportModalProps {
  etablissementId: number;
  open: boolean;
  onClose: () => void;
}

export function EtablissementExportModal({
  etablissementId,
  open,
  onClose,
}: EtablissementExportModalProps) {
  const { data: etab, isLoading, isError } = useEtablissementExport(etablissementId);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = useCallback(async () => {
    if (!previewRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight,
        windowWidth: previewRef.current.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`Fiche_${etab?.nomEtab?.replace(/[^a-zA-Z0-9]/g, '_') || 'Etablissement'}.pdf`);
      toast.success('PDF généré avec succès');
      onClose();
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  }, [etab, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Aperçu de la fiche établissement" size="full">
      <div className="flex flex-col max-h-[85vh]">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-slate-50/80 shrink-0">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Prévisualisation — contenu à exporter
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={generatePDF}
              disabled={isLoading || isError || isGenerating}
              loading={isGenerating}
              className="gap-1.5"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGenerating ? 'Génération...' : 'Télécharger le PDF'}
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : isError || !etab ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-lg font-medium text-slate-700">Impossible de charger les données</p>
              <p className="text-sm text-slate-500 mt-1">Veuillez réessayer</p>
            </div>
          ) : (
            <div className="p-6">
              <div ref={previewRef} className="mx-auto max-w-[210mm] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <ExportPreview etablissement={etab} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── PDF Preview Component ─────────────────────────────────

function ExportPreview({ etablissement }: { etablissement: ExportEtablissement }) {
  const e = etablissement;

  return (
    <div className="text-slate-800" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <School className="h-8 w-8 opacity-90" />
          <h1 className="text-2xl font-bold tracking-tight">{e.nomEtab}</h1>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-green-100">
          {e.dren && <span>DREN : {e.dren}</span>}
          {e.cisco && <span>CISCO : {e.cisco}</span>}
          {e.zap && <span>ZAP : {e.zap}</span>}
        </div>
      </div>

      {/* Infos générales */}
      <Section title="Informations générales" icon={<MapPin className="h-5 w-5" />}>
        <Row label="Commune" value={e.commune} />
        <Row label="Fokontany" value={e.fokontany} />
        <Row label="Quartier" value={e.quartier} />
        <Row label="Coordonnées" value={e.latitude && e.longitude ? `${e.latitude.toFixed(6)}, ${e.longitude.toFixed(6)}` : 'Non renseignées'} />
        <Row label="Couverture téléphonique" value={e.couvTelephonique ? 'Oui' : 'Non'} />
        <Row label="Couverture Internet" value={e.couvInternet ? 'Oui' : 'Non'} />
      </Section>

      {/* Effectifs */}
      <Section title="Effectifs" icon={<Users className="h-5 w-5" />}>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{e.nbEnseignantG + e.nbEnseignantF}</p>
            <p className="text-xs text-blue-600">Enseignants</p>
            <p className="text-xs text-blue-400">({e.nbEnseignantG} H · {e.nbEnseignantF} F)</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{e.nbSectionG + e.nbSectionF}</p>
            <p className="text-xs text-purple-600">Sections</p>
            <p className="text-xs text-purple-400">({e.nbSectionG} H · {e.nbSectionF} F)</p>
          </div>
        </div>
      </Section>

      {/* Directeur */}
      {e.directeur && (
        <Section title="Directeur" icon={<User className="h-5 w-5" />}>
          <Row label="Nom" value={`${e.directeur.nomDirecteur} ${e.directeur.prenomDr || ''}`} />
          {e.directeur.emailDr && <Row label="Email" value={e.directeur.emailDr} icon={<Mail className="h-3.5 w-3.5" />} />}
          {e.directeur.telDr && <Row label="Téléphone" value={e.directeur.telDr} icon={<Phone className="h-3.5 w-3.5" />} />}
        </Section>
      )}

      {/* Désignations */}
      {e.designations.length > 0 && (
        <Section title={`Désignations foncières (${e.designations.length})`} icon={<FileText className="h-5 w-5" />}>
          {e.designations.map((d) => (
            <div key={d.idDesign} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-800">{d.nomDesign}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                {d.typeDesignation && <span>Type : {d.typeDesignation}</span>}
                {d.numCadastre && <span>N° Cadastre : {d.numCadastre}</span>}
                {d.superficieDesign && <span>Surface : {d.superficieDesign} m²</span>}
              </div>
              <div className="mt-2 flex gap-1.5">
                {d.estTitre && <Badge variant="success" className="text-[10px] px-1.5 py-0.5">Titre</Badge>}
                {d.estEnceinteEtab && <Badge variant="info" className="text-[10px] px-1.5 py-0.5">Enceinte</Badge>}
                {d.estLitigieux && <Badge variant="danger" className="text-[10px] px-1.5 py-0.5">Litigieux</Badge>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Structures */}
      {e.structures.length > 0 && (
        <Section title={`Structures (${e.structures.length})`} icon={<Building2 className="h-5 w-5" />}>
          {e.structures.map((s) => (
            <div key={s.idStruc} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-800">{s.typeStruc || 'Structure'}</p>
                <Badge variant={s.existenceStruc ? 'success' : 'danger'} className="text-[10px]">
                  {s.existenceStruc ? 'Existant' : 'Inexistant'}
                </Badge>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-slate-500">
                {s.materiauxStruc && <span>Matériaux : {s.materiauxStruc}</span>}
                {s.etatStruc && <span>État : {s.etatStruc}</span>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Bâtiments */}
      {e.batiments.length > 0 && (
        <Section title={`Bâtiments (${e.batiments.length})`} icon={<Building2 className="h-5 w-5" />}>
          {e.batiments.map((b) => {
            const totalSallePhotos = b.salles.reduce((acc, s) => acc + s.photos.length, 0);
            return (
              <div key={b.idBat} className="rounded-xl border border-slate-200 overflow-hidden mb-4 last:mb-0">
                {/* Batiment header */}
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{b.sigleBat || `Bâtiment #${b.idBat}`}</p>
                    <span className="text-xs text-slate-500">{b.nbNiveau} niveau{b.nbNiveau > 1 ? 'x' : ''}</span>
                  </div>
                  {b.dispositifAc && <p className="text-xs text-slate-500 mt-0.5">Dispositif AC : {b.dispositifAc}</p>}
                </div>

                {/* Photos */}
                {b.photos.length > 0 && (
                  <div className="flex gap-1.5 px-4 py-2 bg-slate-50/50 border-b border-slate-100">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-400">{b.photos.length} photo{b.photos.length > 1 ? 's' : ''}</span>
                    {b.photos.find(p => p.estPrincipale) && <Star className="h-3 w-3 text-amber-400 fill-amber-400 ml-1" />}
                  </div>
                )}

                {/* Toilettes */}
                {b.toilettes.length > 0 && (
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                      <Droplets className="h-3 w-3" /> Toilettes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {b.toilettes.map((t) => (
                        <span key={t.idToilette} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] text-blue-700">
                          {t.nbCompartiment} comp. {t.fonctionToilette || ''}
                          {t.pointEau && ' 💧'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Salles */}
                {b.salles.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {b.salles.map((s) => (
                      <div key={s.idSalle} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">
                            {s.sigleSalle || `Salle #${s.idSalle}`}
                            {s.affectationSalle && (
                              <span className="ml-2 text-xs text-slate-400 font-normal">({s.affectationSalle})</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={s.estOperationnel ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0.5">
                              {s.estOperationnel ? 'Op.' : 'Non op.'}
                            </Badge>
                            {s.estElectrifiee && (
                              <Lightbulb className="h-3 w-3 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                          <span>Niveau {s.niveauSalle}</span>
                          <span>État : {s.etatSalle || 'N/R'}</span>
                          {s.longueurInt && s.hauteurSP && (
                            <span>Dim. : {s.longueurInt} × {s.hauteurSP} m</span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Users className="h-3 w-3" /> {s.nbEleveF + s.nbEleveG} élèves ({s.nbEleveF} F · {s.nbEleveG} G)
                          </span>
                        </div>

                        {/* Équipements */}
                        {s.equipements.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {s.equipements.map((eq) => (
                              <span key={eq.id} className="inline-flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-[10px] text-green-700">
                                {eq.nomEquip} ×{eq.quantite}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Ouvertures */}
                        {s.ouvertures.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {s.ouvertures.map((o) => (
                              <span key={o.idOuvert} className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                                <DoorOpen className="h-2.5 w-2.5" />
                                {o.nbOuvert} {o.typeOuvert || 'ouv.'}
                                {o.surfaceOuvert && ` (${o.surfaceOuvert}m²)`}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Salle photos */}
                        {s.photos.length > 0 && (
                          <p className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                            <ImageIcon className="h-2.5 w-2.5" />
                            {s.photos.length} photo{s.photos.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-3 text-xs text-slate-400">Aucune salle</p>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {/* Photos */}
      {e.photos.length > 0 && (
        <Section title={`Photos (${e.photos.length})`} icon={<ImageIcon className="h-5 w-5" />}>
          <p className="text-sm text-slate-500">{e.photos.length} photo{e.photos.length > 1 ? 's' : ''} — {e.photos.filter(p => p.estPrincipale).length > 0 ? 'dont une photo principale' : 'aucune photo principale'}</p>
        </Section>
      )}

      {/* Footer */}
      <div className="border-t border-slate-200 px-8 py-4 text-center text-xs text-slate-400">
        Fiche générée le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · InfraDren AMM
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 px-8 py-5 last:border-b-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
        <span className="text-green-600">{icon}</span>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="min-w-[120px] text-slate-500">{label}</span>
      <span className="flex items-center gap-1.5 text-slate-800 font-medium">
        {icon && <span className="text-slate-400">{icon}</span>}
        {value}
      </span>
    </div>
  );
}
