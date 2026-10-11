import { Body, Container, Head, Html, Preview, Text } from "@react-email/components"

// Een kale mail met alleen alinea's. Voor interne mails aan Betaalpauze zelf.
export function EenvoudigeMail({ alineas }: { alineas: string[] }) {
  return (
    <Html lang="nl">
      <Head />
      <Preview>{alineas[0]}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", padding: "24px" }}>
          {alineas.map((alinea, i) => (
            <Text key={i} style={{ fontSize: "15px", lineHeight: "1.55", color: "#1c1b2e", margin: "0 0 12px", whiteSpace: "pre-line" }}>
              {alinea}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  )
}
