import "server-only"
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import type { Brief } from "./brief"

// De brief als PDF (A4). Zelfde tekst als het voorbeeld op het scherm (lib/brief.ts).
// Lettertype Helvetica zit in elke PDF-lezer en kent €, ë en é.

const INKT = "#1c1b2e"
const GRIJS = "#55536b"

const stijl = StyleSheet.create({
  pagina: { paddingTop: 44, paddingBottom: 64, paddingHorizontal: 60, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.45, color: INKT },
  blok: { marginBottom: 10 },
  vet: { fontFamily: "Helvetica-Bold" },
  lijstRegel: { flexDirection: "row", marginBottom: 2 },
  bolletje: { width: 12 },
  voetnoot: { position: "absolute", bottom: 32, left: 60, right: 60, fontSize: 8, color: GRIJS, borderTopWidth: 0.5, borderTopColor: "#e3e1ec", paddingTop: 6 },
})

function BriefDocument({ brief }: { brief: Brief }) {
  const laatste = brief.blokken[brief.blokken.length - 1]
  return (
    <Document title={brief.onderwerp} author={brief.naam} language="nl">
      <Page size="A4" style={stijl.pagina}>
        <View style={stijl.blok}>
          {brief.afzender.map((regel) => (
            <Text key={regel}>{regel}</Text>
          ))}
        </View>

        <View style={[stijl.blok, { marginTop: 8 }]}>
          {brief.ontvanger.map((regel) => (
            <Text key={regel}>{regel}</Text>
          ))}
        </View>

        <Text style={[stijl.blok, { marginTop: 8 }]}>{brief.plaatsEnDatum}</Text>
        <Text style={[stijl.blok, stijl.vet]}>Onderwerp: {brief.onderwerp}</Text>
        <Text style={stijl.blok}>{brief.aanhef}</Text>

        {brief.blokken.slice(0, -1).map((blok, i) =>
          "tekst" in blok ? (
            <Text key={i} style={stijl.blok}>
              {blok.tekst}
            </Text>
          ) : (
            <View key={i} style={stijl.blok}>
              {blok.lijst.map((regel) => (
                <View key={regel} style={stijl.lijstRegel}>
                  <Text style={stijl.bolletje}>•</Text>
                  <Text>{regel}</Text>
                </View>
              ))}
            </View>
          )
        )}

        {/* Laatste alinea en de groet blijven op dezelfde pagina. */}
        <View wrap={false}>
          {laatste && "tekst" in laatste && <Text style={stijl.blok}>{laatste.tekst}</Text>}
          <Text style={{ marginBottom: 24 }}>{brief.groet}</Text>
          <Text>{brief.naam}</Text>
        </View>

        <Text style={stijl.voetnoot} fixed>
          {brief.voetnoot}
        </Text>
      </Page>
    </Document>
  )
}

export function maakPdf(brief: Brief): Promise<Buffer> {
  return renderToBuffer(<BriefDocument brief={brief} />)
}
