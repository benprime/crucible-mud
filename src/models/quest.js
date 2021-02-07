import mongoose from 'mongoose';
import QuestSchema from './questSchema';

const Quest = mongoose.model('Quest', QuestSchema);

export default Quest;
