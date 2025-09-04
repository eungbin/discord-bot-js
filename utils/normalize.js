// 입력 정규화: 소문자화, 트림, 전각/반각 통합, 특수문자 단순화, 유니코드 정규화(NFC)
export const normalizeName = (raw) => {
    if (!raw || typeof raw !== 'string') return '';
    let s = raw.trim();
    // 유니코드 정규화
    s = s.normalize('NFC');
    // 전각 -> 반각
    s = s.replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
    // 따옴표, 점, 공백 등 일반화
    s = s.replace(/[’'`′]/g, "'");
    s = s.replace(/[“”]/g, '"');
    s = s.replace(/[‐‑‒–—―]/g, '-');
    // 공백/구두점은 제거하되 하이픈은 유지
    s = s.replace(/[^0-9a-zA-Z가-힣-]/g, '');
    // 대소문자 통일
    s = s.toLowerCase();
    return s;
};

// 비교용 키 생성(챔피언 사전 인덱싱)
export const toCompareKey = (name) => normalizeName(name).replace(/-/g, '');


