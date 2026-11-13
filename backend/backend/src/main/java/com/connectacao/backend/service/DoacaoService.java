package com.connectacao.backend.service;

import com.connectacao.backend.dto.doacao.DoacaoCreateRequest;
import com.connectacao.backend.entidade.Campanha;
import com.connectacao.backend.entidade.Doacao;
import com.connectacao.backend.entidade.FormaPagamento;
import com.connectacao.backend.entidade.Ong;
import com.connectacao.backend.entidade.StatusCampanha;
import com.connectacao.backend.entidade.StatusDoacao;
import com.connectacao.backend.exception.ConflitoException;
import com.connectacao.backend.exception.RecursoNaoEncontradoException;
import com.connectacao.backend.exception.RequisicaoInvalidaException;
import com.connectacao.backend.repository.CampanhaRepository;
import com.connectacao.backend.repository.DoacaoRepository;
import com.connectacao.backend.repository.OngRepository;
import com.connectacao.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoacaoService {
    private static final Logger log = LoggerFactory.getLogger(DoacaoService.class);

    private final DoacaoRepository doacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CampanhaRepository campanhaRepository;
    private final OngRepository ongRepository;
    private final PixService pixService;
    private final AbacatePayService abacatePayService;

    public DoacaoService(DoacaoRepository doacaoRepository, UsuarioRepository usuarioRepository,
                         CampanhaRepository campanhaRepository) {
        this(doacaoRepository, usuarioRepository, campanhaRepository, null, null, null);
    }

    public DoacaoService(DoacaoRepository doacaoRepository, UsuarioRepository usuarioRepository,
                         CampanhaRepository campanhaRepository, OngRepository ongRepository,
                         PixService pixService) {
        this(doacaoRepository, usuarioRepository, campanhaRepository, ongRepository, pixService, null);
    }

    @Autowired
    public DoacaoService(DoacaoRepository doacaoRepository, UsuarioRepository usuarioRepository,
                         CampanhaRepository campanhaRepository, OngRepository ongRepository,
                         PixService pixService, AbacatePayService abacatePayService) {
        this.doacaoRepository = doacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.campanhaRepository = campanhaRepository;
        this.ongRepository = ongRepository;
        this.pixService = pixService;
        this.abacatePayService = abacatePayService;
    }

    public Doacao buscarPorId(Long id) {
        Doacao doacao = doacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Doacao nao encontrada"));

        // Se ainda está pendente e usamos AbacatePay, consulta o status real da cobrança
        if (doacao.getStatus() == StatusDoacao.PENDENTE
                && doacao.getFormaPagamento() == FormaPagamento.PIX
                && abacatePayService != null
                && abacatePayService.isConfigurado()
                && abacatePayService.verificarPagamento(doacao.getId())) {
            doacao.setStatus(StatusDoacao.CONCLUIDA);
            doacao = doacaoRepository.save(doacao);
        }

        enriquecerComPixSeNecessario(doacao);
        return doacao;
    }

    public Doacao realizarDoacao(DoacaoCreateRequest request) {
        validarRequest(request);

        if (!usuarioRepository.existsById(request.getUsuarioId())) {
            throw new RecursoNaoEncontradoException("Usuario nao encontrado");
        }

        Campanha campanha = campanhaRepository.findById(request.getCampanhaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Campanha nao encontrada"));
        if (campanha.getStatus() != StatusCampanha.ATIVA) {
            throw new ConflitoException("Campanha nao esta ativa para receber doacoes");
        }

        Doacao doacao = new Doacao(request.getUsuarioId(), request.getCampanhaId(),
                request.getValor(), request.getFormaPagamento());
        doacao.setStatus(StatusDoacao.PENDENTE);
        doacao.setDataDoacao(LocalDateTime.now());
        Doacao salva = doacaoRepository.save(doacao);

        if (salva.getFormaPagamento() == FormaPagamento.PIX
                && abacatePayService != null
                && abacatePayService.isConfigurado()) {
            try {
                String nomeOng = resolverNomeOng(salva.getCampanhaId());
                String descricao = nomeOng != null
                        ? "Doacao para " + nomeOng
                        : "Doacao ConectAcao #" + salva.getId();
                AbacatePayService.AbacatePixResponse pix = abacatePayService.criarPixTransparente(
                        salva.getId(),
                        salva.getValor(),
                        descricao
                );
                if (pix.brCode() != null && !pix.brCode().isEmpty()) {
                    salva.setPixCopiaECola(pix.brCode());
                    salva.setPixQrCodeUrl(pix.brCodeBase64() != null && !pix.brCodeBase64().isEmpty()
                            ? pix.brCodeBase64()
                            : (pixService != null ? pixService.gerarQrCodeUrl(pix.brCode()) : null));
                    return salva;
                }
            } catch (Exception ex) {
                log.warn("Falha ao criar PIX na AbacatePay (usando fallback local): {}", ex.getMessage());
            }
        }

        enriquecerComPixSeNecessario(salva);
        return salva;
    }

    public Doacao confirmarDoacao(Long id) {
        Doacao doacao = buscarPorId(id);
        if (doacao.getStatus() != StatusDoacao.CONCLUIDA) {
            doacao.setStatus(StatusDoacao.CONCLUIDA);
            doacao = doacaoRepository.save(doacao);
        }
        enriquecerComPixSeNecessario(doacao);
        return doacao;
    }

    public Doacao cancelarDoacao(Long id) {
        Doacao doacao = buscarPorId(id);
        if (doacao.getStatus() != StatusDoacao.CONCLUIDA) {
            doacao.setStatus(StatusDoacao.CANCELADA);
            doacao = doacaoRepository.save(doacao);
        }
        return doacao;
    }

    private String resolverNomeOng(Long campanhaId) {
        try {
            if (campanhaId != null && campanhaRepository != null && ongRepository != null) {
                Campanha c = campanhaRepository.findById(campanhaId).orElse(null);
                if (c != null && c.getOngId() != null) {
                    Ong ong = ongRepository.findById(c.getOngId()).orElse(null);
                    if (ong != null && ong.getNome() != null && !ong.getNome().trim().isEmpty()) {
                        return ong.getNome().trim();
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private void enriquecerComPixSeNecessario(Doacao doacao) {
        if (doacao == null || doacao.getFormaPagamento() != FormaPagamento.PIX || pixService == null) {
            return;
        }
        if (doacao.getPixCopiaECola() != null && !doacao.getPixCopiaECola().isEmpty()) {
            return;
        }

        String nomeOng = resolverNomeOng(doacao.getCampanhaId());
        String nomeBeneficiario = nomeOng != null ? nomeOng : pixService.getBeneficiarioNomePadrao();

        String txId = "DOA" + doacao.getId();
        String copiaECola = pixService.gerarPixCopiaECola(
                pixService.getChaveCentral(),
                nomeBeneficiario,
                pixService.getCidadePadrao(),
                doacao.getValor(),
                txId
        );

        doacao.setPixCopiaECola(copiaECola);
        doacao.setPixQrCodeUrl(pixService.gerarQrCodeUrl(copiaECola));
    }

    private void validarRequest(DoacaoCreateRequest request) {
        if (request == null || request.getUsuarioId() == null || request.getCampanhaId() == null) {
            throw new RequisicaoInvalidaException("Usuario e campanha sao obrigatorios");
        }
        if (request.getValor() == null || request.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RequisicaoInvalidaException("O valor da doacao deve ser maior que zero");
        }
        if (request.getFormaPagamento() == null) {
            throw new RequisicaoInvalidaException("Forma de pagamento e obrigatoria");
        }
    }

    public List<Doacao> listarPorUsuario(Long usuarioId) {
        if (usuarioId == null || !usuarioRepository.existsById(usuarioId)) {
            throw new RecursoNaoEncontradoException("Usuario nao encontrado");
        }
        return doacaoRepository.findByUsuarioId(usuarioId);
    }
}
