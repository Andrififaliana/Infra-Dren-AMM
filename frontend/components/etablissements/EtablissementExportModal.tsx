'use client';

import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { pdf } from '@react-pdf/renderer';
import { X, Loader2, FileText, AlertTriangle, Download, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useEtablissementExport } from '@/hooks/use-export-etablissement';
import { EtablissementPDFDocument } from './EtablissementPDFDocument';
import type { ExportEtablissement } from '@/types/etablissement-export';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
    if (!etab) return;

    setIsGenerating(true);
    try {
      const blob = await pdf(<EtablissementPDFDocument etablissement={etab} apiBaseUrl={API_BASE_URL} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Fiche_${etab.nomEtab?.replace(/[^a-zA-Z0-9]/g, '_') || 'Etablissement'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-3 bg-muted/30 shrink-0">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
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
              className="rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground/80 transition-colors"
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
              <AlertTriangle className="h-12 w-12 text-muted-foreground/60 mb-4" />
              <p className="text-lg font-medium text-foreground">Impossible de charger les données</p>
              <p className="text-sm text-muted-foreground mt-1">Veuillez réessayer</p>
            </div>            ) : (
            <div className="p-6">
              <div ref={previewRef} className="mx-auto max-w-[186mm] bg-white">
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
    <div className="" style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', lineHeight: '1.4' }}>
      {/* Header neutre */}
      <div className="bg-foreground px-5 py-4 text-primary-foreground">
        <h1 className="text-base font-bold tracking-tight">{e.nomEtab}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-primary-foreground/60">
          {e.dren && <span>DREN : {e.dren}</span>}
          {e.cisco && <span>CISCO : {e.cisco}</span>}
          {e.zap && <span>ZAP : {e.zap}</span>}
        </div>
      </div>

      {/* Infos générales */}
      <Section title="Informations générales">
        <Row label="Commune" value={e.commune} />
        <Row label="Fokontany" value={e.fokontany} />
        <Row label="Quartier" value={e.quartier} />
        <Row label="Coordonnées GPS"
          value={e.latitude && e.longitude ? `${e.latitude.toFixed(6)}, ${e.longitude.toFixed(6)}` : 'Non renseignées'} />
        <Row label="Téléphone" value={e.couvTelephonique ? 'Oui' : 'Non'} />
        <Row label="Internet" value={e.couvInternet ? 'Oui' : 'Non'} />
      </Section>

      {/* Effectifs */}
      <Section title="Effectifs">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td className="py-1 pr-4 text-muted-foreground w-32 align-top">Enseignants</td>
              <td className="py-1 font-medium">{e.nbEnseignantG + e.nbEnseignantF} ({e.nbEnseignantG} H · {e.nbEnseignantF} F)</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-muted-foreground w-32 align-top">Sections</td>
              <td className="py-1 font-medium">{e.nbSectionG + e.nbSectionF} ({e.nbSectionG} H · {e.nbSectionF} F)</td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Directeur */}
      {e.directeur && (
        <Section title="Directeur">
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-0.5 pr-4 text-muted-foreground w-32 align-top">Nom</td><td className="py-0.5 font-medium">{e.directeur.nomDirecteur} {e.directeur.prenomDr || ''}</td></tr>
              {e.directeur.emailDr && <tr><td className="py-0.5 pr-4 text-muted-foreground w-32 align-top">Email</td><td className="py-0.5">{e.directeur.emailDr}</td></tr>}
              {e.directeur.telDr && <tr><td className="py-0.5 pr-4 text-muted-foreground w-32 align-top">Téléphone</td><td className="py-0.5">{e.directeur.telDr}</td></tr>}
            </tbody>
          </table>
        </Section>
      )}

      {/* Désignations */}
      {e.designations.length > 0 && (
        <Section title={`Désignations foncières (${e.designations.length})`}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/30">
                <th className="py-1 pr-3 text-left text-muted-foreground font-medium">Nom</th>
                <th className="py-1 pr-3 text-left text-muted-foreground font-medium">Type</th>
                <th className="py-1 pr-3 text-left text-muted-foreground font-medium">Cadastre</th>
                <th className="py-1 text-right text-muted-foreground font-medium">Surface</th>
              </tr>
            </thead>
            <tbody>
              {e.designations.map((d) => (
                <tr key={d.idDesign} className="border-b border-border/20">
                  <td className="py-1.5 pr-3">
                    <span className="font-medium">{d.nomDesign}</span>
                    <div className="flex gap-1 mt-0.5">
                      {d.estTitre && <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-foreground/80">Titre</span>}
                      {d.estEnceinteEtab && <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-foreground/80">Enceinte</span>}
                      {d.estLitigieux && <span className="text-[9px] px-1 py-0.5 rounded bg-muted/50 text-foreground/80">Litigieux</span>}
                    </div>
                  </td>
                  <td className="py-1.5 pr-3 text-foreground/80">{d.typeDesignation || '-'}</td>
                  <td className="py-1.5 pr-3 text-foreground/80">{d.numCadastre || '-'}</td>
                  <td className="py-1.5 text-right text-foreground/80">{d.superficieDesign ? `${d.superficieDesign} m²` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Structures */}
      {e.structures.length > 0 && (
        <Section title={`Structures (${e.structures.length})`}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/30">
                <th className="py-1 pr-3 text-left text-muted-foreground font-medium">Type</th>
                <th className="py-1 pr-3 text-left text-muted-foreground font-medium">Matériaux</th>
                <th className="py-1 pr-3 text-left text-muted-foreground font-medium">État</th>
                <th className="py-1 text-right text-muted-foreground font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {e.structures.map((s) => (
                <tr key={s.idStruc} className="border-b border-border/20">
                  <td className="py-1.5 pr-3 font-medium">{s.typeStruc || 'Structure'}</td>
                  <td className="py-1.5 pr-3 text-foreground/80">{s.materiauxStruc || '-'}</td>
                  <td className="py-1.5 pr-3 text-foreground/80">{s.etatStruc || '-'}</td>
                  <td className="py-1.5 text-right">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.existenceStruc ? 'bg-muted text-foreground' : 'bg-muted/50 text-foreground/80'}`}>
                      {s.existenceStruc ? 'Existant' : 'Inexistant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Bâtiments */}
      {e.batiments.length > 0 && (
        <Section title={`Bâtiments (${e.batiments.length})`}>
          {e.batiments.map((b) => (
            <div key={b.idBat} className="mb-3 last:mb-0">
              {/* En-tête bâtiment */}
              <div className="bg-muted px-3 py-1.5 rounded-t border-b border-border/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{b.sigleBat || `Bâtiment #${b.idBat}`}</span>
                  <span className="text-[10px] text-muted-foreground">{b.nbNiveau} niveau{b.nbNiveau > 1 ? 'x' : ''}</span>
                </div>
                {b.dispositifAc && <p className="text-[10px] text-muted-foreground mt-0.5">AC : {b.dispositifAc}</p>}
              </div>

              {/* Toilettes */}
              {b.toilettes.length > 0 && (
                <div className="px-3 py-1.5 border-x border-border/30 text-[10px] text-muted-foreground">
                  Toilettes : {b.toilettes.map(t => `${t.nbCompartiment} comp.${t.fonctionToilette ? ` (${t.fonctionToilette})` : ''}${t.pointEau ? ' + point eau' : ''}`).join(' · ')}
                </div>
              )}

              {/* Salles */}
              {b.salles.length > 0 ? (
                <div className="border-x border-b border-border/30 rounded-b">
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-1 px-2 text-left text-muted-foreground font-medium">Salle</th>
                        <th className="py-1 px-2 text-left text-muted-foreground font-medium">Niv.</th>
                        <th className="py-1 px-2 text-left text-muted-foreground font-medium">Affectation</th>
                        <th className="py-1 px-2 text-left text-muted-foreground font-medium">État</th>
                        <th className="py-1 px-2 text-center text-muted-foreground font-medium">Op.</th>
                        <th className="py-1 px-2 text-center text-muted-foreground font-medium">Élèves</th>
                        <th className="py-1 px-2 text-center text-muted-foreground font-medium">Équip.</th>
                        <th className="py-1 px-2 text-center text-muted-foreground font-medium">Ouv.</th>
                        <th className="py-1 px-2 text-center text-muted-foreground font-medium">Ph.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.salles.map((s) => (
                        <tr key={s.idSalle} className="border-t border-border/20">
                          <td className="py-1 px-2 font-medium">{s.sigleSalle || `#${s.idSalle}`}</td>
                          <td className="py-1 px-2 text-foreground/80">{s.niveauSalle}</td>
                          <td className="py-1 px-2 text-foreground/80">{s.affectationSalle || '-'}</td>
                          <td className="py-1 px-2 text-foreground/80">{s.etatSalle || '-'}</td>
                          <td className="py-1 px-2 text-center">
                            <span className={`inline-block w-2 h-2 rounded-full ${s.estOperationnel ? 'bg-foreground/80' : 'bg-muted-foreground/30'}`} />
                          </td>
                          <td className="py-1 px-2 text-center text-foreground/80">{s.nbEleveF + s.nbEleveG}</td>
                          <td className="py-1 px-2 text-center text-foreground/80">{s.equipements?.length || 0}</td>
                          <td className="py-1 px-2 text-center text-foreground/80">{s.ouvertures?.length || 0}</td>
                          <td className="py-1 px-2 text-center text-foreground/80">{s.photos?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-3 py-2 border-x border-b border-border/30 rounded-b text-[10px] text-muted-foreground/60">
                  Aucune salle
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ─── Galerie photos ────────────────────────────── */}
      {(e.photos.length > 0 || e.batiments.some(b => b.photos.length > 0) || e.batiments.some(b => b.salles.some(s => s.photos.length > 0))) && (
        <Section title="Galerie photos">
          {/* Photos de l'établissement */}
          {e.photos.length > 0 && (
            <div className="mb-3">
              <h4 className="text-[10px] font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                Établissement ({e.photos.length} photo{e.photos.length > 1 ? 's' : ''})
              </h4>
              <PhotoGrid photos={e.photos} />
            </div>
          )}

          {/* Photos des bâtiments et salles */}
          {e.batiments.filter(b => b.photos.length > 0 || b.salles.some(s => s.photos.length > 0)).map(b => (
            <div key={b.idBat} className="mb-3 last:mb-0">
              <h4 className="text-[10px] font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/80" />
                Bâtiment {b.sigleBat || `#${b.idBat}`}
                {(b.photos.length > 0) && <span className="font-normal text-muted-foreground/60">({b.photos.length} photo{b.photos.length > 1 ? 's' : ''})</span>}
              </h4>
              {b.photos.length > 0 && <PhotoGrid photos={b.photos} />}
              {b.salles.filter(s => s.photos.length > 0).map(s => (
                <div key={s.idSalle} className="mt-2 ml-3">
                  <h5 className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1">
                    └ Salle {s.sigleSalle || `#${s.idSalle}`}
                    <span className="text-muted-foreground/40">({s.photos.length} photo{s.photos.length > 1 ? 's' : ''})</span>
                  </h5>
                  <PhotoGrid photos={s.photos} />
                </div>
              ))}
            </div>
          ))}
        </Section>
      )}

      {/* Footer */}
      <div className="border-t border-border/30 px-4 py-2.5 text-center text-[9px] text-muted-foreground/60">
        Fiche générée le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · InfraDren AMM
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/20 px-4 py-2.5 last:border-b-0">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-2 text-xs py-0.5">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

// ─── Photo Grid (grille 2 colonnes, grande taille) ──────

type PhotoGridPhoto = {
  id: number;
  key: string;
  url: string;
  originalName?: string | null;
  estPrincipale: boolean;
};

function PhotoGrid({ photos }: { photos: PhotoGridPhoto[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map(p => (
        <PhotoCard key={p.id} photo={p} />
      ))}
    </div>
  );
}

function PhotoCard({ photo }: { photo: PhotoGridPhoto }) {
  const apiBase = API_BASE_URL;
  const [src, setSrc] = useState(photo.url);
  const [failed, setFailed] = useState(false);

  const proxyUrl = photo.key
    ? `${apiBase}/r2/proxy-by-key?key=${encodeURIComponent(photo.key)}`
    : `${apiBase}/r2/proxy-image?url=${encodeURIComponent(photo.url)}`;

  const handleError = useCallback(() => {
    if (src === photo.url) {
      setSrc(proxyUrl);
    } else {
      setFailed(true);
    }
  }, [src, photo.url, proxyUrl]);

  return (
    <div className="flex flex-col gap-1">
      {failed ? (
        <div className="w-full h-36 flex items-center justify-center rounded-lg border border-border/30 bg-muted/50 text-muted-foreground/40">
          <ImageIcon className="h-8 w-8" />
        </div>
      ) : (
        <img
          src={src}
          alt={photo.originalName || `Photo #${photo.id}`}
          className="w-full h-36 object-cover rounded-lg border border-border/30"
          onError={handleError}
        />
      )}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground/60 truncate">
          {photo.originalName || `#${photo.id}`}
        </span>
        {photo.estPrincipale && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-foreground font-medium">
            ★ Principale
          </span>
        )}
      </div>
    </div>
  );
}
