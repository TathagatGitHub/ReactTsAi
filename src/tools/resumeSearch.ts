const endpoint = import.meta.env.VITE_SEARCH_ENDPOINT;
const indexName = import.meta.env.VITE_SEARCH_INDEX;
const queryKey = import.meta.env.VITE_SEARCH_QUERY_KEY;

// Shape of one result we care about
export type SearchHit = {
  score: number;
  fileName: string;
  content: string;
};

// Shape of one raw document returned by Azure
type RawHit = {
  "@search.score": number;
 // metadata_storage_name?: string;
  title?: string;
  content?: string;
};

export async function searchResume(query: string, top = 3): Promise<SearchHit[]> {
  const url = `${endpoint}/indexes/${indexName}/docs/search?api-version=2024-07-01`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": queryKey,
    },
    body: JSON.stringify({
      search: query,              // the words to look for
      searchMode: "any",          // match ANY word (not all)
      queryType: "simple",        // plain keyword search (BM25)
      //select: "metadata_storage_name,content",
      select: "title,content",
      top: top,                   // max results
      count: true,                // also return total match count
    }),
  });

  if (!response.ok) {
    throw new Error(`Search failed ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  console.log("Raw Azure response:", data);
console.log("Field names:", Object.keys(data.value[0] ?? {}));
  return (data.value as RawHit[]).map((d) => ({
    score: d["@search.score"],
   // fileName: d.metadata_storage_name ?? "(no name)",
    fileName: d.title ?? "(no name)",
    content: d.content ?? "",
  }));
}