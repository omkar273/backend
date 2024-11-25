import mongoose from 'mongoose';

const connectMongodb = async () => {
    try {
        const mongo_uri = process.env.DB_URI_ATLAS;
        const db_name = process.env.DB_NAME;
        console.log('mongodb uri', mongo_uri);

        const connection = await mongoose.connect(`${mongo_uri}/${db_name}`)

        console.log(`MongoDB connected: ${connection.connection.host}`);

        connection.connection.on('error', (error) => {
            console.log(error);
        })

    } catch (error) {
        console.log(error);
    }
}

export default connectMongodb;