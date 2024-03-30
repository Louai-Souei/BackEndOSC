const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AbsenceRequest = require('../models/absence');

const UserSchema = new Schema({
    nom: { type: String },
    prenom: { type: String},
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: 'L\'adresse e-mail doit contenir le caractère "@".',
        },
    },
    password:  { type: String, required: true },
    role: { type: String,
        enum: ["choriste",'manager de choeur','chef de pupitre', 'admin'],
        default: 'choriste' },
    StatusHistory: {type: mongoose.Schema.Types.ObjectId, ref: 'StatusHistory' },
    demandeConge: {type: Boolean, default : false},
    estEnConge: { type: Boolean, default: false }, 
    conge : {type: String, enum : ['enattente','enconge']},
    dateDebutConge: { type: Date }, 
    dateFinConge: { type: Date }, 
    statusChanged: { type: Boolean , default: false },
    AbsencestatusChanged: { type: Boolean , default: false },
    active: { type: Boolean, default: true }, 
    dateEntreeChoeur: { type: Date }, 
    dateSortieChoeur: { type: Date },
    tessiture: {type : String }, 
    taille_en_m  : {type: String},
    nbsaison:{type:Number}, 
    approved:{type: Boolean},
    absence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'absence' }],
    elimination:{type:String, enum:['nomine','elimine']},
    eliminationDuree: {
        type: Number,
        default: 365,
      },
    eliminationReason: {
        type: String, 
      },
    absencecount:{
        type:Number,
        default:0
      },
     
      concertsValidated:{type:Number,
    default:0},
    repetitionsValidated:{
        type:Number,
        default:0
    },
      pupitre :{type: mongoose.Schema.Types.ObjectId, ref: 'Pupitre'}
    
});

UserSchema.virtual('name').get(function () {
    return `${this.prenom} ${this.nom}`;
});

UserSchema.methods.toPublic = function () {
    const publicUserData = this.toObject();
    delete publicUserData.password;
    publicUserData.name = this.name;

    return publicUserData;
};
UserSchema.statics.getChefDePupitreEmail = async function () {
    try {
        const utilisateur = await this.findOne({ role: 'chef de pupitre' });
        return utilisateur ? utilisateur.email : null;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'adresse e-mail du chef de pupitre:', error.message);
        return null;
    }
};
UserSchema.statics.getChoristeEmail = async function () {
    try {
        const utilisateur = await this.findOne({ role: 'choriste' });
        return utilisateur ? utilisateur.email : null;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'adresse e-mail du choriste:', error.message);
        return null;
    }
};


//sauvgarde des absences 
UserSchema.pre('save', async function(next) {
   
    if (this.isModified('estEnConge') && this.estEnConge === true && this.role === 'choriste') {
      
        this.AbsencestatusChanged = true;

        
        const newAbsence = new AbsenceRequest({ user: this._id, status: 'absent', absence: new Date() });

        try {
            
            await newAbsence.save();
        } catch (error) {
           
            console.error(error);
        }
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
