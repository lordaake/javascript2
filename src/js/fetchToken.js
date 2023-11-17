async function fetchWithToken(url, method = 'GET') {
    const token = localStorage.getItem('accessToken');

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Request failed");
        }

        const data = await response.json();
        console.log("Data received:", data);
        return data;
    } catch (error) {
        console.error("Error in fetch:", error);
    }
}