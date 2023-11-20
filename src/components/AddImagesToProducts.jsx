import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';

const ProductImageUploader = () => {
  const [productsWithoutImages, setProductsWithoutImages] = useState([]);

  // States to handle file inputs
  const [coverImage, setCoverImage] = useState(null);
  const [detailImages, setDetailImages] = useState([]);

  useEffect(() => {
    const fetchProductsWithoutImages = async () => {
      try {
        const productRef = collection(db, 'products');
        const q = query(productRef, where('fotoPortada', '==', ''), where('fotosDetalles', '==', ''));
        const querySnapshot = await getDocs(q);
        const productsData = [];

        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });

        setProductsWithoutImages(productsData);
      } catch (error) {
        console.error('Error fetching products without images: ', error);
      }
    };

    fetchProductsWithoutImages();
  }, []);

  // Function to upload cover image for a product
  const uploadCoverImage = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id);

      if (coverImage) {
        const storageRef = ref(storage, `images/${product.id}/coverImage.jpg`);
        await uploadBytes(storageRef, coverImage);
        product.fotoPortada = await getDownloadURL(storageRef);

        await updateDoc(productRef, { fotoPortada: product.fotoPortada });

        // Remove the product from the list of products without images
        setProductsWithoutImages((prevProducts) => prevProducts.filter((p) => p.id !== product.id));

        // Clear cover image input
        setCoverImage(null);
      }
    } catch (error) {
      console.error('Error uploading cover image: ', error);
    }
  };

  // Function to upload detail images for a product
  const uploadDetailImages = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      const storageRef = ref(storage, `images/${product.id}`);

      const detailImageUrls = await Promise.all(
        detailImages.map(async (detailImage, index) => {
          const detailImageRef = ref(storageRef, `detailImage${index}.jpg`);
          await uploadBytes(detailImageRef, detailImage);
          return getDownloadURL(detailImageRef);
        })
      );

      product.fotosDetalles = detailImageUrls;

      await updateDoc(productRef, { fotosDetalles: product.fotosDetalles });

      // Remove the product from the list of products without images
      setProductsWithoutImages((prevProducts) => prevProducts.filter((p) => p.id !== product.id));

      // Clear detail images input
      setDetailImages([]);
    } catch (error) {
      console.error('Error uploading detail images: ', error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-lg p-6 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4">Productos sin foto</h2>
      <ul>
        {productsWithoutImages.map((product) => (
          <li key={product.id} className="mb-4 border p-4 rounded-lg">
            <span className="text-lg font-semibold">{product.NombreProducto}</span>
            <div className="mt-2">
              <label className="block text-gray-700">Upload Foto Portada</label>
              <input
                type="file"
                onChange={(e) => setCoverImage(e.target.files[0])}
                className="w-full"
              />
              <button
                onClick={() => uploadCoverImage(product)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600 focus:outline-none"
              >
                Subir Foto Portada
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-gray-700">Upload Fotos Detalles</label>
              <input
                type="file"
                multiple
                onChange={(e) => setDetailImages([...e.target.files])}
                className="w-full"
              />
              <button
                onClick={() => uploadDetailImages(product)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600 focus:outline-none"
              >
                Subir Fotos Detalles
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductImageUploader;