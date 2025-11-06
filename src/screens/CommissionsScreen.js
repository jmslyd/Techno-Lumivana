// CommissionsScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

/**
 * Luxurious Modern redesign:
 * - Softer, more realistic shadows (large radius, low opacity)
 * - Consistent rounded corners (20)
 * - Cleaner spacing and layout (padding 20/24)
 * - Refined typography: Milonga for headings + system for body
 * - Elegant buttons with subtle gold accents and depth
 * - Preserves all functionality: animations, filters, list, pull-to-refresh, navigation hooks
 *
 * Notes:
 * - Keep your assets at the same paths or update them:
 *    - Font: ../../assets/fonts/Milonga-Regular.ttf
 *    - Logo: ../../assets/lumivana.png
 * - Mock data below for demonstration. Replace with real data as needed.
 */

const RADIUS = 20;
const CARD_ELEV = Platform.select({ ios: 12, android: 6 });

/* -------------------------
   MOCK DATA (keeps logic intact)
   ------------------------- */
const mockCommissions = [
  {
    id: "c1",
    title: "Aurora Portrait Commission",
    category: "creative",
    image: "https://via.placeholder.com/640x360.png?text=Aurora+Portrait",
    description: "Full-color digital portrait with background and minor revisions.",
    price: 45,
  },
  {
    id: "c2",
    title: "Research Summary Report",
    category: "academic",
    image: "https://via.placeholder.com/640x360.png?text=Research+Report",
    description: "Concise 8-10 page literature summary with references.",
    price: 80,
  },
  {
    id: "c3",
    title: "Blog Post - 1200 words",
    category: "writing",
    image: "https://via.placeholder.com/640x360.png?text=Blog+Post",
    description: "SEO-friendly article with 2 keyword optimizations included.",
    price: 30,
  },
  {
    id: "c4",
    title: "Character Design Pack",
    category: "creative",
    image: "https://via.placeholder.com/640x360.png?text=Character+Design",
    description: "Turnaround + color palette + expressions. Commercial use allowed.",
    price: 150,
  },
  {
    id: "c5",
    title: "Proofreading (10 pages)",
    category: "writing",
    image: "https://via.placeholder.com/640x360.png?text=Proofreading",
    description: "Grammar, style, and clarity improvements with suggestions.",
    price: 60,
  },
];

const categories = [
  { id: "all", title: "All Commissions", icon: "🧾", description: "Browse everything" },
  { id: "creative", title: "Creative / Art", icon: "🎨", description: "Design & illustration" },
  { id: "academic", title: "Academic", icon: "📚", description: "Reports & research" },
  { id: "writing", title: "Writing / Editing", icon: "✍️", description: "Copy & editing" },
];

const CommissionsScreen = ({ navigation }) => {
  // Font (Milonga for headings)
  const [fontsLoaded] = useFonts({
    Milonga: require("../../assets/fonts/Milonga-Regular.ttf"),
  });

  // State (keeps same app logic)
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ priceRange: "any", category: "any" });
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("commissions");

  // Animations
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const bottomNavAnim = useRef(new Animated.Value(0)).current;

  // Filtered data
  const filteredCommissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return mockCommissions.filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (selectedFilters.priceRange !== "any") {
        if (selectedFilters.priceRange === "low" && c.price > 40) return false;
        if (selectedFilters.priceRange === "mid" && (c.price < 41 || c.price > 100)) return false;
        if (selectedFilters.priceRange === "high" && c.price < 101) return false;
      }
      if (!q) return true;
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    });
  }, [activeCategory, searchQuery, selectedFilters]);

  // Animate category content on change (subtle fade + translate)
  useEffect(() => {
    categoryAnim.setValue(0);
    Animated.timing(categoryAnim, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [activeCategory, searchQuery, selectedFilters]);

  // Bottom nav highlight spring
  useEffect(() => {
    Animated.spring(bottomNavAnim, { toValue: activeTab === "commissions" ? 1 : 0, friction: 8, useNativeDriver: true }).start();
  }, [activeTab]);

  // Sheet toggles
  const openFilterSheet = () => {
    setFilterModalVisible(true);
    sheetAnim.setValue(0);
    Animated.timing(sheetAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  };
  const closeFilterSheet = () => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setFilterModalVisible(false);
    });
  };

  // Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // simulate
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: "#fff" }}>Loading fonts…</Text>
      </View>
    );
  }

  // Animated styles
  const categoryContentStyle = {
    opacity: categoryAnim,
    transform: [{ translateY: categoryAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
  };

  // Price formatter
  const formatPrice = (p) => `₱${p.toFixed(2)}`;

  /* -------------------------
     UI Subcomponents (visuals only)
     ------------------------- */

  // Category Card with refined look + subtle 3D press
  const CategoryCard = ({ item }) => {
    const pressScale = useRef(new Animated.Value(1)).current;
    const glow = useRef(new Animated.Value(0)).current;
    const isActive = activeCategory === item.id;

    const pressIn = () => {
      Animated.parallel([
        Animated.spring(pressScale, { toValue: 0.975, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    };
    const pressOut = () => {
      Animated.parallel([
        Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    };

    return (
      <Pressable
        onPress={() => setActiveCategory(item.id)}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{ marginRight: 14 }}
      >
        <Animated.View
          style={[
            styles.categoryCard,
            {
              transform: [{ scale: pressScale }],
              borderRadius: RADIUS,
            },
            isActive && styles.categoryCardActive,
          ]}
        >
          <LinearGradient
            colors={isActive ? ["#FFE9A1", "#CFAD01"] : ["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"]}
            start={[0, 0]}
            end={[1, 1]}
            style={[styles.categoryInner, { borderRadius: RADIUS }]}
          >
            {/* Soft gold glow - subtle */}
            <Animated.View style={[styles.softGlow, { opacity: glow }]} pointerEvents="none" />

            <Text style={styles.catIcon}>{item.icon}</Text>
            <Text style={[styles.catTitle, isActive ? styles.catTitleActive : {}]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.catDesc} numberOfLines={1}>
              {item.description}
            </Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  };

  // Commission card refined visuals
  const CommissionCard = ({ item }) => {
    const pressScale = useRef(new Animated.Value(1)).current;

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => navigation?.navigate?.("CommissionDetail", { commissionId: item.id })}
        onPressIn={() => Animated.spring(pressScale, { toValue: 0.985, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start()}
      >
        <Animated.View style={[styles.commissionCard, { transform: [{ scale: pressScale }] }]}>
          <Image source={{ uri: item.image }} style={styles.commissionImage} />
          <View style={styles.commissionBody}>
            <Text style={styles.commissionTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.commissionDesc} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.commissionFooter}>
              <Text style={styles.commissionPrice}>{formatPrice(item.price)}</Text>
              <TouchableOpacity
                style={styles.requestBtn}
                onPress={() => navigation?.navigate?.("Checkout", { commissionId: item.id })}
              >
                <Text style={styles.requestBtnText}>Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  /* -------------------------
     Main Render
     ------------------------- */
  return (
    <LinearGradient colors={["#0B0028", "#1b103a", "#2d214f"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.brand}>
              <Image source={require("../../assets/lumivana.png")} style={styles.logo} />
              <Text style={[styles.brandTitle, { fontFamily: "Milonga" }]}>Lumivana</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.roundIcon} onPress={() => navigation?.navigate?.("Profile")}>
                <Ionicons name="person-circle-outline" size={28} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.mainTitle, { fontFamily: "Milonga" }]}>COMMISSIONS</Text>

            {/* Search + actions */}
            <View style={styles.searchRow}>
              <View style={styles.searchField}>
                <Ionicons name="search" size={18} color="#777" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search commissions..."
                  placeholderTextColor="#9b9b9b"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                    <Ionicons name="close" size={14} color="#333" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={[styles.roundIcon, styles.filterIcon]} onPress={openFilterSheet}>
                <Ionicons name="funnel-outline" size={20} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <Animated.View style={[styles.content, categoryContentStyle]}>
          {/* Categories (horizontal) */}
          <View style={styles.categoriesRow}>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => <CategoryCard item={item} />}
            />
          </View>

          {/* List header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === "all" ? "Available Commissions" : categories.find((c) => c.id === activeCategory)?.title}
            </Text>
            <Text style={styles.sectionSub}>{filteredCommissions.length} results • Recommended</Text>
          </View>

          {/* Commissions list */}
          <FlatList
            data={filteredCommissions}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <CommissionCard item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No commissions available</Text>
                <Text style={styles.emptySubtitle}>Try changing filters or check back soon.</Text>
              </View>
            }
          />
        </Animated.View>

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab("home"); navigation?.navigate?.("Home"); }}>
            <Ionicons name="home-outline" size={22} color="#dcd6e1" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItemCenter} onPress={() => setActiveTab("commissions")}>
            <Animated.View style={[styles.navCenterBubble, {
              transform: [{ scale: bottomNavAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
            }]}>
              <Ionicons name="briefcase-outline" size={22} color="#2b1b00" />
            </Animated.View>
            <Text style={[styles.navText, styles.navActiveText]}>Commissions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab("accepted"); navigation?.navigate?.("AcceptedCommissions"); }}>
            <Ionicons name="checkmark-done-outline" size={22} color="#dcd6e1" />
            <Text style={styles.navText}>Accepted</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab("faqs"); navigation?.navigate?.("FAQs"); }}>
            <Ionicons name="help-circle-outline" size={22} color="#dcd6e1" />
            <Text style={styles.navText}>FAQs</Text>
          </TouchableOpacity>
        </View>

        {/* FILTER BOTTOM SHEET */}
        {filterModalVisible && (
          <TouchableOpacity activeOpacity={1} style={styles.sheetOverlay} onPress={closeFilterSheet}>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [
                    {
                      translateY: sheetAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [height, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Filter & Sort</Text>

              <View style={styles.sheetSection}>
                <Text style={styles.sheetLabel}>Price</Text>
                <View style={styles.chipsRow}>
                  {["any", "low", "mid", "high"].map((pr) => {
                    const active = selectedFilters.priceRange === pr;
                    return (
                      <TouchableOpacity
                        key={pr}
                        onPress={() => setSelectedFilters((s) => ({ ...s, priceRange: pr }))}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {pr === "any" ? "Any" : pr === "low" ? "≤ ₱40" : pr === "mid" ? "₱41 - ₱100" : "₱101+"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sheetSection}>
                <Text style={styles.sheetLabel}>Category</Text>
                <View style={styles.chipsRow}>
                  {categories.map((c) => {
                    const active = selectedFilters.category === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => setSelectedFilters((s) => ({ ...s, category: s.category === c.id ? "any" : c.id }))}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.title}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sheetActions}>
                <TouchableOpacity onPress={() => setSelectedFilters({ priceRange: "any", category: "any" })} style={[styles.sheetBtn, styles.sheetBtnGhost]}>
                  <Text style={styles.sheetBtnGhostText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeFilterSheet} style={[styles.sheetBtn, styles.sheetBtnPrimary]}>
                  <Text style={styles.sheetBtnPrimaryText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

/* -------------------------
   Styles: visual polish & spacing
   ------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0018" },
  safe: { flex: 1 },

  centered: { alignItems: "center", justifyContent: "center" },

  /* HEADER */
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 26 : 12, paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center" },
  logo: { width: 46, height: 46, marginRight: 12 },
  brandTitle: { color: "#fff", fontSize: 20, letterSpacing: 0.6 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  roundIcon: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  titleRow: { marginTop: 10 },
  mainTitle: {
    textAlign: "center",
    color: "#FFD700",
    fontSize: 26,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },

  searchRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f5f1",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    // soft shadow
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  searchInput: { flex: 1, fontSize: 14, color: "#222" },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  filterIcon: { marginLeft: 6 },

  /* CONTENT */
  content: { flex: 1, marginTop: 8 },

  /* CATEGORIES */
  categoriesRow: { height: 140, marginTop: 6 },
  categoryCard: {
    width: Math.min(width * 0.62, 260),
    height: 120,
    borderRadius: RADIUS,
    overflow: "hidden",
    // subtle outer shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: CARD_ELEV },
    }),
  },
  categoryCardActive: {
    ...Platform.select({
      ios: { shadowColor: "#FFD700", shadowOpacity: 0.16, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: CARD_ELEV + 8 },
    }),
  },
  categoryInner: { flex: 1, padding: 16, justifyContent: "center" },
  softGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff7dc",
    opacity: 0.06,
    borderRadius: RADIUS,
  },
  catIcon: { fontSize: 26, marginBottom: 6 },
  catTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  catTitleActive: { color: "#2b1b00" },
  catDesc: { color: "rgba(255,255,255,0.85)", marginTop: 6, fontSize: 12 },

  /* SECTION HEADER */
  sectionHeader: { paddingHorizontal: 20, marginTop: 18, marginBottom: 8 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  sectionSub: { color: "rgba(255,255,255,0.72)", marginTop: 4, fontSize: 12 },

  /* COMMISSION CARD (refined) */
  commissionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 5 },
    }),
  },
  commissionImage: { width: 120, height: 100 },
  commissionBody: { flex: 1, paddingVertical: 12, paddingHorizontal: 14 },
  commissionTitle: { color: "#fff", fontSize: 15, fontWeight: "800" },
  commissionDesc: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6 },
  commissionFooter: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commissionPrice: { color: "#FFD700", fontSize: 15, fontWeight: "900" },
  requestBtn: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 2 },
    }),
  },
  requestBtnText: { color: "#2b1b00", fontWeight: "900", fontSize: 13 },

  /* EMPTY */
  emptyState: { marginTop: 36, alignItems: "center", padding: 24 },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  emptySubtitle: { color: "rgba(255,255,255,0.75)", marginTop: 8 },

  /* BOTTOM NAV (polished) */
  bottomNav: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    height: 72,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 18 },
    }),
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navItemCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  navText: { color: "#ddd", fontSize: 11, marginTop: 6 },
  navActiveText: { color: "#FFD700", fontWeight: "800" },
  navCenterBubble: {
    backgroundColor: "rgba(255,215,0,0.12)",
    padding: 10,
    borderRadius: 12,
  },

  /* BOTTOM SHEET */
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.36)", justifyContent: "flex-end" },
  bottomSheet: {
    backgroundColor: "#0f0920",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 34,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  sheetHandle: { alignSelf: "center", width: 54, height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6, marginBottom: 10 },
  sheetTitle: { color: "#FFD700", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  sheetSection: { marginTop: 12 },
  sheetLabel: { color: "#fff", fontSize: 13, fontWeight: "700", marginBottom: 8 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginRight: 10,
    marginBottom: 10,
  },
  chipActive: { backgroundColor: "rgba(255,215,0,0.12)", borderWidth: 1, borderColor: "rgba(255,215,0,0.2)" },
  chipText: { color: "#fff", fontSize: 12 },
  chipTextActive: { color: "#FFD700", fontWeight: "700" },

  sheetActions: { flexDirection: "row", marginTop: 16 },
  sheetBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  sheetBtnGhost: { marginRight: 8, backgroundColor: "rgba(255,255,255,0.03)" },
  sheetBtnPrimary: { marginLeft: 8, backgroundColor: "#FFD700" },
  sheetBtnGhostText: { color: "#fff", fontWeight: "700" },
  sheetBtnPrimaryText: { color: "#2b1b00", fontWeight: "900" },
});

export default CommissionsScreen;
