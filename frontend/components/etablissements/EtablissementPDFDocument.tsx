import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { ExportEtablissement, ExportBatiment, ExportSalle, ExportPhoto, ExportBatimentPhoto, ExportSallePhoto } from '@/types/etablissement-export';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 14,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerMeta: {
    fontSize: 8,
    color: '#cbd5e1',
    marginTop: 2,
  },
  headerMetaItem: {
    marginRight: 8,
  },
  section: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  rowLabel: {
    width: 100,
    color: '#64748b',
  },
  rowValue: {
    fontWeight: 'medium',
    color: '#1e293b',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 2,
    marginBottom: 1,
  },
  tableHeaderCell: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 2,
  },
  tableCell: {
    color: '#475569',
  },
  batimentHeader: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginTop: 4,
  },
  batimentTitle: {
    fontWeight: 'bold',
    fontSize: 9,
  },
  batimentMeta: {
    color: '#64748b',
    fontSize: 8,
  },
  toiletteLine: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 8,
    color: '#64748b',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoItem: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  photoImage: {
    width: '100%',
    height: 100,
    objectFit: 'cover',
    borderRadius: 2,
  },
  photoLabel: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 1,
  },
  photoPrincipale: {
    fontSize: 7,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badge: {
    fontSize: 7,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 1,
    marginRight: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 8,
  },
  entityTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

type AnyPhoto = ExportPhoto | ExportBatimentPhoto | ExportSallePhoto;

function PhotoItem({ photo, apiBaseUrl }: { photo: AnyPhoto; apiBaseUrl: string }) {
  const proxySrc = `${apiBaseUrl}/r2/proxy-image?url=${encodeURIComponent(photo.url)}`;
  return (
    <View style={styles.photoItem}>
      <Image style={styles.photoImage} src={proxySrc} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.photoLabel}>{photo.originalName || `#${photo.id}`}</Text>
        {photo.estPrincipale && (
          <Text style={styles.photoPrincipale}>★ Principale</Text>
        )}
      </View>
    </View>
  );
}

function BatimentSection({ batiment }: { batiment: ExportBatiment }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <View style={styles.batimentHeader}>
        <Text style={styles.batimentTitle}>{batiment.sigleBat || `Bâtiment #${batiment.idBat}`}</Text>
        <Text style={styles.batimentMeta}>{batiment.nbNiveau} niveau{batiment.nbNiveau > 1 ? 'x' : ''}</Text>
      </View>

      {batiment.dispositifAc && (
        <View style={{ paddingHorizontal: 8, paddingVertical: 1, fontSize: 8, color: '#64748b' }}>
          <Text>AC : {batiment.dispositifAc}</Text>
        </View>
      )}

      {batiment.toilettes.length > 0 && (
        <View style={styles.toiletteLine}>
          <Text>
            Toilettes : {batiment.toilettes.map(t =>
              `${t.nbCompartiment} comp.${t.fonctionToilette ? ` (${t.fonctionToilette})` : ''}${t.pointEau ? ' + point eau' : ''}`
            ).join(' · ')}
          </Text>
        </View>
      )}

      {batiment.salles.length > 0 ? (
        <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }}>
          <View style={[styles.tableHeader, { paddingHorizontal: 6 }]}>
            <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Salle</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Niv.</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Affectation</Text>
            <Text style={[styles.tableHeaderCell, { width: '12%' }]}>État</Text>
            <Text style={[styles.tableHeaderCell, { width: '8%' }]}>Op.</Text>
            <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Élèves</Text>
            <Text style={[styles.tableHeaderCell, { width: '8%' }]}>Éq.</Text>
            <Text style={[styles.tableHeaderCell, { width: '7%' }]}>Ouv.</Text>
            <Text style={[styles.tableHeaderCell, { width: '7%' }]}>Ph.</Text>
          </View>
          {batiment.salles.map(s => (
            <View key={s.idSalle} style={[styles.tableRow, { paddingHorizontal: 6 }]}>
              <Text style={[styles.tableCell, { width: '18%', fontWeight: 'bold' }]}>{s.sigleSalle || `#${s.idSalle}`}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{s.niveauSalle}</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>{s.affectationSalle || '-'}</Text>
              <Text style={[styles.tableCell, { width: '12%' }]}>{s.etatSalle || '-'}</Text>
              <Text style={[styles.tableCell, { width: '8%' }]}>{s.estOperationnel ? '✓' : '○'}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{s.nbEleveF + s.nbEleveG}</Text>
              <Text style={[styles.tableCell, { width: '8%' }]}>{s.equipements?.length || 0}</Text>
              <Text style={[styles.tableCell, { width: '7%' }]}>{s.ouvertures?.length || 0}</Text>
              <Text style={[styles.tableCell, { width: '7%' }]}>{s.photos?.length || 0}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, fontSize: 8, color: '#94a3b8', borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }}>
          <Text>Aucune salle</Text>
        </View>
      )}
    </View>
  );
}

export function EtablissementPDFDocument({ etablissement, apiBaseUrl }: { etablissement: ExportEtablissement; apiBaseUrl: string }) {
  const e = etablissement;
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{e.nomEtab}</Text>
          <View style={{ flexDirection: 'row', marginTop: 2, flexWrap: 'wrap' }}>
            {e.dren && <Text style={styles.headerMetaItem}>DREN : {e.dren}</Text>}
            {e.cisco && <Text style={styles.headerMetaItem}>CISCO : {e.cisco}</Text>}
            {e.zap && <Text style={styles.headerMetaItem}>ZAP : {e.zap}</Text>}
          </View>
        </View>

        {/* Infos générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          {e.commune && <View style={styles.row}><Text style={styles.rowLabel}>Commune</Text><Text style={styles.rowValue}>{e.commune}</Text></View>}
          {e.fokontany && <View style={styles.row}><Text style={styles.rowLabel}>Fokontany</Text><Text style={styles.rowValue}>{e.fokontany}</Text></View>}
          {e.quartier && <View style={styles.row}><Text style={styles.rowLabel}>Quartier</Text><Text style={styles.rowValue}>{e.quartier}</Text></View>}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Coordonnées GPS</Text>
            <Text style={styles.rowValue}>{e.latitude && e.longitude ? `${e.latitude.toFixed(6)}, ${e.longitude.toFixed(6)}` : 'Non renseignées'}</Text>
          </View>
          <View style={styles.row}><Text style={styles.rowLabel}>Téléphone</Text><Text style={styles.rowValue}>{e.couvTelephonique ? 'Oui' : 'Non'}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Internet</Text><Text style={styles.rowValue}>{e.couvInternet ? 'Oui' : 'Non'}</Text></View>
        </View>

        {/* Effectifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Effectifs</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enseignants</Text>
            <Text style={styles.rowValue}>{e.nbEnseignantG + e.nbEnseignantF} ({e.nbEnseignantG} H · {e.nbEnseignantF} F)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sections</Text>
            <Text style={styles.rowValue}>{e.nbSectionG + e.nbSectionF} ({e.nbSectionG} H · {e.nbSectionF} F)</Text>
          </View>
        </View>

        {/* Directeur */}
        {e.directeur && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Directeur</Text>
            <View style={styles.row}><Text style={styles.rowLabel}>Nom</Text><Text style={styles.rowValue}>{e.directeur.nomDirecteur} {e.directeur.prenomDr || ''}</Text></View>
            {e.directeur.emailDr && <View style={styles.row}><Text style={styles.rowLabel}>Email</Text><Text style={styles.rowValue}>{e.directeur.emailDr}</Text></View>}
            {e.directeur.telDr && <View style={styles.row}><Text style={styles.rowLabel}>Téléphone</Text><Text style={styles.rowValue}>{e.directeur.telDr}</Text></View>}
          </View>
        )}

        {/* Désignations */}
        {e.designations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Désignations foncières ({e.designations.length})</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Nom</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Type</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Cadastre</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>Surface</Text>
            </View>
            {e.designations.map(d => (
              <View key={d.idDesign} style={styles.tableRow}>
                <View style={{ width: '30%' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 9 }}>{d.nomDesign}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {d.estTitre && <Text style={styles.badge}>Titre</Text>}
                    {d.estEnceinteEtab && <Text style={styles.badge}>Enceinte</Text>}
                    {d.estLitigieux && <Text style={styles.badge}>Litigieux</Text>}
                  </View>
                </View>
                <Text style={[styles.tableCell, { width: '20%' }]}>{d.typeDesignation || '-'}</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>{d.numCadastre || '-'}</Text>
                <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>{d.superficieDesign ? `${d.superficieDesign} m²` : '-'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Structures */}
        {e.structures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Structures ({e.structures.length})</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Type</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Matériaux</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>État</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>Statut</Text>
            </View>
            {e.structures.map(s => (
              <View key={s.idStruc} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold' }]}>{s.typeStruc || 'Structure'}</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>{s.materiauxStruc || '-'}</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>{s.etatStruc || '-'}</Text>
                <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>{s.existenceStruc ? 'Existant' : 'Inexistant'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bâtiments */}
        {e.batiments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bâtiments ({e.batiments.length})</Text>
            {e.batiments.map(b => (
              <BatimentSection key={b.idBat} batiment={b} />
            ))}
          </View>
        )}

        {/* Galerie photos */}
        {(e.photos.length > 0 || e.batiments.some(b => b.photos.length > 0) || e.batiments.some(b => b.salles.some(s => s.photos.length > 0))) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Galerie photos</Text>

            {e.photos.length > 0 && (
              <View style={{ marginBottom: 6 }}>
                <Text style={styles.entityTitle}>Établissement ({e.photos.length} photo{e.photos.length > 1 ? 's' : ''})</Text>
                <View style={styles.photoGrid}>
                  {e.photos.map(p => (
                    <PhotoItem key={p.id} photo={p} apiBaseUrl={apiBaseUrl} />
                  ))}
                </View>
              </View>
            )}

            {e.batiments.filter(b => b.photos.length > 0 || b.salles.some(s => s.photos.length > 0)).map(b => (
              <View key={b.idBat} style={{ marginBottom: 6 }}>
                <Text style={styles.entityTitle}>
                  Bâtiment {b.sigleBat || `#${b.idBat}`}
                  {b.photos.length > 0 && ` (${b.photos.length} photo${b.photos.length > 1 ? 's' : ''})`}
                </Text>
                {b.photos.length > 0 && (
                  <View style={styles.photoGrid}>
                    {b.photos.map(p => (
                      <PhotoItem key={p.id} photo={p} apiBaseUrl={apiBaseUrl} />
                    ))}
                  </View>
                )}
                {b.salles.filter(s => s.photos.length > 0).map(s => (
                  <View key={s.idSalle} style={{ marginLeft: 12, marginTop: 4 }}>
                    <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 1 }}>
                      └ Salle {s.sigleSalle || `#${s.idSalle}`} ({s.photos.length} photo{s.photos.length > 1 ? 's' : ''})
                    </Text>
                    <View style={styles.photoGrid}>
                      {s.photos.map(p => (
                        <PhotoItem key={p.id} photo={p} apiBaseUrl={apiBaseUrl} />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Fiche générée le {today} · InfraDren AMM</Text>
        </View>
      </Page>
    </Document>
  );
}
