import axios from 'axios';

const API = axios.create({
    baseURL: 'https://clever-playfulness-production.up.railway.app',
});

export const authAPI = {
    sendOTP: (phone) => API.post('/auth/send-otp', { phone }),
    verifyOTP: (phone, otp) => API.post('/auth/verify-otp', { phone, otp }),
    setMPIN: (phone, mpin) => API.post('/auth/set-mpin', { phone, mpin }),
    login: (phone, mpin) => API.post('/auth/login', { phone, mpin }),
};

export const playerAPI = {
    createProfile: (formData) => API.post('/players/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getProfile: (id) => API.get(`/players/profile/${id}`),
};
// Add this to /src/services/api.js

export const adminAPI = {
    getPendingPlayers: () => API.get('/admin/pending-players'),
    approvePlayer: (playerId) => API.post('/admin/approve-player', { player_id: playerId }),
};
export const clubAPI = {
    // In a real app, clubId comes from the logged-in manager's context
    getApplications: (clubId) => API.get(`/clubs/applications?club_id=${clubId}`)
};

export const trialAPI = {
    invite: (data) => API.post('/trial/invite', data),
    evaluate: (data) => API.post('/trial/evaluate', data)
};
export default API;
