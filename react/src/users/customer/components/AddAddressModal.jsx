import { useState, useEffect, useRef, useCallback } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    CircularProgress,
    Autocomplete, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import {Loader, X} from "lucide-react";
import {GoogleMap, Marker, useLoadScript} from "@react-google-maps/api";
import { MyLocation } from "@mui/icons-material";
import axios from "axios";
import {ADD_ADDRESS, FETCH_AREAS, GOOGLE_MAPS_API_KEY} from "../../../utils/config.js";

const LIBRARIES = ["places", "geometry"];

const AddAddressModal = ({open, handleClose, setToast, setAddresses}) => {
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [options, setOptions] = useState([]);
    const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
    const mapRef = useRef(null);
    const [searchValue, setSearchValue] = useState("");
    const autocompleteService = useRef(null);
    const sessionToken = useRef(null);
    const searchDebounceRef = useRef(null);
    const [areasLoading, setAreasLoading] = useState(false);
    const [areas, setAreas] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const listboxRef = useRef(null);
    const [address, setAddress] = useState({
        street: "",
        area: null,
        city: "",
        state: "",
        zip: "",
        landmark: "",
        addressType: "WORK",
        latitude: "",
        longitude: "",
    });

    const {isLoaded} = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES,
    });

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmit(true);
        try {
            const response = await axios.post(ADD_ADDRESS, address, {headers: {Authorization: `Bearer ${token}`}});
            setToast({ message: response.data?.message, type: "success" });
            setAddresses((prev) => [...prev, address]);
            resetForm();
        } catch (error) {
            setToast({ message: error.response?.data?.message, type: "error" });
            console.error("Error adding address:", error);
        } finally {
            setSubmit(false);
        }
    };

    const fetchAddressFromCoords = useCallback(async (lat, lng) => {
        try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({location: {lat, lng}});

            if (response.results.length > 0) {
                const result = response.results[0];
                const addressComponents = result.address_components;

                const getComponent = (type) => {
                    const component = addressComponents.find(comp =>
                        comp.types.includes(type));
                    return component ? component.long_name : '';
                };

                const plusCode = getComponent('plus_code');
                const streetNumber = getComponent('street_number');
                const route = getComponent('route');
                const sublocality = getComponent('sublocality_level_1');
                const neighborhood = getComponent('neighborhood');
                const locality = getComponent('locality');
                const adminArea2 = getComponent('administrative_area_level_2');
                const adminArea1 = getComponent('administrative_area_level_1');
                const postalCode = getComponent('postal_code');

                const street = [plusCode, streetNumber, route].filter(Boolean).join(' ').trim();
                const area = neighborhood || sublocality || ''; // fallback chain
                const city = locality || adminArea2 || '';
                const state = adminArea1 || '';
                const zip = postalCode || '';

                setAddress((prev) => ({
                    ...prev,
                    street: street,
                    area: null,
                    city: city,
                    state: state,
                    zip: zip,
                    landmark: area,
                    latitude: lat,
                    longitude: lng,
                    addressType: "OTHER",
                }));

            }
        } catch (error) {
            console.error("Error fetching address:", error);
            setToast({ message: "Failed to fetch address from coordinates", type: "error" });
        }
    }, [setToast]);

    const handleMapClick = async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({lat, lng});
        await fetchAddressFromCoords(lat, lng);
    };

    const fetchLiveLocation = useCallback(() => {
        setLoading(true);
        if (!navigator.geolocation) {
            setToast({
                message: "Geolocation is not supported by your browser",
                type: "error",
            });
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });
                await fetchAddressFromCoords(latitude, longitude);
                setLoading(false);
            },
            (err) => {
                setToast({ message: "Unable to retrieve your location", type: "error" });
                console.error(err);
                setLoading(false);
            }
        );
    }, [fetchAddressFromCoords, setToast]);

    const fetchAreas = useCallback(async (city, pageNumber = 0, size = 50) => {
            if (!city) return;
            setAreasLoading(true);
            try {
                const response = await axios.get(FETCH_AREAS(pageNumber, size, city));
                const newAreas = response.data?.content || [];
                const totalElements = response.data?.totalElements || 0;

                setAreas((prev) =>
                    pageNumber === 0 ? newAreas : [...prev, ...newAreas]
                );
                setHasMore((pageNumber + 1) * size < totalElements);
            } catch (err) {
                console.error("Failed to fetch areas:", err);
                setToast({ message: "Failed to load areas", type: "error" });
            } finally {
                setAreasLoading(false);
            }
        },
        [setToast]
    );

    // Initial fetch of live location
    useEffect(() => {
        setTimeout(() => {
            fetchLiveLocation();
        }, 800);
        if (isLoaded && !autocompleteService.current) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, [fetchLiveLocation, isLoaded]);

    // Reset areas when the city changes
    useEffect(() => {
        setAreas([]);
        setPage(0);
        setHasMore(true);
    }, [address?.city]);

    // Fetch areas on city or page change
    useEffect(() => {
        if (address?.city) {
            fetchAreas(address?.city, page).then(r => r);
        }
    }, [address?.city, page, fetchAreas]);

    const handleListboxScroll = (event) => {
        const listboxNode = event.currentTarget;
        if (
            listboxNode.scrollTop + listboxNode.clientHeight >=
            listboxNode.scrollHeight - 1
        ) {
            if (!areasLoading && hasMore) {
                setPage((prev) => prev + 1);
            }
        }
    };

    const resetForm = () => {
        handleClose();
        setSearchValue("");
        setAddress({
            street: "",
            area: null,
            city: "",
            state: "",
            zip: "",
            landmark: "",
            latitude: "",
            longitude: "",
            addressType: "OTHER",
        });
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="add-address-modal">
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <Typography variant="h6">Add New Address</Typography>
                    <IconButton onClick={resetForm}>
                        <X className="w-5 h-5" />
                    </IconButton>
                </div>

                <div className="flex flex-col relative mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search location or pick on map{" "}
                        <span className="text-red-600">*</span>
                    </label>
                    <Autocomplete
                        freeSolo
                        options={options}
                        inputValue={searchValue}
                        onInputChange={(event, newValue) => {
                            setSearchValue(newValue);
                            if (searchDebounceRef.current) {
                                clearTimeout(searchDebounceRef.current);
                            }

                            if (newValue && autocompleteService.current) {
                                if (!sessionToken.current) {
                                    sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
                                    setTimeout(() => {
                                        sessionToken.current = null;
                                    }, 180000); // Reset token after 3 minutes
                                }

                                searchDebounceRef.current = setTimeout(async () => {
                                    await autocompleteService.current.getPlacePredictions(
                                        {
                                            input: newValue,
                                            componentRestrictions: {country: 'in'},
                                            sessionToken: sessionToken.current,
                                            types: ['geocode', 'establishment'],
                                            fields: ['address_components', 'geometry', 'name', 'formatted_address', 'structured_formatting']
                                        },
                                        (predictions) => {
                                            if (predictions) {
                                                setOptions(predictions.map((prediction) => ({
                                                    label: prediction.structured_formatting?.main_text
                                                        ? `${prediction.structured_formatting.main_text} - ${prediction.structured_formatting.secondary_text}`
                                                        : prediction.description,
                                                    placeId: prediction.place_id,
                                                    description: prediction.description
                                                })));
                                            }
                                        }
                                    );
                                }, 300);
                            } else {
                                setOptions([]);
                            }
                        }}
                        onChange={async (event, newValue) => {
                            if (newValue && newValue.placeId) {
                                const geocoder = new window.google.maps.Geocoder();
                                await geocoder.geocode({placeId: newValue.placeId}, async (results, status) => {
                                    if (status === "OK" && results[0]) {
                                        const location = results[0].geometry.location;
                                        const lat = location.lat();
                                        const lng = location.lng();
                                        setPosition({lat, lng});
                                        await fetchAddressFromCoords(lat, lng);
                                        if (mapRef.current) {
                                            mapRef.current.panTo({lat, lng});
                                            mapRef.current.setZoom(15);
                                        }
                                    }
                                });
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                className="w-full"
                                placeholder="Search for a location"
                                variant="outlined"
                            />
                        )}
                    />

                    <div className="relative">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerClassName="h-[250px] mt-2 rounded-md border border-gray-400 hover:border-black"
                                center={position}
                                zoom={15}
                                onClick={handleMapClick}
                                onLoad={(map) => {
                                    mapRef.current = map;
                                }}
                                options={{
                                    disableDefaultUI: true,
                                    mapTypeControlOptions: {
                                        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
                                    }
                                }}
                            >
                                <Marker
                                    position={position}
                                    title="Your Laundry Location"
                                />
                            </GoogleMap>
                        ) : (
                            <div className="h-[250px] mt-2 rounded-md border border-black">
                                <Loader/>
                            </div>
                        )}

                        <button
                            onClick={fetchLiveLocation}
                            type="button"
                            disabled={loading}
                            className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md shadow-md transition focus:outline-none focus:ring-indigo-400 z-[1000]"
                        >
                            {loading ? (
                                <CircularProgress size={20} style={{ color: "white" }} />
                            ) : (
                                <MyLocation />
                            )}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Street Address"
                        name="street"
                        value={address.street || ""}
                        onChange={handleChange}
                        margin="dense"
                        required
                    />

                    <Autocomplete
                        sx={{ width: "100%" }}
                        getOptionLabel={(option) => option.name || ""}
                        options={areas}
                        loading={areasLoading}
                        value={address.area || null}
                        onChange={(event, newValue) => {
                            setAddress((prev) => ({ ...prev, area: newValue }));
                        }}
                        onOpen={() => {
                            if (areas.length === 0 && address.city) {
                                fetchAreas(address.city, 0).then(r => r);
                            }
                        }}
                        slotProps={{
                            listbox: {
                                onScroll: handleListboxScroll,
                                ref: listboxRef,
                                style: { maxHeight: 200, overflow: "auto" },
                            }
                        }}
                        isOptionEqualToValue={(option, value) =>
                            option.id === value?.id
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Area"
                                margin="dense"
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {areasLoading ? (
                                                    <CircularProgress color="inherit" size={20}/>
                                                ) : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }
                                }}
                            />
                        )}
                    />

                    <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={address.city || ""}
                        onChange={handleChange}
                        margin="dense"
                        slotProps={{
                            input: {
                                readOnly: true
                            }
                        }}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Landmark"
                        name="landmark"
                        value={address.landmark || ""}
                        onChange={handleChange}
                        margin="dense"
                    />

                    <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={address.state || ""}
                        onChange={handleChange}
                        margin="dense"
                        slotProps={{
                            input: {
                                readOnly: true
                            }
                        }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="ZIP Code"
                        name="zip"
                        value={address.zip || ""}
                        onChange={handleChange}
                        margin="dense"
                        slotProps={{
                            input: {
                                readOnly: true
                            }
                        }}
                        required
                    />


                    <div className="mb-2 mt-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Type <span className="text-red-600">*</span>
                        </label>
                        <ToggleButtonGroup
                            value={address.addressType}
                            exclusive
                            onChange={(event, newValue) => {
                                if (newValue !== null) {
                                    handleChange({
                                        target: { name: 'addressType', value: newValue }
                                    });
                                }
                            }}
                            fullWidth
                            sx={{ width: '100%' }}
                        >
                            <ToggleButton value="HOME" sx={{ flex: 1 }} >
                                Home
                            </ToggleButton>
                            <ToggleButton value="WORK" sx={{ flex: 1 }}>
                                Work
                            </ToggleButton>
                            <ToggleButton value="OTHER" sx={{ flex: 1 }}>
                                Other
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>

                    <div className="flex gap-3 mt-6 justify-end">
                        <Button loading={submit} variant="contained" type="submit" color="primary">
                            Save Address
                        </Button>
                        <Button disabled={submit} variant="outlined" onClick={resetForm} color="secondary">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
};

export default AddAddressModal;