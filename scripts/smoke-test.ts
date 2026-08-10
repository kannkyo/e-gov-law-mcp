import { fetchJson } from "../src/client.js";

async function main() {
  console.log("=== search_laws (民法) ===");
  const laws = await fetchJson("/laws", { law_title: "民法", limit: 3 });
  console.log(JSON.stringify(laws, null, 2));

  console.log("=== search_keyword (個人情報) ===");
  const keywordResult = await fetchJson("/keyword", { keyword: "個人情報", limit: 3 });
  console.log(JSON.stringify(keywordResult, null, 2));
}

main().catch((err) => {
  console.error("smoke test failed:", err);
  process.exitCode = 1;
});
