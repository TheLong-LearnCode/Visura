import { Colors } from '@/utils/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface GeneratedImage {
    id: string;
    imageUrl: string;
    prompt: string;
    model: string;
    aspectRatio: string;
    createdAt: string;
}

const windowWidth = Dimensions.get('window').width;
const imageSize = (windowWidth - 40) / 2 - 10;

export default function Libraries() {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadImages = async () => {
        try {
            const storedImages = await AsyncStorage.getItem('generatedImages');
            if (storedImages) {
                const parsedImages: GeneratedImage[] = JSON.parse(storedImages);
                // Sort by creation date (newest first)
                parsedImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setImages(parsedImages);
            }
        } catch (error) {
            console.error('Error loading images:', error);
            Toast.show({
                type: 'error',
                text1: 'Loading error',
                text2: 'Failed to load image history',
                visibilityTime: 3000,
            });
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadImages();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadImages();
        setRefreshing(false);
    }, []);

    const deleteImage = async (imageId: string) => {
        try {
            const updatedImages = images.filter(img => img.id !== imageId);
            await AsyncStorage.setItem('generatedImages', JSON.stringify(updatedImages));
            setImages(updatedImages);
            setModalVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Deleted successfully! 🗑️',
                text2: 'Image removed from history',
                visibilityTime: 3000,
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            Toast.show({
                type: 'error',
                text1: 'Delete error',
                text2: 'Failed to delete image',
                visibilityTime: 3000,
            });
        }
    };

    const saveImage = async (image: GeneratedImage) => {
        try {
            let base64Code: string;
            let fileExtension = "jpeg";

            if (image.imageUrl.startsWith("data:image/jpeg;base64,")) {
                base64Code = image.imageUrl.split("data:image/jpeg;base64,")[1];
                fileExtension = "jpeg";
            } else if (image.imageUrl.startsWith("data:image/png;base64,")) {
                base64Code = image.imageUrl.split("data:image/png;base64,")[1];
                fileExtension = "png";
            } else if (image.imageUrl.startsWith("data:image/webp;base64,")) {
                base64Code = image.imageUrl.split("data:image/webp;base64,")[1];
                fileExtension = "webp";
            } else if (image.imageUrl.includes("base64,")) {
                base64Code = image.imageUrl.split("base64,")[1];
                fileExtension = "jpeg";
            } else {
                throw new Error("Unsupported image format");
            }

            if (!base64Code || base64Code.trim() === "") {
                throw new Error("Failed to extract base64 data from image");
            }

            const date = moment(image.createdAt).format("YYYY-MM-DD_HH-mm-ss");
            const filename = FileSystem.documentDirectory + `visura_saved_${date}.${fileExtension}`;

            await FileSystem.writeAsStringAsync(filename, base64Code, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await MediaLibrary.saveToLibraryAsync(filename);
            setModalVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Save successful! 💾',
                text2: 'Image has been saved to your gallery',
                visibilityTime: 3000,
            });
        } catch (error) {
            console.error('Error saving image:', error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            Toast.show({
                type: 'error',
                text1: 'Save error',
                text2: errorMessage,
                visibilityTime: 4000,
            });
        }
    };

    const renderImageItem = ({ item }: { item: GeneratedImage }) => (
        <TouchableOpacity
            style={styles.imageItem}
            onPress={() => {
                setSelectedImage(item);
                setModalVisible(true);
            }}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <View style={styles.imageOverlay}>
                <Text style={styles.imageDate}>
                    {moment(item.createdAt).format('MMM DD')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const confirmDelete = (imageId: string) => {
        Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image from your history?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteImage(imageId) },
            ]
        );
    };

    if (images.length === 0) {
        return (
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <FontAwesome5 name="images" size={80} color={Colors.gray} />
                    <Text style={styles.emptyTitle}>No Generated Images</Text>
                    <Text style={styles.emptySubtitle}>
                        Images you generate with AI will appear here
                    </Text>
                    <Text style={styles.emptyHint}>
                        Pull down to refresh
                    </Text>
                </ScrollView>
                <Toast />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My AI Gallery</Text>
                <Text style={styles.subtitle}>{images.length} images generated</Text>
            </View>

            <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.imageList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            {/* Image Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedImage && (
                            <>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <FontAwesome5 name="times" size={24} color={Colors.white} />
                                </TouchableOpacity>

                                <Image source={{ uri: selectedImage.imageUrl }} style={styles.modalImage} />

                                <ScrollView style={styles.imageDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Created:</Text>
                                        <Text style={styles.detailValue}>
                                            {moment(selectedImage.createdAt).format('MMMM DD, YYYY [at] HH:mm')}
                                        </Text>
                                    </View>
                                </ScrollView>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => saveImage(selectedImage)}
                                    >
                                        <LinearGradient
                                            colors={[Colors.green, Colors.purple]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.actionButtonGradient}
                                        >
                                            <FontAwesome5 name="save" size={20} color={Colors.white} />
                                            <Text style={styles.actionButtonText}>Save</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => confirmDelete(selectedImage.id)}
                                    >
                                        <View style={styles.deleteButton}>
                                            <FontAwesome5 name="trash" size={20} color={Colors.white} />
                                            <Text style={styles.actionButtonText}>Delete</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray,
        textAlign: 'center',
    },
    imageList: {
        padding: 20,
        paddingTop: 10,
    },
    imageItem: {
        width: imageSize,
        height: imageSize,
        marginRight: 10,
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
    },
    imageDate: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.gray,
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyHint: {
        fontSize: 14,
        color: Colors.gray,
        fontStyle: 'italic',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: windowWidth - 40,
        backgroundColor: Colors.background,
        borderRadius: 20,
        padding: 20,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 10,
    },
    modalImage: {
        width: '100%',
        height: 300,
        borderRadius: 15,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    imageDetails: {
        marginBottom: 20,
    },

    detailRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: Colors.gray,
        fontWeight: '600',
        width: 100,
    },
    detailValue: {
        fontSize: 16,
        color: Colors.text,
        flex: 1,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#dc3545',
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
}); 