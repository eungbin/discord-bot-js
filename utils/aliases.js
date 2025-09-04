import { toCompareKey } from './normalize.js';

// 흔한 별칭/약칭을 공식명으로 매핑(사전 정의: 가독성을 위해 원문 유지)
const RAW_ALIAS_TO_OFFICIAL = {
    // 한국어 별칭 예시
    '이즈': '이즈리얼',
    '말파': '말파이트',
    '애쉬': '애쉬',
    '애시': '애쉬',
    '카이사': '카이사',
    '카사딘': '카사딘',
    '가렌': '가렌',
    '베인': '베인',
    '징크스': '징크스',
    '바루스': '바루스',
    '럭스': '럭스',
    '레오나': '레오나',
    '브라움': '브라움',
    '소나': '소나',
    '소나아': '소나',
    '갱플': '갱플랭크',
    // 영문/로마자 예시
    'ez': '이즈리얼',
    'ezreal': '이즈리얼',
    'malph': '말파이트',
    'malphite': '말파이트',
    'ashe': '애쉬',
    'kaisa': '카이사',
    "kai'sa": '카이사',
    'ka"isa': '카이사',
};

// 정규화된 키로 변환한 맵 생성
const buildNormalizedAliasMap = () => {
    const out = {};
    for (const k of Object.keys(RAW_ALIAS_TO_OFFICIAL)) {
        const normK = toCompareKey(k);
        const official = RAW_ALIAS_TO_OFFICIAL[k];
        out[normK] = official;
    }
    return out;
};

export const ALIAS_TO_OFFICIAL = buildNormalizedAliasMap();

