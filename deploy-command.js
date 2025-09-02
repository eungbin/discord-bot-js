import { SlashCommandBuilder, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import 'dotenv/config';

// 등록할 명령어들을 배열에 추가
const commands = [
  new SlashCommandBuilder()
      .setName('안녕') // 명령어 이름은 소문자
      .setDescription('봇에게 인사합니다.'),
  
  new SlashCommandBuilder()
      .setName('피어리스')
      .setDescription('피어리스 관련 명령어')
      .addSubcommand(subcommand =>
        subcommand
          .setName('추가')
          .setDescription('피어리스 목록에 챔피언을 추가합니다. 입력 예시) /피어리스 추가 탑,가렌')
          .addStringOption(option =>
              option.setName('라인')
                  .setDescription('추가할 챔피언의 라인을 지정해주세요. (탑, 정글, 미드, 원딜, 서폿)')
                  .setRequired(true)
                  .addChoices(
                    { name: '탑', value: 'top' },
                    { name: '정글', value: 'jungle' },
                    { name: '미드', value: 'mid' },
                    { name: '원딜', value: 'ad' },
                    { name: '서폿', value: 'support' }
                  )
          )
          .addStringOption(option => 
              option.setName('챔피언')
                  .setDescription('추가할 챔피언의 이름을 입력해주세요.')
                  .setRequired(true)
          )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('삭제')
          .setDescription('피어리스 목록에서 챔피언을 삭제합니다.')
          .addStringOption(option =>
            option.setName('라인')
                .setDescription('삭제할 챔피언의 라인을 지정해주세요. (탑, 정글, 미드, 원딜, 서폿)')
                .setRequired(true)
                .addChoices(
                  { name: '탑', value: 'top' },
                    { name: '정글', value: 'jungle' },
                    { name: '미드', value: 'mid' },
                    { name: '원딜', value: 'ad' },
                    { name: '서폿', value: 'support' }
                )
        )
        .addStringOption(option => 
            option.setName('챔피언')
                .setDescription('삭제할 챔피언의 이름을 입력해주세요.')
                .setRequired(true)
        )
      )
      .addSubcommand(subcommand =>
        subcommand
          .setName('확인')
          .setDescription('피어리스 챔피언 목록을 확인합니다.')
      ),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// 명령어 등록 실행
(async () => {
  try {
      console.log('(/) 명령어 등록을 시작합니다.');
      
      // 기존 명령어 삭제
      console.log('기존 명령어를 삭제합니다...');
      await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: [] },
      );
      
      // 새 명령어 등록
      console.log('새 명령어를 등록합니다...');
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID), // 전역 서버에 등록
          { body: commands },
      );
      console.log('(/) 명령어 등록이 성공적으로 완료되었습니다!');
  } catch (error) {
      console.error(error);
  }
})();