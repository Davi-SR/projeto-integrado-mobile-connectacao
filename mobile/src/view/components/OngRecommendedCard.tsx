import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Categoria } from '../../model/entities/Categoria';
import { Ong } from '../../model/entities/Ong';
import { HeartIcon, PersonIcon } from './HomeIcons';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  ong: Ong;
  categorias: Categoria[];
  onProfile: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
};

export function OngRecommendedCard({
  ong,
  categorias,
  onProfile,
  isFavorite = false,
  onFavoritePress,
}: Props) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const { isDark, theme } = useTheme();

  const categoria =
    categorias.find((item) => item.id === ong.categoriaId)?.nome ?? 'Causa social';

  const cardBg = isDark ? '#1A1D24' : theme.colors.surface;
  const nameColor = isDark ? '#FFFFFF' : theme.colors.ink;
  const categoryBg = isDark ? '#0D3331' : theme.colors.activeSurface;
  const categoryTextColor = isDark ? '#05BCAA' : theme.colors.tealDark;
  const descriptionColor = isDark ? '#CBD5E1' : theme.colors.text;
  const profileBtnBg = isDark ? '#262B35' : theme.colors.subtle;
  const profileBtnTextColor = isDark ? '#FFFFFF' : theme.colors.brand;
  const heartOutlineColor = isDark ? '#9CA3AF' : theme.colors.inputBorder;

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {ong.imagemUrl && !imageFailed ? (
        <Image
          source={{ uri: ong.imagemUrl }}
          onError={() => setImageFailed(true)}
          style={[styles.image, { backgroundColor: isDark ? '#262B35' : theme.colors.subtle }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.fallback, { backgroundColor: isDark ? '#262B35' : theme.colors.subtle }]}>
          <PersonIcon color={isDark ? '#9CA3AF' : theme.colors.muted} />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={[styles.name, { color: nameColor }]}>
            {ong.nome}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
            }
            onPress={onFavoritePress}
            disabled={!onFavoritePress}
            style={({ pressed }) => [
              styles.favoriteButton,
              pressed && onFavoritePress && styles.pressed,
            ]}
          >
            <HeartIcon
              filled={isFavorite}
              size={28}
              color={isFavorite ? (isDark ? '#EF4444' : theme.colors.heart) : heartOutlineColor}
            />
          </Pressable>
        </View>

        <Text
          style={[
            styles.category,
            { backgroundColor: categoryBg, color: categoryTextColor },
          ]}
        >
          {categoria}
        </Text>

        <Text
          numberOfLines={3}
          style={[styles.description, { color: descriptionColor }]}
        >
          {ong.descricao}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={onProfile}
          style={({ pressed }) => [
            styles.profileButton,
            { backgroundColor: profileBtnBg },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.profileText, { color: profileBtnTextColor }]}>Ver Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 190,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 18,
    fontWeight: '800',
  },
  favoriteButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    minHeight: 60,
    marginTop: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  profileButton: {
    minHeight: 48,
    marginTop: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },
});
