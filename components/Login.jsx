import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setLoggedIn, setUser } from '../store/appSlice';
import { loginUser, sendPasswordReset } from '../apiServices/authService';
import { getUserFromDB } from '../apiServices/userService';
import { auth } from '../firebase.config.js';
import AppIcon from '../assets/AppIcon.png';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }
    handleLoginUser(email.trim(), password);
  };

  const handleLoginUser = async (email, password) => {
    try {
      setLoading(true);
      const user = await loginUser(email, password);

      if (!user.emailVerified) {
        Alert.alert('Email Not Verified', 'Please Verify Email Before Logging In');
        return;
      }

      await getDataFromRTDB();
      dispatch(setLoggedIn(true));

      navigation.reset({
        index: 0,
        routes: [{ name: "HomeDrawer" }],
      });
    } catch (error) {
      let message = "Something Went Wrong";
      if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (error.code === 'auth/user-not-found') message = 'No user found with this email.';
      else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') message = 'Incorrect email or password.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const getDataFromRTDB = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const user = await getUserFromDB(uid);

      if (user) {
        const userData = {
          email: user.email,
          name: user.name,
          number: user.number,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        dispatch(setUser(userData));
      } else {
        Alert.alert('Error', 'Failed to save user details. User not found.');
      }
    } catch (error) {
      Alert.alert('Error', `Error fetching user's data`);
    }
  };

  const changePassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      Alert.alert("Email Sent", "A password reset link has been sent to your email.");
    } catch (error) {
      Alert.alert('Error', 'Error Occurred. Try Again Later.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerClassName="flex-grow bg-slate-50"
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="light-content" backgroundColor="#1a1f36" />

        {/* Top accent area with logo */}
        <View className="bg-[#1a1f36] pt-[60px] pb-10 items-center rounded-b-[32px]">
          <Image source={AppIcon} className="w-20 h-20 mb-3" resizeMode="contain" />
          <Text className="text-[26px] font-extrabold text-white tracking-[0.5px]">Attendly</Text>
          <Text className="text-[13px] text-slate-400 mt-1">Track attendance, effortlessly.</Text>
        </View>

        {/* Form area */}
        <View className="flex-1 px-7 pt-9 pb-8">
          <Text className="text-2xl font-bold text-slate-800 mb-1">Welcome back</Text>
          <Text className="text-sm text-slate-500 mb-7">Sign in to continue</Text>

          {/* Email */}
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1.5">Email</Text>
          <View className="flex-row items-center">
            <Ionicons name="mail-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-2"
              placeholder="Enter your email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View className="h-[1px] bg-slate-200 mb-1" />

          {/* Password */}
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1.5 mt-5">Password</Text>
          <View className="flex-row items-center">
            <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-2"
              placeholder="Enter password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-1 py-1.5">
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <View className="h-[1px] bg-slate-200 mb-1" />

          {/* Forgot password */}
          <TouchableOpacity className="self-end mt-2.5 mb-7" onPress={changePassword}>
            <Text className="text-[13px] text-blue-500 font-semibold">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            className={`bg-[#1a1f36] rounded-[14px] py-[15px] items-center justify-center shadow-lg shadow-[#1a1f36] elevation-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold tracking-[0.3px]">Login</Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Signup */}
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-5 items-center">
            <Text className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Text className="text-blue-500 font-bold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
