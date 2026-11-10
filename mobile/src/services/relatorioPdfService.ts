import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { DoacaoRecenteItem, ModoFiltro, MONTH_NAMES_FULL } from '../viewmodel/useDoacoesViewModel';
import { LOGO_CONECTACAO_BASE64 } from './logoBase64';

export type GerarRelatorioPdfParams = {
  user?: {
    nome?: string;
    email?: string;
  } | null;
  modoFiltro: ModoFiltro;
  anoSelecionado: number;
  mesSelecionado: number;
  kpis: {
    totalPeriodo: number;
    mediaPorDoacao: number;
    maiorDoacao: number;
    qtdDoacoesPeriodo: number;
  };
  valorTotalGeral: number;
  ongsApoiadasCount: number;
  doacoes: DoacaoRecenteItem[];
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function obterTituloPeriodo(modoFiltro: ModoFiltro, anoSelecionado: number, mesSelecionado: number): {
  tipo: string;
  descricao: string;
  rotuloBotao: string;
  nomeArquivo: string;
} {
  const mesNome = MONTH_NAMES_FULL[mesSelecionado] || 'Mês';

  if (modoFiltro === 'anos') {
    return {
      tipo: 'Relatório Anual',
      descricao: `Consolidado de Doações — Exercício de ${anoSelecionado}`,
      rotuloBotao: 'Baixar Relatório Anual',
      nomeArquivo: `Relatorio_Anual_ConectAcao_${anoSelecionado}.pdf`,
    };
  }

  if (modoFiltro === 'meses') {
    return {
      tipo: 'Relatório Mensal',
      descricao: `Extrato Detalhado de Doações — ${mesNome} de ${anoSelecionado}`,
      rotuloBotao: 'Baixar Relatório Mensal',
      nomeArquivo: `Relatorio_Mensal_ConectAcao_${mesNome}_${anoSelecionado}.pdf`,
    };
  }

  return {
    tipo: 'Relatório Semanal',
    descricao: `Acompanhamento Semanal de Doações — ${mesNome} de ${anoSelecionado}`,
    rotuloBotao: 'Baixar Relatório Semanal',
    nomeArquivo: `Relatorio_Semanal_ConectAcao_${mesNome}_${anoSelecionado}.pdf`,
  };
}

export function gerarHtmlRelatorio({
  user,
  modoFiltro,
  anoSelecionado,
  mesSelecionado,
  kpis,
  valorTotalGeral,
  ongsApoiadasCount,
  doacoes,
}: GerarRelatorioPdfParams): string {
  const agora = new Date();
  const dataEmissaoFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const horaEmissaoFormatada = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const protocolo = `CA-${agora.getFullYear()}${(agora.getMonth() + 1).toString().padStart(2, '0')}${agora.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { tipo, descricao } = obterTituloPeriodo(modoFiltro, anoSelecionado, mesSelecionado);
  const nomeUsuario = user?.nome || 'Doador Solidário';
  const emailUsuario = user?.email || 'contato@conectacao.org';

  // Filtra as doações relevantes para o período selecionado
  const doacoesFiltradas = doacoes.filter((d) => {
    if (!d.dataOriginal) return false;
    const dt = new Date(d.dataOriginal);
    if (isNaN(dt.getTime())) return false;

    if (modoFiltro === 'anos') {
      return dt.getFullYear() === anoSelecionado;
    }
    if (modoFiltro === 'meses' || modoFiltro === 'semanas') {
      return dt.getFullYear() === anoSelecionado && dt.getMonth() === mesSelecionado;
    }
    return true;
  });

  // Se não houver doações exatamente no período filtrado, utiliza a lista geral com aviso
  const listaParaExibir = doacoesFiltradas.length > 0 ? doacoesFiltradas : doacoes;
  const isPeriodoSemRegistros = doacoesFiltradas.length === 0 && doacoes.length > 0;

  const totalTabela = listaParaExibir.reduce((acc, curr) => acc + curr.valor, 0);

  // Linhas da tabela de doações
  const linhasHtml = listaParaExibir.length > 0
    ? listaParaExibir
        .map((item, index) => {
          const isPar = index % 2 === 1;
          const bgLinha = isPar ? '#F8FAFC' : '#FFFFFF';

          const isConcluida = item.statusColor === 'concluida';
          const isPendente = item.statusColor === 'pendente';

          const badgeBg = isConcluida ? '#E6F8F6' : isPendente ? '#FFF7ED' : '#FEF2F2';
          const badgeColor = isConcluida ? '#006A60' : isPendente ? '#FB6407' : '#DC2626';

          return `
            <tr style="background-color: ${bgLinha};">
              <td style="padding: 10px 14px; font-size: 11px; color: #64748B; font-weight: 600;">#${item.id}</td>
              <td style="padding: 10px 14px; font-size: 12px; color: #0F172A; font-weight: 500;">${item.dataFormatada}</td>
              <td style="padding: 10px 14px; font-size: 12px; color: #0F172A; font-weight: 600;">${item.titulo}</td>
              <td style="padding: 10px 14px; font-size: 11px; color: #334155;">${item.ongNome || 'Organização Social'}</td>
              <td style="padding: 10px 14px; text-align: center;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 999px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">
                  ${item.statusLabel}
                </span>
              </td>
              <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #05BCAA; text-align: right;">
                ${item.valorFormatado}
              </td>
            </tr>
          `;
        })
        .join('')
    : `
      <tr>
        <td colspan="6" style="padding: 28px; text-align: center; color: #64748B; font-size: 13px;">
          Nenhuma doação registrada até o momento no período selecionado.
        </td>
      </tr>
    `;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${tipo} — ConectAção</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 14mm 16mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FFFFFF;
      color: #0F172A;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.45;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 2px solid #E2E8F0;
      position: relative;
    }
    .header-bar::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 140px;
      height: 2px;
      background: linear-gradient(90deg, #05BCAA, #0AAEEE);
    }
    .brand-col {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      height: 52px;
      width: auto;
      object-fit: contain;
    }
    .brand-tagline {
      font-size: 10px;
      font-weight: 600;
      color: #64748B;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      background: #013978;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .doc-date {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
    }
    .doc-protocol {
      font-size: 10px;
      color: #94A3B8;
      font-family: monospace;
      margin-top: 2px;
    }

    /* Título & Período */
    .title-section {
      margin-top: 18px;
      margin-bottom: 18px;
    }
    .main-title {
      font-size: 20px;
      font-weight: 800;
      color: #013978;
      margin: 0 0 4px 0;
      letter-spacing: -0.4px;
    }
    .sub-title {
      font-size: 12px;
      color: #64748B;
      margin: 0;
    }

    /* Cards do Doador */
    .donor-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .donor-info h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
    }
    .donor-info p {
      margin: 0;
      font-size: 11px;
      color: #64748B;
    }
    .donor-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #B45309;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
    }

    /* Grid de Métricas / KPIs */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .kpi-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #CBD5E1;
    }
    .kpi-card.highlight::before {
      background: #05BCAA;
    }
    .kpi-card.blue::before {
      background: #013978;
    }
    .kpi-card.cyan::before {
      background: #0AAEEE;
    }
    .kpi-card.orange::before {
      background: #FB6407;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 6px;
    }
    .kpi-val {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
    }
    .kpi-val.highlight-text {
      color: #05BCAA;
    }

    /* Alerta de Período Sem Doações */
    .notice-box {
      background-color: #F0FDF4;
      border-left: 4px solid #05BCAA;
      padding: 10px 14px;
      font-size: 11px;
      color: #166534;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    /* Tabela de Doações */
    .table-container {
      margin-bottom: 22px;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    thead {
      background-color: #013978;
      color: #FFFFFF;
    }
    thead th {
      padding: 11px 14px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    tbody tr {
      border-bottom: 1px solid #F1F5F9;
    }
    tbody tr:last-child {
      border-bottom: none;
    }
    tfoot td {
      padding: 12px 14px;
      background-color: #F8FAFC;
      border-top: 2px solid #E2E8F0;
      font-weight: 800;
      font-size: 12px;
    }

    /* Caixa de Impacto e Inspiração */
    .impact-box {
      background: linear-gradient(135deg, #F0FDF4 0%, #F0F9FF 100%);
      border: 1px solid #BAE6FD;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .impact-icon {
      font-size: 26px;
      line-height: 1;
    }
    .impact-text h5 {
      margin: 0 0 2px 0;
      font-size: 12px;
      font-weight: 700;
      color: #0369A1;
    }
    .impact-text p {
      margin: 0;
      font-size: 11px;
      color: #334155;
    }

    /* Rodapé */
    .footer-section {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94A3B8;
    }
    .footer-left {
      font-weight: 600;
      color: #64748B;
    }
    .footer-left span {
      color: #05BCAA;
      margin: 0 4px;
    }
    .footer-right {
      text-align: right;
    }
  </style>
</head>
<body>
  <!-- Cabeçalho -->
  <div class="header-bar">
    <div class="brand-col">
      <img src="${LOGO_CONECTACAO_BASE64}" alt="ConectAção Logo" class="brand-logo" />
      <div>
        <div style="font-size: 17px; font-weight: 900; color: #013978; letter-spacing: -0.5px;">ConectAção</div>
        <div class="brand-tagline">Conectar • Colaborar • Crescer</div>
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-type-badge">${tipo}</div>
      <div class="doc-date">Emissão: ${dataEmissaoFormatada} às ${horaEmissaoFormatada}</div>
      <div class="doc-protocol">Protocolo: ${protocolo}</div>
    </div>
  </div>

  <!-- Título Principal -->
  <div class="title-section">
    <h1 class="main-title">Relatório de Impacto & Extrato de Doações</h1>
    <p class="sub-title">${descricao}</p>
  </div>

  <!-- Cartão do Doador -->
  <div class="donor-card">
    <div class="donor-info">
      <h4>${nomeUsuario}</h4>
      <p>Conta associada: ${emailUsuario} &bull; Doador(a) verificado(a) na rede de solidariedade</p>
    </div>
    <div class="donor-badge">
      <span>★</span> Doador Ouro ConectAção
    </div>
  </div>

  <!-- Painel de Métricas / KPIs -->
  <div class="kpi-grid">
    <div class="kpi-card highlight">
      <div class="kpi-label">Total do Período</div>
      <div class="kpi-val highlight-text">${formatarMoeda(kpis.totalPeriodo || totalTabela)}</div>
    </div>
    <div class="kpi-card blue">
      <div class="kpi-label">Doações Realizadas</div>
      <div class="kpi-val">${kpis.qtdDoacoesPeriodo || listaParaExibir.length}</div>
    </div>
    <div class="kpi-card cyan">
      <div class="kpi-label">Média por Doação</div>
      <div class="kpi-val">${formatarMoeda(kpis.mediaPorDoacao || (listaParaExibir.length > 0 ? totalTabela / listaParaExibir.length : 0))}</div>
    </div>
    <div class="kpi-card orange">
      <div class="kpi-label">Causas Apoiadas</div>
      <div class="kpi-val">${ongsApoiadasCount > 0 ? ongsApoiadasCount : 1} ONGs</div>
    </div>
  </div>

  ${
    isPeriodoSemRegistros
      ? `<div class="notice-box">
          <strong>Aviso informativo:</strong> Não encontramos registros específicos de doação no mês selecionado. Abaixo exibimos o histórico geral disponível em sua conta para referência.
        </div>`
      : ''
  }

  <!-- Tabela de Doações -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width: 10%;">Cód.</th>
          <th style="width: 18%;">Data</th>
          <th style="width: 32%;">Campanha / Causa</th>
          <th style="width: 20%;">ONG Beneficiada</th>
          <th style="width: 10%; text-align: center;">Status</th>
          <th style="width: 15%; text-align: right;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${linhasHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align: right; color: #013978; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
            Total Consolidado:
          </td>
          <td style="text-align: right; color: #05BCAA; font-size: 13px;">
            ${formatarMoeda(totalTabela)}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Caixa de Impacto e Transparência -->
  <div class="impact-box">
    <div class="impact-icon">🤝</div>
    <div class="impact-text">
      <h5>Compromisso com a Transparência e Transformação Social</h5>
      <p>Todas as doações são processadas com segurança e repassadas integralmente às causas auditadas. Agradecemos por transformar vidas e construir um futuro mais justo e solidário com a ConectAção!</p>
    </div>
  </div>

  <!-- Rodapé -->
  <div class="footer-section">
    <div class="footer-left">
      ConectAção <span>&bull;</span> Conectar <span>&bull;</span> Colaborar <span>&bull;</span> Crescer
    </div>
    <div class="footer-right">
      Plataforma de Doações Sociais &bull; Documento gerado digitalmente
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Função principal que gera o PDF e abre a caixa nativa de compartilhamento ou impressão.
 */
export async function baixarRelatorioDoacoesPdf(params: GerarRelatorioPdfParams): Promise<{
  sucesso: boolean;
  uri?: string;
  erro?: string;
}> {
  try {
    const html = gerarHtmlRelatorio(params);
    const { nomeArquivo } = obterTituloPeriodo(params.modoFiltro, params.anoSelecionado, params.mesSelecionado);

    if (Platform.OS === 'web') {
      // No ambiente Web, aciona a janela de impressão do navegador ou gera o documento
      await Print.printAsync({ html });
      return { sucesso: true };
    }

    // No ambiente nativo (Android / iOS):
    // 1. Gera o arquivo PDF no sistema de arquivos local
    const arquivo = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // 2. Abre a tela nativa de compartilhamento / salvar do Android / iOS
    const podeCompartilhar = await Sharing.isAvailableAsync();
    if (podeCompartilhar) {
      await Sharing.shareAsync(arquivo.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${nomeArquivo}`,
        UTI: 'com.adobe.pdf',
      });
    }

    return { sucesso: true, uri: arquivo.uri };
  } catch (error: any) {
    console.error('Erro ao gerar relatório em PDF das doações:', error);
    return {
      sucesso: false,
      erro: error?.message || 'Falha ao gerar o arquivo PDF.',
    };
  }
}

export { obterTituloPeriodo };

