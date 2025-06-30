import { Colors } from '@/utils/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';

interface UserStats {
    totalImages: number;
    lastActivity: string;
}

interface UserSettings {
    notifications: boolean;
    autoSave: boolean;
}

export default function Account() {
    const [stats, setStats] = useState<UserStats>({
        totalImages: 0,
        lastActivity: moment().format('YYYY-MM-DD'),
    });

    const [settings, setSettings] = useState<UserSettings>({
        notifications: true,
        autoSave: true,
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            // Load images for statistics
            const storedImages = await AsyncStorage.getItem('generatedImages');
            if (storedImages) {
                const images = JSON.parse(storedImages);
                setStats(prev => ({
                    ...prev,
                    totalImages: images.length,
                    lastActivity: images.length > 0 ? images[0].createdAt : moment().format('YYYY-MM-DD'),
                }));
            }

            // Load settings
            const storedSettings = await AsyncStorage.getItem('userSettings');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const saveSettings = async (newSettings: UserSettings) => {
        try {
            await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
            setSettings(newSettings);
            Toast.show({
                type: 'success',
                text1: 'Settings saved! ⚙️',
                text2: 'Your preferences have been updated',
                visibilityTime: 2000,
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            Toast.show({
                type: 'error',
                text1: 'Save failed',
                text2: 'Could not save settings',
                visibilityTime: 3000,
            });
        }
    };

    const clearAllData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your generated images and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove(['generatedImages', 'userSettings']);
                            setStats({
                                totalImages: 0,
                                lastActivity: moment().format('YYYY-MM-DD'),
                            });
                            Toast.show({
                                type: 'success',
                                text1: 'Data cleared! 🗑️',
                                text2: 'All data has been removed',
                                visibilityTime: 3000,
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Clear failed',
                                text2: 'Could not clear data',
                                visibilityTime: 3000,
                            });
                        }
                    },
                },
            ]
        );
    };

    const StatCard = ({ icon, title, value, color }: { icon: string; title: string; value: string; color: string }) => (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: color }]}>
                <FontAwesome5 name={icon} size={20} color={Colors.white} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    );

    const SettingItem = ({
        icon,
        title,
        description,
        value,
        onToggle
    }: {
        icon: string;
        title: string;
        description: string;
        value: boolean;
        onToggle: (value: boolean) => void;
    }) => (
        <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <FontAwesome5 name={icon} size={20} color={Colors.purple} />
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingDescription}>{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: Colors.gray, true: Colors.purple }}
                thumbColor={value ? Colors.white : Colors.gray}
            />
        </View>
    );

    const MenuButton = ({ icon, title, onPress, color = Colors.purple }: { icon: string; title: string; onPress: () => void; color?: string }) => (
        <TouchableOpacity style={styles.menuButton} onPress={onPress}>
            <FontAwesome5 name={icon} size={20} color={color} />
            <Text style={[styles.menuButtonText, { color }]}>{title}</Text>
            <FontAwesome5 name="chevron-right" size={16} color={Colors.gray} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <LinearGradient
                colors={[Colors.purple, Colors.green]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.profileHeader}
            >
                <View style={styles.profileAvatar}>
                    <FontAwesome5 name="user" size={40} color={Colors.white} />
                </View>
                <Text style={styles.profileName}>AI Artist</Text>
                <Text style={styles.profileSubtitle}>Visura Creator</Text>
            </LinearGradient>

            {/* Stats Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Statistics</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="images"
                        title="Images Generated"
                        value={stats.totalImages.toString()}
                        color={Colors.purple}
                    />
                    <StatCard
                        icon="clock"
                        title="Last Activity"
                        value={moment(stats.lastActivity).fromNow()}
                        color="#4ecdc4"
                    />
                </View>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingsContainer}>
                    <SettingItem
                        icon="bell"
                        title="Notifications"
                        description="Get notified about app updates"
                        value={settings.notifications}
                        onToggle={(value) => saveSettings({ ...settings, notifications: value })}
                    />
                    <SettingItem
                        icon="save"
                        title="Auto Save"
                        description="Automatically save generated images"
                        value={settings.autoSave}
                        onToggle={(value) => saveSettings({ ...settings, autoSave: value })}
                    />
                </View>
            </View>

            {/* App Info Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Information</Text>
                <View style={styles.menuContainer}>
                    <MenuButton
                        icon="info-circle"
                        title="About Visura"
                        onPress={() => {
                            Alert.alert(
                                'About Visura',
                                'Visura is an AI-powered image generation app that brings your creative ideas to life using state-of-the-art AI models.\n\nVersion: 1.0.0\nDeveloped with ❤️'
                            );
                        }}
                    />
                    <MenuButton
                        icon="question-circle"
                        title="Help & Support"
                        onPress={() => {
                            Toast.show({
                                type: 'info',
                                text1: 'Help & Support',
                                text2: 'Contact us at support@visura.com',
                                visibilityTime: 4000,
                            });
                        }}
                    />
                    <MenuButton
                        icon="star"
                        title="Rate This App"
                        onPress={() => {
                            Toast.show({
                                type: 'success',
                                text1: 'Thank you! ⭐',
                                text2: 'Your feedback helps us improve',
                                visibilityTime: 3000,
                            });
                        }}
                    />
                    <MenuButton
                        icon="share"
                        title="Share Visura"
                        onPress={() => {
                            Toast.show({
                                type: 'success',
                                text1: 'Thanks for sharing! 📤',
                                text2: 'Help others discover AI creativity',
                                visibilityTime: 3000,
                            });
                        }}
                    />
                </View>
            </View>

            {/* Danger Zone */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={styles.menuContainer}>
                    <MenuButton
                        icon="sign-out-alt"
                        title="Logout"
                        onPress={() => {
                            Alert.alert(
                                'Logout',
                                'Are you sure you want to logout? Your data will be saved.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Logout',
                                        style: 'destructive',
                                        onPress: () => {
                                            Toast.show({
                                                type: 'success',
                                                text1: 'Logged out successfully! 👋',
                                                text2: 'See you again soon',
                                                visibilityTime: 3000,
                                            });
                                            // Here you would typically handle logout logic
                                            // e.g., clear auth tokens, navigate to login screen
                                        },
                                    },
                                ]
                            );
                        }}
                        color="#ff6b6b"
                    />
                    <MenuButton
                        icon="trash"
                        title="Clear All Data"
                        onPress={clearAllData}
                        color="#dc3545"
                    />
                </View>
            </View>
            <Toast />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    profileHeader: {
        padding: 30,
        paddingTop: 80,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileAvatar: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 5,
    },
    profileSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        margin: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'column',
        gap: 5,
    },
    statCard: {
        width: '100%',
        backgroundColor: Colors.black,
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.white,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statTitle: {
        fontSize: 12,
        color: Colors.gray,
        marginTop: 2,
    },
    settingsContainer: {
        backgroundColor: Colors.black,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.white,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.white,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 15,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    settingDescription: {
        fontSize: 14,
        color: Colors.gray,
        marginTop: 2,
    },
    menuContainer: {
        backgroundColor: Colors.black,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.white,
        overflow: 'hidden',
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.white,
    },
    menuButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 15,
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        padding: 30,
        paddingBottom: 100,
    },
    footerText: {
        fontSize: 16,
        color: Colors.gray,
        marginBottom: 5,
    },
    footerVersion: {
        fontSize: 14,
        color: Colors.gray,
    },
}); 