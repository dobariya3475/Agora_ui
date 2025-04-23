const api = process.env.REACT_APP_API_ENDPOINT;

const basicheader = {
    "Content-Type": "application/json",
}
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

const login = async (loginData: any): Promise<any> => {
    try {
        const response = await fetch(`${api}/generateOTP`, {
            method: 'POST',
            body: JSON.stringify(loginData),
            headers: basicheader
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res?.error || 'Error occurred' };
        } else {
            return { success: true, data: res };
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const verifyOTP = async (otpData: any): Promise<any> => {
    try {
        const token = getAuthToken(); 
        const response = await fetch(`${api}/verifyOTP`, {
            method: 'POST',
            body: JSON.stringify(otpData),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res?.error || 'Error occurred' };
        } else {
            return { success: true, token: res.token};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};


export { login,verifyOTP }