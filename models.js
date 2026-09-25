import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxLength: 200
  },
  coverImage: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const photographySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['portrait', 'landscape', 'street', 'event', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  youtubeId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    default: 'Present'
  },
  description: {
    type: String,
    default: ''
  },
  achievements: [{
    type: String
  }],
  technologies: [{
    type: String
  }],
  type: {
    type: String,
    enum: ['work', 'education', 'volunteer'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  technologies: [{
    type: String
  }],
  githubUrl: {
    type: String,
    default: ''
  },
  liveUrl: {
    type: String,
    default: ''
  },
  highlights: [{
    type: String
  }],
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    featured: {
      type: Boolean,
      default: true
    }
  }],
  featured: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// NEW: Creative (Others) schema for miscellaneous creative works
const creativeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  linkUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Site-wide settings, stored as a single document (key: 'site')
const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'site'
  },
  // Theme id from the client's theme registry; unknown ids fall back to the default there
  theme: {
    type: String,
    default: 'classic',
    match: /^[a-z0-9-]{1,40}$/
  }
}, {
  timestamps: true
});

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export const Photography = mongoose.model('Photography', photographySchema);
export const Video = mongoose.model('Video', videoSchema);
export const Experience = mongoose.model('Experience', experienceSchema);
export const Project = mongoose.model('Project', projectSchema);
export const Skill = mongoose.model('Skill', skillSchema);
export const Course = mongoose.model('Course', courseSchema);
export const Creative = mongoose.model('Creative', creativeSchema);
export const Settings = mongoose.model('Settings', settingsSchema);
