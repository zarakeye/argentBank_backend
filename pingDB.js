const { MongoClient } = require('mongodb');

// Remplace par ton URI MongoDB Atlas
const uri = process.env.DATABASE_URL_PROD;

async function pingDB() {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    if (process.env.NODE_ENV === 'production') {
      await client.connect();
      const stats = await client.db().stats();
      console.log('Ping réussi :', stats.ok ? 'OK' : 'Échec', '-', new Date().toISOString());
      return;
    }
    // await client.connect();
    // const stats = await client.db().stats();
    // console.log('Ping réussi :', stats.ok ? 'OK' : 'Échec', '-', new Date().toISOString());
  } catch (err) {
    console.error('Erreur MongoDB :', err.message);
  } finally {
    await client.close();
  }
}

module.exports = pingDB;
