import { Body, Button, Container, Head, Hr, Html, Preview, Text } from "@react-email/components"
import type { HerinneringTekst } from "@/lib/herinneringTeksten"

// De herinneringsmail aan de gebruiker. De tekst komt uit lib/herinneringTeksten.ts.

const tekst = { fontSize: "16px", lineHeight: "1.6", color: "#1c1b2e", margin: "0 0 16px" }

export function HerinneringMail({ inhoud }: { inhoud: HerinneringTekst }) {
  return (
    <Html lang="nl">
      <Head />
      <Preview>{inhoud.alineas[1]}</Preview>
      <Body style={{ backgroundColor: "#fbfafc", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "560px", padding: "32px 24px", backgroundColor: "#ffffff" }}>
          {inhoud.alineas.map((alinea) => (
            <Text key={alinea} style={tekst}>
              {alinea}
            </Text>
          ))}

          <Button
            href={inhoud.knop.url}
            style={{
              backgroundColor: "#1c1b2e",
              color: "#ffffff",
              borderRadius: "999px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-block",
              margin: "8px 0 24px",
            }}
          >
            {inhoud.knop.tekst}
          </Button>

          <Hr style={{ borderColor: "#e3e1ec", margin: "8px 0 16px" }} />
          <Text style={{ fontSize: "13px", lineHeight: "1.5", color: "#55536b", margin: 0 }}>
            Je krijgt deze mail omdat je via Betaalpauze.nl een betaalvoorstel hebt gestuurd. Betaalpauze.nl int geen
            geld. Je betaalt altijd zelf, via je eigen bank.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
