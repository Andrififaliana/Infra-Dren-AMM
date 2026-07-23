'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEtablissements } from '@/hooks/use-etablissements';
import { useAleas } from '@/hooks/use-aleas';
import { useTrajets } from '@/hooks/use-trajets';
import { SearchBar } from '@/components/shared/search-bar';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebounce } from '@/hooks/use-debounce';
import type { EtablissementListe } from '@/types/etablissement';

const EtablissementsMap = dynamic(
  () => import('@/components/map/etablissements-map'),
  { ssr: false, loading: () => <div className="flex h-[600px] items-center justify-center rounded-lg border bg-muted/50 text-sm text-muted-foreground">Chargement de la carte…</div> }
);

export default function CartePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [ciscoFilter, setCiscoFilter] = useState('');
  const [couvertureFilter, setCouvertureFilter] = useState('toutes');
  const [etatFilter] = useState('tous');
  const [showAleas, setShowAleas] = useState(true);
  const [showTrajets, setShowTrajets] = useState(true);
  const [transportFilter, setTransportFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useEtablissements({ page: 1, limit: 999 });
  const { data: aleas } = useAleas();
  const { data: trajets } = useTrajets();

  const etablissements = (data?.data ?? []) as EtablissementListe[];

  const ciscoOptions = useMemo(() => {
    const unique = [...new Set(etablissements.map(e => e.cisco).filter(Boolean) as string[])];
    return unique.sort().map(v => ({ value: v, label: v }));
  }, [etablissements]);

  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return etablissements.filter(e => {
      if (debouncedSearch && !e.nomEtab.toLowerCase().includes(searchLower) && !(e.commune ?? '').toLowerCase().includes(searchLower)) return false;
      if (ciscoFilter && e.cisco !== ciscoFilter) return false;
      if (couvertureFilter === 'telephonique' && !e.couvTelephonique) return false;
      if (couvertureFilter === 'internet' && !e.couvInternet) return false;
      if (couvertureFilter === 'aucune' && (e.couvTelephonique || e.couvInternet)) return false;
      if (transportFilter) {
        const trajets = travelMap[e.id] ?? [];
        if (!trajets.some((t: any) => t.moyens?.typeMoyen === transportFilter)) return false;
      }
      if (etatFilter === 'problemes') {
        return !!e.latitude && !!e.longitude;
      }
      return true;
    });
  }, [etablissements, debouncedSearch, ciscoFilter, couvertureFilter, transportFilter, etatFilter]);

  // Map: schoolId → trajets (pour le filtre transport)
  const travelMap = useMemo(() => {
    const map: Record<number, any[]> = {};
    if (!trajets) return map;
    for (const t of trajets) {
      const parts = t.nomTrajet?.split('→').map(s => s.trim().toLowerCase()) || [];
      for (const school of etablissements) {
        if (!school.commune) continue;
        const matches = parts.some(p => school.commune!.toLowerCase().includes(p) || p.includes(school.commune!.toLowerCase()));
        if (matches) {
          if (!map[school.id]) map[school.id] = [];
          if (!map[school.id].some((existing: any) => existing.idTrajet === t.idTrajet)) {
            map[school.id].push(t);
          }
        }
      }
    }
    return map;
  }, [trajets, etablissements]);

  const couvOptions = [
    { value: 'toutes', label: 'Toutes les couvertures' },
    { value: 'telephonique', label: 'Couverture téléphonique' },
    { value: 'internet', label: 'Couverture Internet' },
    { value: 'aucune', label: 'Aucune couverture' },
  ];

  const transportOptions = [
    { value: '', label: 'Tous les moyens' },
    { value: 'TAXI-BROUSSE', label: 'Taxi-brousse' },
    { value: 'BUS', label: 'Bus' },
    { value: 'PIED', label: 'À pied' },
    { value: 'VOITURE', label: 'Voiture' },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Carte interactive' }]} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carte interactive</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} établissement{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un établissement ou une commune…"
          className="flex-1"
        />
        <Select
          value={ciscoFilter}
          onChange={(e) => setCiscoFilter(e.target.value)}
          options={ciscoOptions}
          placeholder="Tous les CISCO"
          className="w-48"
        />
        <Select
          value={couvertureFilter}
          onChange={(e) => setCouvertureFilter(e.target.value)}
          options={couvOptions}
          className="w-52"
        />
        <Select
          value={transportFilter}
          onChange={(e) => setTransportFilter(e.target.value)}
          options={transportOptions}
          className="w-44"
        />
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox checked={showAleas} onCheckedChange={(c) => setShowAleas(c === true)} />
            Aléas
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox checked={showTrajets} onCheckedChange={(c) => setShowTrajets(c === true)} />
            Trajets
          </label>
        </div>
      </div>

      <EtablissementsMap
        schools={filtered}
        aleas={aleas}
        trajets={trajets}
        showAleas={showAleas}
        showTrajets={showTrajets}
        onSchoolClick={(id) => router.push(`/responsable/etablissements/${id}`)}
      />
    </div>
  );
}
