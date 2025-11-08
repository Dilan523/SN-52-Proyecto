import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const uploadImage = async (noticiaId: number, file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
            `${API_URL}/imagenes/upload/${noticiaId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw error;
    }
};

export const getImages = async (noticiaId: number) => {
    try {
        const response = await axios.get(`${API_URL}/imagenes/${noticiaId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener las imágenes:', error);
        throw error;
    }
};

export const deleteImage = async (imageId: number) => {
    try {
        const response = await axios.delete(`${API_URL}/imagenes/${imageId}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        throw error;
    }
};