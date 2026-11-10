package com.connectacao.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Locale;

@Service
public class PixService {

    @Value("${pix.chave-central:61999617819}")
    private String chaveCentral;

    @Value("${pix.beneficiario-nome:DAVI SILVA RAMOS}")
    private String beneficiarioNomePadrao;

    @Value("${pix.cidade:BRASILIA}")
    private String cidadePadrao;

    public String getChaveCentral() {
        return chaveCentral;
    }

    public String getBeneficiarioNomePadrao() {
        return beneficiarioNomePadrao;
    }

    public String getCidadePadrao() {
        return cidadePadrao;
    }

    /**
     * Gera a linha oficial do Pix Copia e Cola (Padrão EMV BR Code do Banco Central).
     */
    public String gerarPixCopiaECola(String chave, String nome, String cidade, BigDecimal valor, String txId) {
        String chaveUsada = (chave != null && !chave.trim().isEmpty()) ? chave.trim() : chaveCentral;
        String nomeUsado = (nome != null && !nome.trim().isEmpty()) ? nome.trim() : beneficiarioNomePadrao;
        String cidadeUsada = (cidade != null && !cidade.trim().isEmpty()) ? cidade.trim() : cidadePadrao;

        // Se a chave for telefone (apenas números, 10 ou 11 dígitos), o Bacen exige prefixo internacional +55
        String chaveLimpa = chaveUsada.replaceAll("[^0-9a-zA-Z@.\\-+_]", "");
        if (chaveLimpa.matches("^[0-9]{10,11}$")) {
            chaveLimpa = "+55" + chaveLimpa;
        }

        // Sanitização de Nome (máx 25 caracteres, sem acentos, maiúsculo)
        String nomeSanitizado = removerAcentos(nomeUsado).toUpperCase(Locale.ROOT);
        if (nomeSanitizado.length() > 25) {
            nomeSanitizado = nomeSanitizado.substring(0, 25);
        }

        // Sanitização de Cidade (máx 15 caracteres, sem acentos, maiúsculo)
        String cidadeSanitizada = removerAcentos(cidadeUsada).toUpperCase(Locale.ROOT);
        if (cidadeSanitizada.length() > 15) {
            cidadeSanitizada = cidadeSanitizada.substring(0, 15);
        }

        // TxId (máx 25 caracteres)
        String txIdSanitizado = (txId != null && !txId.trim().isEmpty())
                ? txId.trim().replaceAll("[^0-9a-zA-Z]", "")
                : "***";
        if (txIdSanitizado.length() > 25) {
            txIdSanitizado = txIdSanitizado.substring(0, 25);
        }

        // Formatação do valor (duas casas decimais)
        String valorFormatado = String.format(Locale.US, "%.2f", valor);

        // Montagem dos Blocos TLV (Tag-Length-Value)
        // 00: Payload Format Indicator
        StringBuilder sb = new StringBuilder();
        sb.append(formatarTLV("00", "01"));

        // 26: Merchant Account Information (GUI + Chave Pix)
        String subGui = formatarTLV("00", "br.gov.bcb.pix");
        String subChave = formatarTLV("01", chaveLimpa);
        sb.append(formatarTLV("26", subGui + subChave));

        // 52: Merchant Category Code
        sb.append(formatarTLV("52", "0000"));

        // 53: Transaction Currency (986 = Real / BRL)
        sb.append(formatarTLV("53", "986"));

        // 54: Transaction Amount
        sb.append(formatarTLV("54", valorFormatado));

        // 58: Country Code (BR)
        sb.append(formatarTLV("58", "BR"));

        // 59: Merchant Name
        sb.append(formatarTLV("59", nomeSanitizado));

        // 60: Merchant City
        sb.append(formatarTLV("60", cidadeSanitizada));

        // 62: Additional Data Field Template (TxId)
        String subTxId = formatarTLV("05", txIdSanitizado);
        sb.append(formatarTLV("62", subTxId));

        // 63: CRC16 (Tag + Length + Checksum calculado)
        sb.append("6304");
        String crc = calcularCRC16(sb.toString());
        sb.append(crc);

        return sb.toString();
    }

    /**
     * Retorna uma URL para renderização imediata do QR Code a partir do código Copia e Cola.
     */
    public String gerarQrCodeUrl(String copiaECola) {
        if (copiaECola == null || copiaECola.trim().isEmpty()) {
            return "";
        }
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data="
                + URLEncoder.encode(copiaECola, StandardCharsets.UTF_8);
    }

    private String formatarTLV(String tag, String valor) {
        String tamanho = String.format("%02d", valor.length());
        return tag + tamanho + valor;
    }

    private String removerAcentos(String texto) {
        if (texto == null) return "";
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .replaceAll("[^A-Za-z0-9 ]", "");
    }

    /**
     * Algoritmo CRC-CCITT (0xFFFF, polinômio 0x1021) obrigatório na especificação Pix do Bacen.
     */
    public static String calcularCRC16(String str) {
        int crc = 0xFFFF;
        for (int i = 0; i < str.length(); i++) {
            crc ^= (str.charAt(i) << 8);
            for (int j = 0; j < 8; j++) {
                if ((crc & 0x8000) != 0) {
                    crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    crc = (crc << 1) & 0xFFFF;
                }
            }
        }
        return String.format("%04X", crc);
    }
}

