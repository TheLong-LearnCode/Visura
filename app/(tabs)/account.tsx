import { Colors } from '@/utils/Colors';
import { authApi } from '@/utils/api';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
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

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    dob: string;
    createdAt: string;
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

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({
        username: '',
        email: '',
        dob: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadUserData();
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setIsLoadingProfile(true);
            const profileData = await authApi.getProfile();
            setProfile(profileData);
        } catch (error) {
            console.error('Error loading profile:', error);
            Toast.show({
                type: 'error',
                text1: 'Profile load failed',
                text2: 'Could not load user profile',
                visibilityTime: 3000,
            });
        } finally {
            setIsLoadingProfile(false);
        }
    };

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

    const openUpdateModal = () => {
        if (profile) {
            setUpdateFormData({
                username: profile.username,
                email: profile.email,
                dob: moment(profile.dob).format('DD/MM/YYYY')
            });
            setIsUpdateModalVisible(true);
        }
    };

    const handleUpdateProfile = async () => {
        if (!updateFormData.username || !updateFormData.email || !updateFormData.dob) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields',
                visibilityTime: 3000,
            });
            return;
        }

        try {
            setIsUpdating(true);
            const [day, month, year] = updateFormData.dob.split('/').map(Number);
            const dobString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            // Check if email is being changed
            const isEmailChanged = profile && updateFormData.email !== profile.email;

            const updatedProfile = await authApi.updateProfile({
                username: updateFormData.username,
                email: updateFormData.email,
                dob: dobString,
            });

            setProfile(updatedProfile);
            setIsUpdateModalVisible(false);

            if (isEmailChanged) {
                // If email changed, logout and redirect to login
                Toast.show({
                    type: 'success',
                    text1: 'Profile Updated',
                    text2: 'Email changed. Please login again for security.',
                    visibilityTime: 4000,
                });

                // Logout after a short delay to show the toast
                setTimeout(async () => {
                    try {
                        await authApi.logout();
                        router.replace('/(auth)/login');
                    } catch (error) {
                        // Force redirect even if logout API fails
                        router.replace('/(auth)/login');
                    }
                }, 2000);
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile updated successfully!',
                    visibilityTime: 3000,
                });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Update failed. Please try again.';
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: message,
                visibilityTime: 3000,
            });
        } finally {
            setIsUpdating(false);
        }
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
                {isLoadingProfile ? (
                    <>
                        <Text style={styles.profileName}>Loading...</Text>
                        <Text style={styles.profileSubtitle}>Please wait</Text>
                    </>
                ) : profile ? (
                    <>
                        <Text style={styles.profileName}>{profile.username}</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.profileName}>Unknown User</Text>
                        <Text style={styles.profileSubtitle}>Failed to load profile</Text>
                    </>
                )}
            </LinearGradient>

            {/* Profile Details Section */}
            {profile && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Information</Text>
                    <View style={styles.profileDetailsContainer}>
                        <View style={styles.profileDetailItem}>
                            <FontAwesome5 name="user" size={16} color={Colors.purple} />
                            <View style={styles.profileDetailText}>
                                <Text style={styles.profileDetailLabel}>Username</Text>
                                <Text style={styles.profileDetailValue}>{profile.username}</Text>
                            </View>
                        </View>
                        <View style={styles.profileDetailItem}>
                            <FontAwesome5 name="envelope" size={16} color={Colors.purple} />
                            <View style={styles.profileDetailText}>
                                <Text style={styles.profileDetailLabel}>Email</Text>
                                <Text style={styles.profileDetailValue}>{profile.email}</Text>
                            </View>
                        </View>
                        <View style={styles.profileDetailItem}>
                            <FontAwesome5 name="birthday-cake" size={16} color={Colors.purple} />
                            <View style={styles.profileDetailText}>
                                <Text style={styles.profileDetailLabel}>Date of Birth</Text>
                                <Text style={styles.profileDetailValue}>
                                    {moment(profile.dob).format('DD MMMM YYYY')}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.profileDetailItem}>
                            <FontAwesome5 name="calendar-plus" size={16} color={Colors.purple} />
                            <View style={styles.profileDetailText}>
                                <Text style={styles.profileDetailLabel}>Member Since</Text>
                                <Text style={styles.profileDetailValue}>
                                    {moment(profile.createdAt).format('DD MMMM YYYY')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Update Profile Button */}
            {profile && (
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={openUpdateModal}
                    >
                        <FontAwesome5 name="edit" size={16} color={Colors.white} />
                        <Text style={styles.updateButtonText}>Update Profile</Text>
                    </TouchableOpacity>
                </View>
            )}

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
                                        onPress: async () => {
                                            try {
                                                await authApi.logout();
                                                Toast.show({
                                                    type: 'success',
                                                    text1: 'Logged out successfully! 👋',
                                                    text2: 'See you again soon',
                                                    visibilityTime: 3000,
                                                });
                                                router.replace('/(auth)/login');
                                            } catch (error) {
                                                Toast.show({
                                                    type: 'error',
                                                    text1: 'Logout failed',
                                                    text2: 'Please try again',
                                                    visibilityTime: 3000,
                                                });
                                            }
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

            {/* Update Profile Modal */}
            <Modal
                visible={isUpdateModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsUpdateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Profile</Text>
                            <TouchableOpacity
                                onPress={() => setIsUpdateModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <FontAwesome5 name="times" size={20} color={Colors.gray} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Username</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={updateFormData.username}
                                    onChangeText={(text) => setUpdateFormData({ ...updateFormData, username: text })}
                                    placeholder="Enter username"
                                    placeholderTextColor={Colors.gray}
                                    editable={!isUpdating}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={updateFormData.email}
                                    onChangeText={(text) => setUpdateFormData({ ...updateFormData, email: text })}
                                    placeholder="Enter email"
                                    placeholderTextColor={Colors.gray}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isUpdating}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Date of Birth (DD/MM/YYYY)</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={updateFormData.dob}
                                    onChangeText={(text) => setUpdateFormData({ ...updateFormData, dob: text })}
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor={Colors.gray}
                                    editable={!isUpdating}
                                />
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsUpdateModalVisible(false)}
                                disabled={isUpdating}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, isUpdating && styles.buttonDisabled]}
                                onPress={handleUpdateProfile}
                                disabled={isUpdating}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isUpdating ? 'Updating...' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    profileDetailsContainer: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 16,
    },
    profileDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray + '20',
    },
    profileDetailText: {
        marginLeft: 12,
        flex: 1,
    },
    profileDetailLabel: {
        fontSize: 12,
        color: Colors.gray,
        marginBottom: 2,
    },
    profileDetailValue: {
        fontSize: 16,
        color: Colors.white,
        fontWeight: '500',
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.purple,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 15,
        alignSelf: 'flex-start',
    },
    updateButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: Colors.black,
        borderRadius: 15,
        width: '80%',
        maxWidth: 400,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.white,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.white,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    closeButton: {
        padding: 5,
    },
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: Colors.gray,
        marginBottom: 5,
    },
    modalInput: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.white,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: Colors.purple,
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: Colors.gray,
    },
    cancelButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
}); 