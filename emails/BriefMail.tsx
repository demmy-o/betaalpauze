import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components"
import type { Brief } from "@/lib/brief"

// De mail aan de schuldeiser: de brief zelf als tekst in de mail, en als PDF in de bijlage.
// Eenvoudig gehouden, zodat hij in elk mailprogramma goed leesbaar is.

const tekst = { fontSize: "15px", lineHeight: "1.55", color: "#1c1b2e", margin: "0 0 14px" }

export function BriefMail({ brief }: { brief: Brief }) {
  return (
    <Html lang="nl">
      <Head />
      <Preview>{brief.onderwerp}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", padding: "24px" }}>
          <Text style={tekst}>{brief.aanhef}</Text>

          {brief.blokken.map((blok, i) =>
            "tekst" in blok ? (
              <Text key={i} style={tekst}>
                {blok.tekst}
              </Text>
            ) : (
              <Section key={i} style={{ margin: "0 0 14px" }}>
                {blok.lijst.map((regel) => (
                  <Text key={regel} style={{ ...tekst, margin: "0 0 2px" }}>
                    • {regel}
                  </Text>
                ))}
              </Section>
            )
          )}

          <Text style={tekst}>{brief.groet}</Text>
          <Text style={tekst}>
            {brief.afzender.map((regel, i) => (
              <span key={regel}>
                {regel}
                {i < brief.afzender.length - 1 && <br />}
              </span>
            ))}
          </Text>

          <Text style={{ ...tekst, color: "#55536b", fontSize: "13px" }}>De brief zit ook als PDF in de bijlage.</Text>

          <Hr style={{ borderColor: "#e3e1ec", margin: "24px 0 12px" }} />
          <Text style={{ fontSize: "12px", lineHeight: "1.5", color: "#55536b", margin: 0 }}>{brief.voetnoot}</Text>
        </Container>
      </Body>
    </Html>
  )
}
