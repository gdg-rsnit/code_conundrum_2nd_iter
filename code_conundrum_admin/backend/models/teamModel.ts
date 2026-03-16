import mongoose, { Schema } from "mongoose";

export interface ITeam{
    teamName:string;
    teamMembers:string[];
    banned:boolean;
    bannedAt:Date|null;
    score:number;
    time:number;
    createdAt:Date;
    updatedAt:Date;
}

const teamSchema=new Schema<ITeam>({
    teamName:{
        type:String,
        required:true,
        unique:true,
        maxLength:20,
        minLength:3,
        trim:true
    },
    teamMembers:{
        type:[String],
        required:true,
        validate: {
            validator: function(v: string[]) {
                return v.length === 2;
            },
            message: 'Team must have 2 members'
        }
    },
    banned:{
        type:Boolean,
        default:false
    },
    bannedAt:{
        type:Date,
        default:null
    },
    score:{
        type:Number,
        default:0,
        min:0
    },
    time:{
        type:Number,
        default:0,
        min:0
    }
},{timestamps:true});

export const Team=mongoose.model<ITeam>('Team',teamSchema);
