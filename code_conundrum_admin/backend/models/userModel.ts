import mongoose,{Schema,Document,Types} from "mongoose";

export interface IUser extends Document{
    email:string;
    password:string;
    role:"ADMIN"|"TEAM";
    banned:boolean;
    bannedAt:Date|null;
    teamId:Types.ObjectId | null;
    createdAt:Date;
    updatedAt:Date;
}

const userSchema=new Schema<IUser>(
    {
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        password:{
            type:String,
            required:true,
            select:false
        },
        role:{
            type:String,
            enum:["ADMIN","TEAM"],
            required:true,
            default:"TEAM"
        },
        banned:{
            type:Boolean,
            default:false
        },
        bannedAt:{
            type:Date,
            default:null
        },
        teamId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Team",
            default:null
        },
    },
    {timestamps:true}
);

export const User=mongoose.model<IUser>("User",userSchema);