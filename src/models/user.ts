import { prop, getModelForClass, index, ReturnModelType } from '@typegoose/typegoose';

@index({ email: 1 }, { unique: true })
class UserDocument {
    @prop()
    public email: string;

    @prop()
    public verified: boolean;

    @prop()
    public verifyHash: string;

    @prop()
    public password: string;

    @prop()
    public admin: boolean;

    @prop()
    public debug: boolean;

    public static async findByName(this: ReturnModelType<typeof UserDocument>, name: string): Promise<UserDocument> {
      const userRegEx = new RegExp(`^${name}$`, 'i');
      return this.findOne({ username: userRegEx });
    }
}

const UserModel = getModelForClass(UserDocument);

// TODO: is this necessary?
UserModel.createIndexes();

export { UserModel, UserDocument }

