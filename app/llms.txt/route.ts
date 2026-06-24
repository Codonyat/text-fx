import { CATEGORIES } from "@/lib/effects/taxonomy";
import { EFFECTS } from "@/lib/effects/registry";
import { describe } from "@/lib/effects/descriptions";
import { SITE_URL, SITE_NAME, TAGLINE, DESCRIPTION } from "@/lib/site";

export const dynamic = "force-static";

export function GET(): Response {
  const lines: string[] = [];
  lines.push(`# ${SITE_NAME} — ${TAGLINE}`);
  lines.push("");
  lines.push(`> ${DESCRIPTION}`);
  lines.push("");
  lines.push(
    `${SITE_NAME} is a free, no-signup, browser-based tool. Type any text, shuffle a random ` +
      `pure-CSS text effect, tune it with live controls, then copy the CSS or export HTML, ` +
      `React/JSX, a standalone file, a PNG, or a share link.`,
  );
  lines.push("");
  lines.push(`- Home: ${SITE_URL}/`);
  lines.push(`- All effects: ${SITE_URL}/effects`);
  lines.push("");
  lines.push("## Effects by category");

  for (const c of CATEGORIES) {
    const effs = EFFECTS.filter((e) => e.category === c.id);
    if (!effs.length) continue;
    lines.push("");
    lines.push(`### ${c.name}`);
    lines.push(c.description);
    for (const e of effs) {
      lines.push(`- [${e.name}](${SITE_URL}/effects/${e.id}): ${describe(e)}`);
    }
  }

  lines.push("");
  lines.push("## Exports");
  lines.push("- Copy CSS, copy HTML, copy React/JSX");
  lines.push("- Download a standalone .html file and a .css file");
  lines.push("- Export a PNG image and share via URL");
  lines.push("");

  return new Response(lines.join("\n") + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
