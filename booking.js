(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FestaBooking = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function formatDate(value) {
    if (!value) return 'A escolher';
    const [year,month,day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
  function buildMessage(d) {
    const rows = [`Olá, equipa Festa em Festa! Sou ${(d.nome || '').trim() || '[o seu nome]'}.`, 'Gostaria de pedir disponibilidade e informações para:', '', `Ocasião: ${d.tipo}`, `Data: ${formatDate(d.data)}`, `Horário: ${d.horario}`, `Crianças: ${d.criancas} | Adultos: ${d.adultos}`];
    if ((d.idades || '').trim()) rows.push(`Idades das crianças: ${d.idades.trim()}`);
    if ((d.mensagem || '').trim()) rows.push('', d.mensagem.trim());
    rows.push('', 'Podem indicar-me a disponibilidade, os valores e o que está incluído? Obrigado!');
    return rows.join('\n');
  }
  function whatsappURL(d) { return 'https://wa.me/351913393288?text=' + encodeURIComponent(buildMessage(d)); }
  return { formatDate, buildMessage, whatsappURL };
});
