import { describe, expect, it } from "vitest";
import { parseArxivFeed } from "./parse";

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:arxiv="http://arxiv.org/schemas/atom"
      xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/">
  <opensearch:totalResults>1</opensearch:totalResults>
  <opensearch:startIndex>0</opensearch:startIndex>
  <opensearch:itemsPerPage>1</opensearch:itemsPerPage>
  <entry>
    <id>http://arxiv.org/abs/1706.03762v5</id>
    <title>Attention Is All You Need</title>
    <summary>We propose a new simple network architecture, the Transformer.</summary>
    <published>2017-06-12T17:57:34Z</published>
    <updated>2023-08-02T00:00:00Z</updated>
    <author><name>Ashish Vaswani</name></author>
    <arxiv:primary_category term="cs.CL"/>
    <category term="cs.CL"/>
    <category term="cs.LG"/>
    <link title="pdf" href="http://arxiv.org/pdf/1706.03762v5" type="application/pdf"/>
  </entry>
</feed>`;

describe("parseArxivFeed", () => {
  it("maps an Atom entry onto ArxivPaper", () => {
    const result = parseArxivFeed(FEED);
    expect(result.total).toBe(1);
    expect(result.papers).toHaveLength(1);
    const paper = result.papers[0];
    expect(paper?.id).toBe("1706.03762");
    expect(paper?.version).toBe("v5");
    expect(paper?.title).toBe("Attention Is All You Need");
    expect(paper?.primaryCategory).toBe("cs.CL");
    expect(paper?.authors[0]?.name).toBe("Ashish Vaswani");
    expect(paper?.pdfUrl).toContain("1706.03762");
  });

  it("returns an empty result for a feed with no entries", () => {
    const result = parseArxivFeed("<feed></feed>");
    expect(result.papers).toEqual([]);
  });
});
