import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('match')
    .setDescription('マッチの募集ができるよ'),

  async execute(interaction) {
    const modeSelect = new StringSelectMenuBuilder()
      .setCustomId('match-mode')
      .setPlaceholder('モードを選んでね')
      .addOptions([
        { label: 'バトルロイヤル', value: 'battle' },
        { label: 'ゼロビルド', value: 'zero' },
        { label: 'リロード', value: 'reload' },
        { label: 'クリエイティブ', value: 'creative' },
        { label: '何でもＯＫ', value: 'freemode' },
      ]);

    const teamSelect = new StringSelectMenuBuilder()
      .setCustomId('match-team')
      .setPlaceholder('人数を選んでね')
      .addOptions([
        { label: 'デュオ', value: 'duo' },
        { label: 'トリオ', value: 'trio' },
        { label: 'スクワッド', value: 'squad' },
        { label: '何人でもＯＫ', value: 'freeteam' },
      ]);

    const confirmButton = new ButtonBuilder()
      .setCustomId('match-confirm')
      .setLabel('決定')
      .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(modeSelect);
    const row2 = new ActionRowBuilder().addComponents(teamSelect);
    const row3 = new ActionRowBuilder().addComponents(confirmButton);

    await interaction.reply({
      content: '遊びたいモードと人数を選んでね',
      components: [row1, row2, row3],
      flags: MessageFlags.Ephemeral,
    });
  },
};
