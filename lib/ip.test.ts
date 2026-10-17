import { describe, expect, it } from "vitest"
import { hashIp, ipVoorLimiet, leesIp } from "./ip"

const kop = (waarden: Record<string, string>) => ({ get: (naam: string) => waarden[naam] ?? null })

describe("IP-adres lezen", () => {
  it("gebruikt eerst het adres dat Netlify doorgeeft", () => {
    expect(leesIp(kop({ "x-nf-client-connection-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe(
      "203.0.113.7"
    )
  })

  it("valt terug op het eerste adres in x-forwarded-for", () => {
    expect(leesIp(kop({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" }))).toBe("198.51.100.1")
  })

  it("geeft 'onbekend' als er niets is", () => {
    expect(leesIp(kop({}))).toBe("onbekend")
    expect(leesIp(kop({ "x-nf-client-connection-ip": "  " }))).toBe("onbekend")
  })
})

describe("IP-adres hashen", () => {
  it("geeft voor hetzelfde adres en zout steeds dezelfde hash", () => {
    expect(hashIp("203.0.113.7", "zout-a")).toBe(hashIp("203.0.113.7", "zout-a"))
  })

  it("geeft met een ander zout een andere hash", () => {
    expect(hashIp("203.0.113.7", "zout-a")).not.toBe(hashIp("203.0.113.7", "zout-b"))
  })

  it("bevat het IP-adres zelf niet", () => {
    const hash = hashIp("203.0.113.7", "zout-a")
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).not.toContain("203.0.113.7")
  })

  it("weigert te hashen zonder zout", () => {
    expect(() => hashIp("203.0.113.7", "")).toThrow()
  })
})

describe("welk adres telt voor de limiet", () => {
  it("laat een IPv4-adres zoals het is", () => {
    expect(ipVoorLimiet("203.0.113.7")).toBe("203.0.113.7")
    expect(ipVoorLimiet(" 203.0.113.7 ")).toBe("203.0.113.7")
  })

  it("telt bij IPv6 alleen het /64-netwerk, zodat wisselende privacy-adressen als één tellen", () => {
    const a = ipVoorLimiet("2a02:a46f:1b2c:3d00:85f1:22aa:9c1e:4f10")
    const b = ipVoorLimiet("2a02:a46f:1b2c:3d00:1d4e:b7c3:0a21:66de")
    expect(a).toBe("2a02:a46f:1b2c:3d00::/64")
    expect(b).toBe(a)
  })

  it("houdt verschillende IPv6-netwerken apart", () => {
    expect(ipVoorLimiet("2a02:a46f:1b2c:3d01::1")).not.toBe(ipVoorLimiet("2a02:a46f:1b2c:3d00::1"))
  })

  it("schrijft verkorte en volledige IPv6-adressen hetzelfde", () => {
    const kort = ipVoorLimiet("2001:db8::1")
    expect(kort).toBe("2001:db8:0:0::/64")
    expect(ipVoorLimiet("2001:0DB8:0000:0000:0000:0000:0000:0002")).toBe(kort)
    expect(ipVoorLimiet("::1")).toBe("0:0:0:0::/64")
    expect(ipVoorLimiet("fe80::1%eth0")).toBe("fe80:0:0:0::/64")
  })

  it("telt een IPv4-adres in IPv6-vorm als dat IPv4-adres", () => {
    expect(ipVoorLimiet("::ffff:203.0.113.7")).toBe("203.0.113.7")
  })

  it("laat iets dat geen IP-adres is ongemoeid", () => {
    expect(ipVoorLimiet("onbekend")).toBe("onbekend")
  })
})
