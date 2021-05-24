const { Schema, model } = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const employeeSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  organization: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
},
{
  timestamps: true
});

employeeSchema.plugin(aggregatePaginate);
module.exports = model('employee', employeeSchema);
