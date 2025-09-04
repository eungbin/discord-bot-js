// Damerau-Levenshtein(전치 포함) 거리 계산
export const damerauLevenshtein = (a, b) => {
    const lenA = a.length;
    const lenB = b.length;
    if (lenA === 0) return lenB;
    if (lenB === 0) return lenA;

    const dist = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));
    for (let i = 0; i <= lenA; i++) dist[i][0] = i;
    for (let j = 0; j <= lenB; j++) dist[0][j] = j;

    for (let i = 1; i <= lenA; i++) {
        for (let j = 1; j <= lenB; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dist[i][j] = Math.min(
                dist[i - 1][j] + 1,        // 삭제
                dist[i][j - 1] + 1,        // 삽입
                dist[i - 1][j - 1] + cost  // 대체
            );
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                dist[i][j] = Math.min(dist[i][j], dist[i - 2][j - 2] + cost); // 전치
            }
        }
    }
    return dist[lenA][lenB];
};

export const suggestClosest = (inputKey, candidates, limit = 3) => {
    const scored = candidates.map((c) => ({ key: c, d: damerauLevenshtein(inputKey, c) }));
    scored.sort((a, b) => a.d - b.d);
    return scored.slice(0, limit);
};


