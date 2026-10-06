const { Schema, model, Types } = require('mongoose');
const ts = { timestamps: true };
const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  collegeEmail: String, password: { type: String, select: false }, googleId: String,
  role: { type: String, enum: ['student', 'volunteer', 'admin', 'superadmin'], default: 'student' },
  branch: String, year: Number, cgpa: Number,
  interests: [String], notifyEmail: { type: Boolean, default: true },  myDocuments: [String],
  dismissed: [{ type: Types.ObjectId, ref: 'Deadline' }],   // opportunities the student removed: never auto-add again
}, ts));
const deadlineSchema = new Schema({
  title: { type: String, required: true, trim: true }, description: String, organization: String,
  category: { type: String, required: true }, deadlineDate: { type: Date, required: true }, deadlineTime: String,
  eligibilityBranches: [String], eligibilityYears: [Number], minimumCGPA: { type: Number, default: 0 },
  applicationLink: String, sourceUrl: String, documentsRequired: [String], contactPerson: String, contactEmail: String,
  posterImage: String, status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
  submittedBy: { type: Types.ObjectId, ref: 'User' }, approvedBy: { type: Types.ObjectId, ref: 'User' },
  rejectionReason: String, isPinned: { type: Boolean, default: false }, official: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, ts);
deadlineSchema.index({ deadlineDate: 1 });          // sort/filter by nearest deadline, cron range queries
deadlineSchema.index({ category: 1, status: 1 });   // browse filters
deadlineSchema.index({ applicationLink: 1 });       // duplicate detection by URL
deadlineSchema.index({ submittedBy: 1 });           // "my submissions"
const Deadline = model('Deadline', deadlineSchema);
const appSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true }, deadline: { type: Types.ObjectId, ref: 'Deadline', required: true },
  stage: { type: String, enum: ['Interested', 'Planning', 'Application Started', 'Application Submitted', 'Selected', 'Rejected', 'Withdrawn'], default: 'Interested' },
  notes: String, auto: { type: Boolean, default: false } }, ts);   // auto = added by the system
appSchema.index({ user: 1, deadline: 1 }, { unique: true }); // one tracker entry per student per opportunity
const Application = model('Application', appSchema);
const accessSchema = new Schema({ user: { type: Types.ObjectId, ref: 'User' }, deadline: { type: Types.ObjectId, ref: 'Deadline' }, accessedAt: { type: Date, default: Date.now } });
accessSchema.index({ user: 1, accessedAt: -1 });     // recently accessed lookup
const Access = model('Access', accessSchema);
const noteSchema = new Schema({ user: { type: Types.ObjectId, ref: 'User' }, type: String, message: String,
  deadline: { type: Types.ObjectId, ref: 'Deadline' }, read: { type: Boolean, default: false }, key: String }, ts);
noteSchema.index({ user: 1, key: 1 }, { unique: true, partialFilterExpression: { key: { $type: 'string' } } }); // blocks duplicate notifications
const Notification = model('Notification', noteSchema);

const docSchema = new Schema({ user: { type: Types.ObjectId, ref: 'User', required: true }, type: { type: String, required: true }, filename: String, mime: String, size: Number, data: Buffer }, ts);
docSchema.index({ user: 1, type: 1 }, { unique: true }); // one file per document type per student
const StudentDocument = model('StudentDocument', docSchema);
module.exports = { User, Deadline, Application, Access, Notification, StudentDocument };