// dotenv를 사용하여 .env 파일의 환경 변수를 불러옵니다.
import 'dotenv/config';

// discord.js 모듈에서 필요한 클래스를 가져옵니다.
import { Client, GatewayIntentBits, InteractionType, EmbedBuilder } from 'discord.js';
import { validateChampionName } from './utils/validateChampion.js';
import { loadChampionList } from './utils/champions.js';

// 봇 클라이언트를 생성합니다.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// 봇이 준비되면 한 번만 실행됩니다.
client.once('clientReady', async () => {
    console.log(`봇이 ${client.user.tag} 이름으로 로그인했습니다!`);
    try {
        await loadChampionList(true);
        console.log('챔피언 데이터 로드 완료.');
    } catch (e) {
        console.error('챔피언 데이터 로드 실패:', e);
    }
});

// 주기적 갱신(하루 1회)
setInterval(() => {
    loadChampionList(true).catch(() => {});
}, 24 * 60 * 60 * 1000);

// 봇이 종료될 때 실행됩니다.
process.on('SIGINT', () => {
    console.log('\n봇을 종료합니다...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n봇을 종료합니다...');
    client.destroy();
    process.exit(0);
});

// 피어리스 챔피언 목록
const fearlessList = {
  top: [],
  jungle: [],
  mid: [],
  ad: [],
  support: []
};

// 라인 한글 표기 맵핑
const lineDisplayNames = {
  top: '탑',
  jungle: '정글',
  mid: '미드',
  ad: '원딜',
  support: '서폿'
};

// 임베드 생성 공용 함수 (중복 제거)
const embedConfigs = [
    { key: 'top', title: '탑', color: 0xE74C3C },
    { key: 'jungle', title: '정글', color: 0x27AE60 },
    { key: 'mid', title: '미드', color: 0x2980B9 },
    { key: 'ad', title: '원딜', color: 0xF1C40F },
    { key: 'support', title: '서폿', color: 0x1ABC9C },
];

const buildFearlessEmbeds = (list) => {
    return embedConfigs.map(({ key, title, color }) =>
        new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(list[key].length ? list[key].join(', ') : '없음')
    );
}

// 메시지가 생성될 때마다 실행됩니다.
client.on('interactionCreate', async (interaction) => {
    // 봇 자신이 보낸 메시지는 무시합니다.
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const { commandName } = interaction;

    if (commandName === '안녕') {
      await interaction.reply({
        content: '안녕하세요. ' + interaction.user.username + '님!',
        ephemeral: true
      });
    }

    if (interaction.commandName === '피어리스') {
      // 하위 명령어(subcommand)의 이름을 가져옵니다.
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === '추가') {
        const line = interaction.options.getString('라인');
        const championInput = interaction.options.getString('챔피언');

        const validation = await validateChampionName(championInput);
        if (!validation.ok) {
          const suggestions = validation.suggestions && validation.suggestions.length
            ? `\n혹시 다음 중 하나를 의미하셨나요? ${validation.suggestions.map(s => s.name).join(', ')}`
            : '';
          await interaction.reply({
            content: `'${championInput}' 은(는) 유효한 챔피언이 아닙니다.${suggestions}`,
            ephemeral: true
          });
          return;
        }
        const championName = validation.officialKR;

        // 모든 라인에서 중복 확인
        const existingLine = Object.keys(fearlessList).find(key => fearlessList[key].includes(championName));

        if (existingLine) {
          await interaction.reply({
            content: `'${championName}' 챔피언은 이미 ${lineDisplayNames[existingLine]} 라인에 등록되어 있습니다.`,
            ephemeral: true
          });
        } else {
          fearlessList[line].push(championName);
          await interaction.reply({
            content: `'${championName}' 챔피언을 피어리스 목록에 추가했습니다.`,
            ephemeral: true
          });
        }
      } else if (subcommand === '삭제') {
        const championInput = interaction.options.getString('챔피언');
        const validation = await validateChampionName(championInput);
        if (!validation.ok) {
          const suggestions = validation.suggestions && validation.suggestions.length
            ? `\n혹시 다음 중 하나를 의미하셨나요? ${validation.suggestions.map(s => s.name).join(', ')}`
            : '';
          await interaction.reply({
            content: `'${championInput}' 은(는) 유효한 챔피언이 아닙니다.${suggestions}`,
            ephemeral: true
          });
          return;
        }
        const championName = validation.officialKR;

        // 모든 라인에서 챔피언 존재 여부 확인 후 삭제
        const existingLine = Object.keys(fearlessList).find(key => fearlessList[key].includes(championName));

        if (!existingLine) {
          await interaction.reply({
            content: `'${championName}' 챔피언은 등록되어있지 않습니다.`,
            ephemeral: true
          });
        } else {
          fearlessList[existingLine].splice(fearlessList[existingLine].indexOf(championName), 1);
          await interaction.reply({
            content: `'${championName}' 챔피언을 피어리스 목록(${lineDisplayNames[existingLine]})에서 삭제했습니다.`,
            ephemeral: true
          });
        }
      } else if (subcommand === '확인') {
        const embeds = buildFearlessEmbeds(fearlessList);
        await interaction.reply({
          embeds,
          ephemeral: true
        });
      } else if (subcommand === '공지') {
        const embeds = buildFearlessEmbeds(fearlessList);
        await interaction.reply({
          embeds,
        });
      } else if (subcommand === '초기화') {
        // fearlessList의 모든 라인을 빈 배열로 초기화
        fearlessList.top = [];
        fearlessList.jungle = [];
        fearlessList.mid = [];
        fearlessList.ad = [];
        fearlessList.support = [];
        
        await interaction.reply({
          content: '피어리스 목록이 초기화되었습니다.',
          ephemeral: true
        });
      } else if (subcommand === '검색') {
        const championInput = interaction.options.getString('챔피언');
        const validation = await validateChampionName(championInput);
        if (!validation.ok) {
          const suggestions = validation.suggestions && validation.suggestions.length
            ? `\n혹시 다음 중 하나를 의미하셨나요? ${validation.suggestions.map(s => s.name).join(', ')}`
            : '';
          await interaction.reply({
            content: `'${championInput}' 은(는) 유효한 챔피언이 아닙니다.${suggestions}`,
            ephemeral: true
          });
          return;
        }
        const championName = validation.officialKR;
        const existingLine = Object.keys(fearlessList).find(key => fearlessList[key].includes(championName));

        if (existingLine) {
          await interaction.reply({
            content: `'${championName}' 챔피언은 ${lineDisplayNames[existingLine]} 라인에 등록되어 있습니다.`,
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: `'${championName}' 챔피언은 등록되어 있지 않습니다.`,
            ephemeral: true
          });
        }
      }
  }
});

// 봇 토큰을 사용하여 디스코드에 로그인합니다.
client.login(process.env.DISCORD_TOKEN);