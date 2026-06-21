import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { updateUserInDB } from '../apiServices/userService'
import { auth } from '../firebase.config.js';
import { ActivityIndicator } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

const ProfileScreen = ({ navigation }) => {
  const userDetail = useSelector(state => state.app.user);

  const [userName, setUserName] = useState(userDetail?.name || '');
  const [email, setEmail] = useState(userDetail?.email || '');
  const [number, setNumber] = useState(userDetail?.number || '');

  const updateProfileData = () => {
    if (userDetail.name === userName && userDetail.email === email && userDetail.number === number) {
      Alert.alert('Warning', 'Please Change details to update profile')
    }
    else {
      Alert.alert('Warning',
        'Are You sure you want to update profile',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Ok',
            onPress: async () => {
              const uid = auth.currentUser.uid;
              await updateUserInDB(uid, {
                email: email,
                name: userName,
                number: number,
              });
              Alert.alert('Success!', 'Profile Updated');
            }
          }
        ]
      )
    }
  }

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  if (!userDetail) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#1a1f36" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="flex-grow">
        <StatusBar barStyle="light-content" backgroundColor="#1a1f36" />

        {/* Custom top bar with hamburger */}
        <View className="bg-[#1a1f36] flex-row items-center justify-between px-4 py-3.5">
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-[38px] h-[38px] rounded-[10px] bg-white/10 items-center justify-center"
          >
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-white tracking-[0.3px]">Profile</Text>
          {/* Spacer to balance the hamburger */}
          <View className="w-[38px]" />
        </View>

        {/* Profile header banner */}
        <View className="bg-[#1a1f36] items-center pt-9 pb-8 rounded-b-[32px]">
          <View className="w-[76px] h-[76px] rounded-full bg-blue-500 items-center justify-center mb-3">
            <Text className="text-white text-[26px] font-extrabold tracking-[0.5px]">{getInitials(userDetail.name)}</Text>
          </View>
          <Text className="text-[18px] font-bold text-white mb-1">{userDetail.name}</Text>
          <Text className="text-[13px] text-slate-400">{userDetail.email}</Text>
        </View>

        {/* Form card */}
        <View className="m-5 bg-white rounded-[20px] p-6 shadow-lg shadow-black/5 elevation-3">
          <Text className="text-base font-bold text-slate-800 mb-5">Edit Profile</Text>

          {/* User Name */}
          <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.9px] mb-1.5">User Name</Text>
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-1.5"
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View className="h-[1px] bg-slate-200 mb-0.5" />

          {/* Email */}
          <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.9px] mb-1.5 mt-5">Email</Text>
          <View className="flex-row items-center">
            <Ionicons name="mail-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-1.5"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View className="h-[1px] bg-slate-200 mb-0.5" />

          {/* Number */}
          <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.9px] mb-1.5 mt-5">Phone Number</Text>
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-1.5"
              value={number}
              onChangeText={setNumber}
              placeholder="Enter your number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
          <View className="h-[1px] bg-slate-200 mb-0.5" />

          {/* Update button */}
          <TouchableOpacity className="bg-[#1a1f36] rounded-[14px] py-3.5 items-center justify-center mt-7 shadow-lg shadow-[#1a1f36]/20 elevation-4" onPress={updateProfileData} activeOpacity={0.85}>
            <Text className="text-white text-[15px] font-bold tracking-[0.3px]">Update Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen