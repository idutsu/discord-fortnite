import {Client, GatewayIntentBits, Collection, MessageFlags, EmbedBuilder, AttachmentBuilder} from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { homedir } from 'os';

// ユーザーディレクトリ読み込み
dotenv.config({
  path: path.join(homedir(), '.env'),
});

//ロールデータ読み込み
const USER_ROLE_ID = '1354009062068584488';
const rolesPath    = path.join(process.cwd(), 'roles.json');
const rolesData    = JSON.parse(fs.readFileSync(rolesPath, 'utf-8'));

// 必要なら現在のファイルのパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 画像ファイルのパスを指定
const filePath = path.join(__dirname, 'images', 'match.png');
const file = new AttachmentBuilder(filePath);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// コマンド読み込み
const commandsPath = path.join(process.cwd(), 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = await import(`file://${path.join(commandsPath, file)}`);
    if (command.default?.data && command.default?.execute) {
      client.commands.set(command.default.data.name, command.default);
    }
  }
}

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag}としてログインしました`);
});

// 新規参加者にUSERロール付与
client.on('guildMemberAdd', async (member) => {
  try {
    await member.roles.add(USER_ROLE_ID);
    console.log(`✅ ${member.user.tag} に自動ロールを付与しました`);
  } catch (error) {
    console.error('⚠️ 自動ロール付与に失敗：', error);
  }
});

// 選択内容一時保存用
const matchSelections = new Map();

// インタラクション
client.on('interactionCreate', async (interaction) => {
  // コマンド
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('⚠️ スラッシュコマンド実行時エラー：', error);
      await interaction.reply({ content: '⚠️ コマンド実行中にエラーが発生しました。', flags: MessageFlags.Ephemeral });
    }
  }

  // セレクト
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'match-mode' || interaction.customId === 'match-team') {
      const userId = interaction.user.id;
      const previous = matchSelections.get(userId) || {};
      if (interaction.customId === 'match-mode') {
        previous.mode = interaction.values[0];
      } else if (interaction.customId === 'match-team') {
        previous.team = interaction.values[0];
      }
      matchSelections.set(userId, previous);
      await interaction.deferUpdate();
    }
  }

  // ボタン
  if (interaction.isButton()) {
    const userId = interaction.user.id;
    if (interaction.customId === 'match-confirm') {
      const selections = matchSelections.get(userId);
      if (!selections || !selections.mode || !selections.team) {
        await interaction.reply({ content: '⚠️ モードと人数を両方選択してね。', flags: MessageFlags.Ephemeral });
        return;
      }

      const labelMap = {
        'battle': 'バトルロイヤル',
        'zero': 'ゼロビルド',
        'reload': 'リロード',
        'creative': 'クリエイティブ',
        'freemode':'何でもＯＫ',
        'duo': 'デュオ',
        'trio': 'トリオ',
        'squad': 'スクワッド',
        'freeteam': '何人でもＯＫ'
      };

      const embed = new EmbedBuilder()
        .setTitle('マッチ募集のお知らせだよ！')
        .setDescription(`投稿者：**<@${userId}>**\nモード：**${labelMap[selections.mode]}**\n人数　：**${labelMap[selections.team]}**`)
        .setColor("#6ECFF2")
        .setImage('attachment://match.png');

      await interaction.channel.send({ embeds: [embed], files: [file] });
      await interaction.deferUpdate();
      matchSelections.delete(userId);
    }

    const matchedRole = rolesData.find(role => interaction.customId === `toggle_${role.id}`);
    if (matchedRole) {
      const member = interaction.member;
      if (!member) {
        await interaction.reply({ content: 'メンバー情報が取得できませんでした。', flags: MessageFlags.Ephemeral });
        return;
      }

      const hasRole = member.roles.cache.has(matchedRole.id);

      try {
        if (hasRole) {
          await member.roles.remove(matchedRole.id);
          await interaction.reply({ content: `🔻 ${matchedRole.name} ロールを外しました！`, flags: MessageFlags.Ephemeral });
        } else {
          await member.roles.add(matchedRole.id);
          await interaction.reply({ content: `🔺 ${matchedRole.name} ロールを付与しました！`, flags: MessageFlags.Ephemeral });
        }
      } catch (error) {
        console.error('⚠️ ロール操作に失敗：', error);
        await interaction.reply({ content: '⚠️ ロールの操作中にエラーが発生しました', flags: MessageFlags.Ephemeral });
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);