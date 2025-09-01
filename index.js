// dotenv를 사용하여 .env 파일의 환경 변수를 불러옵니다.
import 'dotenv/config';

// discord.js 모듈에서 필요한 클래스를 가져옵니다.
import { Client, GatewayIntentBits, InteractionType } from 'discord.js';

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
const fearlessList = [];

// 메시지가 생성될 때마다 실행됩니다.
client.on('interactionCreate', async (interaction) => {
    // 봇 자신이 보낸 메시지는 무시합니다.
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const { commandName } = interaction;

    if (commandName === '안녕') {
      await interaction.reply('안녕하세요. ' + interaction.user.username + '님!');
    }

    if (interaction.commandName === '피어리스') {
      // 하위 명령어(subcommand)의 이름을 가져옵니다.
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === '추가') {
        const championName = interaction.options.getString('챔피언이름');

        // 중복일 경우 넘김
        if(fearlessList.includes(championName)) {
          await interaction.reply(`'${championName}' 챔피언은 이미 등록되어 있습니다.`);
        } else {
          fearlessList.push(championName);
          await interaction.reply(`'${championName}' 챔피언을 피어리스 목록에 추가했습니다.`);
        }
      } else if (subcommand === '삭제') {
        const championName = interaction.options.getString('챔피언이름');

        if(!fearlessList.includes(championName)) {
          await interaction.reply(`'${championName}' 챔피언은 등록되어있지 않습니다.`);
        } else {
          fearlessList.splice(fearlessList.indexOf(championName), 1);
          await interaction.reply(`'${championName}' 챔피언을 피어리스 목록에서 삭제했습니다.`);
        }
      } else if (subcommand === '확인') {
        if(fearlessList.length === 0) {
          await interaction.reply('추가된 챔피언이 존재하지 않습니다.');
        } else {
          await interaction.reply(fearlessList);
        }
      }
  }
});

// 봇 토큰을 사용하여 디스코드에 로그인합니다.
client.login(process.env.DISCORD_TOKEN);