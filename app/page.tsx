import { Studio } from "@/components/Studio";
import { SeoFooter, FAQ } from "@/components/SeoFooter";
import { serializeJsonLd, graph, faqLd } from "@/lib/jsonld";

export default function Page() {
  return (
    <>
      <Studio />
      <SeoFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph(faqLd(FAQ))) }}
      />
    </>
  );
}
