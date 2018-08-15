import mongoose from 'mongoose';
import ExitSchema from './exitSchema';

const Exit = mongoose.model('Exit', ExitSchema);

export default Exit;
