const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const helpDeskMappingSchema = mongoose.Schema(
  {
    roleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    categoryId: {
      type: String,
      required: true,
      trim: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    subCategories: [
      {
        id: {
          type: String,
          trim: true,
        },
        name: {
          type: String,
          trim: true,
        },
      },
    ],
    email: [
      {
        type: String,
      },
    ],
    phone: {
      type: String,
    },
    alternativePhone: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

helpDeskMappingSchema.plugin(toJSON);
helpDeskMappingSchema.plugin(paginate);

const HelpDeskMapping = mongoose.model('HelpDeskMapping', helpDeskMappingSchema);

module.exports = HelpDeskMapping;
