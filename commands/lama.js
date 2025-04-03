import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('lama')
    .setDescription('ラマが挨拶します'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🦙 ラマだよ！')
      .setDescription('フォートナイト40代コミュニティへようこそ！')
      .setColor(0x8e44ad)
      .setImage('https://i.imgur.com/O3DHIA5.png') // 任意のラマ画像に差し替え可能
      .setFooter({ text: 'ラマより', iconURL: interaction.client.user.displayAvatarURL() });
    await interaction.reply({ embeds: [embed] });
  }
};
