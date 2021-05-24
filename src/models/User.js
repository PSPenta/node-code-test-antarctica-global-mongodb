const { Schema, model } = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'employee'
  }
},
{
  timestamps: true
});

userSchema.plugin(aggregatePaginate);
module.exports = model('user', userSchema);
