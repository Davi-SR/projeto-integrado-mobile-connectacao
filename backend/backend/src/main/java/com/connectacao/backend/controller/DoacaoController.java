package com.connectacao.backend.controller;

import com.connectacao.backend.dto.doacao.DoacaoCreateRequest;
import com.connectacao.backend.entidade.Doacao;
import com.connectacao.backend.service.DoacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DoacaoController {
    private final DoacaoService doacaoService;

    public DoacaoController(DoacaoService doacaoService) { this.doacaoService = doacaoService; }

    @GetMapping("/doacoes/{id}")
    public ResponseEntity<Doacao> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.buscarPorId(id));
    }

    @PostMapping("/doacoes")
    public ResponseEntity<Doacao> realizarDoacao(@Valid @RequestBody DoacaoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doacaoService.realizarDoacao(request));
    }

    @PostMapping("/doacoes/{id}/confirmar")
    public ResponseEntity<Doacao> confirmarDoacao(@PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.confirmarDoacao(id));
    }

    @PostMapping("/doacoes/{id}/cancelar")
    public ResponseEntity<Doacao> cancelarDoacao(@PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.cancelarDoacao(id));
    }

    @GetMapping("/usuarios/{id}/doacoes")
    public ResponseEntity<List<Doacao>> listarPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.listarPorUsuario(id));
    }
}