const Credential = require('../models/Credential')
const { log }    = require('../services/auditService')
const { getIP }  = require('../utils/helpers')

exports.getAll = async (req, res) => {
  try {
    const credentials = await Credential.find({ userId: req.userId })
      .sort({ isFavourite: -1, createdAt: -1 })
    res.json({ credentials })
  } catch (e) { res.status(500).json({ message: 'Server error.' }) }
}

exports.create = async (req, res) => {
  try {
    const { siteName, siteUrl, username, encryptedPassword, category, tags, notes, isSecureNote } = req.body
    if (!siteName || !username || !encryptedPassword)
      return res.status(400).json({ message: 'Site name, username and password are required.' })
    const normalizedSite = siteName.trim().toLowerCase()
    const normalizedUser = username.trim().toLowerCase()
    const cred = await new Credential({
      userId: req.userId,
      siteName: normalizedSite,
      siteUrl: siteUrl || '',
      username: normalizedUser,
      encryptedPassword,
      category: category || 'Personal',
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || '',
      isSecureNote: isSecureNote || false,
      passwordChangedAt: new Date()
    }).save()
    await log(req.userId, 'ADD_CREDENTIAL', `Added: ${siteName}`, getIP(req))
    res.status(201).json({ message: 'Saved.', credential: cred })
  } catch (e) {
    console.error('[cred] create:', e.message)
    res.status(500).json({ message: 'Failed to save. Try again.' })
  }
}

exports.update = async (req, res) => {
  try {
    const existing = await Credential.findOne({ _id: req.params.id, userId: req.userId })
    if (!existing) return res.status(404).json({ message: 'Not found.' })
    let history = existing.passwordHistory || []
    if (req.body.encryptedPassword && req.body.encryptedPassword !== existing.encryptedPassword) {
      history = [existing.encryptedPassword, ...history].slice(0, 5)
    }
    const updated = await Credential.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        siteName:          req.body.siteName?.trim() || existing.siteName,
        siteUrl:           req.body.siteUrl ?? existing.siteUrl,
        username:          req.body.username?.trim() || existing.username,
        encryptedPassword: req.body.encryptedPassword || existing.encryptedPassword,
        category:          req.body.category || existing.category,
        tags:              Array.isArray(req.body.tags) ? req.body.tags : existing.tags,
        notes:             req.body.notes ?? existing.notes,
        isFavourite:       req.body.isFavourite ?? existing.isFavourite,
        isSecureNote:      req.body.isSecureNote ?? existing.isSecureNote,
        passwordHistory:   history,
        passwordChangedAt: req.body.encryptedPassword !== existing.encryptedPassword ? new Date() : existing.passwordChangedAt,
        updatedAt:         new Date()
      },
      { new: true }
    )
    await log(req.userId, 'EDIT_CREDENTIAL', `Edited: ${existing.siteName}`, getIP(req))
    res.json({ message: 'Updated.', credential: updated })
  } catch (e) {
    console.error('[cred] update:', e.message)
    res.status(500).json({ message: 'Update failed.' })
  }
}

exports.remove = async (req, res) => {
  try {
    const cred = await Credential.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!cred) return res.status(404).json({ message: 'Not found.' })
    await log(req.userId, 'DELETE_CREDENTIAL', `Deleted: ${cred.siteName}`, getIP(req))
    res.json({ message: 'Deleted.' })
  } catch (e) { res.status(500).json({ message: 'Delete failed.' }) }
}

exports.search = async (req, res) => {
  try {
    const q = req.query.q || ''
    const credentials = await Credential.find({
      userId: req.userId,
      $or: [
        { siteName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { tags:     { $in: [new RegExp(q, 'i')] } }
      ]
    }).sort({ isFavourite: -1, createdAt: -1 })
    res.json({ credentials })
  } catch (e) { res.status(500).json({ message: 'Search failed.' }) }
}

exports.toggleFavourite = async (req, res) => {
  try {
    const cred = await Credential.findOne({ _id: req.params.id, userId: req.userId })
    if (!cred) return res.status(404).json({ message: 'Not found.' })
    cred.isFavourite = !cred.isFavourite
    await cred.save()
    res.json({ isFavourite: cred.isFavourite })
  } catch (e) { res.status(500).json({ message: 'Server error.' }) }
}

exports.markUsed = async (req, res) => {
  try {
    await Credential.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { lastUsedAt: new Date() }
    )
    res.json({ message: 'Updated.' })
  } catch (e) { res.status(500).json({ message: 'Server error.' }) }
}

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ message: 'No IDs provided.' })
    await Credential.deleteMany({ _id: { $in: ids }, userId: req.userId })
    await log(req.userId, 'BULK_DELETE', `Deleted ${ids.length} credentials`, getIP(req))
    res.json({ message: `${ids.length} credentials deleted.` })
  } catch (e) { res.status(500).json({ message: 'Bulk delete failed.' }) }
}

exports.exportVault = async (req, res) => {
  try {
    const credentials = await Credential.find({ userId: req.userId })
      .select('-__v -userId').sort({ createdAt: -1 })
    await log(req.userId, 'EXPORT', 'Vault exported', getIP(req))
    res.json({ exportedAt: new Date().toISOString(), count: credentials.length, credentials })
  } catch (e) { res.status(500).json({ message: 'Export failed.' }) }
}
