import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text className="text-2xl font-bold">Settings Screen</Text>
      <Text className="mt-2.5 text-base text-[#666]">This is where application settings will be managed.</Text>
    </SafeAreaView>
    );
};

export default SettingsScreen;
