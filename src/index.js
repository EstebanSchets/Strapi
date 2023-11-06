'use strict';

const axios = require('axios');

// Function to synchronize Printify products
async function synchronizePrintifyProducts() {
  try {
    console.log('Synchronizing Printify products...');

    // Your existing code to get the products from Printify and synchronize with Strapi
    const printifyResponse = await axios.get('https://api.printify.com/v1/shops/12172533/products.json', {
      headers: {
          'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImZlZDI5NmFiMGExY2U1MThlMmNkNWY3ODk2NWY1M2JhMTQ1MGI0Njk3YTAxMDM3ZDg2ODEzMDk2YWIyM2QzMDc2MGIxZTU1OWQ4YWQyNTliIiwiaWF0IjoxNjk5MTIzNzQzLjU2NzM2NCwibmJmIjoxNjk5MTIzNzQzLjU2NzM2NiwiZXhwIjoxNzMwNzQ2MTQzLjU2MDM3Mywic3ViIjoiMTU1MjY3NTEiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AONGb-apTLwh5bTy8--6CZT9llcywWbwxr_ekbUpvMK2fo7BTkgTFQqNLs0wjcjJYkUXC4zApBsiKad1F1U`, // Replace with your actual token
          'User-Agent': 'Strapi' // Replace with your app name or client type
        }
      });

      console.log('Response from Printify:', printifyResponse.data);

// Access the array of products correctly from printifyResponse.data.data
const printifyProducts = printifyResponse.data.data;

for (const product of printifyProducts) {
  // Define a default image URL in case there are no images for a product
  const defaultImageUrl = 'https://seranking.com/blog/wp-content/uploads/2021/01/404_01-min.jpg'; // Replace with your actual default image URL

  // Check if the product has images and assign the URL accordingly
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : defaultImageUrl;

  // Map Printify product data to your Strapi product content type
  const strapiProductData = {
    Product_ID: product.id,
    Product_Name: product.title,
    Product_Desc: product.description,
    Price: product.variants[0].price, // Assuming you want the price of the first variant
    Category: product.category, // You may need to map Printify categories to your Strapi categories
    Brand: product.brand, // Adjust as necessary
    Availability: product.status === 'active', // Adjust based on Printify's status field
    Quantity: product.quantity, // Adjust as necessary
    Product_Images: imageUrl, // This is now a string URL
    publishedAt: new Date(), // This will set the product to be published immediately
  };

  // Check if product already exists in Strapi
  const existingProducts = await strapi.entityService.findMany('api::product.product', {
    filters: { Product_ID: product.id },
  });

  if (existingProducts.length > 0) {
    // Update existing product
    await strapi.entityService.update('api::product.product', existingProducts[0].id, {
      data: strapiProductData,
    });
  } else {
    // Create new product
    await strapi.entityService.create('api::product.product', { data: strapiProductData });
  }
}

console.log('Printify products synchronization completed.');
} catch (error) {
  console.error('Error during Printify products synchronization:', error);
}
}

module.exports = {
async bootstrap() {
  console.log('Starting initial Printify products synchronization...');
  await synchronizePrintifyProducts(); // Perform an initial synchronization

  // Set an interval to run the synchronization function every minute (60000 milliseconds)
  setInterval(async () => {
    console.log('Running periodic Printify products synchronization...');
    await synchronizePrintifyProducts();
  }, 60000); // 60 seconds
},
};
