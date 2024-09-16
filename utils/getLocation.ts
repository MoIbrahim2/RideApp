import axios from 'axios';

export async function getAddressFromCoordinates(latitude, longitude) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C${longitude}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
      const address = response.data.results[0].formatted;
      return address;
    } else {
      throw new Error('Unable to fetch address');
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
}
