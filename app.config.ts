import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'visura',
    slug: 'visura',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
        image: './assets/images/visura-logo.png',
        resizeMode: 'contain',
        backgroundColor: '#8B5CF6'
    },
    updates: {
        fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
        '**/*'
    ],
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.visura.app'
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/images/visura-logo.png',
            backgroundColor: '#8B5CF6'
        },
        package: 'com.visura.app'
    },
    extra: {
        eas: {
            projectId: 'your-project-id'
        }
    },
    plugins: [
        'expo-router'
    ],
    experiments: {
        typedRoutes: true
    },
    owner: 'your-expo-username',
}); 