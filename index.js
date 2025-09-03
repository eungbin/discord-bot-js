// dotenv를 사용하여 .env 파일의 환경 변수를 불러옵니다.
import 'dotenv/config';

// discord.js 모듈에서 필요한 클래스를 가져옵니다.
import { Client, GatewayIntentBits, InteractionType, EmbedBuilder } from 'discord.js';

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
client.once('clientReady', () => {
    console.log(`봇이 ${client.user.tag} 이름으로 로그인했습니다!`);
});

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
        const championName = interaction.options.getString('챔피언');

        // 중복일 경우 넘김
        if(fearlessList[line].includes(championName)) {
          await interaction.reply({
            content: `'${championName}' 챔피언은 이미 등록되어 있습니다.`,
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
        const line = interaction.options.getString('라인');
        const championName = interaction.options.getString('챔피언');

        if(!fearlessList[line].includes(championName)) {
          await interaction.reply({
            content: `'${championName}' 챔피언은 등록되어있지 않습니다.`,
            ephemeral: true
          });
        } else {
          fearlessList[line].splice(fearlessList[line].indexOf(championName), 1);
          await interaction.reply({
            content: `'${championName}' 챔피언을 피어리스 목록에서 삭제했습니다.`,
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
      }
  }
});

// 봇 토큰을 사용하여 디스코드에 로그인합니다.
client.login(process.env.DISCORD_TOKEN);