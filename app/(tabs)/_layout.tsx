import { Colors } from '@/utils/Colors';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.purple,
                tabBarInactiveTintColor: Colors.gray,
                tabBarStyle: {
                    backgroundColor: Colors.black,
                    borderTopColor: Colors.white,
                    borderTopWidth: 0.5,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 5,
                },
                headerShown: false,
            }}>
            <Tabs.Screen
                name="libraries"
                options={{
                    title: 'Libraries',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="photo-library" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: 'AI Generator',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="magic" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="user-circle" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
} 