import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from "twrnc";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const Index = () => {
  const [mapel, setMapel] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [list, setList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('Semua');
  const [currentTime, setCurrentTime] = useState(''); // <<< TAMBAHAN JAM
  const titleRef = useRef<TextInput>(null);
  const mapelRef = useRef<TextInput>(null);

  useEffect(() => {
    loadTask();
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveTask();
  }, [list]);

  const addTask = () => {
    if (mapel.trim() === '' || deadline.trim() === ''){
      Alert.alert('Duh', 'belom kamu isi');
      return;
    }

    if (mapel.trim().length < 3) {
      Alert.alert('Huh', 'Yang bener kamu input mapelnya');
      return;
    }

    Alert.alert(
      "Tambah Ibadah",
      "Yakin mau tambah ibadah ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Tambah", 
          onPress: () => {
            const newTask = {
              id: Date.now().toString(),
              mapel: mapel.trim(),
              title: title.trim(),
              deadline: deadline.trim(),
              category,
              checked: false,
            };
            setList([...list, newTask]);
            resetForm();
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setMapel('');
    setTitle('');
    setDeadline('');
    setCategory('');
    setIsEditing(false);
    setEditId(null);
  };

  const toggleCheck = (id) => {
    const updated = list.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setList(updated);
  };

  const saveTask = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(list));
    } catch (error) {
      console.log('Gagal simpan:', error);
    }
  };

  const loadTask = async () => {
    try {
      const saved = await AsyncStorage.getItem('tasks');
      if (saved !== null) {
        setList(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Gagal load:', error);
    }
  };

  const deleteTask = (id) => {
    const filtered = list.filter(item => item.id !== id);
    setList(filtered);
  };

  const alertDelete = (id) => {
    Alert.alert(
      "Hapus Ibadah",
      "Yakin mau hapus ibadah ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus",
          onPress: () => {
            deleteTask(id);
          },
          style: "destructive"
        }
      ]
    ); 
  };

  const handleEdit = () => {
    Alert.alert(
      "Simpan Perubahan",
      "Yakin mau simpan perubahan ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Simpan", 
          onPress: () => {
            const updated = list.map(item =>
              item.id === editId
                ? { ...item, mapel: mapel.trim(), title: title.trim(), deadline: deadline.trim(), category }
                : item
            );
            setList(updated);
            resetForm();
          }
        }
      ]
    );
  };

  const startEdit = (item) => {
    setMapel(item.mapel);
    setTitle(item.title);
    setDeadline(item.deadline);
    setCategory(item.category);
    setIsEditing(true);
    setEditId(item.id);
  };

  const TaskCard = ({ item }) => (
    <View style={[tw`rounded-xl p-3 mb-3 flex-row justify-between items-center`,
      { backgroundColor: item.checked ? '#1f3f2a' : '#fff', elevation: 2 }
    ]}>
      <View style={tw`flex-row items-start gap-2 flex-1`}>
        <TouchableOpacity onPress={() => toggleCheck(item.id)} style={tw`mt-1`}>
          <View style={[tw`w-7 h-7 rounded border items-center justify-center mr-4 mt-3`, 
            item.checked ? tw`bg-green-700 border-green-700` : tw`border-gray-400`
          ]}>
            {item.checked && <Text style={tw`text-white text-center text-xs`}>✔</Text>}
          </View>
        </TouchableOpacity>
        <View>
          <Text style={[tw`font-bold text-base`, item.checked ? tw`text-gray-200` : tw`text-gray-600`]}>Ibadah: {item.mapel}</Text>
          <Text style={[tw`text-xs font-bold`, item.checked ? tw`text-red-200` : tw`text-red-600`]}>{item.category}</Text>
          <Text style={[tw`text-xs font-bold`, item.checked ? tw`text-red-200` : tw`text-red-600`]}>{item.deadline}</Text>
        </View>
      </View>

      <View style={tw`flex-row gap-2`}>
        <TouchableOpacity onPress={() => startEdit(item)}>
          <View style={tw`bg-blue-600 p-2 rounded`}>
            <Text style={tw`text-white text-xs`}>✏️</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alertDelete(item.id)}>
          <View style={tw`bg-red-600 p-2 rounded`}>
            <Text style={tw`text-white text-xs`}>🗑️</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredList = list.filter(item => {
    if (filter === 'Semua') return true;
    return item.category === filter;
  });

  return (
    <SafeAreaView style={tw`flex-1 mt-8 bg-gray-800`}>
      <ScrollView>
        <View>


          <View style={tw`items-center justify-center`}>
            <View style={tw`bg-yellow-500 w-90 h-30 justify-center rounded-xl`}>
            <View style={tw`px-4 mb-2`}>
              <Text style={tw`text-center text-white text-2xl font-bold`}>{currentTime}</Text>
            </View>
            <View style={tw`px-4`}>
              <Text style={tw`font-bold text-4xl text-center`}>Muslims</Text>
            </View>
            </View>
          </View>
          

        

          <View style={tw`mt-5 px-4 gap-3`}>
            {/* INPUTAN */}
            <View>
              <TextInput
                placeholder='Judul Ibadah'
                style={tw`border border-gray-700 rounded px-2 mt-2 bg-gray-400 rounded-xl`}
                value={mapel}
                onChangeText={setMapel}
              />
            </View>

            <View>
              <TextInput
                placeholder='Deadline (cth: 20 Apr 2025)'
                style={tw`border border-gray-700 rounded px-2 mt-2 bg-gray-400  rounded-xl`}
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>

            <View style={tw`rounded-lg bg-gray-400 text-center`}>
              <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)} style={tw`border border-gray-700 mt-2`}>
                <Picker.Item label="Sunnah" value="Sunnah" />
                <Picker.Item label="Wajib" value="Wajib" />
              </Picker>
            </View>

            <TouchableOpacity onPress={isEditing ? handleEdit : addTask} disabled={mapel === ''} style={tw`bg-yellow-300 h-10 rounded-lg justify-center`}>
              <Text style={tw`text-center text-base font-bold ${mapel === ''  ? 'opacity-50' : ''}`}>
                {isEditing ? 'SIMPAN PERUBAHAN' : 'TAMBAH IBADAH'}
              </Text>
            </TouchableOpacity>

            {/* FILTER */}
            <View style={tw`flex-row justify-center gap-3 mt-4`}>
              <TouchableOpacity onPress={() => setFilter('Semua')} style={[tw`px-4 py-2 rounded`, filter === 'Semua' ? tw`bg-yellow-400` : tw`bg-gray-500`]}>
                <Text style={tw`text-white font-bold`}>Semua</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilter('Sunnah')} style={[tw`px-4 py-2 rounded`, filter === 'Sunnah' ? tw`bg-yellow-400` : tw`bg-gray-500`]}>
                <Text style={tw`text-white font-bold`}>Sunnah</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilter('Wajib')} style={[tw`px-4 py-2 rounded`, filter === 'Wajib' ? tw`bg-yellow-400` : tw`bg-gray-500`]}>
                <Text style={tw`text-white font-bold`}>Wajib</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* LIST */}
        <View style={tw`pt-5 px-4`}>
          <FlatList
            data={filteredList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TaskCard item={item} />}
            contentContainerStyle={tw`pt-5 pb-10`}
            ListEmptyComponent={() => (
              <View style={tw`items-center justify-center mt-20`}>
                <Text style={tw`text-gray-500 text-lg font-semibold`}>Yeay gada tugas kamu</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
