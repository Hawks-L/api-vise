// load.js
const axios = require("axios");
const { faker } = require("@faker-js/faker");
const pLimit = require("p-limit").default; // <- importante
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .option("url", { type: "string", demandOption: true })
  .option("method", { type: "string", default: "GET" })
  .option("rps", { type: "number", default: 10 })
  .option("duration", { type: "number", default: 60 })
  .option("concurrency", { type: "number", default: 20 })
  .option("payload-file", { type: "string", describe: "Ruta a JSON con payload base para POST" })
  .help().argv;

const limit = pLimit(argv.concurrency);

// Lee payload base si existe
let basePayload = null;
if (argv.payloadFile) {
  basePayload = JSON.parse(fs.readFileSync(argv.payloadFile, "utf8"));
}

// Rellena/varía campos con Faker según nombres comunes.
// ADAPTA este mapeo a tu contrato real de /client.
function buildPayload() {
  const cards = ["Classic", "Gold", "Platinum", "Black", "White"];
  return {
    name: faker.person.fullName(),                 // string
    country: faker.location.country(),            // string
    monthlyIncome: faker.number.int({ min: 0, max: 20000 }), // number
    viseClub: faker.datatype.boolean(),           // boolean
    cardType: faker.helpers.arrayElement(cards)   // enum
  };
}


async function oneRequest(i) {
  const start = Date.now();
  try {
    const cfg = {
      timeout: 8000,
      validateStatus: () => true, // no lance excepción por 4xx/5xx
      headers: { "Content-Type": "application/json" },
    };

    let resp;
    if (argv.method.toUpperCase() === "POST") {
      resp = await axios.post(argv.url, buildPayload(), cfg);
    } else {
      const url = new URL(argv.url);
      url.searchParams.set("q", faker.commerce.product());
      resp = await axios.get(url.toString(), cfg);
    }

    const ms = Date.now() - start;
    if (resp.status >= 200 && resp.status < 300) {
      console.log(`[OK] ${resp.status} in ${ms} ms`);
    } else {
      console.log(`[ERR] ${resp.status} in ${ms} ms ->`, JSON.stringify(resp.data));
    }
  } catch (err) {
    const ms = Date.now() - start;
    const code = err.response?.status ?? "ERR";
    console.log(`[ERR] ${code} in ${ms} ms`, err.response?.data || err.message);
  }
}

(async () => {
  console.log(`Start load: ${argv.method} ${argv.url}  rps=${argv.rps}  dur=${argv.duration}s  conc=${argv.concurrency}`);
  const interval = 1000 / argv.rps;
  const endAt = Date.now() + argv.duration * 1000;

  const tick = async () => {
    if (Date.now() > endAt) return;
    limit(() => oneRequest()).catch(() => {});
    setTimeout(tick, interval);
  };
  tick();

  const monitor = setInterval(() => {
    if (Date.now() > endAt && limit.pendingCount === 0) {
      clearInterval(monitor);
      console.log("Load finished.");
      process.exit(0);
    }
  }, 500);
})();
