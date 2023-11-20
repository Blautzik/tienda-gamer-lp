import React, { useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import Papa from 'papaparse';
import { addDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const ProductForm = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [technicalSpecs, setTechnicalSpecs] = useState('');
  const [category, setCategory] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [transferPrice, setTransferPrice] = useState('');
  const [installments, setInstallments] = useState('');


  const fetchProducts = async () => {
    try {
      const productRef = collection(db, 'products');
      const querySnapshot = await getDocs(productRef);
      const productData = [];

      querySnapshot.forEach((doc) => {
        productData.push({ id: doc.id, ...doc.data() });
      });

      setProducts(productData);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleDetailImagesChange = (e) => {
    const images = Array.from(e.target.files);
    setDetailImages(images);
  };

  const handleCsvFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleCreateProduct = async () => {
    try {
      const productRef = collection(db, 'products');

      const newProduct = {
        nombre: productName,
        descripcion: description,
        precio: parseFloat(price),
        stock: parseInt(stock),
        technicalSpecs: technicalSpecs,
        categoria: category,
        novedad: isNew,
        oferta: isOnSale,
        precioLista: parseFloat(listPrice),
        precioTransferencia: parseFloat(transferPrice),
        cuotas: parseInt(installments),
      };

      // Add the product to Firestore and get the document reference
      const docRef = await addDoc(productRef, newProduct);

      // Upload cover image
      if (coverImage) {
        const storageRef = ref(storage, `images/${docRef.id}/${coverImage.name}`);
        await uploadBytes(storageRef, coverImage);
        newProduct.fotoPortada = await getDownloadURL(storageRef);
      }

      // Upload detail images
      const detailImageUrls = await Promise.all(
        detailImages.map(async (detailImage) => {
          const detailStorageRef = ref(storage, `images/${docRef.id}/${detailImage.name}`);
          await uploadBytes(detailStorageRef, detailImage);
          return getDownloadURL(detailStorageRef);
        })
      );

      newProduct.fotosDetalles = detailImageUrls;

      // Update the Firestore document with image URLs using setDoc with the merge option
      await setDoc(docRef, newProduct, { merge: true });

      // Clear form fields
      setProductName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCoverImage(null);
      setDetailImages([]);

      // Refresh the product list (you may use a different approach)
      fetchProducts();
    } catch (error) {
      console.error('Error creating product: ', error);
    }
  };

  const handleUploadCsv = () => {
    if (csvFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const csvData = e.target.result;
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (result && result.data) {
              result.data.forEach(async (product) => {
                try {
                  const productRef = collection(db, 'products');
                  await addDoc(productRef, product);
                } catch (error) {
                  console.error('Error adding product: ', error);
                }
              });
            }
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
          },
        });
      };

      reader.readAsText(csvFile);
    }
  };

  const handleDownloadProducts = () => {
    // Convert products data to CSV
    const csvData = Papa.unparse(products, { header: true });

    // Create a Blob and download the CSV file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_collection.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-lg p-6 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4">Crear producto</h2>
      <div className="mb-4">
        <label htmlFor="productName" className="block text-gray-700">
          Nombre del Producto
        </label>
        <input
          type="text"
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700">
          Descripción
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="price" className="block text-gray-700">
          Precio
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="stock" className="block text-gray-700">
          Stock
        </label>
        <input
          type="number"
          id="stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="coverImage" className="block text-gray-700">
          Portada
        </label>
        <input
          type="file"
          id="coverImage"
          onChange={handleCoverImageChange}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="detailImages" className="block text-gray-700">
          Mas Imágenes
        </label>
        <input
          type="file"
          id="detailImages"
          multiple
          onChange={handleDetailImagesChange}
          className="w-full"
        />
      </div>



      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700">
          Categoría
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">
          Novedad
        </label>
        <input
          type="checkbox"
          checked={isNew}
          onChange={() => setIsNew(!isNew)}
          className="mr-2"
        />
        Es Nuevo
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">
          Oferta
        </label>
        <input
          type="checkbox"
          checked={isOnSale}
          onChange={() => setIsOnSale(!isOnSale)}
          className="mr-2"
        />
        En Oferta
      </div>

      <div className="mb-4">
        <label htmlFor="listPrice" className="block text-gray-700">
          Precio Lista
        </label>
        <input
          type="number"
          id="listPrice"
          value={listPrice}
          onChange={(e) => setListPrice(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="transferPrice" className="block text-gray-700">
          Precio Transferencia
        </label>
        <input
          type="number"
          id="transferPrice"
          value={transferPrice}
          onChange={(e) => setTransferPrice(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="installments" className="block text-gray-700">
          Cuotas
        </label>
        <input
          type="number"
          id="installments"
          value={installments}
          onChange={(e) => setInstallments(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="technicalSpecs" className="block text-gray-700">
          Detalles técnicos
        </label>
        <ReactQuill
          id="technicalSpecs"
          value={technicalSpecs}
          onChange={(value) => setTechnicalSpecs(value)}
          className="quill-editor" // Apply custom styles if needed
        />
      </div>





      <button
        onClick={handleCreateProduct}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Crear producto
      </button>

      <h2 className="text-2xl font-semibold mt-8">Subir desde excel</h2>
      <div className="mb-4">
        <label htmlFor="csvFile" className="block text-gray-700">
          El archivo tiene que estar guardado como .csv
        </label>
        <input
          type="file"
          id="csvFile"
          accept=".csv"
          onChange={handleCsvFileChange}
          className="w-full"
        />
      </div>
      <button
        onClick={handleUploadCsv}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Subir CSV
      </button>

      <button
        onClick={handleDownloadProducts}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none mt-4"
      >
        Descargar Planilla
      </button>
    </div>
  );
};

export default ProductForm;