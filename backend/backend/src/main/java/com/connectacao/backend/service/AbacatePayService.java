package com.connectacao.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AbacatePayService {

    private static final Logger log = LoggerFactory.getLogger(AbacatePayService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final Map<Long, String> doacaoIdParaPixId = new ConcurrentHashMap<>();
    private final Map<String, Long> pixIdParaDoacaoId = new ConcurrentHashMap<>();

    public record AbacatePixResponse(String pixId, String brCode, String brCodeBase64, String status) {
    }

    public AbacatePayService(
            @Value("${abacatepay.api-key:}") String apiKey,
            @Value("${abacatepay.base-url:https://api.abacatepay.com/v2}") String baseUrl
    ) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        String urlLimpa = (baseUrl != null && !baseUrl.trim().isEmpty())
                ? baseUrl.trim().replaceAll("/+$", "")
                : "https://api.abacatepay.com/v2";
        this.restClient = RestClient.builder()
                .baseUrl(urlLimpa)
                .build();
    }

    public boolean isConfigurado() {
        return !apiKey.isEmpty();
    }

    /**
     * Cria uma cobrança PIX transparente na API v2 da AbacatePay.
     */
    public AbacatePixResponse criarPixTransparente(Long doacaoId, BigDecimal valor, String descricao) {
        if (!isConfigurado()) {
            throw new IllegalStateException("ABACATEPAY_API_KEY nao configurada.");
        }

        int valorCentavos = valor
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();

        String descSanitizada = (descricao != null && !descricao.trim().isEmpty())
                ? descricao.trim()
                : "Doacao ConectAcao #" + doacaoId;
        if (descSanitizada.length() > 140) {
            descSanitizada = descSanitizada.substring(0, 140);
        }

        Map<String, Object> body = Map.of(
                "method", "PIX",
                "data", Map.of(
                        "amount", valorCentavos,
                        "description", descSanitizada,
                        "expiresIn", 900,
                        "externalId", "DOA-" + doacaoId
                )
        );

        Map<String, Object> response = restClient.post()
                .uri("/transparents/create")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        Map<String, Object> data = extrairData(response);
        if (data == null) {
            throw new IllegalStateException("Resposta invalida da AbacatePay ao criar PIX: " + response);
        }

        String pixId = asString(data.get("id"));
        String brCode = asString(data.get("brCode"));
        String brCodeBase64 = asString(data.get("brCodeBase64"));
        String status = asString(data.get("status"));

        if (brCodeBase64 != null && !brCodeBase64.isEmpty() && !brCodeBase64.startsWith("data:image")) {
            brCodeBase64 = "data:image/png;base64," + brCodeBase64;
        }

        if (pixId != null && !pixId.isEmpty()) {
            doacaoIdParaPixId.put(doacaoId, pixId);
            pixIdParaDoacaoId.put(pixId, doacaoId);
        }

        return new AbacatePixResponse(pixId, brCode, brCodeBase64, status);
    }

    /**
     * Consulta na API v2 da AbacatePay se a cobrança PIX vinculada à doação já foi paga.
     */
    public boolean verificarPagamento(Long doacaoId) {
        if (!isConfigurado() || doacaoId == null) {
            return false;
        }

        String pixId = doacaoIdParaPixId.get(doacaoId);
        if (pixId == null || pixId.isEmpty()) {
            return false;
        }

        try {
            Map<String, Object> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/transparents/check")
                            .queryParam("id", pixId)
                            .build())
                    .header("Authorization", "Bearer " + apiKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            Map<String, Object> data = extrairData(response);
            if (data == null) {
                return false;
            }

            String status = asString(data.get("status"));
            return "PAID".equalsIgnoreCase(status)
                    || "APPROVED".equalsIgnoreCase(status)
                    || "COMPLETED".equalsIgnoreCase(status);
        } catch (Exception ex) {
            log.warn("Erro ao consultar status do PIX {} na AbacatePay: {}", pixId, ex.getMessage());
            return false;
        }
    }

    public Long resolverDoacaoId(String pixId, String externalId) {
        if (externalId != null && externalId.startsWith("DOA-")) {
            try {
                return Long.parseLong(externalId.substring(4));
            } catch (NumberFormatException ignored) {
            }
        }
        if (pixId != null) {
            return pixIdParaDoacaoId.get(pixId);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extrairData(Map<String, Object> response) {
        if (response == null) return null;
        Object dataObj = response.get("data");
        if (dataObj instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        if (response.containsKey("brCode") || response.containsKey("status")) {
            return response;
        }
        return null;
    }

    private String asString(Object value) {
        return value != null ? String.valueOf(value) : null;
    }
}

