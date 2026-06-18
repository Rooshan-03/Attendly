import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase.config';
import { getSubjectName, getAttendance } from '../apiServices/attendanceService';
import { useRoute } from '@react-navigation/native';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';


const ShowAttendance = ({ navigation }) => {
    const [presentStudents, setPresentStudents] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [subjectName, setSubjectName] = useState('');
    const { classId, subjectId } = useRoute().params;
    const uid = auth.currentUser?.uid;

    useEffect(() => {
        const fetchData = async () => {
            // Get subject name
            const fetchedSubjectName = await getSubjectName(uid, classId, subjectId);
            setSubjectName(fetchedSubjectName);

            // Get attendance
            const dateStr = getReadableDate();
            const data = await getAttendance(uid, classId, subjectId, dateStr);
            if (data) {
                const students = Object.values(data);
                setPresentStudents(students);
            }
            setLoading(false);
        };

        fetchData();
    }, []);



    const getReadableDate = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const exportToExcel = async () => {
        try {
            if (!presentStudents.length) {
                Alert.alert('No data', 'There are no students to export.');
                return;
            }
            const formattedData = presentStudents.map(student => ({
                Name: student.name,
                'Roll Number': student.rollNo,
                Attendance: student.Attendance
            }));

            const sheetName = `${subjectName} ${getReadableDate()}`;
            const ws = XLSX.utils.json_to_sheet(formattedData, { header: ['Name', 'Roll Number', 'Attendance'] });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const filePath = FileSystem.documentDirectory + `${sheetName}.xlsx`;

            await FileSystem.writeAsStringAsync(filePath, wbout, {
                encoding: 'base64',
            });

            await Sharing.shareAsync(filePath, {
                mimeType:
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Export Attendance',
                UTI: 'com.microsoft.excel.xlsx',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to export Excel file');
        }
    };

    const downloadExcel = async () => {
        try {
            if (!presentStudents.length) {
                Alert.alert('No data', 'There are no students to download.');
                return;
            }
            const formattedData = presentStudents.map(student => ({
                Name: student.name,
                'Roll Number': student.rollNo,
                Attendance: student.Attendance
            }));

            const sheetName = `${subjectName} ${getReadableDate()}`;
            const ws = XLSX.utils.json_to_sheet(formattedData, { header: ['Name', 'Roll Number', 'Attendance'] });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
                const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    `${sheetName}.xlsx`,
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
                Alert.alert('Success', 'File downloaded successfully');
            } else {
                // Fallback if permission is not granted or on iOS
                const filePath = FileSystem.documentDirectory + `${sheetName}.xlsx`;
                await FileSystem.writeAsStringAsync(filePath, wbout, { encoding: FileSystem.EncodingType.Base64 });
                await Sharing.shareAsync(filePath, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: 'Download Attendance',
                    UTI: 'com.microsoft.excel.xlsx',
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to download Excel file');
        }
    };


    if (isLoading) {
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
                        Loading...
                    </Text>

                    <View className="w-[38px]" />
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" />
                </View>
            </SafeAreaView>
        );
    }

    const RenderStudents = ({ item }) => {
        const getStatusText = (status) => {
            if (status === 'P') return 'Present';
            if (status === 'A') return 'Absent';
            if (status === 'L') return 'Leave';
            return status || 'N/A';
        };

        const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';

        return (
            <View className="bg-white rounded-[20px] p-4 mb-3 mx-4 shadow-sm shadow-black/5 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-slate-50 rounded-full items-center justify-center mr-3">
                        <Text className="text-lg font-bold text-slate-400">{initial}</Text>
                    </View>
                    <View>
                        <Text className="text-[16px] font-extrabold text-slate-800 mb-0.5 tracking-tight">{item.name}</Text>
                        <Text className="text-xs font-medium text-slate-400">Roll No: {item.rollNo}</Text>
                    </View>
                </View>
                {item.Attendance === 'P' && (
                    <View className="px-3 py-1.5 rounded-full bg-green-50">
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-green-600">{getStatusText(item.Attendance)}</Text>
                    </View>
                )}
                {item.Attendance === 'A' && (
                    <View className="px-3 py-1.5 rounded-full bg-red-50">
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-red-600">{getStatusText(item.Attendance)}</Text>
                    </View>
                )}
                {item.Attendance === 'L' && (
                    <View className="px-3 py-1.5 rounded-full bg-orange-50">
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600">{getStatusText(item.Attendance)}</Text>
                    </View>
                )}
                {item.Attendance !== 'P' && item.Attendance !== 'A' && item.Attendance !== 'L' && (
                    <View className="px-3 py-1.5 rounded-full bg-slate-50">
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">{getStatusText(item.Attendance)}</Text>
                    </View>
                )}
            </View>
        );
    };


    const presentCount = presentStudents.filter(s => s.Attendance === 'P').length;
    const absentCount = presentStudents.filter(s => s.Attendance === 'A').length;
    const leaveCount = presentStudents.filter(s => s.Attendance === 'L').length;

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
                    {subjectName || 'Attendance'}
                </Text>

                <View className="w-[38px]" />
            </View>

            <View className="px-6 pt-5 pb-3 flex-row justify-between items-center">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance List</Text>
                <Text className="text-xs font-bold text-slate-400">{getReadableDate()}</Text>
            </View>

            {/* Summary Statistics */}
            <View className="flex-row justify-between px-4 pb-4 mt-2">
                <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm shadow-black/5 items-center">
                    <Text className="text-2xl font-black text-slate-800 tracking-tighter">{presentCount}</Text>
                    <View className="flex-row items-center mt-1.5">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present</Text>
                    </View>
                </View>
                <View className="flex-1 bg-white rounded-2xl p-4 mx-1 shadow-sm shadow-black/5 items-center">
                    <Text className="text-2xl font-black text-slate-800 tracking-tighter">{absentCount}</Text>
                    <View className="flex-row items-center mt-1.5">
                        <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Absent</Text>
                    </View>
                </View>
                <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm shadow-black/5 items-center">
                    <Text className="text-2xl font-black text-slate-800 tracking-tighter">{leaveCount}</Text>
                    <View className="flex-row items-center mt-1.5">
                        <View className="w-2 h-2 rounded-full bg-orange-500 mr-1.5" />
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leave</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={presentStudents}
                keyExtractor={item => item.rollNo.toString()}
                renderItem={RenderStudents}
                contentContainerClassName="pb-24 pt-1"
                showsVerticalScrollIndicator={false}
            />
            <View className="absolute bottom-[30px] right-6 gap-3">
                <TouchableOpacity className="bg-green-500 p-4 rounded-full shadow-lg shadow-black/20 elevation-3" onPress={downloadExcel}>
                    <Ionicons name='download-outline' size={24} color={'#fff'} />
                </TouchableOpacity>
                <TouchableOpacity className="bg-blue-500 p-4 rounded-full shadow-lg shadow-black/20 elevation-3" onPress={exportToExcel}>
                    <Ionicons name='share-social-outline' size={24} color={'#fff'} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ShowAttendance;