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

  const { data } = useEtablissements({ page: 1, limit: 999 });
  const { data: aleas } = useAleas();
  const { data: trajets } = useTrajets();

  const etablissements = (data?.data ?? []) as EtablissementListe[];

  const ciscoOptions = useMemo(() => {
    const unique = [...new Set(etablissements.map(e => e.cisco).filter(Boolean) as string[])];
    return unique.sort().map(v => ({ value: v, label: v }));
  }, [etablissements]);

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return etablissements.filter(e => {
      if (search && !e.nomEtab.toLowerCase().includes(searchLower) && !(e.commune ?? '').toLowerCase().includes(searchLower)) return false;
      if (ciscoFilter && e.cisco !== ciscoFilter) return false;
      if (couvertureFilter === 'telephonique' && !e.couvTelephonique) return false;
      if (couvertureFilter === 'internet' && !e.couvInternet) return false;
      if (couvertureFilter === 'aucune' && (e.couvTelephonique || e.couvInternet)) return false;
      if (etatFilter === 'problemes') {
        return !!e.latitude && !!e.longitude;
      }
      return true;
    });
  }, [etablissements, search, ciscoFilter, couvertureFilter, etatFilter]);

  const couvOptions = [
    { value: 'toutes', label: 'Toutes les couvertures' },
    { value: 'telephonique', label: 'Couverture téléphonique' },
    { value: 'internet', label: 'Couverture Internet' },
    { value: 'aucune', label: 'Aucune couverture' },
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
