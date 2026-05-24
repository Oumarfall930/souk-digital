export async function uploadImage(file, folder) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result;
        const token = localStorage.getItem('souk_token');
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            base64,
            filename: file.name,
            folder,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur upload');
        resolve(data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
