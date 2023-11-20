import React, { useState } from 'react';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const ProductUpdateForm = () => {
    // State variables
    const [productCode, setProductCode] = useState('');
    const [productData, setProductData] = useState({});

    
    const fetchProductData = async () => {
        try {
            const productRef = doc(db, 'your-collection', productCode);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                setProductData(productSnap.data());
            } else {
                // Handle the case when the product with the given code is not found
                console.log('Product not found.');
            }
        } catch (error) {
            console.error('Error fetching product data: ', error);
        }
    };

    // Function to update product data
    const updateProductData = async () => {
        try {
            const productRef = doc(db, 'your-collection', productCode);
            await updateDoc(productRef, productData);

            // Handle success or provide feedback to the user
            console.log('Product updated successfully.');
        } catch (error) {
            console.error('Error updating product data: ', error);
        }
    };

    // JSX structure with input fields and buttons for product code, fetching, and updating
    return (
        <div>
            {/* Product Code Input */}
            <label htmlFor="productCode">Product Code:</label>
            <input
                type="text"
                id="productCode"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
            />

            {/* Fetch Product Data Button */}
            <button onClick={fetchProductData}>Fetch Product Data</button>

            {/* Display Product Data Form */}
            <form>
                {/* Add input fields for each property of the product */}
                <label htmlFor="productName">Product Name:</label>
                <input
                    type="text"
                    id="productName"
                    value={productData.NombreProducto}
                    onChange={(e) => setProductData({ ...productData, NombreProducto: e.target.value })}
                />

                <label htmlFor="description">Description:</label>
                <input
                    type="text"
                    id="description"
                    value={productData.Descripcion}
                    onChange={(e) => setProductData({ ...productData, Descripcion: e.target.value })}
                />

                {/* Input for fotoPortada */}
                <label htmlFor="coverImage">Cover Image URL:</label>
                <input
                    type="text"
                    id="coverImage"
                    value={productData.fotoPortada}
                    onChange={(e) => setProductData({ ...productData, fotoPortada: e.target.value })}
                />

                {/* Input for fotosDetalles */}
                <label htmlFor="detailImages">Detail Images URLs:</label>
                <input
                    type="text"
                    id="detailImages"
                    value={productData.fotosDetalles}
                    onChange={(e) => setProductData({ ...productData, fotosDetalles: e.target.value })}
                />

                {/* Input for precio */}
                <label htmlFor="price">Price:</label>
                <input
                    type="number"
                    id="price"
                    value={productData.precio}
                    onChange={(e) => setProductData({ ...productData, precio: e.target.value })}
                />

                {/* Input for stock */}
                <label htmlFor="stock">Stock:</label>
                <input
                    type="number"
                    id="stock"
                    value={productData.stock}
                    onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                />

                {/* Input for categoria */}
                <label htmlFor="category">Category:</label>
                <input
                    type="text"
                    id="category"
                    value={productData.categoria}
                    onChange={(e) => setProductData({ ...productData, categoria: e.target.value })}
                />

                {/* Input for precioDescuento */}
                <label htmlFor="discountPrice">Discount Price:</label>
                <input
                    type="number"
                    id="discountPrice"
                    value={productData.precioDescuento}
                    onChange={(e) => setProductData({ ...productData, precioDescuento: e.target.value })}
                />

                {/* Input for esOferta */}
                <label htmlFor="isOffer">Is Offer:</label>
                <input
                    type="checkbox"
                    id="isOffer"
                    checked={productData.esOferta}
                    onChange={(e) => setProductData({ ...productData, esOferta: e.target.checked })}
                />

                {/* Input for esNovedad */}
                <label htmlFor="isNew">Is New:</label>
                <input
                    type="checkbox"
                    id="isNew"
                    checked={productData.esNovedad}
                    onChange={(e) => setProductData({ ...productData, esNovedad: e.target.checked })}
                />

                {/* Input for especificaciones */}
                <label htmlFor="specifications">Specifications:</label>
                <textarea
                    id="specifications"
                    value={productData.especificaciones}
                    onChange={(e) => setProductData({ ...productData, especificaciones: e.target.value })}
                />

                {/* Update Product Data Button */}
                <button type="button" onClick={updateProductData}>
                    Update Product Data
                </button>
            </form>
        </div>
    );
};

export default ProductUpdateForm;
