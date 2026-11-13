import { useCallback, useEffect, useState } from 'react';

import { Ong } from '../model/entities/Ong';
import { CampanhaDestaque } from '../model/entities/CampanhaDestaque';
import { OngRepository } from '../model/repositories/OngRepository';
import { CampanhaRepository } from '../model/repositories/CampanhaRepository';
import { CategoriaRepository } from '../model/repositories/CategoriaRepository';
import { DoacaoRepository } from '../model/repositories/DoacaoRepository';
import { useAuth } from './AuthContext';

export function useOngDetailsViewModel(ongId: number) {
  const { user } = useAuth();
  const [ong, setOng] = useState<Ong | null>(null);
  const [campanhas, setCampanhas] = useState<CampanhaDestaque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaNome, setCategoriaNome] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const carregarOng = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const [ongData, categorias, favoritos, campanhasData] = await Promise.all([
        OngRepository.buscarPorId(ongId),
        CategoriaRepository.listar(),
        user?.id ? OngRepository.listarFavoritos(user.id).catch(() => []) : Promise.resolve([]),
        CampanhaRepository.listarPorOng(ongId).catch(() => [] as CampanhaDestaque[]),
      ]);
      setOng(ongData);
      setCategoriaNome(categorias.find((categoria) => categoria.id === ongData.categoriaId)?.nome ?? null);
      setIsFavorite(favoritos.some((item) => item.id === ongId));
      setCampanhas(campanhasData);
    } catch (cause) {
      if (!silencioso) {
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a ONG.');
      }
    } finally {
      if (!silencioso) {
        setIsLoading(false);
      }
    }
  }, [ongId, user?.id]);

  useEffect(() => {
    void carregarOng(false);
  }, [carregarOng]);

  const toggleFavorito = useCallback(async () => {
    if (!user?.id || !ong) return;
    const proximoEstado = !isFavorite;
    setIsFavorite(proximoEstado);
    try {
      if (proximoEstado) {
        await OngRepository.favoritar(user.id, ong.id);
      } else {
        await OngRepository.desfavoritar(user.id, ong.id);
      }
    } catch (cause) {
      console.error('Erro ao alternar favorito no perfil:', cause);
      setIsFavorite(!proximoEstado);
    }
  }, [user?.id, ong, isFavorite]);

  const realizarDoacao = useCallback(
    async (campanhaId: number, valor: number, formaPagamento: 'PIX' | 'CARTAO' = 'PIX') => {
      const usuarioId = user?.id ?? 1;
      const doacao = await DoacaoRepository.criar({
        usuarioId,
        campanhaId,
        valor,
        formaPagamento,
      });
      // Recarrega campanhas e status silenciosamente sem desmontar a tela
      void carregarOng(true);
      return doacao;
    },
    [user?.id, carregarOng],
  );

  const confirmarDoacao = useCallback(
    async (doacaoId: number) => {
      try {
        const doacao = await DoacaoRepository.confirmar(doacaoId);
        void carregarOng(true);
        return doacao;
      } catch {
        // Fallback local se o backend não tiver o endpoint
        void carregarOng(true);
        return null;
      }
    },
    [carregarOng],
  );

  const cancelarDoacao = useCallback(
    async (doacaoId: number) => {
      try {
        const doacao = await DoacaoRepository.cancelar(doacaoId);
        void carregarOng(true);
        return doacao;
      } catch {
        void carregarOng(true);
        return null;
      }
    },
    [carregarOng],
  );

  return {
    ong,
    campanhas,
    categoriaNome,
    isLoading,
    error,
    isFavorite,
    toggleFavorito,
    realizarDoacao,
    confirmarDoacao,
    cancelarDoacao,
    recarregar: carregarOng,
  };
}

