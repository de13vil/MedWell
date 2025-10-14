import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { medicineApi } from '../api/medicineApi';
import { dateUtils } from '../utils/dateUtils';
import { Plus, Pill, Edit, Trash2 } from 'lucide-react';
import { googleCalendarApi } from '../services/googleCalendarApi';

const ScheduleForm = ({ onSave, onCancel, existingSchedule }) => {
    // ... (This component does not need any changes)
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        times: ['09:00'],
        startDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (existingSchedule) {
            setFormData({
                name: existingSchedule.name,
                dosage: existingSchedule.dosage,
                times: existingSchedule.times,
                startDate: new Date(existingSchedule.startDate).toISOString().split('T')[0],
            });
        }
    }, [existingSchedule]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData(prev => ({ ...prev, times: newTimes.sort() }));
    };

    const addTime = () => {
        setFormData(prev => ({ ...prev, times: [...prev.times, '17:00'].sort() }));
    };

    const removeTime = (index) => {
        const newTimes = formData.times.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-bold text-gray-300 block mb-2">Medicine Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., Ibuprofen" />
            </div>
             <div>
                <label className="text-sm font-bold text-gray-300 block mb-2">Dosage</label>
                <input type="text" name="dosage" value={formData.dosage} onChange={handleInputChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., 200mg" />
            </div>
            <div>
                 <label className="text-sm font-bold text-gray-300 block mb-2">Dose Times</label>
                 <div className="space-y-2">
                    {formData.times.map((time, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            {formData.times.length > 1 && (
                                 <button type="button" onClick={() => removeTime(index)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button>
                            )}
                        </div>
                    ))}
                 </div>
                 <button type="button" onClick={addTime} className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-semibold">
                    + Add another time
                 </button>
            </div>
            <div>
                <label className="text-sm font-bold text-gray-300 block mb-2">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Save Schedule</button>
            </div>
        </form>
    );
};


const SchedulesPage = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        medicineApi.getSchedules().then(data => {
            setSchedules(data);
            setLoading(false);
        }).catch(error => {
            console.error("Failed to fetch schedules:", error);
            setLoading(false);
        });
    }, []);

    useEffect(fetchData, [fetchData]);

    const handleSave = async (formData) => {
        setIsModalOpen(false);

        // If editing, delete old calendar events first
        if (editingSchedule && editingSchedule.googleEventIds && editingSchedule.googleEventIds.length > 0) {
            await googleCalendarApi.deleteScheduleFromCalendar(editingSchedule.googleEventIds);
        }

        // Save or update schedule in backend (without event IDs yet)
        const scheduleData = editingSchedule
            ? { ...editingSchedule, ...formData, googleEventIds: [] }
            : { ...formData, googleEventIds: [] };

        const savedSchedule = editingSchedule
            ? await medicineApi.updateSchedule(editingSchedule._id, scheduleData)
            : await medicineApi.addSchedule(scheduleData);

        // Add new events to Google Calendar and get their IDs
        const newEventIds = await googleCalendarApi.addScheduleToCalendar(savedSchedule);

        // Update backend with new event IDs
        if (newEventIds && newEventIds.length > 0) {
            await medicineApi.updateSchedule(savedSchedule._id, { ...savedSchedule, googleEventIds: newEventIds });
        }

        setEditingSchedule(null);
        fetchData();
    };

    const confirmDelete = async () => {
        if (showDeleteConfirm) {
            const scheduleToDelete = schedules.find(s => s._id === showDeleteConfirm);

            if (scheduleToDelete && scheduleToDelete.googleEventIds && scheduleToDelete.googleEventIds.length > 0) {
                console.log('Attempting to delete Google Calendar events:', scheduleToDelete.googleEventIds);
                try {
                    await googleCalendarApi.deleteScheduleFromCalendar(scheduleToDelete.googleEventIds);
                } catch (err) {
                    console.error('Failed to delete Google Calendar events:', err);
                    alert('Failed to delete Google Calendar events. Please check your Google connection.');
                }
            } else {
                console.warn('No googleEventIds found for this schedule:', scheduleToDelete);
            }

            await medicineApi.deleteSchedule(showDeleteConfirm);

            setShowDeleteConfirm(null);
            fetchData();
        }
    };

    const handleDelete = (scheduleId) => setShowDeleteConfirm(scheduleId);
    const handleOpenEditModal = (schedule) => { setEditingSchedule(schedule); setIsModalOpen(true); };
    const handleOpenNewModal = () => { setEditingSchedule(null); setIsModalOpen(true); };
    const handleCancel = () => { setIsModalOpen(false); setEditingSchedule(null); };

        return (
            <div className="relative min-h-screen flex flex-col bg-gray-900 text-white overflow-x-hidden">
                {/* Animated background orb */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-72 bg-gradient-to-r from-purple-500/20 via-pink-400/10 to-purple-500/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />
                {/* Animated divider */}
                <div className="w-full flex justify-center items-center mb-8 z-10 relative mt-8">
                    <div className="h-1 w-32 rounded-full bg-gradient-to-r from-purple-500/40 via-pink-400/30 to-purple-500/40 animate-pulse" />
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-10 z-10 relative w-full max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">My Medication Schedules</h1>
                        <button onClick={handleOpenNewModal} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl flex items-center shadow-lg transition-all text-lg">
                            <Plus size={22} className="mr-2" /> Add Medicine
                        </button>
                    </div>
                    {loading ? <div className="text-center p-10">Loading Schedules...</div> : schedules.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
                            {schedules.map(schedule => (
                                <motion.div
                                    key={schedule._id}
                                    layout
                                    className="panel-glass panel-hover flex flex-col justify-between shadow-2xl border border-purple-900/30 bg-gradient-to-br from-purple-900/40 to-pink-900/30 rounded-2xl hover:scale-[1.025] hover:shadow-2xl transition-all"
                                    whileHover={{ scale: 1.025 }}
                                >
                                    <div className="p-6">
                                        <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">{schedule.name}</h2>
                                        <p className="text-purple-200 font-semibold text-lg">{schedule.dosage}</p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {schedule.times.map((time, index) => (
                                                <span key={index} className="bg-black/20 px-4 py-2 rounded-full text-base font-mono text-purple-300 shadow-inner border border-purple-800/20">{dateUtils.formatTime(time)}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-purple-800/30 flex justify-between items-center text-base p-6">
                                        <p className="text-purple-300 font-mono">Start: {dateUtils.formatDate(schedule.startDate)}</p>
                                        <div className="flex gap-6">
                                            <button onClick={() => handleOpenEditModal(schedule)} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold"><Edit size={16}/> Edit</button>
                                            <button onClick={() => handleDelete(schedule._id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold"><Trash2 size={16}/> Delete</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center panel-glass panel-hover p-16 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-900/30 shadow-2xl">
                            <Pill className="mx-auto text-purple-400" size={56} />
                            <h3 className="mt-6 text-2xl font-extrabold text-white">No Schedules Found</h3>
                            <p className="text-purple-200 mt-3 text-lg">Get started by adding your first medication.</p>
                            <button onClick={handleOpenNewModal} className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl flex items-center mx-auto shadow-lg transition-all text-lg">
                                <Plus size={22} className="mr-2" /> Add a Schedule
                            </button>
                        </div>
                    )}
                </div>
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="panel-glass p-10 w-full max-w-lg rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-900/30 shadow-2xl">
                                <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">{editingSchedule ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                                <ScheduleForm onSave={handleSave} onCancel={handleCancel} existingSchedule={editingSchedule} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {showDeleteConfirm && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                             <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="panel-glass rounded-2xl p-10 w-full max-w-sm text-center bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-purple-900/30 shadow-2xl">
                                 <h3 className="text-2xl font-extrabold text-white">Are you sure?</h3>
                                 <p className="text-purple-200 my-6 text-lg">This action will permanently delete the schedule. This cannot be undone.</p>
                                 <div className="flex justify-center gap-6">
                                     <button onClick={() => setShowDeleteConfirm(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-xl text-lg">Cancel</button>
                                     <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl text-lg">Delete</button>
                                 </div>
                             </motion.div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>
    );
};
export default SchedulesPage;