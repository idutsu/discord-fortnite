import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { homedir } from 'os';

dotenv.config({ path: path.join(homedir(), '.env') });

const commands = [];
const commandsPath = path.join(process.cwd(), 'commands');

const walk = async (dir) => {
  for (const file of readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) await walk(filePath);
    if (file.name.endsWith('.js')) {
      const command = (await import(`file://${filePath}`)).default;
      if (command?.data) {
        commands.push(command.data.toJSON());
      }
    }
  }
};

await walk(commandsPath);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('💡 ギルド限定スラッシュコマンドを登録中...');
  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_SERVER_ID),
    { body: commands }
  );
  console.log('✅ ギルド限定スラッシュコマンドを登録しました！');
} catch (err) {
  console.error('⚠️ 登録に失敗しました:', err);
}