import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../utils/Colors';
import { authApi } from '../../utils/api';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dobInput, setDobInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateDate = (dateStr: string) => {
        // Check format DD/MM/YYYY
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(regex);
        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Create date object and verify valid date
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== day || date.getMonth() + 1 !== month || date.getFullYear() !== year) {
            return false;
        }

        // Check if date is not in future
        if (date > new Date()) {
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword || !dobInput) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Passwords do not match',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        if (!validateDate(dobInput)) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a valid date in DD/MM/YYYY format',
                position: 'bottom',
                visibilityTime: 3000,
            });
            return;
        }

        try {
            setIsLoading(true);
            const [day, month, year] = dobInput.split('/').map(Number);
            // Format dob as YYYY-MM-DD string for backend
            const dobString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            console.log("CheckData", username);
            console.log("CheckData", email);
            console.log("CheckData", password);
            console.log("CheckData", dobString);

            await authApi.register({
                username,
                email,
                password,
                dob: dobString,
            });


            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Registration successful! Please login to continue.',
                position: 'bottom',
                visibilityTime: 3000,
            });
            //redirect đến login
            router.replace("/(auth)/login");
        } catch (error: any) {
            console.log("Check error", error)
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: message,
                position: 'bottom',
                visibilityTime: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentContainer}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/visura-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            placeholderTextColor="#666"
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholderTextColor="#666"
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#666"
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholderTextColor="#666"
                            editable={!isLoading}
                        />

                        <View style={styles.dateInputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Date of Birth (DD/MM/YYYY)"
                                value={dobInput}
                                onChangeText={setDobInput}
                                keyboardType="numeric"
                                placeholderTextColor="#666"
                                editable={!isLoading}
                                maxLength={10}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Creating Account...' : 'Register'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity disabled={isLoading}>
                                    <Text style={styles.loginLink}>Login</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 150,
        height: 150,
    },
    formContainer: {
        width: '100%',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        color: Colors.white,
    },
    dateInputContainer: {
        marginBottom: 5,
    },
    dateHint: {
        color: '#666',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 15,
        marginLeft: 15,
    },
    button: {
        backgroundColor: Colors.purple,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 16,
        color: '#666',
    },
    loginLink: {
        fontSize: 16,
        color: Colors.purple,
        fontWeight: '600',
    },
}); 