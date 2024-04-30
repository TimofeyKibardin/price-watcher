import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if(!process.env.MONGODB_URI) return console.log('MONGODB_URI не определен');

  if(isConnected) return console.log('=> подключение к базе данных');

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;

    console.log('MongoDB подключение произошло успешно');
  } catch (error) {
    console.log(error);
  }
}