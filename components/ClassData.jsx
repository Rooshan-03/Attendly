import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import { auth } from '../firebase.config.js';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../apiServices/subjectService';

const ClassData = ({ navigation }) => {
  const { className, classId } = useRoute().params;

  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [updateSubjectName, setUpdateSubjectName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [id, setId] = useState('');

  const [isLoading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null); // 'submit' | 'addMore' | null

  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const subjectArray = await getSubjects(uid, classId);
        setSubjects(subjectArray);
      } catch (error) {
        Alert.alert('Error', 'Unknown Error Occurred While fetching subjects');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [classId]);



  const handleSubmitSubject = async (actionType) => {
    if (!subjectName.trim()) {
      Alert.alert('Validation Error', 'Please Enter Subject Name:');
      return;
    }

    setLoadingAction(actionType);

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const newSubjectData = { subjectName: subjectName.trim() };
      const newId = await addSubject(uid, classId, subjectName.trim());
      setSubjects((prev) => [...prev, { id: newId, ...newSubjectData }]);

      setSubjectName('');
      if (actionType === 'submit') {
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not add subject');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!updateSubjectName.trim()) {
      Alert.alert('Validation Error', 'Please Enter Subject Name');
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const updatedData = { subjectName: updateSubjectName.trim() };
      await updateSubject(uid, classId, id, updateSubjectName.trim());
      setSubjects(prev =>
        prev.map(s => s.id === id ? { ...s, ...updatedData } : s)
      );

      setUpdateSubjectName('');
      setUpdateModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Could not update subject');
    }
  };

  const deleteSubjectItem = (subjectId) => {
    Alert.alert('Warning', 'Are you sure you want to delete this subject?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            await deleteSubject(uid, classId, subjectId);
            setSubjects(prev => prev.filter(s => s.id !== subjectId));
          } catch (error) {
            Alert.alert('Error', 'Could not delete subject');
          }
        },
      },
    ]);
  };

  const openUpdateModal = (item) => {
    setId(item.id);
    setUpdateSubjectName(item.subjectName);
    setSelectedItemId(null);
    setUpdateModalVisible(true);
  };

  const renderSubjectItem = useCallback(({ item }) => {
    const isMenuOpen = selectedItemId === item.id;
    return (
      <TouchableOpacity
        className="mx-3 my-1 bg-white rounded-2xl shadow-md flex-row items-center p-3"
        onPress={() => navigation.navigate('StudentsData', { subjectId: item.id, subjectName: item.subjectName, classId })}
      >
        <View className="w-8 h-8 bg-blue-100 rounded-full justify-center items-center mr-3">
          <Ionicons name="book-outline" size={18} color="#2563EB" />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">{item.subjectName}</Text>
        </View>
        <Menu
          visible={isMenuOpen}
          onDismiss={() => setSelectedItemId(null)}
          anchor={
            <TouchableOpacity onPress={() => setSelectedItemId(item.id)} className="pl-3 rounded-full w-10 h-7">
              <Ionicons name="ellipsis-vertical" size={18} color="grey" />
            </TouchableOpacity>
          }
        >
          <Menu.Item title="Update" onPress={() => openUpdateModal(item)} />
          <Menu.Item title="Delete" onPress={() => deleteSubjectItem(item.id)} />
        </Menu>
      </TouchableOpacity>
    );
  }, [selectedItemId, classId, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Custom Header */}
      <View className="bg-[#1a1f36] flex-row items-center justify-between px-4 pt-4 pb-5 rounded-b-[24px] mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-[38px] h-[38px] rounded-[10px] bg-white/10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text className="text-[18px] font-bold text-white tracking-[0.3px]">
          {className || 'Class Data'}
        </Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-[38px] h-[38px] rounded-[10px] bg-white/10 items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Update Subject Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={updateModalVisible}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="flex items-center justify-center p-6 m-3 bg-white w-[95%] rounded-lg">
            <Text className="font-sans font-bold m-3">Edit Subject Name</Text>

            <TextInput
              placeholder="Subject Name to edit"
              value={updateSubjectName}
              onChangeText={setUpdateSubjectName}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />
            <View className="w-full">
              <TouchableOpacity className="w-full rounded-lg m-1 bg-green-500 flex items-center p-2 justify-center" onPress={handleUpdateSubmit}>
                <Text className="text-white font-bold">Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full rounded-lg m-1 bg-slate-500 flex items-center p-2 justify-center"
                onPress={() => {
                  setSelectedItemId(null);
                  setUpdateModalVisible(false);
                }}
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white rounded-lg items-center p-6">
            <Text className="text-lg font-bold mb-4 text-center">Enter Subject Name</Text>
            <TextInput
              placeholder="Subject"
              value={subjectName}
              onChangeText={setSubjectName}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />
            <View className="flex-row justify-between w-full">
              <TouchableOpacity
                className="w-[48%] bg-green-500 rounded-md py-2 mb-2 justify-center items-center"
                onPress={() => handleSubmitSubject('addMore')}
                disabled={!!loadingAction}
              >
                {loadingAction === 'addMore' ? (
                  <ActivityIndicator size="small" color="#192130" />
                ) : (
                  <Text className="text-white font-bold">Add More</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="w-[48%] bg-blue-500 rounded-md py-2 mb-2 justify-center items-center"
                onPress={() => handleSubmitSubject('submit')}
                disabled={!!loadingAction}
              >
                {loadingAction === 'submit' ? (
                  <ActivityIndicator size="small" color="#192130" />
                ) : (
                  <Text className="text-white font-bold">Submit</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="w-full bg-gray-400 rounded-md py-2 mt-2"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-center font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size={50} color="blue" />
          </View>
        ) : subjects.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 font-extrabold">No subjects Added Yet</Text>
          </View>
        ) : (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id}
            renderItem={renderSubjectItem}
            className="flex-1 mt-3"
          />
        )}
      </View>
    </SafeAreaView>
    );
};

export default ClassData;