import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Categoria } from '../../model/entities/Categoria';
import { CategoriaRepository } from '../../model/repositories/CategoriaRepository';
import { RootStackParamList } from '../../navigation/types';
import { useFavoritosViewModel } from '../../viewmodel/useFavoritosViewModel';
import { useDrawer } from '../../viewmodel/DrawerContext';
import { OngRecommendedCard } from '../components/OngRecommendedCard';
import { AppIcon } from '../components/HomeIcons';
import { useTheme } from '../../theme/ThemeContext';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function FavoritosScreen() {
    const navigation = useNavigation<Navigation>();
    const { openDrawer } = useDrawer();
    const { isDark, theme } = useTheme();

    const {
        favoritos,
        isLoading,
        error,
        carregarFavoritos,
        desfavoritar,
    } = useFavoritosViewModel();

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        async function carregarCategorias() {
            try {
                const resultado = await CategoriaRepository.listar();
                setCategorias(resultado);
            } catch (cause) {
                console.error('Erro ao carregar categorias:', cause);
            }
        }

        void carregarCategorias();
    }, []);

    async function atualizar() {
        setRefreshing(true);

        try {
            await carregarFavoritos();
        } finally {
            setRefreshing(false);
        }
    }

    const pageBg = isDark ? '#111418' : theme.colors.page;
    const headerBg = isDark ? '#121418' : theme.colors.surface;
    const borderColor = isDark ? '#242A35' : theme.colors.line;
    const titleColor = isDark ? '#FFFFFF' : theme.colors.ink;
    const subtitleColor = isDark ? '#9CA3AF' : theme.colors.text;
    const primaryTeal = isDark ? '#05BCAA' : theme.colors.tealDark;

    return (
        <View style={[styles.container, { backgroundColor: pageBg }]}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Abrir menu"
                    onPress={openDrawer}
                    style={({ pressed }) => [
                        styles.menuButton,
                        pressed && styles.pressed,
                    ]}
                >
                    <AppIcon name="menu" size={28} color={primaryTeal} />
                </Pressable>

                <Text style={[styles.title, { color: titleColor }]}>ONGs Favoritas</Text>

                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={primaryTeal} />
                    <Text style={[styles.message, { color: subtitleColor }]}>Carregando favoritas...</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.error}>{error}</Text>

                    <Pressable
                        onPress={() => void carregarFavoritos()}
                        style={({ pressed }) => [
                            styles.retryButton,
                            { backgroundColor: primaryTeal },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : favoritos.length === 0 ? (
                <View style={styles.center}>
                    <AppIcon
                        name="favorite_border"
                        size={54}
                        color={isDark ? '#2E3543' : theme.colors.inputBorder}
                    />

                    <Text style={[styles.emptyTitle, { color: titleColor }]}>
                        Nenhuma ONG favorita
                    </Text>

                    <Text style={[styles.message, { color: subtitleColor }]}>
                        As ONGs que você favoritar aparecerão aqui.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => void atualizar()}
                            tintColor={primaryTeal}
                            colors={[primaryTeal]}
                        />
                    }
                >
                    <Text style={[styles.subtitle, { color: titleColor }]}>
                        Suas causas favoritas
                    </Text>

                    <View style={styles.cards}>
                        {favoritos.map((ong) => (
                            <OngRecommendedCard
                                key={ong.id}
                                ong={ong}
                                categorias={categorias}
                                isFavorite
                                onFavoritePress={() => void desfavoritar(ong.id)}
                                onProfile={() =>
                                    navigation.navigate('OngDetails', {
                                        ongId: ong.id,
                                    })
                                }
                            />
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        minHeight: 88,
        paddingTop: 32,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },

    menuButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },

    title: {
        flex: 1,
        textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        fontWeight: '800',
    },

    headerSpacer: {
        width: 48,
    },

    content: {
        padding: 24,
        paddingBottom: 40,
    },

    subtitle: {
        marginBottom: 20,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 22,
        fontWeight: '800',
    },

    cards: {
        gap: 20,
    },

    center: {
        flex: 1,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        marginTop: 14,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },

    message: {
        marginTop: 10,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },

    error: {
        color: '#EF4444',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },

    retryButton: {
        minHeight: 48,
        marginTop: 20,
        paddingHorizontal: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },

    retryText: {
        color: '#FFFFFF',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        fontWeight: '800',
    },

    pressed: {
        opacity: 0.75,
    },
});
