import AdmZip from "adm-zip";
import * as fs from "fs";
import * as https from "https";
import { MongoClient } from "mongodb";
import * as path from "path";
import * as readline from "readline";

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const OBS_PATH = path.resolve(__dirname, "../../obs.json");
const obsData: { region: string; systems: string[] }[] = JSON.parse(
    fs.readFileSync(OBS_PATH, "utf-8"),
);
const obsSystems = new Set<string>(obsData.flatMap((r) => r.systems));

const MONGO_URL = `mongodb://${process.env.MONGO_HOST}/`;
const MONGO_DB = process.env.MONGO_DBNAME as string;

const SDE_URL =
    "https://developers.eveonline.com/static-data/eve-online-static-data-latest-jsonl.zip";

const TMP_DIR = path.resolve(__dirname, "../../.sde-tmp");
const ZIP_PATH = path.join(TMP_DIR, "sde.zip");

// ── helpers ─────────────────────────────────────────────────────────────────

function log(msg: string) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        log(`Downloading ${url} …`);
        const file = fs.createWriteStream(dest);
        https
            .get(url, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    file.close();
                    fs.unlinkSync(dest);
                    return downloadFile(res.headers.location as string, dest)
                        .then(resolve)
                        .catch(reject);
                }
                if (res.statusCode !== 200) {
                    file.close();
                    fs.unlinkSync(dest);
                    return reject(
                        new Error(`HTTP ${res.statusCode} for ${url}`),
                    );
                }
                const total = parseInt(
                    res.headers["content-length"] ?? "0",
                    10,
                );
                let received = 0;
                let lastPct = -1;
                res.on("data", (chunk: Buffer) => {
                    received += chunk.length;
                    if (total) {
                        const pct = Math.floor((received / total) * 100);
                        if (pct !== lastPct && pct % 10 === 0) {
                            process.stdout.write(`\r  ${pct}% `);
                            lastPct = pct;
                        }
                    }
                });
                res.pipe(file);
                file.on("finish", () => {
                    process.stdout.write("\n");
                    file.close();
                    resolve();
                });
            })
            .on("error", (err) => {
                fs.unlinkSync(dest);
                reject(err);
            });
    });
}

function unzip(zipPath: string, destDir: string): void {
    log(`Extracting ${zipPath} to ${destDir} …`);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(destDir, /* overwrite */ true);
}

async function loadJsonlAsMap(filePath: string): Promise<Map<number, any>> {
    const map = new Map<number, any>();
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const doc = JSON.parse(trimmed);
        map.set(doc._key, doc);
    }
    return map;
}

async function buildCategoryGroupSet(
    categoriesFile: string,
    groupsFile: string,
    categoryID: number,
): Promise<Set<number>> {
    log(`Building group set for categoryID ${categoryID} …`);
    const categories = await loadJsonlAsMap(categoriesFile);
    if (!categories.has(categoryID)) {
        throw new Error(
            `categoryID ${categoryID} not found in ${categoriesFile}`,
        );
    }
    const groups = await loadJsonlAsMap(groupsFile);
    const groupIDs = new Set<number>();
    for (const [key, group] of groups) {
        if (group.categoryID === categoryID) groupIDs.add(key);
    }
    log(`  Found ${groupIDs.size} groups in category ${categoryID}.`);
    return groupIDs;
}

async function processJsonl(
    filePath: string,
    filter: (doc: any) => boolean,
    transform: (doc: any) => any,
    collection: any,
    label: string,
) {
    log(`Importing ${label} from ${filePath} …`);

    if (!fs.existsSync(filePath)) {
        log(`  WARNING: file not found, skipping: ${filePath}`);
        return;
    }

    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
    });

    const BATCH = 500;
    let batch: any[] = [];
    let total = 0;
    let imported = 0;

    for await (const line of rl) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        total++;

        let doc: any;
        try {
            doc = JSON.parse(trimmed);
        } catch {
            log(`  WARN: could not parse line ${total}, skipping`);
            continue;
        }

        if (!filter(doc)) continue;

        batch.push(transform(doc));

        if (batch.length >= BATCH) {
            await collection.insertMany(batch, { ordered: false });
            imported += batch.length;
            batch = [];
        }
    }

    if (batch.length > 0) {
        await collection.insertMany(batch, { ordered: false });
        imported += batch.length;
    }

    log(`  ${label}: parsed ${total} lines, imported ${imported} documents.`);
}

// ── transforms ───────────────────────────────────────────────────────────────

function transformRegion(doc: any): any {
    return {
        ID: doc._key,
        RegionID: doc._key,
        Name: doc.name,
        Description: doc.description,
        FactionID: doc.factionID,
        NebulaID: doc.nebulaID,
        Position: doc.position,
        ConstellationIDs: doc.constellationIDs,
        WormholeClassID: doc.wormholeClassID,
    };
}

function transformConstellation(doc: any): any {
    return {
        ID: doc._key,
        ConstellationID: doc._key,
        Name: doc.name,
        FactionID: doc.factionID,
        Position: doc.position,
        RegionID: doc.regionID,
        SolarSystemIDs: doc.solarSystemIDs,
        WormholeClassID: doc.wormholeClassID,
    };
}

function transformSolarSystem(
    doc: any,
    stargateDestMap: Map<number, number>,
): any {
    const connectedSystems = ((doc.stargateIDs as number[]) ?? [])
        .map((id) => stargateDestMap.get(id))
        .filter((id): id is number => id !== undefined);

    return {
        ID: doc._key,
        SolarSystemID: doc._key,
        Name: doc.name,
        RegionID: doc.regionID,
        ConstellationID: doc.constellationID,
        SecurityStatus: doc.securityStatus,
        SecurityClass: doc.securityClass,
        Position: doc.position,
        Position2D: doc.position2D,
        Luminosity: doc.luminosity,
        Radius: doc.radius,
        StarID: doc.starID,
        StargateIDs: doc.stargateIDs,
        PlanetIDs: doc.planetIDs,
        Border: doc.border,
        Corridor: doc.corridor,
        Fringe: doc.fringe,
        Hub: doc.hub,
        International: doc.international,
        Regional: doc.regional,
        HasObs: obsSystems.has(doc.name?.en ?? doc.name) ?? false,
        ConnectedSystems: connectedSystems,
    };
}

function transformInvType(doc: any): any {
    return {
        ID: doc._key,
        TypeID: doc._key,
        Name: doc.name,
        Description: doc.description,
        GroupID: doc.groupID,
        MarketGroupID: doc.marketGroupID,
        Mass: doc.mass,
        Volume: doc.volume,
        PortionSize: doc.portionSize,
        Published: doc.published,
        Radius: doc.radius,
        GraphicID: doc.graphicID,
        SoundID: doc.soundID,
    };
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
    if (!MONGO_DB) {
        console.error("ERROR: MONGO_DBNAME is not set. Check your .env file.");
        process.exit(1);
    }

    // 1. Download & extract the SDE zip
    ensureDir(TMP_DIR);

    await downloadFile(SDE_URL, ZIP_PATH);
    unzip(ZIP_PATH, TMP_DIR);

    // The zip may place files in a sub-directory; search for the expected files.
    function findFile(name: string): string {
        const candidates = [
            path.join(TMP_DIR, name),
            path.join(TMP_DIR, "sde", name),
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        if (!found) {
            // Recursive walk as fallback
            const walk = (dir: string): string | null => {
                for (const entry of fs.readdirSync(dir, {
                    withFileTypes: true,
                })) {
                    const full = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        const r = walk(full);
                        if (r) return r;
                    } else if (entry.name === name) {
                        return full;
                    }
                }
                return null;
            };
            return walk(TMP_DIR) ?? path.join(TMP_DIR, name);
        }
        return found;
    }

    const files = {
        regions: findFile("mapRegions.jsonl"),
        constellations: findFile("mapConstellations.jsonl"),
        solarSystems: findFile("mapSolarSystems.jsonl"),
        stargates: findFile("mapStargates.jsonl"),
        invTypes: findFile("types.jsonl"),
        categories: findFile("categories.jsonl"),
        groups: findFile("groups.jsonl"),
    };

    log(`Files located:`);
    Object.entries(files).forEach(([k, v]) => log(`  ${k}: ${v}`));

    // 2. Connect to MongoDB
    log(`Connecting to MongoDB at ${MONGO_URL} (db: ${MONGO_DB}) …`);
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(MONGO_DB);

    try {
        // 3. Drop existing collections for a clean import
        for (const col of [
            "regions",
            "constellations",
            "solarsystems",
            "invTypes",
        ]) {
            log(`Dropping collection '${col}' …`);
            await db
                .collection(col)
                .drop()
                .catch(() => {
                    /* ignore if not exists */
                });
        }

        // 4. Import each collection
        await processJsonl(
            files.regions,
            () => true,
            transformRegion,
            db.collection("regions"),
            "Regions",
        );

        await processJsonl(
            files.constellations,
            () => true,
            transformConstellation,
            db.collection("constellations"),
            "Constellations",
        );

        log(`Loading stargates for connected system lookup …`);
        const stargateMap = await loadJsonlAsMap(files.stargates);
        // Build a map from stargateID -> destination solarSystemID
        const stargateDestMap = new Map<number, number>();
        for (const [key, gate] of stargateMap) {
            stargateDestMap.set(key, gate.destination.solarSystemID);
        }

        await processJsonl(
            files.solarSystems,
            () => true,
            (doc) => transformSolarSystem(doc, stargateDestMap),
            db.collection("solarsystems"),
            "Solar Systems",
        );

        const shipGroupIDs = await buildCategoryGroupSet(
            files.categories,
            files.groups,
            6,
        );

        await processJsonl(
            files.invTypes,
            (doc) => shipGroupIDs.has(doc.groupID),
            transformInvType,
            db.collection("invTypes"),
            "Inventory Types",
        );

        log("Import complete.");
    } finally {
        await client.close();

        // 5. Clean up temp files
        log("Cleaning up temporary files …");
        fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
