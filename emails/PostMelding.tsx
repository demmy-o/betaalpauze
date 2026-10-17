import { Body, Container, Head, Html, Preview, Text } from "@react-email/components"

// Melding aan Betaalpauze (NOTIFY_EMAIL): er staat een brief klaar om per post te versturen.
// Bewust zonder PDF: het script maakt de definitieve PDF met de postdatum.

const tekst = { fontSize: "15px", lineHeight: "1.55", color: "#1c1b2e", margin: "0 0 12px" }
const code = { ...tekst, fontFamily: "Menlo, monospace", backgroundColor: "#f3effb", padding: "8px 12px" }

export type PostMeldingGegevens = {
  zaakId: string
  factuurnummer: string
  aan: string[] // naam en adres van het bedrijf, per regel
  van: string // naam en e-mail van de gebruiker
  heeftToelichting: boolean
}

export function PostMelding({ g }: { g: PostMeldingGegevens }) {
  return (
    <Html lang="nl">
      <Head />
      <Preview>{`Brief per post versturen: ${g.factuurnummer}`}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", padding: "24px" }}>
          <Text style={tekst}>Er staat een brief klaar om per post te versturen.</Text>
          <Text style={{ ...tekst, fontWeight: 600, margin: "16px 0 4px" }}>Aan</Text>
          <Text style={tekst}>
            {g.aan.map((regel, i) => (
              <span key={i}>
                {regel}
                {i < g.aan.length - 1 && <br />}
              </span>
            ))}
          </Text>
          <Text style={{ ...tekst, fontWeight: 600, margin: "16px 0 4px" }}>Van</Text>
          <Text style={tekst}>{g.van}</Text>
          <Text style={tekst}>
            Factuur {g.factuurnummer}
            {g.heeftToelichting ? " · met eigen toelichting" : ""}
          </Text>
          <Text style={{ ...tekst, fontWeight: 600, margin: "16px 0 4px" }}>Zo verstuur je hem</Text>
          <Text style={tekst}>
            Draai op de dag dat je de brief op de post doet het script hieronder. Dat maakt de definitieve PDF met de
            postdatum, mailt hem naar jou om te printen, zet de zaak op verstuurd en plant de herinneringen in.
          </Text>
          <Text style={code}>{`npm run post -- ${g.zaakId} JJJJ-MM-DD`}</Text>
          <Text style={{ ...tekst, color: "#55536b", fontSize: "13px" }}>Zaak-id: {g.zaakId}</Text>
        </Container>
      </Body>
    </Html>
  )
}
