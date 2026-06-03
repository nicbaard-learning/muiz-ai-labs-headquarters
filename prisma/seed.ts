import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parseMdContent } from "../src/lib/parse-md";

const prisma = new PrismaClient();

function getProjectKey(filename: string): string {
  const match = filename.match(/PROJECT_DETAILS_(\w+)\.md/i);
  return match ? match[1].toLowerCase() : "";
}

const projectConfigs: Record<string, { slug: string; shortName: string }> = {
  tprm: { slug: "tprm", shortName: "TPRM" },
  grc: { slug: "grc", shortName: "GRC" },
  sfr: { slug: "sfr", shortName: "SFR" },
};

async function main() {
  const projectsDir = process.cwd();
  const mdFiles = fs
    .readdirSync(projectsDir)
    .filter((f) => f.startsWith("PROJECT_DETAILS") && f.endsWith(".md"));

  console.log("Seeding database...\n");

  for (const mdFile of mdFiles) {
    const key = getProjectKey(mdFile);
    if (!key || !projectConfigs[key]) {
      console.log(`Skipping unknown file: ${mdFile}`);
      continue;
    }

    const config = projectConfigs[key];
    const filePath = path.join(projectsDir, mdFile);
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = parseMdContent(content);

    const projectData = {
      slug: config.slug,
      shortName: config.shortName,
      name: parsed.name || `Excellenta ${config.shortName}`,
      clientName: "Excellenta Cyber",
      description: parsed.description || "",
      techStack: JSON.stringify(parsed.techStack),
      techDetails: JSON.stringify(parsed.techDetails),
      deploymentNotes: parsed.deploymentNotes,
      runtimeNotes: parsed.runtimeNotes,
      siteUrl: parsed.siteUrl,
      localDir: `D:\\projects\\${mdFile.replace(/\.md$/, "")}`,
      status: config.slug === "grc" ? "Early Development" : "Active",
    };

    await prisma.project.upsert({
      where: { slug: config.slug },
      update: projectData,
      create: projectData,
    });

    console.log(`✅ ${config.shortName}: ${parsed.techStack.length} tech items, ${parsed.deploymentNotes ? "deployment" : "no deployment"}, ${parsed.runtimeNotes ? "runtime" : "no runtime"}`);
  }

  console.log("\n✨ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
