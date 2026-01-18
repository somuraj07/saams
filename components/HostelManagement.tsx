"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Users, MapPin, IndianRupee, X, Bed } from "lucide-react";

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  cotCount: number;
  amount: number;
  availableCots: number[];
  bookedCotsCount: number;
  availableCotsCount: number;
  bookings: Array<{
    id: string;
    cotNumber: number;
    student: {
      user: { name: string | null; email: string | null };
      class: { name: string; section: string | null } | null;
    };
  }>;
}

interface HostelData {
  id: string;
  name: string;
  address: string;
  gender: string;
  rooms: Room[];
  createdAt: string;
}

interface Booking {
  id: string;
  cotNumber: number;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  room: {
    id: string;
    roomNumber: string;
    floor: number;
    hostel: {
      id: string;
      name: string;
      address: string;
      gender: string;
    };
  };
  student: {
    user: { name: string | null; email: string | null };
    class: { name: string; section: string | null } | null;
  };
}

export default function HostelManagement() {
  const [hostels, setHostels] = useState<HostelData[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hostels" | "create" | "bookings">("hostels");
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gender: "MALE",
  });

  const [rooms, setRooms] = useState<Array<{ roomNumber: string; floor: string; cotCount: string; amount: string }>>([
    { roomNumber: "", floor: "", cotCount: "", amount: "" },
  ]);

  useEffect(() => {
    fetchHostels();
    fetchBookings();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hostel/list");
      const data = await res.json();
      if (res.ok && data.hostels) {
        setHostels(data.hostels);
      } else {
        alert(data.message || "Failed to fetch hostels");
      }
    } catch (err: any) {
      console.error("Error fetching hostels:", err);
      alert(err?.message || "Failed to fetch hostels");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/hostel/bookings");
      const data = await res.json();
      if (res.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validRooms = rooms.filter(r => r.roomNumber.trim() && r.floor && r.cotCount && r.amount && parseFloat(r.amount) >= 0);
    if (validRooms.length === 0) {
      alert("Please add at least one room with all details");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/hostel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rooms: validRooms.map(r => ({
            roomNumber: r.roomNumber.trim(),
            floor: parseInt(r.floor),
            cotCount: parseInt(r.cotCount),
            amount: parseFloat(r.amount),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create hostel");
        return;
      }

      alert("Hostel created successfully!");
      setFormData({ name: "", address: "", gender: "MALE" });
      setRooms([{ roomNumber: "", floor: "", cotCount: "", amount: "" }]);
      setActiveTab("hostels");
      fetchHostels();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const addRoom = () => {
    setRooms([...rooms, { roomNumber: "", floor: "", cotCount: "", amount: "" }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index: number, field: "roomNumber" | "floor" | "cotCount" | "amount", value: string) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              Hostel Management
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Manage hostels, rooms, and bookings</p>
          </div>
          <div className="flex gap-2 flex-wrap w-full md:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("hostels")}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-semibold transition-all duration-300 flex items-center gap-2 flex-1 md:flex-none ${
                activeTab === "hostels"
                  ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border border-[#808080]"
                  : "bg-[#2d2d2d] text-[#808080] hover:bg-[#404040] hover:text-white border border-[#333333]"
              }`}
            >
              <Building2 size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="whitespace-nowrap">All Hostels</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("create")}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-semibold transition-all duration-300 flex items-center gap-2 flex-1 md:flex-none ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border border-[#808080]"
                  : "bg-[#2d2d2d] text-[#808080] hover:bg-[#404040] hover:text-white border border-[#333333]"
              }`}
            >
              <Plus size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="whitespace-nowrap">Create Hostel</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("bookings")}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-semibold transition-all duration-300 flex items-center gap-2 flex-1 md:flex-none ${
                activeTab === "bookings"
                  ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border border-[#808080]"
                  : "bg-[#2d2d2d] text-[#808080] hover:bg-[#404040] hover:text-white border border-[#333333]"
              }`}
            >
              <Users size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="whitespace-nowrap">All Bookings</span>
            </motion.button>
          </div>
        </motion.div>

      {activeTab === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-3">
              <Plus className="w-7 h-7 text-[#808080]" />
              Create New Hostel
            </h2>
          <form onSubmit={handleCreateHostel} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <Building2 size={16} />
                  Hostel Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  placeholder="e.g., Boys Hostel A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  placeholder="Hostel address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <Users size={16} />
                  Gender <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                >
                  <option value="MALE" className="bg-[#2d2d2d]">Male</option>
                  <option value="FEMALE" className="bg-[#2d2d2d]">Female</option>
                  <option value="UNISEX" className="bg-[#2d2d2d]">Unisex</option>
                </select>
              </div>
            </div>

            <div className="border-t border-[#333333] pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bed size={20} />
                  Rooms & Pricing
                </h3>
                <motion.button
                  type="button"
                  onClick={addRoom}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] hover:bg-[#404040] text-white rounded-lg transition text-sm font-medium border border-[#333333] hover:border-[#808080]"
                >
                  <Plus size={16} />
                  Add Room
                </motion.button>
              </div>
              <div className="space-y-3">
                {rooms.map((room, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3 items-start p-4 bg-[#2d2d2d]/50 border border-[#404040] rounded-lg hover:bg-[#404040]/50 transition"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#808080] mb-1 flex items-center gap-2">
                          <Building2 size={14} />
                          Room Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={room.roomNumber}
                          onChange={(e) => updateRoom(index, "roomNumber", e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#404040] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                          placeholder="e.g., 101, A-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#808080] mb-1">Floor <span className="text-red-400">*</span></label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={room.floor}
                          onChange={(e) => updateRoom(index, "floor", e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#404040] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#808080] mb-1 flex items-center gap-2">
                          <Bed size={14} />
                          Cots <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={room.cotCount}
                          onChange={(e) => updateRoom(index, "cotCount", e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#404040] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                          placeholder="e.g., 2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#808080] mb-1 flex items-center gap-2">
                          <IndianRupee size={14} />
                          Amount (₹) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={room.amount}
                          onChange={(e) => updateRoom(index, "amount", e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#404040] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                          placeholder="e.g., 5000"
                        />
                      </div>
                    </div>
                    {rooms.length > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => removeRoom(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="mt-6 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition border border-red-500/30 hover:border-red-400"
                      >
                        <X size={20} />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                type="submit"
                disabled={creating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Create Hostel</span>
                  </>
                )}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  setActiveTab("hostels");
                  setFormData({ name: "", address: "", gender: "MALE" });
                  setRooms([{ roomNumber: "", floor: "", cotCount: "", amount: "" }]);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2d2d2d] hover:bg-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-[#333333] hover:border-[#808080]"
              >
                Cancel
              </motion.button>
            </div>
          </form>
          </div>
        </motion.div>
      )}

      {activeTab === "hostels" && (
        <div className="space-y-6">
          {hostels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-12 text-center border border-[#333333]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <Building2 size={64} className="mx-auto text-[#808080] mb-4 opacity-50" />
                <p className="text-[#808080] text-lg mb-6">No hostels created yet</p>
                <motion.button
                  onClick={() => setActiveTab("create")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-[#808080] hover:border-white shadow-lg"
                >
                  Create First Hostel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {hostels.map((hostel, hostelIndex) => (
                <motion.div
                  key={hostel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: hostelIndex * 0.1 }}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                  <div className="relative">
                    {/* Hostel Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#404040] to-[#6b6b6b] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white">{hostel.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className="flex items-center gap-2 text-[#808080] text-sm">
                                <MapPin size={16} />
                                <span>{hostel.address}</span>
                              </div>
                              <span className="px-3 py-1 bg-[#404040]/50 text-white rounded-full text-xs font-medium border border-[#808080]/30">
                                {hostel.gender}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rooms Grid */}
                    {hostel.rooms.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        {hostel.rooms.map((room, roomIndex) => (
                          <motion.div
                            key={room.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: hostelIndex * 0.1 + roomIndex * 0.05 }}
                            className="bg-[#1a1a1a] border border-[#404040] rounded-xl p-4 hover:border-[#808080] transition-all duration-200 hover:bg-[#2d2d2d]"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Bed size={16} className="text-[#808080]" />
                                  <p className="font-semibold text-white">Room {room.roomNumber}</p>
                                </div>
                                <p className="text-xs text-[#808080]">Floor {room.floor}</p>
                              </div>
                              <span className="font-bold text-green-400 flex items-center gap-1">
                                <IndianRupee size={14} />
                                {room.amount}
                              </span>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-[#333333]">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-[#808080]">
                                  {room.bookedCotsCount} / {room.cotCount} cots booked
                                </p>
                                <span className="text-xs font-medium text-white">
                                  {room.availableCotsCount} available
                                </span>
                              </div>
                              <div className="w-full bg-[#2d2d2d] rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ 
                                    width: `${Math.min((room.bookedCotsCount / room.cotCount) * 100, 100)}%` 
                                  }}
                                  transition={{ duration: 0.5, delay: hostelIndex * 0.1 + roomIndex * 0.05 }}
                                  className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full"
                                ></motion.div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-xl p-6 text-center mt-6">
                        <Bed size={32} className="mx-auto text-[#808080] mb-2 opacity-50" />
                        <p className="text-[#808080] text-sm">No rooms available in this hostel</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-3">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-[#808080]" />
              All Student Bookings
            </h2>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-[#808080] mb-4" />
                <p className="text-[#808080] text-lg">No bookings yet</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#2d2d2d]/50 border border-[#404040] rounded-xl p-4 hover:border-[#808080] transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white text-lg">
                              {booking.student.user.name || "N/A"}
                            </h3>
                            <p className="text-sm text-[#808080] mt-1">
                              {booking.student.class
                                ? `${booking.student.class.name}${booking.student.class.section ? ` - ${booking.student.class.section}` : ""}`
                                : "N/A"}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
                            booking.paymentStatus === "PAID" 
                              ? "bg-green-500/20 text-green-400 border-green-500/30" 
                              : booking.paymentStatus === "FAILED"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#333333]">
                          <div>
                            <p className="text-xs text-[#808080] mb-1">Hostel</p>
                            <p className="text-sm font-medium text-white">{booking.room.hostel.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#808080] mb-1">Room & Cot</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white">Room {booking.room.roomNumber}</span>
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30">
                                Cot {booking.cotNumber}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-[#808080] mb-1">Amount</p>
                            <p className="text-sm font-semibold text-green-400 flex items-center gap-1">
                              <IndianRupee size={14} />
                              {booking.amount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#808080] mb-1">Booked On</p>
                            <p className="text-sm text-white">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Student Name</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Class</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Hostel</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Room</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Cot</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Amount</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Payment</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Booked On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333333]">
                      {bookings.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "#2d2d2d" }}
                          className="hover:bg-[#2d2d2d]/50 transition"
                        >
                          <td className="px-4 py-3 font-medium text-white">
                            {booking.student.user.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-[#808080]">
                            {booking.student.class
                              ? `${booking.student.class.name}${booking.student.class.section ? ` - ${booking.student.class.section}` : ""}`
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            {booking.room.hostel.name}
                          </td>
                          <td className="px-4 py-3 text-white">Room {booking.room.roomNumber}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium border border-green-500/30">
                              Cot {booking.cotNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-400 flex items-center gap-1">
                            <IndianRupee size={14} />
                            {booking.amount}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${
                              booking.paymentStatus === "PAID" 
                                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                : booking.paymentStatus === "FAILED"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            }`}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#808080]">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
