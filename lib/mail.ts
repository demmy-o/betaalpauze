// Mag er een inlogcode naar dit adres?
// - In de bètaversie (MAIL_BETA): elk adres. De code is voor de gebruiker zelf.
// - In testmodus: alleen MAIL_TEST_ADDRESS (of een +variant daarvan).
export function magMailen(email: string) {
  if (process.env.MAIL_BETA === "true") return true
  if (process.env.MAIL_TEST_MODE !== "true") return true

  const test = (process.env.MAIL_TEST_ADDRESS ?? "").toLowerCase()
  const [testNaam, testDomein] = test.split("@")
  const [naam, domein] = email.toLowerCase().split("@")
  return domein === testDomein && naam.split("+")[0] === testNaam
}
