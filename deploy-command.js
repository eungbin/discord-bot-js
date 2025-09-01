import { SlashCommandBuilder, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import 'dotenv/config';

// 등록할 명령어들을 배열에 추가
const commands = [
  new SlashCommandBuilder()
      .setName('안녕') // 명령어 이름은 소문자
      .setDescription('봇에게 인사합니다.'),
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