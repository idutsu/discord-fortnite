import {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} from 'discord.js';
  
export default {
    data: new SlashCommandBuilder().setName('nickname').setDescription('フォートナイトの名前を登録して、ニックネームに追加します'),
    async execute(interaction) {
      const modal = new ModalBuilder()
        .setCustomId('nickname-modal')
        .setTitle('フォートナイトでの名前を入力');
      const input = new TextInputBuilder()
        .setCustomId('fn-name')
        .setLabel('あなたのフォートナイトでの名前は？')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('例: RyuFN40')
        .setRequired(true);
      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);
      await interaction.showModal(modal);
    },
};
  