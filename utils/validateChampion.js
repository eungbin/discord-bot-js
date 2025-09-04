import { toCompareKey } from './normalize.js';
import { ALIAS_TO_OFFICIAL } from './aliases.js';
import { findOfficialByInput, listCompareKeys } from './champions.js';
import { suggestClosest } from './fuzzy.js';

// 입력을 받아 공식 한국어 챔피언명 또는 제안 리스트를 반환
// 반환 형태: { ok: true, officialKR } | { ok: false, suggestions: [{name, distance}] }
export const validateChampionName = async (input) => {
    const official = await findOfficialByInput(input);
    if (official) {
        return { ok: true, officialKR: official };
    }

    // 별칭 매핑 시도
    const aliasKey = toCompareKey(input);
    const aliasOfficial = ALIAS_TO_OFFICIAL[aliasKey];
    if (aliasOfficial) {
        const mappedOfficial = await findOfficialByInput(aliasOfficial);
        if (mappedOfficial) return { ok: true, officialKR: mappedOfficial };
    }

    // 퍼지 제안
    const keys = await listCompareKeys();
    const suggestions = suggestClosest(aliasKey, keys, 3)
        .map(({ key, d }) => ({ key, d }))
        .filter(s => s.d <= Math.max(1, Math.floor(aliasKey.length / 4))); // 길이 기반 임계값

    if (!suggestions.length) return { ok: false, suggestions: [] };

    // 키 -> 공식 KR 이름으로 매핑
    const nameMap = new Map();
    for (const k of keys) {
        // 간단 매핑: findOfficialByInput는 입력에서 키를 다시 계산하므로 바로 사용 불가
        // champions.byKey를 노출하는 대신, findOfficialByInput를 한번 더 호출
        // 성능 문제 없도록 최대 3개만 호출
    }

    const resolved = await Promise.all(
        suggestions.map(async (s) => ({ name: (await findOfficialByInput(s.key)) || s.key, distance: s.d }))
    );

    return { ok: false, suggestions: resolved };
};


