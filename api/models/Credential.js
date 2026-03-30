const mongoose = require('mongoose')

const credentialSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  siteName:          { type: String, required: true, trim: true },
  siteUrl:           { type: String, default: '' },
  username:          { type: String, required: true, trim: true },
  encryptedPassword: { type: String, required: true },
  category:          { type: String, enum: ['Personal','Work','Banking','Social','Other'], default: 'Personal' },
  tags:              { type: [String], default: [] },
  notes:             { type: String, default: '' },
  isFavourite:       { type: Boolean, default: false },
  isSecureNote:      { type: Boolean, default: false },
  passwordHistory:   { type: [String], default: [] },
  lastUsedAt:        { type: Date },
  passwordChangedAt: { type: Date, default: Date.now },
  createdAt:         { type: Date, default: Date.now },
  updatedAt:         { type: Date, default: Date.now }
})

credentialSchema.pre('save', function() {
  this.updatedAt = Date.now()
})

credentialSchema.index(
  { userId: 1, siteName: 1, username: 1 },
  { unique: true }
)

module.exports = mongoose.model('Credential', credentialSchema)
