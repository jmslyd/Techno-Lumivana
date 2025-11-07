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

const OfferCommissionScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Milonga: require('../../assets/fonts/Milonga-Regular.ttf'),
  });

  const [commissionName, setCommissionName] = useState('');
  const [description, setDescription] = useState('');
  const [dateRequested, setDateRequested] = useState('');
  const [category, setCategory] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
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
      const updatedPhotos = [...referencePhotos, result.assets[0].uri];
      setReferencePhotos(updatedPhotos);
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
      const updatedPhotos = [...referencePhotos, result.assets[0].uri];
      setReferencePhotos(updatedPhotos);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Add Product Photo', 'Choose an option', [
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
          if (selectedPhotoIndex === index) {
            setShowPhotoModal(false);
            setSelectedPhotoIndex(null);
          }
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
    Alert.alert('Offer Sent!', 'Commission offer submitted successfully.', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Home', { activeTab: 'Home' }),
      },
    ]);
  };

  const handleDecline = () => {
    Alert.alert('Cancel Offer', 'Cancel this commission offer?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <LinearGradient
      colors={['#1B0E2A', '#2A1B40', '#0E0B2A']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" translucent />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={26} color="#FFD700" />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { fontFamily: 'Milonga' }]}>
            Offer Commission
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scrollable Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsCard}>
            {/* Commission Name */}
            <Text style={styles.detailLabel}>Commission Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Commission Name"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={commissionName}
              onChangeText={setCommissionName}
            />

            {/* Description */}
            <Text style={styles.detailLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, { height: 100 }]}
              placeholder="Describe the commission details..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* Date Requested */}
            <Text style={styles.detailLabel}>Date Requested</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={handleCalendarPress}
              activeOpacity={0.8}
            >
              <TextInput
                style={styles.dateTextInput}
                value={dateRequested}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="rgba(255,255,255,0.7)"
                editable={false}
                pointerEvents="none"
              />
              <View style={styles.calendarButton}>
                <Ionicons name="calendar-outline" size={22} color="#FFD700" />
              </View>
            </TouchableOpacity>

            {/* Category */}
            <Text style={styles.detailLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Custom Commission"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={category}
              onChangeText={setCategory}
            />

            {/* Product Photos */}
            <Text style={styles.detailLabel}>
              Product Photos ({referencePhotos.length})
            </Text>
            <View style={styles.photoGrid}>
              {referencePhotos.length === 0 ? (
                <Text style={styles.noPhotosText}>
                  No product photos yet. Add one below!
                </Text>
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
              <Text style={styles.addPhotoText}>Add Product Photo</Text>
            </TouchableOpacity>

            {/* Contact Info */}
            <Text style={styles.detailLabel}>Contact Information</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.7)"
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
                <Text style={styles.secondaryButtonText}>Decline</Text>
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
    paddingTop: 50,
    paddingHorizontal: 24,
  },
  backButton: { width: 40, alignItems: 'center' },
  screenTitle: { fontSize: 24, color: '#FFD700', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginTop: 20,
  },
  detailLabel: {
    fontSize: 15,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    color: '#fff',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dateInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  dateTextInput: { flex: 1, padding: 12, color: '#fff' },
  calendarButton: {
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#FFD700',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  photoItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  gridPhoto: { width: '100%', height: '100%' },
  noPhotosText: { color: '#FFD700', textAlign: 'center', opacity: 0.8 },
  addPhotoButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  addPhotoText: { marginLeft: 6, fontWeight: '600', color: '#000' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  buttonInput: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: '#FFD700' },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  primaryButtonText: { color: '#000', fontWeight: '700' },
  secondaryButtonText: { color: '#FFD700', fontWeight: '700' },
});

export default OfferCommissionScreen;
