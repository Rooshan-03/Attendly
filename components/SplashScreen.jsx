import React, { useEffect, useRef } from 'react';
import { View, Image, Text, Animated, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../assets/AppIcon.png';
import { useSelector } from 'react-redux';

const SplashScreen = ({ navigation }) => {
    const isLoggedIn = useSelector(state => state.app.isLoggedIn);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Start animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();

        // Navigate after delay
        const timer = setTimeout(() => {
            if (isLoggedIn) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "HomeDrawer" }],
                });
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                });
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, isLoggedIn, navigation]);

    return (
        <SafeAreaView className="flex-1 bg-[#1a1f36]">
            <StatusBar barStyle="light-content" backgroundColor="#1a1f36" />
            <View className="flex-1 justify-center items-center">
                <Animated.View
                    className="items-center"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }}
                >
                    {/* Logo wrapper with shadow */}
                    <View className="shadow-2xl shadow-black/50 elevation-10 bg-white rounded-3xl p-1 mb-6">
                        <Image
                            source={AppIcon}
                            className="w-[120px] h-[120px] rounded-3xl"
                            resizeMode="contain"
                        />
                    </View>

                    {/* Brand Name */}
                    <Text className="text-4xl font-extrabold text-white tracking-[1px] mb-2">
                        Attendly
                    </Text>

                    {/* Tagline */}
                    <Text className="text-sm text-slate-400 tracking-[0.5px] font-medium">
                        Track attendance, effortlessly.
                    </Text>
                </Animated.View>
            </View>


        </SafeAreaView>
    );
};

export default SplashScreen;