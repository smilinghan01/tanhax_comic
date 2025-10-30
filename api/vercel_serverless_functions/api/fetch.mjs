import { parse } from "url";

const SUB_URLS = {
    file: "https://raw.githubusercontent.com/txperl/airAnime/master/api/_examples/data/{kt}",
    agefans: "https://www.agefans.la/search?query={kt}",
    mikanani: "https://mikanani.me/Home/Search?searchstr={kt}",
    koxmoe: "https://airanime-koxmoe-fetch.txperl.workers.dev/?keyword={kt}",
    dmzj: "https://sacg.dmzj.com/comicsum/search.php?s={kt}",
    gugufan: "https://www.gugu3.com/index.php/vod/search.html?wd={kt}",
};

export default async function handler(req, res) {
    const paths = parse(req.url).pathname.split("/").slice(2);

    if (paths.length <= 1)
        return res.json(SUB_URLS);

    const subName = paths[0];
    const kt = paths.slice(1).join("");

    if (!SUB_URLS[subName] || !kt)
        return res.status(400) && res.send("missing subname or keyword");

    const finalUrl = SUB_URLS[subName].replace("{kt}", kt);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const response = await fetch(finalUrl, {
        headers: {
            "Referer": finalUrl,
            "User-Agent": "Vercel Serverless Functions",
            "platform": "1",
        }
    });

    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Vary", "Origin");
    if (response.headers.get("content-type").includes("json")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
    } else {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
    }
    return res.send(await response.text());
}
