import fetch from 'node-fetch';
import 'dotenv/config';

const API_KEY = process.env.RIOT_API_KEY;
const PLATFORM = process.env.RIOT_PLATFORM || 'kr'; // kr, na1, euw1 ...
const REGIONAL = process.env.RIOT_REGIONAL || 'americas'; // americas, asia, europe

const headers = {
    'X-Riot-Token': API_KEY || '',
    'Content-Type': 'application/json'
};

const platformUrl = (path) => `https://${PLATFORM}.api.riotgames.com${path}`;
const regionalUrl = (path) => `https://${REGIONAL}.api.riotgames.com${path}`;

export const getMatch = async (matchId) => {
    const res = await fetch(regionalUrl(`/lol/match/v5/matches/${encodeURIComponent(matchId)}`), {
        headers
    });
    if (!res.ok) throw new Error(`getMatch failed: ${res.status}`);
    return await res.json();
};

// Summoner-v4: 소환사명으로 기본 정보 조회 → puuid 획득
export const getSummonerByName = async (name) => {
    const res = await fetch(platformUrl(`/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`), {
        headers
    });
    if (!res.ok) throw new Error(`getSummonerByName failed: ${res.status}`);
    return await res.json();
};

// Account-v1: Riot ID (닉네임#태그)로 계정 조회 → puuid 획득
export const getAccountByRiotId = async (gameName, tagLine) => {
    const res = await fetch(regionalUrl(`/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`), {
        headers
    });
    if (!res.ok) throw new Error(`getAccountByRiotId failed: ${res.status}`);
    return await res.json();
};

// Match-v5: puuid로 최근 matchId 목록 조회
export const getMatchIdsByPuuid = async (puuid, count = 1) => {
    const params = new URLSearchParams({ count: String(count) });
    const res = await fetch(regionalUrl(`/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?${params.toString()}`), {
        headers
    });
    if (!res.ok) throw new Error(`getMatchIdsByPuuid failed: ${res.status}`);
    return await res.json();
};


