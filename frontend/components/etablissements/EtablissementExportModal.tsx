'use client';

import { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { X, Loader2, FileText, AlertTriangle, Download, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
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
    <div className="text-slate-800" style={{ fontFamily: 'system-ui, sans-serif', fontSize: '10px', lineHeight: '1.4' }}>
      {/* Header neutre */}
      <div className="bg-slate-800 px-6 py-5 text-white">
        <h1 className="text-lg font-bold tracking-tight">{e.nomEtab}</h1>
        <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-0.5 text-[11px] text-slate-300">
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
              <td className="py-1 pr-4 text-slate-500 w-32 align-top">Enseignants</td>
              <td className="py-1 font-medium">{e.nbEnseignantG + e.nbEnseignantF} ({e.nbEnseignantG} H · {e.nbEnseignantF} F)</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-slate-500 w-32 align-top">Sections</td>
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
              <tr><td className="py-0.5 pr-4 text-slate-500 w-32 align-top">Nom</td><td className="py-0.5 font-medium">{e.directeur.nomDirecteur} {e.directeur.prenomDr || ''}</td></tr>
              {e.directeur.emailDr && <tr><td className="py-0.5 pr-4 text-slate-500 w-32 align-top">Email</td><td className="py-0.5">{e.directeur.emailDr}</td></tr>}
              {e.directeur.telDr && <tr><td className="py-0.5 pr-4 text-slate-500 w-32 align-top">Téléphone</td><td className="py-0.5">{e.directeur.telDr}</td></tr>}
            </tbody>
          </table>
        </Section>
      )}

      {/* Désignations */}
      {e.designations.length > 0 && (
        <Section title={`Désignations foncières (${e.designations.length})`}>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-1 pr-3 text-left text-slate-500 font-medium">Nom</th>
                <th className="py-1 pr-3 text-left text-slate-500 font-medium">Type</th>
                <th className="py-1 pr-3 text-left text-slate-500 font-medium">Cadastre</th>
                <th className="py-1 text-right text-slate-500 font-medium">Surface</th>
              </tr>
            </thead>
            <tbody>
              {e.designations.map((d) => (
                <tr key={d.idDesign} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3">
                    <span className="font-medium">{d.nomDesign}</span>
                    <div className="flex gap-1 mt-0.5">
                      {d.estTitre && <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-600">Titre</span>}
                      {d.estEnceinteEtab && <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-600">Enceinte</span>}
                      {d.estLitigieux && <span className="text-[9px] px-1 py-0.5 rounded bg-red-50 text-red-600">Litigieux</span>}
                    </div>
                  </td>
                  <td className="py-1.5 pr-3 text-slate-600">{d.typeDesignation || '-'}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{d.numCadastre || '-'}</td>
                  <td className="py-1.5 text-right text-slate-600">{d.superficieDesign ? `${d.superficieDesign} m²` : '-'}</td>
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
              <tr className="border-b border-slate-200">
                <th className="py-1 pr-3 text-left text-slate-500 font-medium">Type</th>
                <th className="py-1 pr-3 text-left text-slate-500 font-medium">Matériaux</th>
                <th className="py-1 pr-3 text-left text-slate-500 font-medium">État</th>
                <th className="py-1 text-right text-slate-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {e.structures.map((s) => (
                <tr key={s.idStruc} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3 font-medium">{s.typeStruc || 'Structure'}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{s.materiauxStruc || '-'}</td>
                  <td className="py-1.5 pr-3 text-slate-600">{s.etatStruc || '-'}</td>
                  <td className="py-1.5 text-right">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.existenceStruc ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600'}`}>
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
              <div className="bg-slate-100 px-3 py-1.5 rounded-t border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{b.sigleBat || `Bâtiment #${b.idBat}`}</span>
                  <span className="text-[10px] text-slate-500">{b.nbNiveau} niveau{b.nbNiveau > 1 ? 'x' : ''}</span>
                </div>
                {b.dispositifAc && <p className="text-[10px] text-slate-500 mt-0.5">AC : {b.dispositifAc}</p>}
              </div>

              {/* Photos du bâtiment */}
              {b.photos.length > 0 && (
                <PhotoList photos={b.photos} label={`${b.photos.length} photo${b.photos.length > 1 ? 's' : ''}`} />
              )}

              {/* Toilettes */}
              {b.toilettes.length > 0 && (
                <div className="px-3 py-1.5 border-x border-slate-200 text-[10px] text-slate-500">
                  Toilettes : {b.toilettes.map(t => `${t.nbCompartiment} comp.${t.fonctionToilette ? ` (${t.fonctionToilette})` : ''}${t.pointEau ? ' + point eau' : ''}`).join(' · ')}
                </div>
              )}

              {/* Salles */}
              {b.salles.length > 0 ? (
                <div className="border-x border-b border-slate-200 rounded-b">
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="py-1 px-2 text-left text-slate-500 font-medium">Salle</th>
                        <th className="py-1 px-2 text-left text-slate-500 font-medium">Niv.</th>
                        <th className="py-1 px-2 text-left text-slate-500 font-medium">Affectation</th>
                        <th className="py-1 px-2 text-left text-slate-500 font-medium">État</th>
                        <th className="py-1 px-2 text-center text-slate-500 font-medium">Op.</th>
                        <th className="py-1 px-2 text-center text-slate-500 font-medium">Élèves</th>
                        <th className="py-1 px-2 text-center text-slate-500 font-medium">Équip.</th>
                        <th className="py-1 px-2 text-center text-slate-500 font-medium">Ouv.</th>
                        <th className="py-1 px-2 text-center text-slate-500 font-medium">Ph.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.salles.map((s) => (
                        <tr key={s.idSalle} className="border-t border-slate-100">
                          <td className="py-1 px-2 font-medium">{s.sigleSalle || `#${s.idSalle}`}</td>
                          <td className="py-1 px-2 text-slate-600">{s.niveauSalle}</td>
                          <td className="py-1 px-2 text-slate-600">{s.affectationSalle || '-'}</td>
                          <td className="py-1 px-2 text-slate-600">{s.etatSalle || '-'}</td>
                          <td className="py-1 px-2 text-center">
                            <span className={`inline-block w-2 h-2 rounded-full ${s.estOperationnel ? 'bg-green-500' : 'bg-red-400'}`} />
                          </td>
                          <td className="py-1 px-2 text-center text-slate-600">{s.nbEleveF + s.nbEleveG}</td>
                          <td className="py-1 px-2 text-center text-slate-600">{s.equipements?.length || 0}</td>
                          <td className="py-1 px-2 text-center text-slate-600">{s.ouvertures?.length || 0}</td>
                          <td className="py-1 px-2 text-center text-slate-600">{s.photos?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Détail des photos par salle */}
                  {b.salles.filter(s => s.photos.length > 0).length > 0 && (
                    <div className="border-t border-slate-100 px-3 py-1.5 text-[9px] text-slate-400">
                      {b.salles.filter(s => s.photos.length > 0).map(s => (
                        <div key={s.idSalle} className="mb-0.5 last:mb-0">
                          <span className="font-medium text-slate-500">{s.sigleSalle || `#${s.idSalle}`}</span> :{' '}
                          {s.photos.map(p => (
                            <span key={p.id} className="mr-1.5">
                              {p.originalName || `Photo #${p.id}`}{p.estPrincipale ? ' ★' : ''}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 border-x border-b border-slate-200 rounded-b text-[10px] text-slate-400">
                  Aucune salle
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Photos de l'établissement */}
      {e.photos.length > 0 && (
        <Section title={`Photos (${e.photos.length})`}>
          <PhotoList photos={e.photos} />
        </Section>
      )}

      {/* Footer */}
      <div className="border-t border-slate-200 px-6 py-3 text-center text-[9px] text-slate-400">
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
    <div className="border-b border-slate-100 px-5 py-3 last:border-b-0">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">{title}</h3>
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
    <div className="flex items-start gap-3 text-xs py-0.5">
      <span className="text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

// ─── Photo List Helper (miniatures) ──────────────────────

function PhotoList({ photos, label }: { photos: Array<{ id: number; url: string; originalName?: string | null; estPrincipale: boolean }>; label?: string }) {
  const [failedIds, setFailedIds] = useState<Set<number>>(new Set());

  return (
    <div className="border-x border-slate-200 px-3 py-2 text-[10px]">
      {label && <p className="text-slate-500 mb-1.5 font-medium">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {photos.map(p => (
          <div key={p.id} className="flex flex-col items-center gap-0.5">
            {failedIds.has(p.id) ? (
              <div className="w-[60px] h-[45px] flex items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-300">
                <ImageIcon className="h-4 w-4" />
              </div>
            ) : (
              <img
                src={p.url}
                alt={p.originalName || `Photo #${p.id}`}
                className="w-[60px] h-[45px] object-cover rounded border border-slate-200"
                crossOrigin="anonymous"
                loading="lazy"
                onError={() => setFailedIds(prev => new Set(prev).add(p.id))}
              />
            )}
            <div className="flex items-center gap-0.5">
              <span className="text-[8px] text-slate-400 truncate max-w-[60px]">
                {p.originalName || `Photo #${p.id}`}
              </span>
              {p.estPrincipale && <span className="text-[9px] text-amber-600" title="Principale">★</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
