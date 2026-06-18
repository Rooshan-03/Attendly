import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useCallback, useMemo, useState } from 'react'
import { useFocusEffect, useRoute } from '@react-navigation/native'
import { auth } from '../firebase.config.js';
import { getClassName, getStudents } from '../apiServices/studentService';
import { getAttendance, submitAttendance } from '../apiServices/attendanceService';
import RadioButton from './RadioButton'
import { Ionicons } from '@expo/vector-icons';

const MarkAttendance = ({ navigation }) => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState('');
    //getting id and subject name using props from StudentsData Screen
    const { classId, subjectId, subjectName } = useRoute().params

    const uid = auth.currentUser.uid

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    if (!uid) {
                        return
                    }
                    const fetchedClassName = await getClassName(uid, classId);
                    setClassName(fetchedClassName);

                    const studentsArray = await getStudents(uid, classId, subjectId);
                    const list = studentsArray.map(s => ({
                        ...s,
                        Attendance: "P"
                    }));
                    setStudents(list);
                    setLoading(false);
                } catch (error) {
                    Alert.alert("Error", "Something Went Wrong!")
                }
            }
            fetchData()
        }, [])
    );

    const updateStatus = useCallback((studentId, value) => {
        setStudents(prev =>
            prev.map(s => s.id === studentId ? { ...s, Attendance: value } : s)
        );
    }, []);

    const showDialog = () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to Submit Attendance?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => handleSubmitAttendance() }
            ],
            { cancelable: true }
        );
    };

    const getReadableDate = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getFormattedTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const mins = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${mins} ${ampm}`;
    }

    const handleSubmitAttendance = async () => {
        setLoading(true);
        const Date = getReadableDate();

        const existingAttendance = await getAttendance(uid, classId, subjectId, Date);
        if (existingAttendance) {
            setLoading(false)
            alert(`Attendance Taken For ${Date}`)
            navigation.navigate('ShowAttendance', { subjectId, classId })
            return
        }

        let checkMissingStudents = students.some(s => s.Attendance == null);
        if (checkMissingStudents) {
            setLoading(false)
            Alert.alert("Error", "Please Mark Attendance for All students")
            return;
        }

        try {
            await submitAttendance(uid, classId, subjectId, Date, students);
            setLoading(false)
            alert('Attendance marked successfully!');
            navigation.navigate('ShowAttendance', { subjectId, classId })
        } catch (error) {
            setLoading(false)
            console.error("Error marking attendance:", error);
            alert('Failed to mark attendance.');
        }
    };

    const present = React.useMemo(() => students.filter(s => s.Attendance === "P").length, [students]);
    const Absent = React.useMemo(() => students.filter(s => s.Attendance === "A").length, [students]);
    const Leave = React.useMemo(() => students.filter(s => s.Attendance === "L").length, [students]);

    const RenderItem = useMemo(() => {
        const Item = React.memo(({ item, number }) => {
            const onP = () => updateStatus(item.id, "P");
            const onA = () => updateStatus(item.id, "A");
            const onL = () => updateStatus(item.id, "L");
            return (
                <View className="w-full bg-white p-2 flex-row border-b-[0.3px] border-slate-200">
                    <View className=" p-2  mr-4">
                        <Text>{number + 1}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-800">{item.Name}</Text>
                        <Text className="text-xs text-gray-500"> {item.RollNo}</Text>
                    </View>
                    <View className='flex justify-center items-center flex-row'>
                        <RadioButton
                            label={'P'}
                            color={'bg-gray-300'}
                            textColor={'text-green-700'}
                            selectedColor={'bg-green-200'}
                            onPress={onP}
                            selected={item.Attendance === "P"}
                        />
                        <RadioButton
                            label={'A'}
                            color={'bg-gray-200'}
                            selectedColor={'bg-red-200'}
                            textColor={'text-red-700'}
                            onPress={onA}
                            selected={item.Attendance === "A"}
                        />
                        <RadioButton
                            label={'L'}
                            color={'bg-gray-200'}
                            selectedColor={'bg-yellow-200'}
                            textColor={'text-yellow-600'}
                            onPress={onL}
                            selected={item.Attendance === "L"}
                        />
                    </View>
                </View>
            )
        })
        return Item;
    }, [updateStatus])

    return (
        <SafeAreaView className='flex-1 bg-slate-50'>
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
                    Mark Attendance
                </Text>

                <View className="w-[38px]" />
            </View>

            {loading ? (
                <View className='flex-1 justify-center items-center'>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <View className="flex-1 items-center">
                {/* Top View for Details */}
                <View className='w-[95%] flex flex-col mt-2 p-2 rounded-md border border-blue-200 bg-blue-200/90 '>
                    {/* First row(Class Name and subjectName) */}
                    <View className='flex flex-row justify-between mx-5'>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='people-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{className}</Text>
                        </View>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='book-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{subjectName}</Text>
                        </View>
                    </View>
                    {/* 2nd row time and date */}
                    <View className='flex flex-row justify-between mx-5'>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='today-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{getReadableDate()}</Text>
                        </View>
                        <View className='flex flex-row px-3 m-2'>
                            <Ionicons name='time-outline' className='mx-1' color={'#2563EB'} size={12} />
                            <Text className='text-xs text-blue-700 font-bold'>{getFormattedTime()}</Text>
                        </View>
                    </View>
                </View>
                {/* Attendance Details*/}
                <View className='w-[95%] flex flex-row mt-2 mx-2 justify-center items-center'>
                    {/* present students */}
                    <View className='w-[30%] m-2 h-20 bg-white rounded-lg p-3  '>
                        <Text className='text-gray-500 font-semibold'>Present</Text>
                        <View className='mt-3 flex flex-row'>
                            <View className='w-3 h-3 bg-green-600 rounded-full' />
                            <Text className='text-xs pl-1'>{present}</Text>
                        </View>
                    </View>
                    {/* Absent Students */}
                    <View className='w-[30%] m-2 h-20 bg-white rounded-lg p-3'>
                        <Text className='font-semibold text-gray-500 '>Absent</Text>
                        <View className='mt-3 flex flex-row'>
                            <View className='w-3 h-3 bg-red-600 rounded-full' />
                            <Text className='text-xs pl-1'>{Absent}</Text>
                        </View>
                    </View>
                    {/* Students On leave */}
                    <View className='w-[30%] m-2 h-20 bg-white rounded-lg p-3'>
                        <Text className='font-semibold text-gray-500 '>Leave</Text>
                        <View className='mt-3 flex flex-row'>
                            <View className='w-3 h-3 bg-yellow-400 rounded-full' />
                            <Text className='text-xs pl-1'>{Leave}</Text>
                        </View>
                    </View>
                </View>
                {/* Flatlist started */}
                <View className="w-[95%] h-4/5 mt-3 pb-40" >
                    <FlatList
                        className='rounded-md'
                        data={students}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <RenderItem
                                item={item}
                                number={index}
                            />
                        )
                        }

                    />
                </View>
                <View className='bg-white w-full h-28 absolute bottom-0 '>
                    <TouchableOpacity className="top-0 mx-6 h-12 flex flex-row justify-center bg-blue-400  rounded-md mt-5 items-center" onPress={showDialog}>
                        <Ionicons name='send' color={"#fff"} size={20} />
                        <Text className="text-white ml-2 font-sens text-xl">
                            Submit Attendance
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            )}
        </SafeAreaView>
    )
}

export default MarkAttendance;