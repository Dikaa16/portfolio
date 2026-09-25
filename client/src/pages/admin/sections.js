import {
  EXPERIENCE_TYPES, ExperienceForm, ProjectForm, SkillForm, CourseForm, BlogForm, PhotoForm, VideoForm, OtherForm
} from './forms';

// Each content type the admin can manage. Adding a type = one entry here + a form.
//   endpoint     API path under /api
//   noun/plural  used in headings and buttons
//   defaults     initial values for a new item
//   filters      manage-view filters: 'type' | 'category' | 'tag'
//   reorderable  shows ↑ ↓ buttons
//   card         how an item is summarised in the manage list
const featuredBadge = (item) => (item.featured ? { label: 'Featured', tone: 'published' } : null);
const visibilityBadge = (item) => (item.featured
  ? { label: 'Featured', tone: 'published' }
  : { label: 'Hidden', tone: 'draft' });

export const SECTIONS = {
  experience: {
    endpoint: 'experience', noun: 'Experience', plural: 'Experience',
    Form: ExperienceForm, defaults: { type: 'work' }, filters: ['type'], reorderable: true,
    card: {
      title: item => item.company,
      meta: item => `${item.title} • ${item.type}`,
      description: item => item.description,
      badge: featuredBadge
    }
  },
  projects: {
    endpoint: 'projects', noun: 'Project', plural: 'Projects',
    Form: ProjectForm, reorderable: true,
    card: {
      title: item => item.name,
      meta: item => `${item.startDate} - ${item.endDate}`,
      description: item => item.description,
      badge: featuredBadge
    }
  },
  courses: {
    endpoint: 'courses', noun: 'Course', plural: 'Courses',
    Form: CourseForm, defaults: { featured: true }, reorderable: true,
    card: { title: item => item.name, description: item => item.description, badge: featuredBadge }
  },
  skills: {
    endpoint: 'skills', noun: 'Skill Category', plural: 'Skills',
    Form: SkillForm, defaults: { featured: true }, reorderable: true,
    card: {
      title: item => item.category,
      meta: item => `${item.skills.length} skills`,
      description: item => item.skills.map(skill => skill.name).join(', '),
      badge: featuredBadge
    }
  },
  blog: {
    endpoint: 'blog', listPath: '/blog/all', listNeedsAuth: true,
    noun: 'Blog Post', plural: 'Blog Posts', createVerb: 'Create',
    Form: BlogForm, filters: ['tag'], cancelOnlyWhenEditing: true,
    card: {
      title: item => item.title,
      meta: item => item.slug,
      description: item => item.excerpt,
      showTags: true,
      badge: item => (item.published
        ? { label: 'Published', tone: 'published' }
        : { label: 'Draft', tone: 'draft' })
    }
  },
  photo: {
    endpoint: 'photography', noun: 'Photo', plural: 'Photography',
    Form: PhotoForm, defaults: { category: 'other' }, filters: ['category', 'tag'], reorderable: true,
    card: { title: item => item.title, meta: item => item.category, description: item => item.description, showTags: true, badge: visibilityBadge }
  },
  video: {
    endpoint: 'videos', noun: 'Video', plural: 'Videos',
    Form: VideoForm, filters: ['category', 'tag'], reorderable: true,
    card: {
      title: item => item.title,
      meta: item => [item.category, `YouTube: ${item.youtubeId}`].filter(Boolean).join(' • '),
      description: item => item.description,
      showTags: true,
      badge: visibilityBadge
    }
  },
  others: {
    endpoint: 'creatives', noun: 'Creative', plural: 'Others',
    Form: OtherForm, filters: ['category', 'tag'], reorderable: true,
    card: { title: item => item.title, meta: item => item.category, description: item => item.description, showTags: true, badge: visibilityBadge }
  }
};

export { EXPERIENCE_TYPES };

export const TABS = [
  {
    id: 'home', label: 'Home Settings', heading: 'Home Page Settings',
    intro: 'Manage content for your homepage.',
    sections: ['experience', 'projects', 'courses', 'skills']
  },
  { id: 'blog', label: 'Blog Posts', sections: ['blog'] },
  {
    id: 'creatives', label: 'Creatives', heading: 'Creatives Settings',
    intro: 'Manage photography, videos, and other creative content. Only featured items appear on the Creatives page.',
    sections: ['photo', 'video', 'others']
  }
];

// Fields edited as "a | b | c" text but stored as arrays
const LIST_FIELDS = ['technologies', 'achievements', 'highlights', 'tags'];
const DELIMITER = '|';

const splitList = (text) => text.split(DELIMITER).map(part => part.trim()).filter(Boolean);

// Form state → API payload
export const toPayload = (formData) => {
  const payload = { ...formData };
  LIST_FIELDS.forEach(field => {
    if (typeof payload[field] === 'string') payload[field] = splitList(payload[field]);
  });
  if (typeof payload.skills === 'string') {
    payload.skills = splitList(payload.skills).map(name => ({ name, featured: true }));
  }
  return payload;
};

// API item → form state
export const toFormData = (item) => {
  const data = { ...item };
  LIST_FIELDS.forEach(field => {
    if (Array.isArray(data[field])) data[field] = data[field].join(` ${DELIMITER} `);
  });
  if (Array.isArray(data.skills)) {
    data.skills = data.skills.map(skill => skill.name).join(` ${DELIMITER} `);
  }
  return data;
};
