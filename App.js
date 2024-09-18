import {
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  TouchableNativeFeedback,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Gap from './src/component/gap';
import CheckBox from '@react-native-community/checkbox';
import {useEffect, useState} from 'react';
import styles from './src/style/styleApp';
import EncryptedStorage from 'react-native-encrypted-storage';

export default function App() {
  const [task, setTask] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleAdd, setModalVisibleAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [editedTask, setEditedTask] = useState({
    title: '',
    deskripsi: '',
    checked: false,
    id: 0,
    collapse: false,
  });

  const closeModal = () => setModalVisible(false);
  const closeModalAdd = () => setModalVisibleAdd(false);

  function showDesc(id) {
    const updatedTasks = task.map(task =>
      task.id === id ? {...task, collapse: !task.collapse} : task,
    );
    setTask(updatedTasks);
    simpanTask(updatedTasks);
  }

  const simpanTask = async updatedTasks => {
    try {
      await EncryptedStorage.setItem('task', JSON.stringify(updatedTasks));
    } catch (error) {
      Alert.alert('Gagal ambil tugas:', error);
    }
  };

  const loadTask = async () => {
    try {
      const storedTasks = await EncryptedStorage.getItem('task');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          setTask(parsedTasks);
        } else {
          console.error('Task bukan array', parsedTasks);
          setTask([]);
        }
      }
    } catch (error) {
      console.error('Gagal Ambil Tugas', error);
    }
  };

  useEffect(() => {
    loadTask();
  }, []);

  function createTask() {
    const newTask = [
      {title: title, checked: false, id: task.length + 1, deskripsi: deskripsi},
      ...task,
    ];
    setTask(newTask);
    simpanTask(newTask);
    setTitle('');
    setDeskripsi('');
    closeModalAdd(false);
  }

  function deleteTask(id) {
    Alert.alert('Hapus Tugas', 'Yakin akan menghapus tugas ini?', [
      {
        text: 'Hapus',
        onPress: () => {
          const filteredTasks = task.filter(task => task.id !== id);
          setTask(filteredTasks);
          simpanTask(filteredTasks);
        },
      },
      {text: 'Cancel'},
    ]);
  }

  function checkListTask(id) {
    const updatedTasks = task.map(task =>
      task.id === id ? {...task, checked: !task.checked} : task,
    );
    setTask(updatedTasks);
    simpanTask(updatedTasks);
  }

  function updatedTask() {
    const updatedTasks = task.map(task =>
      task.id === editedTask.id ? editedTask : task,
    );
    setTask(updatedTasks);
    simpanTask(updatedTasks);
    setModalVisible(false);
  }

  return (
    <View style={{flex: 1}}>
      <StatusBar backgroundColor={'#390085'} />

      {/* Header */}
      <View style={styles.viewHeader}>
        <Icon name={'notebook'} size={40} color={'white'} />
        <Text style={styles.textHeader}>To Do list</Text>
      </View>

      {/* Render Item */}
      <FlatList
        ListFooterComponent={<Gap height={30} />}
        ListEmptyComponent={
          <Text style={styles.textEmptyComponent}>Tidak ada Tugas</Text>
        }
        data={task}
        renderItem={({item}) => {
          return (
            <View style={styles.viewRenderItem}>
              <CheckBox
                value={item.checked}
                tintColors={{true: '#6e00ff', false: '#6e00ff'}}
                onValueChange={() => {
                  checkListTask(item.id);
                }}
              />
              <Gap width={10} />
              <View style={styles.viewTugas}>
                <View style={{flex: 1}}>
                  <Text style={styles.textTugas}>{item.title}</Text>
                  <Gap height={10} />
                  {item.collapse && (
                    <Text style={styles.textDeskripsi}>{item.deskripsi}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => showDesc(item.id)}>
                  {item.collapse ? (
                    <View style={styles.viewBtnCollapse}>
                      <Icon name={'chevron-up'} size={25} color={'white'} />
                    </View>
                  ) : (
                    <View style={styles.viewBtnCollapse}>
                      <Icon name={'chevron-down'} size={25} color={'white'} />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.viewLine} />
                <View>
                  <TouchableOpacity style={styles.btnTugas}>
                    <Icon
                      name={'pencil'}
                      color={'white'}
                      size={25}
                      onPress={() => {
                        setModalVisible(true);
                        setEditedTask(item);
                      }}
                    />
                  </TouchableOpacity>
                  <Gap height={10} />
                  <TouchableOpacity
                    style={{...styles.btnTugas, backgroundColor: '#e60000'}}
                    onPress={() => deleteTask(item.id)}>
                    <Icon name={'trash-can'} color={'white'} size={25} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* button Tambah Tugas */}
      <View style={styles.btnLocAdd}>
        <View style={styles.viewBtn}>
          <TouchableOpacity onPress={() => setModalVisibleAdd(true)}>
            <View style={styles.viewTextAdd}>
              <Icon name={'plus-thick'} size={20} color={'white'} />
              <Gap width={5} />
              <Text style={{fontSize: 18, color: 'white', fontWeight: '500'}}>
                Tambah Tugas
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* modal tambah tugas */}
      <Modal
        transparent
        visible={modalVisibleAdd}
        onRequestClose={closeModalAdd}
        animationType="fade">
        <Pressable style={styles.backDrop} onPress={closeModalAdd} />
        <View style={styles.modalContainer}>
          <View style={styles.viewModal}>
            <View style={styles.headerModal}>
              <Icon name="plus-thick" color={'black'} size={25} />
              <Text style={{fontSize: 17, fontWeight: '500', color: 'grey'}}>
                Tambah Tugas
              </Text>
              <TouchableOpacity>
                <Icon
                  name="close-circle"
                  color={'black'}
                  size={25}
                  onPress={closeModalAdd}
                />
              </TouchableOpacity>
            </View>
            <Gap height={10} />
            <TextInput
              autoFocus
              placeholder="Masukkan Tugas"
              placeholderTextColor="grey"
              style={styles.textInputModal}
              value={title}
              onChangeText={title => setTitle(title)}
            />
            <Gap height={10} />
            <TextInput
              placeholder="Masukkan Deskripsi"
              placeholderTextColor="grey"
              style={styles.textInputModal}
              value={deskripsi}
              onChangeText={deskripsi => setDeskripsi(deskripsi)}
            />
            <Gap height={20} />
            <TouchableNativeFeedback useForeground onPress={createTask}>
              <View style={styles.btnEdit}>
                <Text style={styles.textEdit}>Tambah</Text>
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      </Modal>

      {/* Modal edit tugas*/}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
        animationType="fade">
        <Pressable style={styles.backDrop} onPress={closeModal} />
        <View style={styles.modalContainer}>
          <View style={styles.viewModal}>
            <View style={styles.headerModal}>
              <Icon name="lead-pencil" color={'black'} size={25} />
              <Text style={{fontSize: 17, fontWeight: '500', color: 'grey'}}>
                Edit Tugas
              </Text>
              <TouchableOpacity>
                <Icon
                  name="close-circle"
                  color={'black'}
                  size={25}
                  onPress={closeModal}
                />
              </TouchableOpacity>
            </View>
            <Gap height={10} />
            <TextInput
              placeholder="Edit Tugas"
              placeholderTextColor="grey"
              style={styles.textInputModal}
              value={editedTask.title}
              onChangeText={title =>
                setEditedTask({...editedTask, title: title})
              }
            />
            <Gap height={10} />
            <TextInput
              placeholder="Edit Deskripsi"
              placeholderTextColor="grey"
              style={styles.textInputModal}
              value={editedTask.deskripsi}
              onChangeText={deskripsi =>
                setEditedTask({...editedTask, deskripsi: deskripsi})
              }
            />
            <Gap height={20} />
            <TouchableNativeFeedback
              useForeground
              onPress={updatedTask}
              disabled={editedTask.title === ''}>
              <View style={styles.btnEdit}>
                <Text style={styles.textEdit}>Edit</Text>
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      </Modal>
    </View>
  );
}
