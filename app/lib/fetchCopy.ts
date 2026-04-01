import { Client } from "@notionhq/client"
import { defaultCopy } from "./defaultCopy"

// Data source ID from the "Betaalpauze Copy" Notion database
const NOTION_DATA_SOURCE_ID = "30629d2f-ecf1-4f10-863a-8329e9b04bd3"

export async function fetchCopy(): Promise<Record<string, string>> {
  // If no Notion token is configured, return defaults
  const token = process.env.NOTION_TOKEN
  if (!token) {
    console.warn("NOTION_TOKEN not set, using default copy")
    return { ...defaultCopy }
  }

  try {
    const notion = new Client({ auth: token })
    const copy = { ...defaultCopy }

    let hasMore = true
    let startCursor: string | undefined

    while (hasMore) {
      const response = await notion.dataSources.query({
        data_source_id: NOTION_DATA_SOURCE_ID,
        start_cursor: startCursor,
      })

      for (const page of response.results) {
        if (!("properties" in page)) continue

        const keyProp = page.properties["key"]
        const valueProp = page.properties["value"]

        if (keyProp?.type !== "title" || valueProp?.type !== "rich_text") continue

        const key = keyProp.title
          .map((t: { plain_text: string }) => t.plain_text)
          .join("")
        const value = valueProp.rich_text
          .map((t: { plain_text: string }) => t.plain_text)
          .join("")

        if (key && value) {
          copy[key] = value
        }
      }

      hasMore = response.has_more
      startCursor = response.next_cursor ?? undefined
    }

    return copy
  } catch (error) {
    console.error("Failed to fetch copy from Notion:", error)
    return { ...defaultCopy }
  }
}
