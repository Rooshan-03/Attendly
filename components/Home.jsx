import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase.config.js';
import { getClasses, addClass, updateClass, deleteClass } from '../apiServices/classService';
import { Ionicons } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS + 1) * 2) / NUM_COLUMNS;

const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
};

const AVATAR_COLORS = [
    '#4F86C6', '#5BAD6F', '#C4774B', '#9B6DC5',
    '#C45B7B', '#4BADC4', '#C4B44B', '#6B9E6B',
];

const getAvatarColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const Home = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [className, setClassName] = useState('');
    const [classes, setClasses] = useState([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loadingAddMore, setLoadingAddMore] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [updateClassName, setUpdateClassName] = useState('')
    const [updateModalVisible, setUpdateModalVisible] = useState(false)
    const [classItemId, setClassItemId] = useState('')

    const storedUser = useSelector(state => state.app.user);

    const openItemMenu = (id) => setSelectedItemId(id)
    const closeItemMenu = () => setSelectedItemId(null)

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            return;
        }
        const fetchClasses = async () => {
            const classesArray = await getClasses(uid);
            setLoadingClasses(false);
            setClasses(classesArray);
        }
        fetchClasses();
    }, [])

    const handleSubmit = async () => {
        if (!className.trim()) {
            alert('Please enter a class name');
            return;
        }
        setLoadingSubmit(true);
        setLoadingAddMore(true);
        try {
            if (classes.some(c => c.className.toLowerCase() === className.trim().toLowerCase())) {
                alert('This class already exists!');
                return;
            }
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const newClassData = { className };
            const newId = await addClass(uid, className);

            setClasses(prev => [...prev, { id: newId, ...newClassData }]);
            setClassName('');
        } catch (error) {
            Alert.alert('Error', 'Error Adding Class')
        } finally {
            setLoadingSubmit(false);
            setLoadingAddMore(false);
        }
    };

    const handleUpdateClass = async () => {
        setClassItemId(selectedItemId)
        closeItemMenu()
        setUpdateModalVisible(true)
    }

    const deleteClassItem = async (classId) => {
        Alert.alert('Warning',
            'Are You sure you want to delete this Class?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Ok',
                    onPress: async () => {
                        const uid = auth.currentUser.uid;
                        await deleteClass(uid, classId);
                        setClasses(prev => prev.filter(c => c.id !== classId));
                    }
                }
            ]
        )
    }

    const RenderClass = ({ item }) => {
        const initials = getInitials(item.className);
        const avatarColor = getAvatarColor(item.className);

        return (
            <TouchableOpacity
                className="bg-white rounded-[14px] p-3.5 min-h-[120px] shadow-sm shadow-black/10 elevation-2"
                style={{ width: CARD_WIDTH, margin: CARD_MARGIN }}
                onPress={() => navigation.navigate('ClassData', { className: item.className, classId: item.id })}
                activeOpacity={0.85}
            >
                {/* Three-dot menu — top-right corner */}
                <View className="absolute top-1.5 right-1 z-10">
                    <Menu
                        visible={selectedItemId === item.id}
                        onDismiss={closeItemMenu}
                        anchor={
                            <TouchableOpacity
                                onPress={() => openItemMenu(item.id)}
                                className="p-1.5"
                                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            >
                                <Ionicons name="ellipsis-vertical" size={16} color="grey" />
                            </TouchableOpacity>
                        }
                    >
                        <Menu.Item title='Update' onPress={() => handleUpdateClass()} />
                        <Menu.Item title='Delete' onPress={() => deleteClassItem(item.id)} />
                    </Menu>
                </View>

                {/* Initials circle */}
                <View
                    className="w-[52px] h-[52px] rounded-full items-center justify-center mb-2.5 mt-1"
                    style={{ backgroundColor: avatarColor }}
                >
                    <Text className="text-white font-bold text-[17px] tracking-[0.5px]">
                        {initials}
                    </Text>
                </View>

                {/* Class name */}
                <Text
                    className="text-sm font-semibold text-slate-800"
                    numberOfLines={2}
                >
                    {item.className}
                </Text>
            </TouchableOpacity>
        );
    };

    const handleUpdateSubmit = async () => {
        if (!updateClassName.trim()) {
            alert('Please Enter Class Name')
            return;
        }
        const uid = auth.currentUser.uid;
        await updateClass(uid, classItemId, updateClassName);
        setClasses(prev =>
            prev.map(c => c.id === classItemId ? { ...c, className: updateClassName } : c)
        )
        closeItemMenu()
        setUpdateModalVisible(false)
        setUpdateClassName('')
        setUpdateModalVisible(false)
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" backgroundColor="#1a1f36" />
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="w-4/5 bg-white rounded-xl p-6 items-center">
                        <Text className="text-lg font-bold mb-4 text-center">Enter Class Name:</Text>
                        <TextInput
                            placeholder="Class Name"
                            value={className}
                            onChangeText={setClassName}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                        />

                        <View className="flex-row justify-between w-full mb-3">
                            <TouchableOpacity
                                className="w-[48%] bg-green-500 rounded-md py-2"
                                onPress={async () => {
                                    await handleSubmit();
                                    setModalVisible(true);
                                }}
                            >
                                {loadingAddMore ? (
                                    <ActivityIndicator size="small" color="#192130" />
                                ) : (
                                    <Text className="text-white font-bold text-center">Add More</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="w-[48%] bg-blue-500 rounded-md py-2"
                                onPress={async () => {
                                    await handleSubmit();
                                    setModalVisible(false);
                                }}
                            >
                                {loadingSubmit ? (
                                    <ActivityIndicator size="small" color="#192130" />
                                ) : (
                                    <Text className="text-white font-bold text-center">Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className="w-full bg-gray-400 rounded-md py-2"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-white font-bold text-center">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for updation of className */}
            <Modal
                animationType="slide"
                transparent
                visible={updateModalVisible}
                onRequestClose={() => setUpdateModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">

                    <View className='flex items-center justify-center p-6 m-3 bg-white w-[95%] rounded-lg '>
                        <Text className='font-sens font-bold m-3'>Edit Class Name</Text>

                        <TextInput
                            placeholder='Class Name to edit'
                            value={updateClassName}
                            onChangeText={setUpdateClassName}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 mb-3'
                        />
                        <View className='w-full'>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-green-500 flex items-center p-2 justify-center' onPress={handleUpdateSubmit} >
                                <Text className='text-white font-bold '>
                                    Update
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity className='w-full rounded-lg m-1 bg-slate-500 flex items-center p-2 justify-center' onPress={() => { setUpdateModalVisible(false), closeItemMenu }}>
                                <Text className='text-white font-bold'>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom branded top bar */}
            <View className="bg-[#1a1f36] px-4 pt-4 pb-5 rounded-b-[24px]">
                {/* Row: hamburger + greeting + add button */}
                <View className="flex-row items-center justify-between">
                    {/* Hamburger */}
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="w-[38px] h-[38px] rounded-[10px] bg-white/10 items-center justify-center"
                    >
                        <Ionicons name="menu" size={22} color="#fff" />
                    </TouchableOpacity>

                    {/* App title */}
                    <Text className="text-xl font-extrabold text-white tracking-[0.5px]">
                        Attendly
                    </Text>

                    {/* Add class button */}
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="w-[38px] h-[38px] rounded-[10px] bg-blue-500 items-center justify-center"
                    >
                        <Ionicons name="add" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Greeting row below */}
                {storedUser && (
                    <View className="mt-3.5">
                        <Text className="text-[13px] text-slate-400">Welcome back,</Text>
                        <Text className="text-[17px] font-bold text-white mt-0.5">
                            {storedUser.name}
                        </Text>
                    </View>
                )}
            </View>

            {loadingClasses ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="blue" />
                </View>
            ) : classes.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500 font-bold text-xl">No Classes Yet..</Text>
                </View>
            ) : (
                <FlatList
                    data={classes}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <RenderClass item={item} />}
                    numColumns={NUM_COLUMNS}
                    contentContainerStyle={{ padding: CARD_MARGIN }}
                    className="flex-1"
                />
            )}

        </SafeAreaView>
    );
};

export default Home;