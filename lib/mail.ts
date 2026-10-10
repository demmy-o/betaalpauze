// In testmodus gaat er alleen mail naar MAIL_TEST_ADDRESS (of een +variant daarvan).
export function magMailen(email: string) {
  if (process.env.MAIL_TEST_MODE !== "true") return true

  const test = (process.env.MAIL_TEST_ADDRESS ?? "").toLowerCase()
  const [testNaam, testDomein] = test.split("@")
  const [naam, domein] = email.toLowerCase().split("@")
  return domein === testDomein && naam.split("+")[0] === testNaam
}
