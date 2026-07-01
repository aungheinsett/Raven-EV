import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#555',
    fontSize: 18,
    fontWeight: 'bold',
  },
  marker: {
    marginTop: 20,
    backgroundColor: '#00E676',
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#121212',
  },
  markerText: {
    fontSize: 16,
  },
  topOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  filterScroll: {
    marginTop: 15,
  },
  filterContainer: {
    paddingRight: 20,
  },
  filterChip: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: '#00E676',
  },
  filterText: {
    color: '#CCC',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#00E676',
    fontWeight: 'bold',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stationName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  distanceText: {
    color: '#AAA',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoDetail: {
    color: '#CCC',
    fontSize: 14,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
    marginRight: 8,
  },
  availabilityText: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '600',
  },
  navigateButton: {
    backgroundColor: '#00E676',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
});