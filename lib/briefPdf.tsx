import "server-only"
import type { Brief } from "./brief"

// De brief als PDF (A4). Zelfde tekst als het voorbeeld op het scherm (lib/brief.ts).
// Lettertype Helvetica zit in elke PDF-lezer en kent €, ë en é.
//
// De PDF-bibliotheek laden we pas als er een PDF gemaakt wordt (dynamische import).
// Zo werkt dit bestand zowel in de app als in lokale scripts (npm run post).
type Pdf = typeof import("@react-pdf/renderer")

const INKT = "#1c1b2e"
const GRIJS = "#55536b"

const stijl = {
  pagina: { paddingTop: 44, paddingBottom: 64, paddingHorizontal: 60, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.45, color: INKT },
  blok: { marginBottom: 10 },
  vet: { fontFamily: "Helvetica-Bold" },
  lijstRegel: { flexDirection: "row", marginBottom: 2 },
  bolletje: { width: 12 },
  testversie: { marginBottom: 16, padding: 8, borderWidth: 1, borderColor: "#8a5a00", backgroundColor: "#fef4e6", fontFamily: "Helvetica-Bold" },
  voetnoot: { position: "absolute", bottom: 32, left: 60, right: 60, fontSize: 8, color: GRIJS, borderTopWidth: 0.5, borderTopColor: "#e3e1ec", paddingTop: 6 },
} as const

function BriefDocument({ brief, pdf, testversie }: { brief: Brief; pdf: Pdf; testversie?: string }) {
  const { Document, Page, Text, View } = pdf
  const laatste = brief.blokken[brief.blokken.length - 1]
  return (
    <Document title={brief.onderwerp} author={brief.naam} language="nl">
      <Page size="A4" style={stijl.pagina}>
        {testversie && <Text style={stijl.testversie}>{testversie}</Text>}

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

// testversie: de regel bovenaan in de bètaversie ("Testversie: deze brief is niet naar ... gestuurd").
export async function maakPdf(brief: Brief, testversie?: string): Promise<Buffer> {
  const pdf = await import("@react-pdf/renderer")
  return pdf.renderToBuffer(<BriefDocument brief={brief} pdf={pdf} testversie={testversie} />)
}
