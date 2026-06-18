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
import Icon from 'react-native-vector-icons/Ionicons';
import { signupUser } from '../apiServices/authService';
import { saveUserToDB } from '../apiServices/userService';
import { auth } from '../firebase.config';
import AppIcon from '../assets/AppIcon.png';

const Signup = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    const { name, email, number, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !number.trim() || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const user = await signupUser(email.trim(), password);

      if (user) {
        const userData = {
          name: name.trim(),
          email: email.trim(),
          number: number.trim()
        };

        await storeDataInFirebase(userData);
      }
    } catch (error) {
      let message = "Something Went Wrong";
      if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
      else if (error.code === 'auth/user-not-found') message = 'No user found with this email.';
      else if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      else if (error.code === 'auth/email-already-in-use') message = 'User with this Email already Registered.';

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const storeDataInFirebase = async (data) => {
    try {
      const uid = auth.currentUser.uid;

      await saveUserToDB(uid, data);

      setFormData({ name: '', email: '', number: '', password: '', confirmPassword: '' });

      Alert.alert('Verify Email', 'Please verify your email to proceed.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Cannot update user data.');
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
        <View className="bg-[#1a1f36] pt-[52px] pb-8 items-center rounded-b-[32px]">
          <Image source={AppIcon} className="w-[72px] h-[72px] mb-2.5" resizeMode="contain" />
          <Text className="text-2xl font-extrabold text-white tracking-[0.5px]">Attendly</Text>
          <Text className="text-[13px] text-slate-400 mt-1">Track attendance, effortlessly.</Text>
        </View>

        {/* Form area */}
        <View className="flex-1 px-7 pt-7 pb-8">
          <Text className="text-2xl font-bold text-slate-800 mb-1">Create account</Text>
          <Text className="text-sm text-slate-500 mb-6">Fill in your details to get started</Text>

          {/* Name */}
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1.5">Full Name</Text>
          <View className="flex-row items-center">
            <Icon name="person-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-2"
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
              value={formData.name}
              onChangeText={(val) => updateFormData('name', val)}
            />
          </View>
          <View className="h-[1px] bg-slate-200 mb-1" />

          {/* Email */}
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1.5 mt-[18px]">Email</Text>
          <View className="flex-row items-center">
            <Icon name="mail-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-2"
              placeholder="Enter your Gmail"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(val) => updateFormData('email', val)}
            />
          </View>
          <View className="h-[1px] bg-slate-200 mb-1" />

          {/* Phone Number */}
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1.5 mt-[18px]">Phone Number</Text>
          <View className="flex-row items-center">
            <Icon name="call-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-2"
              placeholder="Enter your number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={formData.number}
              onChangeText={(val) => updateFormData('number', val)}
            />
          </View>
          <View className="h-[1px] bg-slate-200 mb-1" />

          {/* Password */}
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1.5 mt-[18px]">Password</Text>
          <View className="flex-row items-center">
            <Icon name="lock-closed-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-2"
              placeholder="Enter password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(val) => updateFormData('password', val)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-1 py-1.5">
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <View className="h-[1px] bg-slate-200 mb-1" />

          {/* Confirm Password */}
          <Text className="text-xs font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1.5 mt-[18px]">Confirm Password</Text>
          <View className="flex-row items-center">
            <Icon name="lock-closed-outline" size={18} color="#94a3b8" className="mr-2.5" />
            <TextInput
              className="flex-1 text-[15px] text-slate-800 py-2"
              placeholder="Confirm password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(val) => updateFormData('confirmPassword', val)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="px-1 py-1.5">
              <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <View className="h-[1px] bg-slate-200 mb-1" />

          {/* Sign Up button */}
          <TouchableOpacity
            className={`bg-[#1a1f36] rounded-[14px] py-[15px] items-center justify-center mt-7 shadow-lg shadow-[#1a1f36] elevation-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold tracking-[0.3px]">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-5 items-center">
            <Text className="text-sm text-slate-500">
              Already have an account?{' '}
              <Text className="text-blue-500 font-bold">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;