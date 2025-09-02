const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chart title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Chart type is required'],
    enum: ['bar', 'line', 'pie', 'scatter', 'area', 'column']
  },
  config: {
    xAxis: {
      type: String,
      required: [true, 'X-axis configuration is required']
    },
    yAxis: {
      type: String,
      required: [true, 'Y-axis configuration is required']
    },
    colors: [String],
    theme: {
      type: String,
      enum: ['light', 'dark', 'custom'],
      default: 'light'
    },
    customOptions: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  dataSource: {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExcelFile',
      required: [true, 'Data source file ID is required']
    },
    sheetName: String,
    dataRange: String,
    filters: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator user ID is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  exportCount: {
    type: Number,
    default: 0
  },
  lastExported: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
chartSchema.index({ createdBy: 1, createdAt: -1 });
chartSchema.index({ 'dataSource.fileId': 1 });
chartSchema.index({ type: 1 });
chartSchema.index({ isPublic: 1, isActive: 1 });
chartSchema.index({ tags: 1 });

// Virtual for chart URL
chartSchema.virtual('chartUrl').get(function() {
  return `/api/charts/${this._id}`;
});

// Ensure virtual fields are serialized
chartSchema.set('toJSON', { virtuals: true });

// Pre-remove middleware to handle cascading deletes
chartSchema.pre('remove', async function(next) {
  // Add any cleanup logic here if needed
  next();
});

module.exports = mongoose.model('Chart', chartSchema);