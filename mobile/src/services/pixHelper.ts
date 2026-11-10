/**
 * Helper para geração do Pix Copia e Cola no padrão EMV BR Code oficial do Banco Central.
 */

export const PIX_CONFIG_PADRAO = {
  chaveCentral: '61999617819',
  beneficiarioNome: 'DAVI SILVA RAMOS',
  cidade: 'BRASILIA',
};

function formatarTLV(tag: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, '0');
  return `${tag}${tamanho}${valor}`;
}

function removerAcentos(texto: string): string {
  if (!texto) return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '');
}

export function calcularCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export type GerarPixParams = {
  chave?: string;
  nome?: string;
  cidade?: string;
  valor: number;
  txId?: string;
};

export function gerarPixCopiaECola({
  chave = PIX_CONFIG_PADRAO.chaveCentral,
  nome = PIX_CONFIG_PADRAO.beneficiarioNome,
  cidade = PIX_CONFIG_PADRAO.cidade,
  valor,
  txId = '***',
}: GerarPixParams): { copiaECola: string; qrCodeUrl: string } {
  // Se for número de telefone de 10 ou 11 dígitos, adiciona o prefixo internacional +55
  let chaveLimpa = chave.replace(/[^0-9a-zA-Z@.\-+_]/g, '');
  if (/^[0-9]{10,11}$/.test(chaveLimpa)) {
    chaveLimpa = `+55${chaveLimpa}`;
  }

  // Nome sanitizado (máx 25 caracteres, maiúsculo, sem acentos)
  let nomeSanitizado = removerAcentos(nome).toUpperCase();
  if (nomeSanitizado.length > 25) {
    nomeSanitizado = nomeSanitizado.slice(0, 25);
  }
  if (!nomeSanitizado) nomeSanitizado = 'DAVI SILVA RAMOS';

  // Cidade sanitizada (máx 15 caracteres, maiúsculo, sem acentos)
  let cidadeSanitizada = removerAcentos(cidade).toUpperCase();
  if (cidadeSanitizada.length > 15) {
    cidadeSanitizada = cidadeSanitizada.slice(0, 15);
  }
  if (!cidadeSanitizada) cidadeSanitizada = 'BRASILIA';

  // TxId
  let txIdSanitizado = (txId || '***').replace(/[^0-9a-zA-Z]/g, '');
  if (txIdSanitizado.length > 25) {
    txIdSanitizado = txIdSanitizado.slice(0, 25);
  }

  const valorFormatado = valor.toFixed(2);

  // Montagem dos blocos TLV
  let payload = '';
  payload += formatarTLV('00', '01'); // Payload Format Indicator

  // Tag 26: Merchant Account Information
  const subGui = formatarTLV('00', 'br.gov.bcb.pix');
  const subChave = formatarTLV('01', chaveLimpa);
  payload += formatarTLV('26', `${subGui}${subChave}`);

  payload += formatarTLV('52', '0000'); // Merchant Category Code
  payload += formatarTLV('53', '986'); // Currency BRL
  payload += formatarTLV('54', valorFormatado); // Amount
  payload += formatarTLV('58', 'BR'); // Country Code
  payload += formatarTLV('59', nomeSanitizado); // Merchant Name
  payload += formatarTLV('60', cidadeSanitizada); // Merchant City

  // Tag 62: Additional Data Field Template
  const subTxId = formatarTLV('05', txIdSanitizado);
  payload += formatarTLV('62', subTxId);

  // Tag 63: CRC16
  payload += '6304';
  const checksum = calcularCRC16(payload);
  const copiaECola = `${payload}${checksum}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    copiaECola
  )}`;

  return {
    copiaECola,
    qrCodeUrl,
  };
}

