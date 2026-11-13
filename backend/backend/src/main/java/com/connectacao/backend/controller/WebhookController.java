package com.connectacao.backend.controller;

import com.connectacao.backend.service.AbacatePayService;
import com.connectacao.backend.service.DoacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/webhooks")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final AbacatePayService abacatePayService;
    private final DoacaoService doacaoService;

    public WebhookController(AbacatePayService abacatePayService, DoacaoService doacaoService) {
        this.abacatePayService = abacatePayService;
        this.doacaoService = doacaoService;
    }

    @PostMapping("/abacatepay")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> receberAbacatePay(@RequestBody Map<String, Object> payload) {
        try {
            String event = payload.get("event") != null ? String.valueOf(payload.get("event")) : "";
            Object dataObj = payload.get("data");
            Map<String, Object> data = dataObj instanceof Map<?, ?> m ? (Map<String, Object>) m : payload;

            // Suporta tanto payload transparente direto quanto aninhado em pixQrCode / billing
            Map<String, Object> alvo = data;
            if (data.get("pixQrCode") instanceof Map<?, ?> pixMap) {
                alvo = (Map<String, Object>) pixMap;
            } else if (data.get("billing") instanceof Map<?, ?> billingMap) {
                alvo = (Map<String, Object>) billingMap;
            }

            String pixId = alvo.get("id") != null ? String.valueOf(alvo.get("id")) : null;
            String externalId = alvo.get("externalId") != null ? String.valueOf(alvo.get("externalId")) : null;
            String status = alvo.get("status") != null ? String.valueOf(alvo.get("status")) : "";

            boolean pago = "PAID".equalsIgnoreCase(status)
                    || "APPROVED".equalsIgnoreCase(status)
                    || "COMPLETED".equalsIgnoreCase(status)
                    || event.toLowerCase().contains("paid");

            if (pago) {
                Long doacaoId = abacatePayService.resolverDoacaoId(pixId, externalId);
                if (doacaoId != null) {
                    doacaoService.confirmarDoacao(doacaoId);
                    log.info("Doacao {} confirmada via webhook AbacatePay (pixId={})", doacaoId, pixId);
                }
            }
        } catch (Exception ex) {
            log.warn("Erro ao processar webhook AbacatePay: {}", ex.getMessage());
        }

        return ResponseEntity.ok(Map.of("received", true));
    }
}

