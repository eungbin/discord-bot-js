import https from 'node:https';
import { normalizeName, toCompareKey } from './normalize.js';

// 간단한 https GET 유틸
const getJSON = (url) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    }).on('error', reject);
});

let cached = {
    version: null,
    byKey: new Map(), // compareKey -> 공식표기(기본: KR)
    officialKR: new Map(), // 공식KR -> 원본이름(표시용)
    officialEN: new Map(),
    lastLoadedAt: 0,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const loadChampionList = async (force = false) => {
    const now = Date.now();
    if (!force && cached.version && now - cached.lastLoadedAt < ONE_DAY_MS) {
        return cached;
    }

    // 최신 버전 조회
    const versions = await getJSON('https://ddragon.leagueoflegends.com/api/versions.json');
    const latest = versions[0];

    // KR/EN 데이터 로드
    const [kr, en] = await Promise.all([
        getJSON(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/ko_KR/champion.json`),
        getJSON(`https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion.json`),
    ]);

    const byKey = new Map();
    const officialKR = new Map();
    const officialEN = new Map();

    // 객체 형태: data: { Ahri: { name: '아리', ... }, ... }
    for (const enKey of Object.keys(en.data)) {
        const enItem = en.data[enKey];
        const krItem = kr.data[enKey];
        if (!enItem || !krItem) continue;

        const nameKR = krItem.name; // 한국어 공식명
        const nameEN = enItem.name; // 영문 공식명

        const keyKR = toCompareKey(nameKR);
        const keyEN = toCompareKey(nameEN);

        // 기본 비교 키 -> KR 공식명 우선
        byKey.set(keyKR, nameKR);
        byKey.set(keyEN, nameKR);

        officialKR.set(toCompareKey(nameKR), nameKR);
        officialEN.set(toCompareKey(nameEN), nameEN);
    }

    cached = {
        version: latest,
        byKey,
        officialKR,
        officialEN,
        lastLoadedAt: now,
    };

    return cached;
};

export const findOfficialByInput = async (input) => {
    const { byKey } = await loadChampionList();
    const key = toCompareKey(input);
    return byKey.get(key) || null;
};

export const listCompareKeys = async () => {
    const { byKey } = await loadChampionList();
    return Array.from(new Set(byKey.keys()));
};


