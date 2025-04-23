const api = process.env.REACT_APP_API_ENDPOINT;
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

const getBearerHeader= () => {
    const token = getAuthToken(); 
    return {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

const getCandidateName = async (): Promise<any> => {
    try {
        const response = await fetch(`${api}/getName`, {
            method: 'GET',
            headers: getBearerHeader()
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const uploadCandidateImage = async (data : any): Promise<any> => {
    try {
        const token = getAuthToken(); 
        const response = await fetch(`${api}/putImage`, {
            method: 'PUT',
            body : JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const startInterview = async (): Promise<any> => {
    try {
        const response = await fetch(`${api}/startInterview`, {
            method: 'GET',
            headers: getBearerHeader()
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};



const getQuestion = async (): Promise<any> => {
    try {
        const response = await fetch(`${api}/nextQuestion`, {
            method: 'POST',
            headers: getBearerHeader()
        });

        
        if (!response.ok) {
            return { success: false, message: 'Error occurred' };
        } else {
             // Extract AI message from headers
             const aImessage = decodeURIComponent(
                response.headers.get("X-Ai-Question") || ""
            );
            const section = decodeURIComponent(
                response.headers.get("X-Ai-Section") || ""
            );

            // Convert the response stream into a Blob
            const audioBlob = await response.blob();
            return { success: true, data: {
                audio: audioBlob,
                text: aImessage,
                section
            }};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const nextQuestion = async (data : any): Promise<any> => {
    try {
        const token = getAuthToken(); 
        const response = await fetch(`${api}/nextQuestion`, {
            method: 'POST',
            body : JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            return { success: false, message:  'Error occurred' };
        } else {
             // Extract AI message from headers
            const aImessage = decodeURIComponent(
                response.headers.get("X-Ai-Question") || ""
            );
            const section = decodeURIComponent(
                response.headers.get("X-Ai-Section") || ""
            );

            // Convert the response stream into a Blob
            const audioBlob = await response.blob();
            return { success: true, data: {
                audio: audioBlob,
                text: aImessage,
                section
            }};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const sendAnswer = async (data : any): Promise<any> => {
    try {
        const token = getAuthToken(); 
        const response = await fetch(`${api}/sendAnswer`, {
            method: 'POST',
            body : JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        if (!response.ok) {
            return { success: false, message: 'Something went wrong' };
        } else {
            return { success: true, data: "Sent Answer"};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const getTextFromAudio = async (data : any): Promise<any> => {
    try {
        const response = await fetch(`${api}/transcibeAudio`, {
            method: 'POST',
            body : data ,
            headers: getBearerHeader()
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const updateStatus = async (): Promise<any> => {
    try {
        const response = await fetch(`${api}/updateStatus`, {
            method: 'GET',
            headers: getBearerHeader()
        });

        if (!response.ok) {
            return { success: false, message: 'Error occurred' };
        } else {
            return { success: true, data: "successfully "};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const updateTabSwitch = async (): Promise<any> => {
    try {
        const response = await fetch(`${api}/switchCount`, {
            method: 'GET',
            headers: getBearerHeader()
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const generateSignedAzureLinkService = async (): Promise<any> => {
    try {
        const response = await fetch(`${api}/getStorageLink`, {
            method: 'POST',
            headers: getBearerHeader()
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const submitInterview = async (data : any): Promise<any> => {
    try {
        const token = getAuthToken(); 
        const response = await fetch(`${api}/submit`, {
            method: 'POST',
            body : JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });
        if (!response.ok) {
            return { success: false, message: 'Something went wrong' };
        } else {
            return { success: true, data: "Sent Answer"};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const uploadVideoAzure = async (data : FormData): Promise<any> => {
    try {
        const response = await fetch(`${api}/uploadVideoToAzure`, {
            method: 'POST',
            body : data ,
            headers: getBearerHeader()
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

const updateVideoStatus = async (data : any): Promise<any> => {
    try {
        const token = getAuthToken(); 
        const response = await fetch(`${api}/uploadVideoStatus`, {
            method: 'POST',
            body : JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        const res = await response.json();
        if (!response.ok) {
            return { success: false, message: res.message || 'Error occurred' };
        } else {
            return { success: true, data: res};
        }
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};


export { startInterview,getQuestion,getTextFromAudio,nextQuestion ,sendAnswer ,uploadCandidateImage,updateStatus ,updateTabSwitch ,submitInterview ,getCandidateName , generateSignedAzureLinkService,uploadVideoAzure,updateVideoStatus}