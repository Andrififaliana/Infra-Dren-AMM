'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EtablissementListe } from '@/types/etablissement';
import type { Alea } from '@/types/alea';
import type { Trajet } from '@/types/trajet';

const schoolIcon = L.divIcon({
  className: '',
  html: `<div style="background:#16a34a;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const aleaIcon = L.divIcon({
  className: '',
  html: `<div style="background:#8b5cf6;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -32],
});

interface EtablissementWithCoords extends EtablissementListe {
  latitude: number;
  longitude: number;
}

function FitBounds({ schools }: { schools: EtablissementWithCoords[] }) {
  const map = useMap();
  useEffect(() => {
    if (schools.length === 0) return;
    const bounds = L.latLngBounds(schools.map(s => [s.latitude, s.longitude]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [schools, map]);
  return null;
}

/** Formate une durée en minutes en texte lisible */
function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

function TransportBadge({ type }: { type?: string }) {
  const map: Record<string, { label: string; color: string }> = {
    'TAXI-BROUSSE': { label: 'Taxi-brousse', color: 'bg-amber-100 text-amber-700' },
    'BUS': { label: 'Bus', color: 'bg-blue-100 text-blue-700' },
    'PIED': { label: 'À pied', color: 'bg-green-100 text-green-700' },
    'VOITURE': { label: 'Voiture', color: 'bg-slate-100 text-slate-700' },
    'MOTO': { label: 'Moto', color: 'bg-orange-100 text-orange-700' },
    'VELO': { label: 'Vélo', color: 'bg-teal-100 text-teal-700' },
  };
  const info = map[type ?? ''];
  if (!info) return <span className="text-xs text-muted-foreground">Inconnu</span>;
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}



interface MapContentProps {
  schools: EtablissementWithCoords[];
  showAleas: boolean;
  showTrajets: boolean;
  aleas?: Alea[];
  trajets?: Trajet[];
  onSchoolClick: (id: number) => void;
}

function MapContent({ schools, showAleas, showTrajets, aleas, trajets, onSchoolClick }: MapContentProps) {
  const aleaEtabIds = useMemo(() => {
    if (!aleas) return new Set<number>();
    const ids = new Set<number>();
    aleas.forEach(a => {
      if (a.effets) {
        a.effets.forEach(e => {
          if (e.trajet) ids.add(e.trajetId);
        });
      }
    });
    return ids;
  }, [aleas]);

  // Map: schoolId → trajets qui desservent sa commune (pré-calculé O(1))
  const schoolTrajetMap = useMemo(() => {
    const map = new Map<number, Trajet[]>();
    if (!trajets) return map;
    for (const t of trajets) {
      const parts = t.nomTrajet?.split('→').map(s => s.trim().toLowerCase()) || [];
      if (parts.length === 0) continue;
      // Pour chaque école dont la commune matche un segment du trajet
      for (const school of schools) {
        if (!school.commune) continue;
        const communeLower = school.commune.toLowerCase();
        const matches = parts.some(p => communeLower.includes(p) || p.includes(communeLower));
        if (matches) {
          if (!map.has(school.id)) map.set(school.id, []);
          const list = map.get(school.id)!;
          if (!list.some(existing => existing.idTrajet === t.idTrajet)) {
            list.push(t);
          }
        }
      }
    }
    return map;
  }, [trajets, schools]);

  const trajetLines = useMemo(() => {
    if (!showTrajets || !trajets || schools.length === 0) return [];
    return trajets.map(t => {
      const parts = t.nomTrajet?.split('→').map(s => s.trim()) || [];
      const points: [number, number][] = [];
      for (const part of parts) {
        const found = schools.find(s =>
          s.commune?.toLowerCase().includes(part.toLowerCase()) ||
          s.nomEtab.toLowerCase().includes(part.toLowerCase())
        );
        if (found) points.push([found.latitude, found.longitude]);
      }
      return { trajet: t, points };
    }).filter(t => t.points.length >= 2);
  }, [showTrajets, trajets, schools]);

  return (
    <>
      <FitBounds schools={schools} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {schools.map(school => {
        const affected = showAleas && aleaEtabIds.size > 0;
        const icon = affected ? aleaIcon : schoolIcon;
        const schoolTrajets = schoolTrajetMap.get(school.id) ?? [];
        const hasTrajets = showTrajets && schoolTrajets.length > 0;

        return (
          <Marker
            key={school.id}
            position={[school.latitude, school.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-[220px]">
                {/* En-tête */}
                <strong className="text-sm">{school.nomEtab}</strong>

                {/* Infos générales */}
                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <p>{school.cisco} — {school.zap}</p>
                  <p>{school.commune}{school.fokontany ? `, ${school.fokontany}` : ''}</p>
                  <p>
                    <span className="font-medium">Tel. :</span> {school.couvTelephonique ? 'Oui' : 'Non'}
                    {' | '}<span className="font-medium">Internet :</span> {school.couvInternet ? 'Oui' : 'Non'}
                  </p>
                  <p><span className="font-medium">Enseignants :</span> {school.nbEnseignantG + school.nbEnseignantF}</p>
                  <p><span className="font-medium">Batiments :</span> {school._count?.batiments ?? 0}</p>
                </div>

                {/* Infos transport */}
                {hasTrajets && (
                  <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Accès
                    </p>
                    {schoolTrajets.map((t) => (
                      <div key={t.idTrajet} className="flex items-center gap-2 text-xs">
                        <TransportBadge type={t.moyens?.typeMoyen} />
                        <div className="flex-1 min-w-0">
                          <p className="text-muted-foreground">
                            {t.moyens?.dureeMoyen != null && formatDuree(t.moyens.dureeMoyen)}
                            {t.moyens?.dureeMoyen != null && t.moyens?.distanceMoyen != null && ' · '}
                            {t.moyens?.distanceMoyen != null && `${t.moyens.distanceMoyen} km`}
                          </p>
                        </div>
                        {t.periode && (
                          <span className="shrink-0 text-[10px] text-amber-600 font-medium cursor-help" title={`Difficile: ${new Date(t.periode.debutPeriode).toLocaleDateString('fr-FR')} - ${new Date(t.periode.finPeriode).toLocaleDateString('fr-FR')}`}>
                            {t.moyens?.dureeMoyen != null ? '!' : 'Période difficile'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!hasTrajets && showTrajets && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground/60">Aucune info de transport</p>
                  </div>
                )}

                <button
                  onClick={() => onSchoolClick(school.id)}
                  className="mt-2 w-full rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Voir le détail
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {showTrajets && trajetLines.map(({ trajet, points }) => (
        <Polyline
          key={trajet.idTrajet}
          positions={points}
          color="#3b82f6"
          weight={3}
          opacity={0.6}
          dashArray="10 6"
        >
          <Popup>
            <div className="text-xs">
              <strong>{trajet.nomTrajet}</strong>
              <p>{trajet.moyens?.typeMoyen ?? 'Inconnu'} — {trajet.moyens?.distanceMoyen} km</p>
              {trajet.moyens?.dureeMoyen != null && <p>Durée : {formatDuree(trajet.moyens.dureeMoyen)}</p>}
              {trajet.periode && (
                <p>Période difficile: {new Date(trajet.periode.debutPeriode).toLocaleDateString()} - {new Date(trajet.periode.finPeriode).toLocaleDateString()}</p>
              )}
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
}

interface EtablissementsMapProps {
  schools: EtablissementListe[];
  aleas?: Alea[];
  trajets?: Trajet[];
  showAleas: boolean;
  showTrajets: boolean;
  onSchoolClick: (id: number) => void;
}

export default function EtablissementsMap({
  schools,
  aleas,
  trajets,
  showAleas,
  showTrajets,
  onSchoolClick,
}: EtablissementsMapProps) {
  const schoolsWithCoords = schools.filter(
    (s): s is EtablissementWithCoords => typeof s.latitude === 'number' && typeof s.longitude === 'number'
  );

  const center: [number, number] = schoolsWithCoords.length > 0
    ? [schoolsWithCoords[0].latitude, schoolsWithCoords[0].longitude]
    : [-20.3, 47.0];

  if (schoolsWithCoords.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Aucun établissement avec des coordonnées GPS
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={center}
        zoom={9}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <MapContent
          schools={schoolsWithCoords}
          showAleas={showAleas}
          showTrajets={showTrajets}
          aleas={aleas}
          trajets={trajets}
          onSchoolClick={onSchoolClick}
        />
      </MapContainer>
    </div>
  );
}
