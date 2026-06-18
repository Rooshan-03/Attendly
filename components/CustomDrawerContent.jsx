import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase.config.js';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setLoggedIn, clearUser } from '../store/appSlice';
import { logoutUser } from '../apiServices/authService';

const CustomDrawerContent = (props) => {
  const dispatch = useDispatch();
  const storedUser = useSelector(state => state.app.user);
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert('Warning',
      'Are You sure you want to Logout',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: async () => {
            await logoutUser();
            await AsyncStorage.removeItem('user');
            dispatch(setLoggedIn(false));
            dispatch(clearUser());
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        }
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Dark profile header */}
      <View className="bg-[#1a1f36] pt-[52px] pb-6 px-5 rounded-br-[24px]">
        {!storedUser ? (
          <View className="h-20 items-center justify-center">
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <>
            {/* Avatar circle with initials */}
            <View className="w-[60px] h-[60px] rounded-full bg-blue-500 items-center justify-center mb-3">
              <Text className="text-white text-[22px] font-extrabold tracking-[0.5px]">{getInitials(storedUser.name)}</Text>
            </View>

            <Text className="text-[17px] font-bold text-white mb-[3px]">{storedUser.name}</Text>
            <Text className="text-xs text-slate-400 mb-1.5">{storedUser.email}</Text>

            {storedUser.number ? (
              <View className="flex-row items-center gap-[5px]">
                <Ionicons name="call-outline" size={13} color="#94a3b8" />
                <Text className="text-xs text-slate-400 ml-1">{storedUser.number}</Text>
              </View>
            ) : null}
          </>
        )}
      </View>

      {/* Drawer navigation items */}
      <DrawerContentScrollView
        {...props}
        contentContainerClassName="pt-2"
      >
        <View className="px-4 pt-4 pb-1">
          <Text className="text-[11px] font-bold text-slate-400 tracking-[1.2px]">MENU</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout button at bottom */}
      <View className="px-4 pb-8">
        <View className="h-[1px] bg-slate-200 mb-3" />
        <TouchableOpacity
          className="flex-row items-center bg-white border border-red-200 rounded-xl py-3 px-4"
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" className="mr-2.5" />
          <Text className="text-red-500 font-bold text-[15px]">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawerContent;