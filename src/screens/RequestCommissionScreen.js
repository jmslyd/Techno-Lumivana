import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const RequestCommissionScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Milonga: require('../../assets/fonts/Milonga-Regular.ttf'),
  });

  const [commissionName, setCommissionName] = useState('');
  const [description, setDescription] = useState('');
  const [dateRequested, setDateRequested] = useState('');
  const [category, setCategory] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!fontsLoaded) return null;

  const pickReferencePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReferencePhotos([...referencePhotos, result.assets[0].uri]);
    }
  };

  const takeReferencePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReferencePhotos([...referencePhotos, result.assets[0].uri]);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Add Reference Photo', 'Choose an option', [
      { text: 'Choose from Gallery', onPress: pickReferencePhoto },
      { text: 'Take Photo', onPress: takeReferencePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const deleteReferencePhoto = (index) => {
    Alert.alert('Delete Photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedPhotos = referencePhotos.filter((_, i) => i !== index);
          setReferencePhotos(updatedPhotos);
        },
      },
    ]);
  };

  const handleCalendarPress = () => setShowCalendar(true);
  const handleDateChange = (event, date) => {
    setShowCalendar(false);
    if (date) {
      const formattedDate = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      setDateRequested(formattedDate);
    }
  };

  const handleConfirm = () => {
    if (!commissionName || !description || !dateRequested || !contactInfo) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }
    Alert.alert('Request Sent!', 'Your commission request has been submitted.', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Home', { activeTab: 'Home' }),
      },
    ]);
  };

  const handleDecline = () => {
    Alert.alert('Cancel Request', 'Do you want to cancel this commission request?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <LinearGradient colors={['#12071C', '#1E1030', '#0B081F']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={28} color="#FFD700" />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { fontFamily: 'Milonga' }]}>
            Request Commission
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scroll Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsCard}>
            {/* Commission Name */}
            <Text style={styles.detailLabel}>Commission Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Commission Name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={commissionName}
              onChangeText={setCommissionName}
            />

            {/* Description */}
            <Text style={styles.detailLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, { height: 100 }]}
              placeholder="Describe what you want..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* Date Requested */}
            <Text style={styles.detailLabel}>Date Requested</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              activeOpacity={0.8}
              onPress={handleCalendarPress}
            >
              <TextInput
                style={styles.dateTextInput}
                value={dateRequested}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="rgba(255,255,255,0.6)"
                editable={false}
                pointerEvents="none"
              />
              <Ionicons name="calendar-outline" size={22} color="#FFD700" />
            </TouchableOpacity>

            {/* Category */}
            <Text style={styles.detailLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Custom Commission"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={category}
              onChangeText={setCategory}
            />

            {/* Reference Photos */}
            <Text style={styles.detailLabel}>
              Reference Photos ({referencePhotos.length})
            </Text>
            <View style={styles.photoGrid}>
              {referencePhotos.length === 0 ? (
                <Text style={styles.noPhotosText}>No photos yet. Add one below!</Text>
              ) : (
                referencePhotos.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.photoItem}
                    onLongPress={() => deleteReferencePhoto(i)}
                  >
                    <Image source={{ uri }} style={styles.gridPhoto} />
                  </TouchableOpacity>
                ))
              )}
            </View>

            <TouchableOpacity style={styles.addPhotoButton} onPress={showPhotoOptions}>
              <Ionicons name="add-circle-outline" size={26} color="#000" />
              <Text style={styles.addPhotoText}>Add Reference Photo</Text>
            </TouchableOpacity>

            {/* Contact Info */}
            <Text style={styles.detailLabel}>Contact Information</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={contactInfo}
              onChangeText={setContactInfo}
              keyboardType="email-address"
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.buttonInput, styles.primaryButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.primaryButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonInput, styles.secondaryButton]}
                onPress={handleDecline}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showCalendar && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingHorizontal: 24,
  },
  backButton: { width: 40, alignItems: 'center' },
  screenTitle: { fontSize: 26, color: '#FFD700', textAlign: 'center', letterSpacing: 0.5 },
  content: { flex: 1, paddingHorizontal: 20 },
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 25,
  },
  detailLabel: {
    fontSize: 15,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    color: '#fff',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    fontSize: 15,
  },
  dateInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    paddingRight: 10,
  },
  dateTextInput: { flex: 1, padding: 12, color: '#fff', fontSize: 15 },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  photoItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  gridPhoto: { width: '100%', height: '100%' },
  noPhotosText: { color: '#FFD700', textAlign: 'center', opacity: 0.8 },
  addPhotoButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 12,
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  addPhotoText: { marginLeft: 6, fontWeight: '700', color: '#000' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, gap: 12 },
  buttonInput: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: '#FFD700', shadowColor: '#FFD700', elevation: 3 },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  primaryButtonText: { color: '#000', fontWeight: '700', fontSize: 16 },
  secondaryButtonText: { color: '#FFD700', fontWeight: '700', fontSize: 16 },
});

export default RequestCommissionScreen;
