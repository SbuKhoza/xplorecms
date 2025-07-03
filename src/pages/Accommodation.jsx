"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Linking,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "../../Firebase/config"
import { useScrollTracking, AnimatedFlatList } from "../BottomNav"
import ReservationForm from "./ReservationForm"

const { width } = Dimensions.get("window")

const Accommodation = () => {
  const [activeTab, setActiveTab] = useState("BnB")
  const [selectedAccommodation, setSelectedAccommodation] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [reservationModalVisible, setReservationModalVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [favorites, setFavorites] = useState(new Set())
  const [accommodationsData, setAccommodationsData] = useState({})
  const [dataLoading, setDataLoading] = useState(true)

  // Get scroll tracking props from the custom hook
  const scrollProps = useScrollTracking()

  const accommodationTypes = ["BnB", "Guest House", "Hotel", "Backpackers", "Self Catering", "Lodge"]

  // Function to open directions in maps app
  const openDirections = (coordinates, name) => {
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      Alert.alert("Error", "Location coordinates not available for this accommodation.")
      return
    }

    const lat = Number.parseFloat(coordinates.latitude)
    const lng = Number.parseFloat(coordinates.longitude)

    // Use Google Maps universally - works on both iOS and Android
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`

    Linking.openURL(googleMapsUrl).catch((err) => {
      console.error("Error opening maps:", err)
      Alert.alert("Error", "Could not open maps application")
    })
  }

  // Initialize accommodations collection with default data
  const initializeAccommodationsCollection = async () => {
    try {
      const accommodationsRef = collection(db, "accommodations")
      const snapshot = await getDocs(accommodationsRef)

      if (snapshot.empty) {
        console.log("Accommodations collection doesn't exist, creating with default data...")
        const defaultAccommodations = [
          {
            type: "BnB",
            name: "Soweto Heritage BnB",
            images: [
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
            ],
            price: 850,
            rating: 4.8,
            reviews: 124,
            availability: "Available",
            description:
              "Experience authentic Soweto hospitality in our beautifully decorated bed and breakfast. Located in the heart of Orlando West, walking distance to Mandela House.",
            amenities: ["Free WiFi", "Breakfast Included", "Parking", "Garden", "Laundry"],
            maxGuests: 4,
            location: "Orlando West",
            coordinates: {
              latitude: "-26.2041",
              longitude: "27.9249",
            },
            createdAt: new Date(),
          },
          {
            type: "BnB",
            name: "Vilakazi Street BnB",
            images: [
              "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400",
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
            ],
            price: 750,
            rating: 4.6,
            reviews: 89,
            availability: "Available",
            description:
              "Stay on the famous Vilakazi Street, home to two Nobel Prize winners. Comfortable accommodation with modern amenities.",
            amenities: ["Free WiFi", "Breakfast", "Security", "Tours Available"],
            maxGuests: 2,
            location: "Vilakazi Street",
            coordinates: {
              latitude: "-26.2041",
              longitude: "27.9249",
            },
            createdAt: new Date(),
          },
          {
            type: "Guest House",
            name: "Soweto Comfort Guest House",
            images: [
              "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            ],
            price: 950,
            rating: 4.7,
            reviews: 156,
            availability: "Limited",
            description:
              "Modern guest house offering comfortable rooms with spectacular views of Johannesburg skyline.",
            amenities: ["Pool", "Restaurant", "Conference Room", "Free WiFi", "Airport Shuttle"],
            maxGuests: 6,
            location: "Diepkloof",
            coordinates: {
              latitude: "-26.2675",
              longitude: "27.8546",
            },
            createdAt: new Date(),
          },
          {
            type: "Hotel",
            name: "Soweto Hotel & Conference Centre",
            images: [
              "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400",
              "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400",
            ],
            price: 1200,
            rating: 4.5,
            reviews: 203,
            availability: "Available",
            description:
              "Full-service hotel with modern amenities and conference facilities. Perfect for business and leisure travelers.",
            amenities: ["Gym", "Spa", "Restaurant", "Bar", "Conference Rooms", "Free WiFi"],
            maxGuests: 4,
            location: "Kliptown",
            coordinates: {
              latitude: "-26.2456",
              longitude: "27.8546",
            },
            createdAt: new Date(),
          },
        ]

        for (const accommodation of defaultAccommodations) {
          await addDoc(accommodationsRef, accommodation)
        }
        console.log("Accommodations collection initialized successfully!")
      }
    } catch (error) {
      console.error("Error initializing accommodations collection:", error)
    }
  }

  // Fetch accommodations data from Firebase
  const fetchAccommodationsData = async () => {
    try {
      setDataLoading(true)
      const accommodationsRef = collection(db, "accommodations")
      const snapshot = await getDocs(accommodationsRef)
      const groupedData = {}

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() }
        const type = data.type
        if (!groupedData[type]) {
          groupedData[type] = []
        }
        groupedData[type].push(data)
      })

      setAccommodationsData(groupedData)
    } catch (error) {
      console.error("Error fetching accommodations data:", error)
      // Fallback to empty data if fetch fails
      setAccommodationsData({})
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      await initializeAccommodationsCollection()
      await fetchAccommodationsData()
    }
    initializeData()
  }, [])

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const openAccommodationDetails = (accommodation) => {
    setSelectedAccommodation(accommodation)
    setCurrentImageIndex(0)
    setModalVisible(true)
  }

  const openReservationForm = (accommodation) => {
    setSelectedAccommodation(accommodation)
    setModalVisible(false)
    setReservationModalVisible(true)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />)
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />)
    }

    return stars
  }

  const renderAccommodationCard = ({ item }) => (
    <TouchableOpacity style={styles.accommodationCard} onPress={() => openAccommodationDetails(item)}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.accommodationImage} />
        <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
          <Ionicons
            name={favorites.has(item.id) ? "heart" : "heart-outline"}
            size={24}
            color={favorites.has(item.id) ? "#FF6B6B" : "#FFF"}
          />
        </TouchableOpacity>
        <View
          style={[styles.statusBadge, { backgroundColor: item.availability === "Available" ? "#4CAF50" : "#FF9800" }]}
        >
          <Text style={styles.statusText}>{item.availability}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.accommodationName}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>

        {/* Display coordinates */}
        {item.coordinates && (
          <Text style={styles.coordinates}>
            📍 {item.coordinates.latitude}, {item.coordinates.longitude}
          </Text>
        )}

        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>{renderStars(item.rating)}</View>
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviews} reviews)
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>R{item.price}</Text>
          <Text style={styles.priceLabel}>per night</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.maxGuests}>Up to {item.maxGuests} guests</Text>

          {/* Directions Button */}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={(e) => {
              e.stopPropagation() // Prevent opening modal
              openDirections(item.coordinates, item.name)
            }}
          >
            <Ionicons name="navigate" size={16} color="#FFF" />
            <Text style={styles.directionsButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderImageCarousel = () => {
    if (!selectedAccommodation) return null

    return (
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width)
            setCurrentImageIndex(index)
          }}
        >
          {selectedAccommodation.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.carouselImage} />
          ))}
        </ScrollView>
        <View style={styles.imageIndicators}>
          {selectedAccommodation.images.map((_, index) => (
            <View
              key={index}
              style={[styles.indicator, { backgroundColor: index === currentImageIndex ? "#87CEEB" : "#C7C7CC" }]}
            />
          ))}
        </View>
      </View>
    )
  }

  if (dataLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 18, color: "#666" }}>Loading accommodations...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Sliding Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {accommodationTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tab, activeTab === type && styles.activeTab]}
            onPress={() => setActiveTab(type)}
          >
            <Text style={[styles.tabText, activeTab === type && styles.activeTabText]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Accommodations List */}
      <AnimatedFlatList
        data={accommodationsData[activeTab] || []}
        renderItem={renderAccommodationCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      />

      {/* Accommodation Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalFavoriteButton}
              onPress={() => toggleFavorite(selectedAccommodation?.id)}
            >
              <Ionicons
                name={favorites.has(selectedAccommodation?.id) ? "heart" : "heart-outline"}
                size={24}
                color={favorites.has(selectedAccommodation?.id) ? "#FF6B6B" : "#000"}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderImageCarousel()}

            {selectedAccommodation && (
              <View style={styles.detailsContainer}>
                <Text style={styles.modalTitle}>{selectedAccommodation.name}</Text>
                <Text style={styles.modalLocation}>{selectedAccommodation.location}</Text>

                {/* Display coordinates in modal */}
                {selectedAccommodation.coordinates && (
                  <View style={styles.coordinatesContainer}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.modalCoordinates}>
                      {selectedAccommodation.coordinates.latitude}, {selectedAccommodation.coordinates.longitude}
                    </Text>
                  </View>
                )}

                <View style={styles.modalRatingContainer}>
                  <View style={styles.starsContainer}>{renderStars(selectedAccommodation.rating)}</View>
                  <Text style={styles.modalRatingText}>
                    {selectedAccommodation.rating} ({selectedAccommodation.reviews} reviews)
                  </Text>
                </View>

                <View style={styles.modalPriceContainer}>
                  <Text style={styles.modalPrice}>R{selectedAccommodation.price}</Text>
                  <Text style={styles.modalPriceLabel}>per night</Text>
                  <View
                    style={[
                      styles.modalStatusBadge,
                      {
                        backgroundColor: selectedAccommodation.availability === "Available" ? "#4CAF50" : "#FF9800",
                      },
                    ]}
                  >
                    <Text style={styles.modalStatusText}>{selectedAccommodation.availability}</Text>
                  </View>
                </View>

                {/* Large Directions Button in Modal */}
                <TouchableOpacity
                  style={styles.modalDirectionsButton}
                  onPress={() => openDirections(selectedAccommodation.coordinates, selectedAccommodation.name)}
                >
                  <Ionicons name="navigate" size={20} color="#FFF" />
                  <Text style={styles.modalDirectionsButtonText}>Get Directions</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{selectedAccommodation.description}</Text>

                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenitiesContainer}>
                  {selectedAccommodation.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.guestNightContainer}>
                  <View style={styles.guestNightItem}>
                    <Ionicons name="people" size={20} color="#666" />
                    <Text style={styles.guestNightText}>Up to {selectedAccommodation.maxGuests} guests</Text>
                  </View>
                  <View style={styles.guestNightItem}>
                    <Ionicons name="calendar" size={20} color="#666" />
                    <Text style={styles.guestNightText}>Minimum 1 night</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.reserveButton}
                  onPress={() => openReservationForm(selectedAccommodation)}
                >
                  <Text style={styles.reserveButtonText}>Reserve Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Reservation Form Modal */}
      <ReservationForm
        visible={reservationModalVisible}
        onClose={() => setReservationModalVisible(false)}
        accommodation={selectedAccommodation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  tabsContainer: {
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 5,
    height: 30,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
  },
  activeTab: {
    backgroundColor: "#87CEEB",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#FFF",
  },
  listContainer: {
    padding: 14,
    paddingBottom: 100,
  },
  accommodationCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  accommodationImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
  },
  accommodationName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: "#87CEEB",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#87CEEB",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  maxGuests: {
    fontSize: 14,
    color: "#666",
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#87CEEB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  directionsButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  closeButton: {
    padding: 8,
  },
  modalFavoriteButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  carouselContainer: {
    position: "relative",
  },
  carouselImage: {
    width: width,
    height: 250,
  },
  imageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  modalLocation: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  coordinatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalCoordinates: {
    fontSize: 14,
    color: "#87CEEB",
    marginLeft: 4,
    fontFamily: "monospace",
  },
  modalRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalRatingText: {
    fontSize: 16,
    color: "#666",
  },
  modalPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#87CEEB",
  },
  modalPriceLabel: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
    marginRight: 16,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalStatusText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalDirectionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#87CEEB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  modalDirectionsButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  amenitiesContainer: {
    marginBottom: 20,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  guestNightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  guestNightItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  guestNightText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  reserveButton: {
    backgroundColor: "#87CEEB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  reserveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
})

export default Accommodation
