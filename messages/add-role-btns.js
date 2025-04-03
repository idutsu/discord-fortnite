import {Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder,} from 'discord.js';
import dotenv from 'dotenv';
import { homedir } from 'os';
import path from 'path';
import fs from 'fs';

dotenv.config({
  path: path.join(homedir(), '.env'),
});

const CHANNEL_ID = '1353643816598372433';
const rolesPath = path.join(process.cwd(), 'roles.json');
const rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf-8'));

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} としてログインしました`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    const gameRoles = rolesData.filter(role => role.type === 'game');
    const timeRoles = rolesData.filter(role => role.type === 'time');

    const gameRow = new ActionRowBuilder().addComponents(
      ...gameRoles.map(role =>
        new ButtonBuilder()
          .setCustomId(`toggle_${role.id}`)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Primary)
      )
    );

    const timeRow = new ActionRowBuilder().addComponents(
      ...timeRoles.map(role =>
        new ButtonBuilder()
          .setCustomId(`toggle_${role.id}`)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    await channel.send({
      content: 'よくプレイするモードと時間帯を選んでください！\nボタンを押すとロールが付きます。\nロールを外したい場合はもう一度ボタンを押してください。',
      components: [gameRow, timeRow],
    });

    console.log('✅ ロール選択メッセージを送信しました');
  } catch (err) {
    console.error('⚠️ メッセージ送信に失敗：', err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);
  